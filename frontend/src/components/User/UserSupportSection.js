import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import TicketTable from '../Support/TicketTable';
import TicketModal from '../Support/TicketModal';

const UserSupportSection = () => {
  const { tickets, loading, createTicket, deleteTicket, fetchTickets } = useTickets(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="user-support-section">
      <div className="support-header">
        <h2>My Support Tickets</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            className="btn btn-icon"
            onClick={fetchTickets}
            title="Reload"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2902 17.8946 15.3566 20 12 20C7.58172 20 4 16.4183 4 12M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Ticket
          </button>
        </div>
      </div>

      <TicketTable
        tickets={tickets}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onViewTicket={setViewingTicket}
        onDeleteTicket={async (ticketId) => {
          try {
            await deleteTicket(ticketId);
            alert('Ticket deleted successfully');
          } catch (error) {
            console.error('Error deleting ticket:', error);
            alert(`Failed to delete ticket: ${error.message}`);
          }
        }}
        isAdmin={false}
      />

      {/* Create Ticket Modal */}
      <TicketModal
        showModal={showCreateModal}
        ticket={null}
        mode="create"
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (ticketData) => {
          await createTicket(ticketData);
          setShowCreateModal(false);
        }}
        status="open"
        setStatus={() => {}}
        response=""
        setResponse={() => {}}
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

export default UserSupportSection;

