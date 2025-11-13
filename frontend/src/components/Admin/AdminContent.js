import React, { useState } from 'react';
import StatsCards from '../StatsCards';
import UsersSection from './UsersSection';
import RolesSection from './RolesSection';
import AdminSupportSection from './AdminSupportSection';
import ChatSection from './ChatSection';
import Panorama360Section from './Panorama360Section';
import Tour360Viewer from './Tour360Viewer';
import { useUsers } from '../../hooks/useUsers';
import './AdminContent.css';

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('users');
  const { users } = useUsers();

  return (
    <main className="dashboard-main">
      <StatsCards users={users || []} />
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          Roles
        </button>
        <button 
          className={`tab-btn ${activeTab === 'supports' ? 'active' : ''}`}
          onClick={() => setActiveTab('supports')}
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
          className={`tab-btn ${activeTab === '360' ? 'active' : ''}`}
          onClick={() => setActiveTab('360')}
        >
          🌐 360 View
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tour360' ? 'active' : ''}`}
          onClick={() => setActiveTab('tour360')}
        >
          🎬 Tour 360
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && <UsersSection />}
      {activeTab === 'roles' && <RolesSection />}
      {activeTab === 'supports' && <AdminSupportSection />}
      {activeTab === 'chat' && <ChatSection />}
      {activeTab === '360' && <Panorama360Section />}
      {activeTab === 'tour360' && <Tour360Viewer />}
    </main>
  );
};

export default AdminContent;
