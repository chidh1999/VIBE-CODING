import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from './Login';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Contact your administrator for access.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
