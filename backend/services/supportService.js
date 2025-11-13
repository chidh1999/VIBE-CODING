const Support = require('../models/Support');
const User = require('../models/User');

class SupportService {
  // Get all tickets
  async getAllTickets() {
    return await Support.find()
      .populate('user', 'name email')
      .populate('adminResponse.repliedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  // Get user's own tickets
  async getUserTickets(userId) {
    return await Support.find({ user: userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
  }

  // Create new ticket
  async createTicket(userId, ticketData) {
    const ticket = new Support({
      ...ticketData,
      user: userId
    });
    const savedTicket = await ticket.save();
    return await Support.findById(savedTicket._id)
      .populate('user', 'name email');
  }

  // Update ticket
  async updateTicket(ticketId, updateData) {
    const ticket = await Support.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    Object.assign(ticket, updateData);
    ticket.updatedAt = new Date();
    const savedTicket = await ticket.save();
    
    // Populate user before returning
    return await Support.findById(savedTicket._id)
      .populate('user', 'name email');
  }

  // Admin response to ticket
  async respondToTicket(ticketId, adminId, message) {
    const ticket = await Support.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    ticket.adminResponse = {
      message,
      repliedBy: adminId,
      repliedAt: new Date()
    };
    ticket.updatedAt = new Date();
    
    const savedTicket = await ticket.save();
    
    // Populate user and adminResponse.repliedBy before returning
    return await Support.findById(savedTicket._id)
      .populate('user', 'name email')
      .populate('adminResponse.repliedBy', 'name email');
  }

  // Update ticket status
  async updateStatus(ticketId, status) {
    const ticket = await Support.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    ticket.status = status;
    ticket.updatedAt = new Date();
    const savedTicket = await ticket.save();
    
    // Populate user before returning
    return await Support.findById(savedTicket._id)
      .populate('user', 'name email');
  }

  // Delete ticket
  async deleteTicket(ticketId) {
    const ticket = await Support.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return await Support.findByIdAndDelete(ticketId);
  }

  // Get ticket by ID
  async getTicketById(ticketId) {
    return await Support.findById(ticketId)
      .populate('user', 'name email')
      .populate('adminResponse.repliedBy', 'name email');
  }

  // Search tickets
  async searchTickets(query, filters = {}) {
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ],
      ...filters
    };
    
    return await Support.find(searchQuery)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
  }
}

module.exports = new SupportService();

