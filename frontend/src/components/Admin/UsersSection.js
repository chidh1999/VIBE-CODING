import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useModal } from '../../hooks/useModal';
import UserTable from '../User/UserTable';
import UserModal from '../User/UserModal';

const UsersSection = () => {
  const { users, loading, addUser, updateUser, deleteUser, resetPassword } = useUsers();
  const { roles } = useRoles();
  const {
    showModal,
    editingUser,
    deleteUserId,
    newUser,
    setNewUser,
    setEditingUser,
    setDeleteUserId,
    setShowModal,
    openAddModal,
    openEditModal,
    openDeleteModal,
    closeAddModal,
    closeEditModal,
    closeDeleteModal
  } = useModal();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Event handlers
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await addUser(newUser);
      closeAddModal();
    } catch (error) {
      alert('Error adding user: ' + error.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser.id || editingUser._id, editingUser);
      closeEditModal();
    } catch (error) {
      alert('Error updating user: ' + error.message);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      closeDeleteModal();
    } catch (error) {
      alert('Error deleting user: ' + error.message);
    }
  };

  const handleResetPassword = async (id) => {
    if (window.confirm('Are you sure you want to reset this user\'s password to 123456?')) {
      try {
        await resetPassword(id);
        alert('Password reset successfully to 123456');
      } catch (error) {
        alert('Error resetting password: ' + error.message);
      }
    }
  };

  return (
    <>
      <UserTable
        users={users}
        roles={roles}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddUser={openAddModal}
        onEditUser={openEditModal}
        onDeleteUser={openDeleteModal}
        onResetPassword={handleResetPassword}
      />

      <UserModal
        showModal={showModal}
        editingUser={editingUser}
        deleteUserId={deleteUserId}
        newUser={newUser}
        setNewUser={setNewUser}
        setEditingUser={setEditingUser}
        setDeleteUserId={setDeleteUserId}
        setShowModal={setShowModal}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        roles={roles}
      />
    </>
  );
};

export default UsersSection;
