const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Role name must be at least 2 characters long'],
    maxlength: [50, 'Role name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  permissions: [{
    type: String,
    enum: [
      'read_users',
      'write_users', 
      'delete_users',
      'read_roles',
      'write_roles',
      'delete_roles',
      'admin_access'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add a static method for searching roles
RoleSchema.statics.searchRoles = async function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $or: [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } }
    ]
  }).sort({ createdAt: -1 });
};

// Add a static method for getting role statistics
RoleSchema.statics.getStats = async function() {
  return this.aggregate([
    {
      $facet: {
        totalRoles: [
          { $count: 'count' }
        ],
        activeRoles: [
          { $match: { isActive: true } },
          { $count: 'count' }
        ]
      }
    },
    {
      $project: {
        totalRoles: { $arrayElemAt: ['$totalRoles.count', 0] },
        activeRoles: { $arrayElemAt: ['$activeRoles.count', 0] }
      }
    },
    {
      $project: {
        totalRoles: { $ifNull: ['$totalRoles', 0] },
        activeRoles: { $ifNull: ['$activeRoles', 0] }
      }
    }
  ]);
};

module.exports = mongoose.model('Role', RoleSchema);
