import { useState } from 'react';

export const useModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

  const openAddModal = () => {
    setShowModal(true);
    setNewUser({ name: '', email: '', password: '' });
  };

  const openEditModal = (user) => {
    setEditingUser(user);
  };

  const openDeleteModal = (id) => {
    setDeleteUserId(id);
  };

  const closeAllModals = () => {
    setShowModal(false);
    setEditingUser(null);
    setDeleteUserId(null);
    setNewUser({ name: '', email: '', password: '' });
  };

  const closeAddModal = () => {
    setShowModal(false);
    setNewUser({ name: '', email: '', password: '' });
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const closeDeleteModal = () => {
    setDeleteUserId(null);
  };

  return {
    // State
    showModal,
    editingUser,
    deleteUserId,
    newUser,
    
    // Setters
    setNewUser,
    setEditingUser,
    setDeleteUserId,
    setShowModal,
    
    // Actions
    openAddModal,
    openEditModal,
    openDeleteModal,
    closeAllModals,
    closeAddModal,
    closeEditModal,
    closeDeleteModal
  };
};
