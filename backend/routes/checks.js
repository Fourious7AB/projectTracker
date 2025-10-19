const express = require('express');
const { body, validationResult } = require('express-validator');
const Check = require('../models/Check');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/checks/run
// @desc    Run visibility checks for a project
// @access  Private
router.post('/run', [
  auth,
  body('projectId').isMongoId().withMessage('Valid project ID is required'),
  body('engines').optional().isArray().withMessage('Engines must be an array'),
  body('keywords').optional().isArray().withMessage('Keywords must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, engines, keywords } = req.body;

    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id,
      isActive: true
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const enginesToCheck = engines || project.settings.engines || ['chatgpt', 'gemini'];
    const keywordsToCheck = keywords || project.keywords.map(k => k.keyword);

    const checks = [];

    // Create check records for each engine-keyword combination
    for (const engine of enginesToCheck) {
      for (const keyword of keywordsToCheck) {
        const check = new Check({
          project: projectId,
          engine,
          keyword,
          status: 'pending'
        });
        await check.save();
        checks.push(check);
      }
    }

    // Simulate AI engine responses (in production, this would call actual APIs)
    setTimeout(async () => {
      for (const check of checks) {
        await simulateAIEngineResponse(check);
      }
    }, 1000);

    res.json({
      message: 'Visibility checks initiated',
      checks: checks.map(c => ({
        id: c._id,
        engine: c.engine,
        keyword: c.keyword,
        status: c.status
      }))
    });
  } catch (error) {
    console.error('Run checks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/checks/project/:projectId
// @desc    Get checks for a project
// @access  Private
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { engine, keyword, limit = 50, page = 1 } = req.query;

    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id,
      isActive: true
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const query = { project: projectId };
    if (engine) query.engine = engine;
    if (keyword) query.keyword = new RegExp(keyword, 'i');

    const checks = await Check.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Check.countDocuments(query);

    res.json({
      checks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get checks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/checks/:id
// @desc    Get single check
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const check = await Check.findById(req.params.id).populate('project', 'name domain owner');

    if (!check) {
      return res.status(404).json({ message: 'Check not found' });
    }

    // Verify ownership through project
    if (check.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(check);
  } catch (error) {
    console.error('Get check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simulate AI engine response (replace with actual API calls in production)
async function simulateAIEngineResponse(check) {
  try {
    // Simulate realistic response data
    const isPresent = Math.random() > 0.3; // 70% chance of presence
    const position = isPresent ? Math.floor(Math.random() * 10) + 1 : 0;
    const citationsCount = isPresent ? Math.floor(Math.random() * 5) : 0;

    const sampleSnippets = [
      "Based on the latest information, this topic is gaining significant attention in the industry...",
      "Recent developments suggest that this approach is becoming increasingly popular among professionals...",
      "Industry experts are noting a growing trend towards this methodology...",
      "The data indicates a strong correlation between these factors and improved outcomes..."
    ];

    const sampleUrls = [
      "https://example.com/article1",
      "https://example.com/guide",
      "https://example.com/research",
      "https://example.com/insights"
    ];

    check.presence = isPresent;
    check.position = position;
    check.answerSnippet = isPresent ? sampleSnippets[Math.floor(Math.random() * sampleSnippets.length)] : '';
    check.citationsCount = citationsCount;
    check.observedUrls = isPresent ? sampleUrls.slice(0, citationsCount).map((url, index) => ({
      url,
      domain: new URL(url).hostname,
      position: index + 1
    })) : [];
    check.status = 'completed';
    check.metadata.queryTime = Math.floor(Math.random() * 2000) + 500;
    check.metadata.responseSize = Math.floor(Math.random() * 5000) + 1000;

    await check.save();
  } catch (error) {
    console.error('Simulation error:', error);
    check.status = 'failed';
    check.errorMessage = 'Simulation failed';
    await check.save();
  }
}

module.exports = router;
