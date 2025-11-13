import React from 'react';
import './UserModal.css';

const UserModal = ({ 
  showModal, 
  editingUser, 
  deleteUserId, 
  newUser, 
  setNewUser, 
  setEditingUser, 
  setDeleteUserId, 
  setShowModal, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser,
  roles = []
}) => {
  return (
    <>
      {/* Add User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={onAddUser} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password || ''}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Default: 123456"
                />
                <small className="form-help">Leave empty for default password (123456)</small>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role || ''}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="close-btn" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <form onSubmit={onUpdateUser} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editingUser.role.name || ''}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role._id } value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="close-btn" onClick={() => setDeleteUserId(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setDeleteUserId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => onDeleteUser(deleteUserId)} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserModal;
