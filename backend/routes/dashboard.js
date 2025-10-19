const express = require('express');
const Check = require('../models/Check');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview data
// @access  Private
router.get('/overview', auth, async (req, res) => {
  try {
    const { projectId, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let matchQuery = {
      'project.owner': req.user._id,
      createdAt: { $gte: startDate }
    };

    if (projectId) {
      // Verify project ownership
      const project = await Project.findOne({
        _id: projectId,
        owner: req.user._id,
        isActive: true
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      matchQuery['project'] = projectId;
    }

    // Get visibility score across engines
    const visibilityScore = await Check.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$engine',
          totalChecks: { $sum: 1 },
          presenceCount: { $sum: { $cond: ['$presence', 1, 0] } },
          avgPosition: { $avg: { $cond: ['$presence', '$position', null] } },
          avgCitations: { $avg: '$citationsCount' }
        }
      },
      {
        $project: {
          engine: '$_id',
          visibilityScore: {
            $multiply: [
              { $divide: ['$presenceCount', '$totalChecks'] },
              100
            ]
          },
          avgPosition: { $round: ['$avgPosition', 2] },
          avgCitations: { $round: ['$avgCitations', 2] },
          totalChecks: 1
        }
      }
    ]);

    // Get trends over time
    const trends = await Check.aggregate([
      { $match: matchQuery },
      {
        $group:         {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            engine: '$engine'
          },
          presenceCount: { $sum: { $cond: ['$presence', 1, 0] } },
          totalChecks: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          engines: {
            $push: {
              engine: '$_id.engine',
              visibilityScore: {
                $multiply: [
                  { $divide: ['$presenceCount', '$totalChecks'] },
                  100
                ]
              }
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get keyword breakdown
    const keywordBreakdown = await Check.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$keyword',
          totalChecks: { $sum: 1 },
          presenceCount: { $sum: { $cond: ['$presence', 1, 0] } },
          avgPosition: { $avg: { $cond: ['$presence', '$position', null] } },
          engines: { $addToSet: '$engine' }
        }
      },
      {
        $project: {
          keyword: '$_id',
          visibilityScore: {
            $multiply: [
              { $divide: ['$presenceCount', '$totalChecks'] },
              100
            ]
          },
          avgPosition: { $round: ['$avgPosition', 2] },
          totalChecks: 1,
          enginesCount: { $size: '$engines' }
        }
      },
      { $sort: { visibilityScore: -1 } },
      { $limit: 10 }
    ]);

    // Get recommendations
    const recommendations = await generateRecommendations(matchQuery);

    res.json({
      visibilityScore,
      trends,
      keywordBreakdown,
      recommendations,
      period: {
        days: parseInt(days),
        startDate,
        endDate: new Date()
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/keyword/:keyword
// @desc    Get detailed keyword analysis
// @access  Private
router.get('/keyword/:keyword', auth, async (req, res) => {
  try {
    const { keyword } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const keywordData = await Check.aggregate([
      {
        $match: {
          keyword: new RegExp(keyword, 'i'),
          'project.owner': req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            engine: '$engine',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          presence: { $sum: { $cond: ['$presence', 1, 0] } },
          totalChecks: { $sum: 1 },
          avgPosition: { $avg: { $cond: ['$presence', '$position', null] } },
          avgCitations: { $avg: '$citationsCount' }
        }
      },
      {
        $group: {
          _id: '$_id.engine',
          dailyData: {
            $push: {
              date: '$_id.date',
              visibilityScore: {
                $multiply: [
                  { $divide: ['$presence', '$totalChecks'] },
                  100
                ]
              },
              avgPosition: { $round: ['$avgPosition', 2] },
              avgCitations: { $round: ['$avgCitations', 2] }
            }
          },
          overallVisibility: {
            $avg: {
              $multiply: [
                { $divide: ['$presence', '$totalChecks'] },
                100
              ]
            }
          }
        }
      }
    ]);

    res.json({
      keyword,
      period: { days: parseInt(days), startDate, endDate: new Date() },
      engineData: keywordData
    });
  } catch (error) {
    console.error('Keyword analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/engine-comparison
// @desc    Compare performance across engines
// @access  Private
router.get('/engine-comparison', auth, async (req, res) => {
  try {
    const { projectId, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let matchQuery = {
      'project.owner': req.user._id,
      createdAt: { $gte: startDate }
    };

    if (projectId) {
      matchQuery['project'] = projectId;
    }

    const engineComparison = await Check.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$engine',
          totalChecks: { $sum: 1 },
          presenceCount: { $sum: { $cond: ['$presence', 1, 0] } },
          avgPosition: { $avg: { $cond: ['$presence', '$position', null] } },
          avgCitations: { $avg: '$citationsCount' },
          topKeywords: {
            $push: {
              keyword: '$keyword',
              presence: '$presence',
              position: '$position'
            }
          }
        }
      },
      {
        $project: {
          engine: '$_id',
          visibilityScore: {
            $multiply: [
              { $divide: ['$presenceCount', '$totalChecks'] },
              100
            ]
          },
          avgPosition: { $round: ['$avgPosition', 2] },
          avgCitations: { $round: ['$avgCitations', 2] },
          totalChecks: 1,
          topPerformingKeywords: {
            $slice: [
              {
                $filter: {
                  input: '$topKeywords',
                  cond: { $eq: ['$$this.presence', true] }
                }
              },
              5
            ]
          }
        }
      },
      { $sort: { visibilityScore: -1 } }
    ]);

    res.json({
      engineComparison,
      period: { days: parseInt(days), startDate, endDate: new Date() }
    });
  } catch (error) {
    console.error('Engine comparison error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate recommendations based on data
async function generateRecommendations(matchQuery) {
  const recommendations = [];

  // Get engines with low visibility
  const engineStats = await Check.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$engine',
        visibilityScore: {
          $avg: { $cond: ['$presence', 100, 0] }
        }
      }
    }
  ]);

  const lowVisibilityEngines = engineStats
    .filter(stat => stat.visibilityScore < 50)
    .map(stat => stat._id);

  if (lowVisibilityEngines.length > 0) {
    recommendations.push({
      type: 'low_visibility',
      priority: 'high',
      message: `Low visibility detected on engines: ${lowVisibilityEngines.join(', ')}`,
      action: 'Consider optimizing content for these AI engines'
    });
  }

  // Get keywords with low citations
  const keywordStats = await Check.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$keyword',
        avgCitations: { $avg: '$citationsCount' }
      }
    },
    { $match: { avgCitations: { $lt: 2 } } }
  ]);

  if (keywordStats.length > 0) {
    recommendations.push({
      type: 'low_citations',
      priority: 'medium',
      message: `Keywords with low citations: ${keywordStats.slice(0, 3).map(s => s._id).join(', ')}`,
      action: 'Improve content authority and backlinks for these keywords'
    });
  }

  return recommendations;
}

module.exports = router;
