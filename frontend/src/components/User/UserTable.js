import React from 'react';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../Shared/Pagination';
import './UserTable.css';

const UserTable = ({ 
  users, 
  roles,
  loading, 
  searchTerm, 
  onSearchChange, 
  onAddUser, 
  onEditUser, 
  onDeleteUser,
  onResetPassword
}) => {
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    paginatedItems: paginatedUsers,
    currentPage,
    totalPages,
    goToPage,
    totalItems
  } = usePagination(filteredUsers, 10, searchTerm);
  return (
    <div className="table-container">
      <div className="actions-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={onAddUser}
        >
          + Add New User
        </button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="loading-cell">Loading...</td>
            </tr>
          ) : filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-cell">No users found</td>
            </tr>
          ) : (
            paginatedUsers.map(user => {
              return (
                <tr key={user.id || user._id}>
                  <td>{user.id || user._id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.role ? (
                      <span className="role-badge">{user.role.name}</span>
                    ) : (
                      <span className="no-role">No role</span>
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions">
                  <button
                    className="btn btn-sm btn-edit"
                    onClick={() => onEditUser(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-reset"
                    onClick={() => onResetPassword && onResetPassword(user.id || user._id)}
                    title="Reset password to 123456"
                  >
                    Reset PW
                  </button>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => onDeleteUser(user.id || user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
              );
            })
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        itemsPerPage={10}
        totalItems={totalItems}
      />
    </div>
  );
};

export default UserTable;
