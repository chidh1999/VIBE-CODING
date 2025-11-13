const Role = require('../models/Role');

class RoleService {
  constructor() {
    this.useMongoDB = true;
  }

  // Get all roles
  async getAllRoles() {
    try {
      const roles = await Role.find().sort({ createdAt: -1 });
      return roles;
    } catch (error) {
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }
  }

  // Get role by ID
  async getRoleById(id) {
    try {
      const role = await Role.findById(id);
      if (!role) {
        throw new Error('Role not found');
      }
      return role;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid role ID');
      }
      throw new Error(`Failed to fetch role: ${error.message}`);
    }
  }

  // Create new role
  async createRole(roleData) {
    try {
      const newRole = new Role({
        name: roleData.name.trim(),
        description: roleData.description?.trim() || '',
        permissions: roleData.permissions || [],
        isActive: roleData.isActive !== undefined ? roleData.isActive : true
      });
      const savedRole = await newRole.save();
      return savedRole;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Role name already exists');
      }
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  // Update role
  async updateRole(id, roleData) {
    try {
      const role = await Role.findById(id);
      if (!role) {
        throw new Error('Role not found');
      }

      // Check if name already exists (excluding current role)
      if (roleData.name && roleData.name !== role.name) {
        const existingRole = await Role.findOne({
          name: roleData.name.trim(),
          _id: { $ne: id }
        });
        if (existingRole) {
          throw new Error('Role name already exists');
        }
      }

      // Update role fields
      if (roleData.name) role.name = roleData.name.trim();
      if (roleData.description !== undefined) role.description = roleData.description.trim();
      if (roleData.permissions) role.permissions = roleData.permissions;
      if (roleData.isActive !== undefined) role.isActive = roleData.isActive;

      const updatedRole = await role.save();
      return updatedRole;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid role ID');
      }
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      throw new Error(`Failed to update role: ${error.message}`);
    }
  }

  // Delete role
  async deleteRole(id) {
    try {
      const role = await Role.findByIdAndDelete(id);
      if (!role) {
        throw new Error('Role not found');
      }
      return role;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid role ID');
      }
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  // Search roles
  async searchRoles(query) {
    try {
      const searchRegex = new RegExp(query, 'i');
      const roles = await Role.find({
        $or: [
          { name: { $regex: searchRegex } },
          { description: { $regex: searchRegex } }
        ]
      }).sort({ createdAt: -1 });
      return roles;
    } catch (error) {
      throw new Error(`Failed to search roles: ${error.message}`);
    }
  }

  // Get role statistics
  async getRoleStats() {
    try {
      const totalRoles = await Role.countDocuments();
      const activeRoles = await Role.countDocuments({ isActive: true });
      
      return {
        totalRoles,
        activeRoles
      };
    } catch (error) {
      throw new Error(`Failed to get role stats: ${error.message}`);
    }
  }

  // Get roles with pagination
  async getRolesWithPagination(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const roles = await Role.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Role.countDocuments();

      return {
        roles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRoles: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get roles with pagination: ${error.message}`);
    }
  }
}

module.exports = new RoleService();
