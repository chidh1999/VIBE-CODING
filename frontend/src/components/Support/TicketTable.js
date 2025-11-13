import React from 'react';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../Shared/Pagination';
import './TicketTable.css';

const TicketTable = ({ 
  tickets, 
  loading, 
  searchTerm = '', 
  onSearchChange, 
  onViewTicket,
  onUpdateStatus,
  onRespond,
  onDeleteTicket,
  isAdmin = false
}) => {
  const itemsPerPage = 10;
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'open': return 'status-open';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch(priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
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

  const filteredTickets = Array.isArray(tickets) 
    ? tickets.filter(ticket => {
        if (!ticket) return false;
        const title = (ticket.title || '').toLowerCase();
        const userName = ticket.user?.name ? ticket.user.name.toLowerCase() : '';
        const type = (ticket.type || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return title.includes(searchLower) || 
               userName.includes(searchLower) ||
               type.includes(searchLower);
      })
    : [];

  // Use pagination hook
  const {
    paginatedItems: paginatedTickets,
    currentPage,
    totalPages,
    goToPage,
    totalItems
  } = usePagination(filteredTickets, itemsPerPage, searchTerm);

  return (
    <div className="ticket-table-container">
      <div className="actions-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="tickets-grid">
        {loading ? (
          <div className="loading-cell">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-cell">No tickets found</div>
        ) : (
          paginatedTickets.map(ticket => ticket ? (
            <div key={ticket._id} className="ticket-card">
              <div className="ticket-header">
                <div className="ticket-title">
                  <span className="type-icon">{getTypeIcon(ticket.type || 'issue')}</span>
                  <h3>{ticket.title || 'Untitled'}</h3>
                </div>
                <div className="ticket-badges">
                  <span className={`status-badge ${getStatusBadgeClass(ticket.status || 'open')}`}>
                    {ticket.status || 'open'}
                  </span>
                  <span className={`priority-badge ${getPriorityBadgeClass(ticket.priority || 'medium')}`}>
                    {ticket.priority || 'medium'}
                  </span>
                </div>
              </div>

              <div className="ticket-info">
                <p className="ticket-description">
                  {(ticket.description || '').substring(0, 100)}...
                </p>
                <div className="ticket-meta">
                  <span className="ticket-user">
                    {ticket.user?.name || 'Unknown User'}
                  </span>
                  <span className="ticket-date">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {ticket.adminResponse && (
                <div className="admin-response">
                  <strong>Admin Response:</strong>
                  <p>{ticket.adminResponse.message}</p>
                </div>
              )}

              <div className="ticket-actions">
                <button
                  className="btn btn-sm btn-view"
                  onClick={() => onViewTicket(ticket)}
                >
                  View Details
                </button>
                {isAdmin && (
                  <>
                    {onUpdateStatus && (
                      <select
                        className="btn btn-sm btn-status"
                        value={ticket.status}
                        onChange={(e) => onUpdateStatus(ticket._id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    )}
                    {onRespond && !ticket.adminResponse && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => onRespond(ticket)}
                      >
                        Respond
                      </button>
                    )}
                    {onDeleteTicket && (
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
                            onDeleteTicket(ticket._id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
                {!isAdmin && onDeleteTicket && (
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
                        onDeleteTicket(ticket._id);
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ) : null)
        )}
      </div>

      {/* Pagination - Fixed at bottom center */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
      />
    </div>
  );
};

export default TicketTable;
