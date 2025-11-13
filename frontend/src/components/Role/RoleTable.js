import React from 'react';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../Shared/Pagination';
import './RoleTable.css';

const RoleTable = ({ 
  roles, 
  loading, 
  searchTerm, 
  onSearchChange, 
  onAddRole, 
  onEditRole, 
  onDeleteRole 
}) => {
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const {
    paginatedItems: paginatedRoles,
    currentPage,
    totalPages,
    goToPage,
    totalItems
  } = usePagination(filteredRoles, 10, searchTerm);

  return (
    <div className="table-container">
      <div className="actions-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={onAddRole}
        >
          + Add New Role
        </button>
      </div>

      <table className="roles-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Permissions</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="loading-cell">Loading...</td>
            </tr>
          ) : filteredRoles.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-cell">No roles found</td>
            </tr>
          ) : (
            paginatedRoles.map(role => (
              <tr key={role.id || role._id}>
                <td>{role.id || role._id}</td>
                <td>{role.name}</td>
                <td>{role.description || '-'}</td>
                <td>
                  <div className="permissions-list">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((permission, index) => (
                        <span key={index} className="permission-tag">
                          {permission.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="no-permissions">No permissions</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${role.isActive ? 'active' : 'inactive'}`}>
                    {role.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(role.createdAt).toLocaleDateString()}</td>
                <td className="actions">
                  <button
                    className="btn btn-sm btn-edit"
                    onClick={() => onEditRole(role)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => onDeleteRole(role.id || role._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
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

export default RoleTable;
