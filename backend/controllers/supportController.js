const supportService = require('../services/supportService');

class SupportController {
  // Get all support tickets (Admin only)
  async getAllTickets(req, res) {
    try {
      const tickets = await supportService.getAllTickets();
      
      res.json({
        success: true,
        data: tickets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user's own tickets
  async getUserTickets(req, res) {
    try {
      const tickets = await supportService.getUserTickets(req.user._id);
      
      res.json({
        success: true,
        data: tickets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new ticket
  async createTicket(req, res) {
    try {
      const { title, type, priority, description, attachments } = req.body;
      
      const ticket = await supportService.createTicket(req.user._id, {
        title,
        type,
        priority,
        description,
        attachments: attachments || []
      });
      
      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        data: ticket
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update ticket
  async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const { title, type, priority, description } = req.body;
      
      const ticket = await supportService.getTicketById(id);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }
      
      // Check permissions
      const isAdmin = req.user.role?.name === 'admin';
      const isOwner = ticket.user.toString() === req.user._id;
      
      if (!isAdmin && (!isOwner || ticket.status !== 'open')) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own open tickets'
        });
      }
      
      const updateData = {};
      if (title) updateData.title = title;
      if (type) updateData.type = type;
      if (priority) updateData.priority = priority;
      if (description) updateData.description = description;
      
      const updatedTicket = await supportService.updateTicket(id, updateData);
      
      res.json({
        success: true,
        message: 'Ticket updated successfully',
        data: updatedTicket
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin response to ticket
  async respondToTicket(req, res) {
    try {
      const { id } = req.params;
      const { message } = req.body;
      
      const ticket = await supportService.getTicketById(id);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }
      
      // Only admin can respond
      if (req.user.role?.name !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can respond to tickets'
        });
      }
      
      const updatedTicket = await supportService.respondToTicket(id, req.user._id, message);
      
      res.json({
        success: true,
        message: 'Response added successfully',
        data: updatedTicket
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update ticket status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const ticket = await supportService.getTicketById(id);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }
      
      // Only admin can update status
      if (req.user.role?.name !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can update ticket status'
        });
      }
      
      const updatedTicket = await supportService.updateStatus(id, status);
      
      res.json({
        success: true,
        message: 'Status updated successfully',
        data: updatedTicket
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete ticket
  async deleteTicket(req, res) {
    try {
      const { id } = req.params;
      
      const ticket = await supportService.getTicketById(id);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }
      
      // Only admin or ticket owner can delete
      const isAdmin = req.user.role?.name === 'admin';
      const isOwner = ticket.user.toString() === req.user._id;
      
      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own tickets'
        });
      }
      
      await supportService.deleteTicket(id);
      
      res.json({
        success: true,
        message: 'Ticket deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get ticket by ID
  async getTicketById(req, res) {
    try {
      const { id } = req.params;
      
      const ticket = await supportService.getTicketById(id);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }
      
      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new SupportController();
