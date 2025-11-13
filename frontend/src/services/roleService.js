import api from './api';

// Role API Service
export const roleService = {
  // Get all roles
  getAllRoles: async () => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }
  },

  // Get role by ID
  getRoleById: async (id) => {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch role: ${error.message}`);
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await api.post('/roles', roleData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create role: ${error.message}`);
    }
  },

  // Update role
  updateRole: async (id, roleData) => {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update role: ${error.message}`);
    }
  },

  // Delete role
  deleteRole: async (id) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  },

  // Search roles
  searchRoles: async (query) => {
    try {
      const response = await api.get(`/roles?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search roles: ${error.message}`);
    }
  },

  // Get role statistics
  getRoleStats: async () => {
    try {
      const response = await api.get('/roles/stats');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get role statistics: ${error.message}`);
    }
  }
};

export default roleService;
