const userService = require('../services/userService');

class UserController {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const { search } = req.query;
      
      let users;
      if (search) {
        users = await userService.searchUsers(search);
      } else {
        users = await userService.getAllUsers();
      }

      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      const statusCode = error.message.includes('User not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message
      });
    }
  }

  // Create new user
  async createUser(req, res) {
    try {
      const userData = req.body;
      const newUser = await userService.createUser(userData);
     
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
      });
    } catch (error) {
      const statusCode = error.message.includes('Validation failed') || 
                        error.message.includes('Email already exists') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;
      const updatedUser = await userService.updateUser(id, userData);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      const statusCode = error.message.includes('User not found') ? 404 :
                        error.message.includes('Validation failed') || 
                        error.message.includes('Email already exists') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = await userService.deleteUser(id);

      res.json({
        success: true,
        message: 'User deleted successfully',
        data: deletedUser
      });
    } catch (error) {
      const statusCode = error.message.includes('User not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  }

  // Reset user password
  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const updatedUser = await userService.resetPassword(id);

      res.json({
        success: true,
        message: 'Password reset successfully to 123456',
        data: updatedUser
      });
    } catch (error) {
      const statusCode = error.message.includes('User not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: 'Failed to reset password',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
