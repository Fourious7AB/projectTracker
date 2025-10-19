const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    trim: true,
    lowercase: true
  },
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true
  },
  competitors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  }],
  keywords: [{
    keyword: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    category: {
      type: String,
      enum: ['primary', 'secondary', 'long-tail'],
      default: 'primary'
    },
    targetPosition: {
      type: Number,
      min: 1,
      max: 10
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    checkFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    engines: [{
      type: String,
      enum: ['chatgpt', 'gemini', 'claude', 'perplexity', 'copilot']
    }]
  }
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ owner: 1, isActive: 1 });
projectSchema.index({ domain: 1 });

module.exports = mongoose.model('Project', projectSchema);
