import api from './api';

// User API Service
export const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  },

  // Search users
  searchUsers: async (query) => {
    try {
      const response = await api.get(`/users?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  },

  // Reset user password
  resetPassword: async (id) => {
    try {
      const response = await api.post(`/users/${id}/reset-password`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to reset password: ${error.message}`);
    }
  }
};

export default userService;
