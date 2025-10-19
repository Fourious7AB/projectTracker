const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ 
      owner: req.user._id, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isActive: true
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Project name is required'),
  body('domain').isURL().withMessage('Please provide a valid domain URL'),
  body('brand').trim().isLength({ min: 1, max: 100 }).withMessage('Brand name is required'),
  body('keywords').isArray({ min: 1 }).withMessage('At least one keyword is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, domain, brand, competitors, keywords, settings } = req.body;

    const project = new Project({
      name,
      description,
      domain,
      brand,
      competitors: competitors || [],
      keywords,
      settings: settings || { checkFrequency: 'daily', engines: ['chatgpt', 'gemini'] },
      owner: req.user._id
    });

    await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('domain').optional().isURL(),
  body('brand').optional().trim().isLength({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isActive: true
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        project[key] = updates[key];
      }
    });

    await project.save();

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isActive: true
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.isActive = false;
    await project.save();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
