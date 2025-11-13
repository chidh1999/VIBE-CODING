const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['bug', 'feature_request', 'issue', 'suggestion', 'other'],
    default: 'issue'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  attachments: [{
    url: String,
    name: String,
    size: Number
  }],
  adminResponse: {
    message: String,
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    repliedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

supportSchema.index({ user: 1, createdAt: -1 });
supportSchema.index({ status: 1 });

module.exports = mongoose.model('Support', supportSchema);

