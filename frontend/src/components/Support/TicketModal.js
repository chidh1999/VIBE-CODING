import React, { useState } from 'react';
import { Modal } from '../Shared';
import './TicketModal.css';

const TicketModal = ({ 
  showModal, 
  ticket, 
  mode,
  onClose,
  onSubmit,
  status,
  setStatus,
  response,
  setResponse
}) => {
  const [newTicket, setNewTicket] = useState({
    title: '',
    type: 'issue',
    priority: 'medium',
    description: ''
  });
  const getStatusBadgeClass = (statusValue) => {
    switch(statusValue) {
      case 'open': return 'status-open';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'bug': return '🐛';
      case 'feature_request': return '✨';
      case 'issue': return '⚠️';
      case 'suggestion': return '💡';
      case 'other': return '📝';
      default: return '📋';
    }
  };

  if (!showModal) return null;

  return (
    <Modal isOpen={showModal} onClose={onClose} title={mode === 'create' ? 'Create New Ticket' : 'Ticket Details'}>
      {mode === 'create' ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(newTicket);
          setNewTicket({ title: '', type: 'issue', priority: 'medium', description: '' });
        }} className="create-ticket-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={newTicket.title}
              onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
              placeholder="Enter ticket title"
              className="form-control"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={newTicket.type}
                onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                className="form-control"
              >
                <option value="bug">🐛 Bug</option>
                <option value="feature_request">✨ Feature Request</option>
                <option value="issue">⚠️ Issue</option>
                <option value="suggestion">💡 Suggestion</option>
                <option value="other">📝 Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="form-control"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              placeholder="Describe your issue or request"
              rows="6"
              className="form-control"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Ticket</button>
          </div>
        </form>
      ) : mode === 'view' && ticket ? (
        <div className="ticket-details">
          <div className="ticket-header-details">
            <div className="ticket-title-section">
              <h2>
                <span className="type-icon-large">{getTypeIcon(ticket.type)}</span>
                {ticket.title}
              </h2>
              <div className="ticket-meta-info">
                <span className="ticket-type">Type: {ticket.type}</span>
                <span className="ticket-priority">Priority: {ticket.priority}</span>
                <span className={`status-badge-large ${getStatusBadgeClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          </div>

          <div className="ticket-content">
            <div className="ticket-section">
              <h3>Description</h3>
              <p>{ticket.description}</p>
            </div>

            <div className="ticket-section">
              <h3>User Information</h3>
              <p><strong>Name:</strong> {ticket.user?.name || 'Unknown'}</p>
              <p><strong>Email:</strong> {ticket.user?.email || 'Unknown'}</p>
              <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
            </div>

            {ticket.adminResponse && (
              <div className="ticket-section admin-response-section">
                <h3>Admin Response</h3>
                <p><strong>Replied by:</strong> {ticket.adminResponse.repliedBy?.name || 'Admin'}</p>
                <p><strong>Replied at:</strong> {new Date(ticket.adminResponse.repliedAt).toLocaleString()}</p>
                <div className="response-message">
                  {ticket.adminResponse.message}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : mode === 'update-status' && ticket ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(ticket._id, status);
        }} className="status-update-form">
          <div className="form-group">
            <label>Update Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="form-control"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Update Status</button>
        </form>
      ) : mode === 'respond' && ticket ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(ticket._id, response);
        }} className="respond-form">
          <div className="form-group">
            <label>Admin Response</label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Enter your response..."
              rows="6"
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Send Response</button>
        </form>
      ) : null}
    </Modal>
  );
};

export default TicketModal;
