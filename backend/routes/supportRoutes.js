const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticateToken } = require('../middleware/auth');

// Get all tickets (Admin only)
router.get('/', authenticateToken, (req, res) => supportController.getAllTickets(req, res));

// Get user's own tickets
router.get('/my-tickets', authenticateToken, (req, res) => supportController.getUserTickets(req, res));

// Get ticket by ID
router.get('/:id', authenticateToken, (req, res) => supportController.getTicketById(req, res));

// Create new ticket
router.post('/', authenticateToken, (req, res) => supportController.createTicket(req, res));

// Update ticket
router.put('/:id', authenticateToken, (req, res) => supportController.updateTicket(req, res));

// Admin response
router.post('/:id/respond', authenticateToken, (req, res) => supportController.respondToTicket(req, res));

// Update status
router.patch('/:id/status', authenticateToken, (req, res) => supportController.updateStatus(req, res));

// Delete ticket
router.delete('/:id', authenticateToken, (req, res) => supportController.deleteTicket(req, res));

module.exports = router;

