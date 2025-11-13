const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // unique: true automatically creates an index
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
// Note: email index is already defined in schema with unique: true, so we don't need to add it again
userSchema.index({ name: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for formatted date
userSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt ? this.createdAt.toLocaleDateString() : '';
});

// Pre-save middleware to hash password and update updatedAt
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    this.updatedAt = new Date();
    return next();
  }

  try {
    // Hash password with bcrypt
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to find users by name or email
userSchema.statics.searchUsers = function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  }).sort({ createdAt: -1 });
};

// Static method to get user statistics
userSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        newThisMonth: {
          $sum: {
            $cond: [
              { $gte: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);