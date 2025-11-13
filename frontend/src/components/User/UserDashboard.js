import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Chat from '../Chat/Chat';
import UserSupportSection from './UserSupportSection';
import Tour360Viewer from '../Admin/Tour360Viewer';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="user-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>User Dashboard</h1>
          <div className="header-right">
            {user && (
              <div className="user-info">
                <span className="user-name">Welcome, {user.name}</span>
                <span className="user-role">({user.role?.name || 'No role'})</span>
                <button 
                  className="logout-btn"
                  onClick={logout}
                  title="Logout"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            🎫 Support
          </button>
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tour360' ? 'active' : ''}`}
            onClick={() => setActiveTab('tour360')}
          >
            🎬 Tour 360
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div className="welcome-section">
              <h2>Welcome to your dashboard!</h2>
              <p>This is a regular user dashboard. More features coming soon...</p>
            </div>

            <div className="user-cards">
              <div className="info-card">
                <h3>Your Information</h3>
                <div className="info-item">
                  <strong>Name:</strong> {user?.name}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {user?.email}
                </div>
                <div className="info-item">
                  <strong>Role:</strong> {user?.role?.name || 'No role assigned'}
                </div>
              </div>

              <div className="features-card">
                <h3>Available Features</h3>
                <ul>
                  <li>View your profile</li>
                  <li>Update your information</li>
                  <li>Change password</li>
                  <li>View notifications</li>
                </ul>
              </div>

              <div className="coming-soon-card">
                <h3>Coming Soon</h3>
                <p>More features will be added here for regular users.</p>
                <div className="feature-list">
                  <span className="feature-tag">Profile Management</span>
                  <span className="feature-tag">Settings</span>
                  <span className="feature-tag">Notifications</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && <UserSupportSection />}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="chat-section">
            <Chat />
          </div>
        )}
        
        {/* Tour 360 Tab */}
        {activeTab === 'tour360' && <Tour360Viewer />}
      </main>
    </div>
  );
};

export default UserDashboard;
