import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './api';

// Global state for pending invitations
let globalPendingCount = 0;
let listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export function usePendingInvitations() {
  const [, forceUpdate] = useState(0);

  const fetchPendingInvitations = useCallback(async () => {
    try {
      console.log('Fetching pending invitations...');
      const invitations = await apiClient.getEventInvitations('received');
      const newPendingCount = invitations.filter((inv) => inv.rsvpStatus === 'Pending').length;
      console.log('New pending count:', newPendingCount);
      globalPendingCount = newPendingCount;
      notifyListeners();
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      if (
        error instanceof Error &&
        (error.message?.includes('Unauthorized') || error.message?.includes('401'))
      ) {
        globalPendingCount = 0;
        notifyListeners();
      }
    }
  }, []);

  useEffect(() => {
    // Add this component as a listener
    const listener = () => forceUpdate(Math.random());
    listeners.push(listener);

    // Initial fetch
    fetchPendingInvitations();

    // Cleanup
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, [fetchPendingInvitations]);

  return {
    pendingCount: globalPendingCount,
    refreshPendingInvitations: () => {
      console.log('Manual refresh triggered');
      fetchPendingInvitations();
    },
  };
}
