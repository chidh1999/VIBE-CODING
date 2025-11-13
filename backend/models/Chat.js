const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['text', 'system', 'location', 'image', 'model3d'],
    default: 'text'
  },
  location: {
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    },
    address: {
      type: String,
      trim: true
    }
  },
  image: { // New field for image messages
    url: {
      type: String, // File path/URL
      required: function() { return this.type === 'image'; }
    },
    name: {
      type: String,
      trim: true,
      required: function() { return this.type === 'image'; }
    },
    size: {
      type: Number,
      required: function() { return this.type === 'image'; }
    }
  },
  model3d: { // New field for 3D model messages
    url: {
      type: String, // File path/URL
      required: function() { return this.type === 'model3d'; }
    },
    name: {
      type: String,
      trim: true,
      required: function() { return this.type === 'model3d'; }
    },
    size: {
      type: Number,
      required: function() { return this.type === 'model3d'; }
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
chatSchema.index({ createdAt: -1 });
chatSchema.index({ user: 1 });

// Virtual for formatted date
chatSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleTimeString();
});

// Static method to get recent messages
chatSchema.statics.getRecentMessages = function(limit = 50) {
  return this.find()
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get messages by user
chatSchema.statics.getMessagesByUser = function(userId, limit = 50) {
  return this.find({ user: userId })
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Chat', chatSchema);
