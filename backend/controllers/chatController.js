const Chat = require('../models/Chat');

class ChatController {
  // Get all messages
  async getAllMessages(req, res) {
    try {
      const { limit = 50 } = req.query;
      const messages = await Chat.getRecentMessages(parseInt(limit));
      
      res.json({
        success: true,
        data: messages.reverse(), // Reverse to show oldest first
        count: messages.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
        error: error.message
      });
    }
  }

  // Get messages by user
  async getMessagesByUser(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      const messages = await Chat.getMessagesByUser(userId, parseInt(limit));
      
      res.json({
        success: true,
        data: messages.reverse(),
        count: messages.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user messages',
        error: error.message
      });
    }
  }

  // Create new message
  async createMessage(req, res) {
    try {
      const { message, userId } = req.body;
      
      if (!message || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Message and userId are required'
        });
      }

      const newMessage = new Chat({
        user: userId,
        message: message.trim(),
        type: 'text'
      });

      const savedMessage = await newMessage.save();
      const populatedMessage = await Chat.findById(savedMessage._id)
        .populate('user', 'name email role');

      res.status(201).json({
        success: true,
        message: 'Message created successfully',
        data: populatedMessage
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create message',
        error: error.message
      });
    }
  }

  // Mark messages as read
  async markAsRead(req, res) {
    try {
      const { userId } = req.params;
      
      await Chat.updateMany(
        { user: { $ne: userId }, isRead: false },
        { isRead: true }
      );

      res.json({
        success: true,
        message: 'Messages marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read',
        error: error.message
      });
    }
  }

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const { userId } = req.params;
      
      const unreadCount = await Chat.countDocuments({
        user: { $ne: userId },
        isRead: false
      });

      res.json({
        success: true,
        data: { unreadCount }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: error.message
      });
    }
  }
}

module.exports = new ChatController();
