import { useState, useEffect } from 'react';
import { userService, healthAPI } from '../services';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllUsers();
      setUsers(response.data || response);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData) => {
    try {
      const response = await userService.createUser(userData);
      setUsers(prevUsers => [...prevUsers, response.data || response]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const response = await userService.updateUser(id, userData);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          (user.id === id || user._id === id) ? (response.data || response) : user
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await userService.deleteUser(id);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id && user._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (id) => {
    try {
      const response = await userService.resetPassword(id);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          (user.id === id || user._id === id) ? (response.data || response) : user
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    // Only fetch users if user is authenticated and is admin
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.role?.name === 'admin') {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    resetPassword
  };
};

export const useBackendStatus = () => {
  const [backendStatus, setBackendStatus] = useState('');

  const checkBackendStatus = async () => {
    try {
      const response = await healthAPI.check();
      setBackendStatus(response.status);
    } catch (error) {
      setBackendStatus('Backend not connected');
    }
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  return { backendStatus, checkBackendStatus };
};
