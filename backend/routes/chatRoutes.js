const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Chat routes - Require authentication
router.get('/', authenticateToken, chatController.getAllMessages);
router.get('/user/:userId', authenticateToken, chatController.getMessagesByUser);
router.post('/', authenticateToken, chatController.createMessage);
router.put('/read/:userId', authenticateToken, chatController.markAsRead);
router.get('/unread/:userId', authenticateToken, chatController.getUnreadCount);

module.exports = router;
