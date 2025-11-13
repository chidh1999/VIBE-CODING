import React from 'react';
import './Header.css';

const Header = ({ backendStatus, user, onLogout }) => {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <h1>User Management System</h1>
        <div className="header-right">
          {user && (
            <div className="user-info">
              <span className="user-name">Welcome, {user.name}</span>
              <span className="user-role">({user.role?.name || 'No role'})</span>
              <button 
                className="logout-btn"
                onClick={onLogout}
                title="Logout"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
