import React, { useState } from 'react';
import { useRoles } from '../../hooks/useRoles';
import RoleTable from '../Role/RoleTable';
import RoleModal from '../Role/RoleModal';

const RolesSection = () => {
  const { roles, loading, addRole, updateRole, deleteRole } = useRoles();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteRoleId, setDeleteRoleId] = useState(null);
  const [newRole, setNewRole] = useState({ 
    name: '', 
    description: '', 
    permissions: [], 
    isActive: true 
  });

  // Event handlers
  const handleAddRole = async (e) => {
    e.preventDefault();
    try {
      await addRole(newRole);
      setNewRole({ name: '', description: '', permissions: [], isActive: true });
      setShowRoleModal(false);
    } catch (error) {
      alert('Error adding role: ' + error.message);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      await updateRole(editingRole.id || editingRole._id, editingRole);
      setEditingRole(null);
    } catch (error) {
      alert('Error updating role: ' + error.message);
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      await deleteRole(id);
      setDeleteRoleId(null);
    } catch (error) {
      alert('Error deleting role: ' + error.message);
    }
  };

  return (
    <>
      <RoleTable
        roles={roles}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddRole={() => setShowRoleModal(true)}
        onEditRole={setEditingRole}
        onDeleteRole={setDeleteRoleId}
      />

      <RoleModal
        showModal={showRoleModal}
        editingRole={editingRole}
        deleteRoleId={deleteRoleId}
        newRole={newRole}
        setNewRole={setNewRole}
        setEditingRole={setEditingRole}
        setDeleteRoleId={setDeleteRoleId}
        setShowModal={setShowRoleModal}
        onAddRole={handleAddRole}
        onUpdateRole={handleUpdateRole}
        onDeleteRole={handleDeleteRole}
      />
    </>
  );
};

export default RolesSection;
