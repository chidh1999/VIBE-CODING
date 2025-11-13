import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBackendStatus } from '../../hooks/useUsers';
import Header from '../Header';
import AdminContent from './AdminContent';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { backendStatus } = useBackendStatus();

  return (
    <div className="admin-dashboard">
      <Header 
        backendStatus={backendStatus} 
        user={user} 
        onLogout={logout} 
      />
      <AdminContent />
    </div>
  );
};

export default AdminDashboard;
