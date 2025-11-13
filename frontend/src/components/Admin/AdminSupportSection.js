import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import TicketTable from '../Support/TicketTable';
import TicketModal from '../Support/TicketModal';

const AdminSupportSection = () => {
  const { tickets, loading, updateStatus, respondToTicket, deleteTicket, fetchTickets } = useTickets(false);
  const [statusUpdateTicket, setStatusUpdateTicket] = useState(null);
  const [respondTicket, setRespondTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [status, setStatus] = useState('open');
  const [response, setResponse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await updateStatus(ticketId, newStatus);
      setStatusUpdateTicket(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRespond = async (ticketId, message) => {
    try {
      await respondToTicket(ticketId, message);
      setRespondTicket(null);
      setResponse('');
    } catch (error) {
      console.error('Error responding to ticket:', error);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await deleteTicket(ticketId);
      alert('Ticket deleted successfully');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert(`Failed to delete ticket: ${error.message}`);
    }
  };

  return (
    <div className="admin-support-section">
      <div className="support-header">
        <h2>All Support Tickets</h2>
        <button 
          className="btn btn-icon"
          onClick={fetchTickets}
          title="Reload"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2902 17.8946 15.3566 20 12 20C7.58172 20 4 16.4183 4 12M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <TicketTable
        tickets={tickets}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onViewTicket={setViewingTicket}
        onUpdateStatus={handleUpdateStatus}
        onRespond={(ticket) => {
          setRespondTicket(ticket);
          setResponse('');
        }}
        onDeleteTicket={handleDeleteTicket}
        isAdmin={true}
      />

      {/* Update Status Modal */}
      <TicketModal
        showModal={statusUpdateTicket !== null}
        ticket={statusUpdateTicket}
        mode="update-status"
        onClose={() => setStatusUpdateTicket(null)}
        onSubmit={(ticketId, newStatus) => handleUpdateStatus(ticketId, newStatus)}
        status={status}
        setStatus={setStatus}
        response=""
        setResponse={() => {}}
      />

      {/* Respond Modal */}
      <TicketModal
        showModal={respondTicket !== null}
        ticket={respondTicket}
        mode="respond"
        onClose={() => {
          setRespondTicket(null);
          setResponse('');
        }}
        onSubmit={(ticketId, message) => handleRespond(ticketId, message)}
        status={respondTicket?.status || 'open'}
        setStatus={() => {}}
        response={response}
        setResponse={setResponse}
      />

      {/* View Ticket Modal */}
      <TicketModal
        showModal={viewingTicket !== null}
        ticket={viewingTicket}
        mode="view"
        onClose={() => setViewingTicket(null)}
        status={viewingTicket?.status || 'open'}
        setStatus={() => {}}
        response={viewingTicket?.response || ''}
        setResponse={() => {}}
      />
    </div>
  );
};

export default AdminSupportSection;

