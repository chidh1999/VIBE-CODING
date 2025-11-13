const roleService = require('../services/roleService');

class RoleController {
  // Get all roles
  async getAllRoles(req, res) {
    try {
      const { search } = req.query;

      let roles;
      if (search) {
        roles = await roleService.searchRoles(search);
      } else {
        roles = await roleService.getAllRoles();
      }

      res.json({
        success: true,
        data: roles,
        count: roles.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch roles',
        error: error.message
      });
    }
  }

  // Get role by ID
  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const role = await roleService.getRoleById(id);

      res.json({
        success: true,
        data: role
      });
    } catch (error) {
      const statusCode = error.message.includes('Role not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Failed to fetch role',
        error: error.message
      });
    }
  }

  // Create new role
  async createRole(req, res) {
    try {
      const roleData = req.body;
      const newRole = await roleService.createRole(roleData);

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: newRole
      });
    } catch (error) {
      const statusCode = error.message.includes('Validation failed') ||
                        error.message.includes('Role name already exists') ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Failed to create role',
        error: error.message
      });
    }
  }

  // Update role
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const roleData = req.body;
      const updatedRole = await roleService.updateRole(id, roleData);

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: updatedRole
      });
    } catch (error) {
      const statusCode = error.message.includes('Role not found') ? 404 :
                        error.message.includes('Validation failed') ||
                        error.message.includes('Role name already exists') ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Failed to update role',
        error: error.message
      });
    }
  }

  // Delete role
  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const deletedRole = await roleService.deleteRole(id);

      res.json({
        success: true,
        message: 'Role deleted successfully',
        data: deletedRole
      });
    } catch (error) {
      const statusCode = error.message.includes('Role not found') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Failed to delete role',
        error: error.message
      });
    }
  }

  // Get role statistics
  async getRoleStats(req, res) {
    try {
      const stats = await roleService.getRoleStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get role statistics',
        error: error.message
      });
    }
  }

  // Get roles with pagination
  async getRolesWithPagination(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await roleService.getRolesWithPagination(page, limit);

      res.json({
        success: true,
        data: result.roles,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get roles with pagination',
        error: error.message
      });
    }
  }
}

module.exports = new RoleController();
