import api from './api';

// Chat API Service
export const chatService = {
  // Get all messages
  getAllMessages: async (limit = 50) => {
    try {
      const response = await api.get(`/chat?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  },

  // Get messages by user
  getMessagesByUser: async (userId, limit = 50) => {
    try {
      const response = await api.get(`/chat/user/${userId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch user messages: ${error.message}`);
    }
  },

  // Create new message
  createMessage: async (messageData) => {
    try {
      const response = await api.post('/chat', messageData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }
  },

  // Mark messages as read
  markAsRead: async (userId) => {
    try {
      const response = await api.put(`/chat/read/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to mark messages as read: ${error.message}`);
    }
  },

  // Get unread count
  getUnreadCount: async (userId) => {
    try {
      const response = await api.get(`/chat/unread/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }
};

export default chatService;
