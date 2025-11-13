import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import UserDashboard from './components/User/UserDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import './App.css';

function AppContent() {
  const { isAdmin, isUser } = useAuth();

  // Show user dashboard for regular users
  if (isUser()) {
    return <UserDashboard />;
  }

  // Show admin dashboard for admin users
  if (isAdmin()) {
    return <AdminDashboard />;
  }

  // Fallback
  return <UserDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;