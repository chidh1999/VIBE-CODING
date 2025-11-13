const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Get all users (with optional search) - Admin only
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);

// GET /api/users/:id - Get user by ID - Admin only
router.get('/:id', authenticateToken, requireAdmin, userController.getUserById);

// POST /api/users - Create new user - Admin only
router.post('/', authenticateToken, requireAdmin, userController.createUser);

// PUT /api/users/:id - Update user - Admin only
router.put('/:id', authenticateToken, requireAdmin, userController.updateUser);

// DELETE /api/users/:id - Delete user - Admin only
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

// POST /api/users/:id/reset-password - Reset user password - Admin only
router.post('/:id/reset-password', authenticateToken, requireAdmin, userController.resetPassword);

module.exports = router;
