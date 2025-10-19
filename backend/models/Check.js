const mongoose = require('mongoose');

const checkSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  engine: {
    type: String,
    required: true,
    enum: ['chatgpt', 'gemini', 'claude', 'perplexity', 'copilot']
  },
  keyword: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  position: {
    type: Number,
    min: 0,
    default: 0
  },
  presence: {
    type: Boolean,
    default: false
  },
  answerSnippet: {
    type: String,
    trim: true,
    maxlength: [2000, 'Answer snippet cannot exceed 2000 characters']
  },
  citationsCount: {
    type: Number,
    min: 0,
    default: 0
  },
  observedUrls: [{
    url: {
      type: String,
      trim: true
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true
    },
    position: {
      type: Number,
      min: 1
    }
  }],
  metadata: {
    queryTime: {
      type: Number, // in milliseconds
      default: 0
    },
    responseSize: {
      type: Number, // in bytes
      default: 0
    },
    userAgent: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
checkSchema.index({ project: 1, createdAt: -1 });
checkSchema.index({ engine: 1, keyword: 1, createdAt: -1 });
checkSchema.index({ presence: 1, createdAt: -1 });

module.exports = mongoose.model('Check', checkSchema);
