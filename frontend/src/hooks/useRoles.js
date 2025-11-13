import { useState, useEffect } from 'react';
import { roleService } from '../services';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleService.getAllRoles();
      setRoles(response.data || response);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (roleData) => {
    try {
      const response = await roleService.createRole(roleData);
      setRoles(prevRoles => [...prevRoles, response.data || response]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateRole = async (id, roleData) => {
    try {
      const response = await roleService.updateRole(id, roleData);
      setRoles(prevRoles => 
        prevRoles.map(role => 
          (role.id === id || role._id === id) ? (response.data || response) : role
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteRole = async (id) => {
    try {
      await roleService.deleteRole(id);
      setRoles(prevRoles => prevRoles.filter(role => role.id !== id && role._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    // Only fetch roles if user is authenticated and is admin
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.role?.name === 'admin') {
      fetchRoles();
    }
  }, []);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    addRole,
    updateRole,
    deleteRole
  };
};
