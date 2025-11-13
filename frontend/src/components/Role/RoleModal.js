import React from 'react';
import './RoleModal.css';

const PERMISSIONS = [
  { value: 'read_users', label: 'Read Users' },
  { value: 'write_users', label: 'Write Users' },
  { value: 'delete_users', label: 'Delete Users' },
  { value: 'read_roles', label: 'Read Roles' },
  { value: 'write_roles', label: 'Write Roles' },
  { value: 'delete_roles', label: 'Delete Roles' },
  { value: 'admin_access', label: 'Admin Access' }
];

const RoleModal = ({ 
  showModal, 
  editingRole, 
  deleteRoleId, 
  newRole, 
  setNewRole, 
  setEditingRole, 
  setDeleteRoleId, 
  setShowModal, 
  onAddRole, 
  onUpdateRole, 
  onDeleteRole 
}) => {
  const handlePermissionChange = (permission, isChecked, role, setRole) => {
    if (isChecked) {
      setRole({
        ...role,
        permissions: [...(role.permissions || []), permission]
      });
    } else {
      setRole({
        ...role,
        permissions: (role.permissions || []).filter(p => p !== permission)
      });
    }
  };

  return (
    <>
      {/* Add Role Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Role</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={onAddRole} className="modal-form">
              <div className="form-group">
                <label>Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newRole.description || ''}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-grid">
                  {PERMISSIONS.map(permission => (
                    <label key={permission.value} className="permission-checkbox">
                      <input
                        type="checkbox"
                        value={permission.value}
                        checked={(newRole.permissions || []).includes(permission.value)}
                        onChange={(e) => handlePermissionChange(
                          permission.value, 
                          e.target.checked, 
                          newRole, 
                          setNewRole
                        )}
                      />
                      <span>{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="status-toggle">
                  <input
                    type="checkbox"
                    checked={newRole.isActive !== false}
                    onChange={(e) => setNewRole({...newRole, isActive: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                  Active Role
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Role</h2>
              <button className="close-btn" onClick={() => setEditingRole(null)}>×</button>
            </div>
            <form onSubmit={onUpdateRole} className="modal-form">
              <div className="form-group">
                <label>Role Name</label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingRole.description || ''}
                  onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-grid">
                  {PERMISSIONS.map(permission => (
                    <label key={permission.value} className="permission-checkbox">
                      <input
                        type="checkbox"
                        value={permission.value}
                        checked={(editingRole.permissions || []).includes(permission.value)}
                        onChange={(e) => handlePermissionChange(
                          permission.value, 
                          e.target.checked, 
                          editingRole, 
                          setEditingRole
                        )}
                      />
                      <span>{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="status-toggle">
                  <input
                    type="checkbox"
                    checked={editingRole.isActive !== false}
                    onChange={(e) => setEditingRole({...editingRole, isActive: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                  Active Role
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingRole(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteRoleId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="close-btn" onClick={() => setDeleteRoleId(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this role? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setDeleteRoleId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => onDeleteRole(deleteRoleId)} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleModal;
