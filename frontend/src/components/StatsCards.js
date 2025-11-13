import React from 'react';
import './StatsCards.css';

const StatsCards = ({ users }) => {
  const newThisMonth = users.filter(u => 
    new Date(u.createdAt) > new Date(Date.now() - 30*24*60*60*1000)
  ).length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Users</h3>
        <p className="stat-number">{users.length}</p>
      </div>
      <div className="stat-card">
        <h3>Active Users</h3>
        <p className="stat-number">{users.length}</p>
      </div>
      <div className="stat-card">
        <h3>New This Month</h3>
        <p className="stat-number">{newThisMonth}</p>
      </div>
    </div>
  );
};

export default StatsCards;
