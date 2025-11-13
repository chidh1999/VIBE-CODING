const User = require('../models/User');

class UserService {
  constructor() {
    // Always use MongoDB
    this.useMongoDB = true;
  }

  // Get all users
  async getAllUsers() {
    try {
      const users = await User.find().populate('role').sort({ createdAt: -1 });
      return users;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const user = await User.findById(id).populate('role');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid user ID');
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const newUser = new User({
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password || '123456', // Default password
        role: userData.role || null
      });
      const savedUser = await newUser.save();
      return await User.findById(savedUser._id).populate('role');
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email already exists');
      }
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Update user
  async updateUser(id, userData) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if email already exists (excluding current user)
      if (userData.email && userData.email !== user.email) {
        const existingUser = await User.findOne({
          email: userData.email.trim().toLowerCase(),
          _id: { $ne: id }
        });
        if (existingUser) {
          throw new Error('Email already exists');
        }
      }

      // Update user fields
      if (userData.name) user.name = userData.name.trim();
      if (userData.email) user.email = userData.email.trim().toLowerCase();
      if (userData.role !== undefined) user.role = userData.role;
      
      // Handle password update
      if (userData.password) {
        user.password = userData.password;
      }

      const updatedUser = await user.save();
      return await User.findById(updatedUser._id).populate('role');
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid user ID');
      }
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid user ID');
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Search users
  async searchUsers(query) {
    try {
      const searchRegex = new RegExp(query, 'i');
      const users = await User.find({
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } }
        ]
      }).sort({ createdAt: -1 });
      return users;
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const totalUsers = await User.countDocuments();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const newThisMonth = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });
      
      return {
        totalUsers,
        newThisMonth
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }

  // Get users with pagination
  async getUsersWithPagination(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const users = await User.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments();

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get users with pagination: ${error.message}`);
    }
  }

  // Reset user password to default
  async resetPassword(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      user.password = '123456'; // Reset to default password
      await user.save();

      return await User.findById(user._id).populate('role');
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid user ID');
      }
      throw new Error(`Failed to reset password: ${error.message}`);
    }
  }
}

module.exports = new UserService();