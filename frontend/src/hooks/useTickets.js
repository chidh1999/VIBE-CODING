import { useState, useEffect } from 'react';
import { supportService } from '../services';

export const useTickets = (isMyTickets = false) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = isMyTickets 
        ? await supportService.getMyTickets()
        : await supportService.getAllTickets();
      
      // Support service returns response.data from axios, which is { success: true, data: [...] }
      const data = response.data || response;
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (data) => {
    try {
      const response = await supportService.createTicket(data);
      // Response is { success: true, data: {...} }
      const newTicket = response.data || response;
      setTickets(prev => [...prev, newTicket]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTicket = async (id, data) => {
    try {
      const response = await supportService.updateTicket(id, data);
      setTickets(prev => 
        prev.map(ticket => 
          (ticket._id === id || ticket.id === id) ? (response.data || response) : ticket
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    try {
      await supportService.deleteTicket(id);
      setTickets(prev => prev.filter(ticket => ticket._id !== id && ticket.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await supportService.updateStatus(id, status);
      setTickets(prev => 
        prev.map(ticket => 
          (ticket._id === id || ticket.id === id) ? (response.data || response) : ticket
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const respondToTicket = async (id, message) => {
    try {
      const response = await supportService.respondToTicket(id, message);
      setTickets(prev => 
        prev.map(ticket => 
          (ticket._id === id || ticket.id === id) ? (response.data || response) : ticket
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchTickets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTickets]);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    updateStatus,
    respondToTicket
  };
};

