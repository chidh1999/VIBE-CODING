import api from './api';

// Support API Service
export const supportService = {
  // Get all tickets (Admin only)
  getAllTickets: async () => {
    try {
      const response = await api.get('/support');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch tickets: ${error.message}`);
    }
  },
  
  // Get user's own tickets
  getMyTickets: async () => {
    try {
      const response = await api.get('/support/my-tickets');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch my tickets: ${error.message}`);
    }
  },
  
  // Create new ticket
  createTicket: async (data) => {
    try {
      const response = await api.post('/support', data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create ticket: ${error.message}`);
    }
  },
  
  // Update ticket
  updateTicket: async (id, data) => {
    try {
      const response = await api.put(`/support/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update ticket: ${error.message}`);
    }
  },
  
  // Admin response to ticket
  respondToTicket: async (id, message) => {
    try {
      const response = await api.post(`/support/${id}/respond`, { message });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to respond to ticket: ${error.message}`);
    }
  },
  
  // Update ticket status
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/support/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update ticket status: ${error.message}`);
    }
  },
  
  // Delete ticket
  deleteTicket: async (id) => {
    try {
      const response = await api.delete(`/support/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete ticket: ${error.message}`);
    }
  }
};

export default supportService;

