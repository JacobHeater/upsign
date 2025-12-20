'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button, Input, Card, Textarea, Icon, Tag } from '@/components/design-system';
import { apiClient } from '@/lib/api';
import { Event, EventSegment, User, EventInvitation, EventSegmentAttendee, EventSegmentAttendeeContribution, ChatMessage, EventAttendee } from 'common/schema';
import { useSocket } from '@/lib/use-socket';
import { useRouter } from 'next/navigation';

export default function ViewEventPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [invitations, setInvitations] = useState<EventInvitation[]>([]);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [editingContributionId, setEditingContributionId] = useState<string | null>(null);
  const [presentUsers, setPresentUsers] = useState<User[]>([]);
  const [userCache, setUserCache] = useState<Map<string, User>>(new Map());
  const [showPresenceModal, setShowPresenceModal] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const messagesRef = useRef<HTMLDivElement>(null);
  const mobileMessagesRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, userData] = await Promise.all([
          apiClient.getEvent(eventId),
          apiClient.getCurrentUser().catch(() => null),
        ]);
        setEvent(eventData);
        setCurrentUser(userData);

        // Fetch invitations if user is host
        if (userData && eventData.hostId === userData.id) {
          const invitationsData = await apiClient.getEventInvitations(undefined, eventId);
          setInvitations(invitationsData);
        }
      } catch (err) {
        setError('404 - Event not found');
        console.error('Error fetching event:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  // Socket listener for real-time RSVP updates
  useEffect(() => {
    if (!socket || !event || !currentUser || event.hostId !== currentUser.id) return;

    const handleInvitationRsvpd = async (data: { invitation: EventInvitation; event: Event }) => {
      // Only update if this is for the current event
      if (data.event.id === eventId) {
        console.log('Received RSVP update for event:', eventId);

        try {
          // Refetch event to get updated attendees
          const updatedEvent = await apiClient.getEvent(eventId);
          setEvent(updatedEvent);

          // Refetch invitations
          const updatedInvitations = await apiClient.getEventInvitations(undefined, eventId);
          setInvitations(updatedInvitations);
        } catch (error) {
          console.error('Failed to update event data after RSVP:', error);
        }
      }
    };

    socket.on('invitation-rsvpd', handleInvitationRsvpd);

    return () => {
      socket.off('invitation-rsvpd', handleInvitationRsvpd);
    };
  }, [socket, event, currentUser, eventId]);

  // Socket listener for real-time attendee additions
  useEffect(() => {
    if (!socket || !event) return;

    const handleAttendeeAdded = async (data: { attendee: EventSegmentAttendee; segment: EventSegment; eventId: string }) => {
      // Only update if this is for the current event
      if (data.eventId === eventId) {
        console.log('Received attendee added for event:', eventId);

        try {
          // Refetch event to get updated segment attendees
          const updatedEvent = await apiClient.getEvent(eventId);
          setEvent(updatedEvent);
        } catch (error) {
          console.error('Failed to update event data after attendee added:', error);
        }
      }
    };

    socket.on('attendee-added', handleAttendeeAdded);

    return () => {
      socket.off('attendee-added', handleAttendeeAdded);
    };
  }, [socket, event, eventId]);

  // Socket listener for real-time attendee removals
  useEffect(() => {
    if (!socket || !event) return;

    const handleSegmentAttendeeLeft = async (data: { attendee: EventSegmentAttendee; segment: EventSegment; eventId: string }) => {
      // Only update if this is for the current event
      if (data.eventId === eventId) {
        console.log('Received segment attendee left for event:', eventId);

        try {
          // Refetch event to get updated segment attendees
          const updatedEvent = await apiClient.getEvent(eventId);
          setEvent(updatedEvent);
        } catch (error) {
          console.error('Failed to update event data after segment attendee left:', error);
        }
      }
    };

    socket.on('segment-attendee-left', handleSegmentAttendeeLeft);

    return () => {
      socket.off('segment-attendee-left', handleSegmentAttendeeLeft);
    };
  }, [socket, event, eventId]);

  // Socket listener for real-time attendee removals
  useEffect(() => {
    if (!socket || !event) return;

    const handleAttendeeRemoved = async (data: { attendee: EventAttendee; eventId: string }) => {
      if (data.attendee.userId === currentUser?.id) {
        return router.push('/events');
      }

      if (data.eventId === eventId) {
        console.log('Received attendee removed for event:', eventId);

        try {
          // Refetch event to get updated attendees
          const updatedEvent = await apiClient.getEvent(eventId);
          setEvent(updatedEvent);
        } catch (error) {
          console.error('Failed to update event data after attendee removed:', error);
        }
      }
    };

    socket.on('attendee-removed', handleAttendeeRemoved);

    return () => {
      socket.off('attendee-removed', handleAttendeeRemoved);
    };
  }, [socket, event, eventId]);

  // Socket listener for real-time contribution additions
  useEffect(() => {
    if (!socket || !event) return;

    const handleContributionAdded = async (data: { contribution: EventSegmentAttendeeContribution; attendee: EventSegmentAttendee; segment: EventSegment; eventId: string }) => {
      // Only update if this is for the current event
      if (data.eventId === eventId) {
        console.log('Received contribution added for event:', eventId);

        try {
          // Refetch event to get updated contributions
          const updatedEvent = await apiClient.getEvent(eventId);

          // Non-destructive update: preserve the contribution being edited
          if (editingContributionId) {
            // Find and preserve the editing contribution from current event state
            const preserveEditingContribution = (segments: EventSegment[]) => {
              return segments.map(segment => ({
                ...segment,
                attendees: segment.attendees?.map(attendee => ({
                  ...attendee,
                  contributions: attendee.contributions?.map(contrib =>
                    contrib.id === editingContributionId ? (
                      // Find the current contribution from the existing event state
                      event.segments?.flatMap(s => s.attendees?.flatMap(a => a.contributions || []) || [])
                        .find(c => c.id === editingContributionId) || contrib
                    ) : contrib
                  ) || []
                })) || []
              }));
            };

            updatedEvent.segments = preserveEditingContribution(updatedEvent.segments || []);
          }

          setEvent(updatedEvent);
        } catch (error) {
          console.error('Failed to update event data after contribution added:', error);
        }
      }
    };

    socket.on('contribution-added', handleContributionAdded);

    return () => {
      socket.off('contribution-added', handleContributionAdded);
    };
  }, [socket, event, eventId, editingContributionId]);

  // Socket listener for real-time contribution updates
  useEffect(() => {
    if (!socket || !event) return;

    const handleContributionUpdated = async (data: { contribution: EventSegmentAttendeeContribution; attendee: EventSegmentAttendee; segment: EventSegment; eventId: string }) => {
      // Only update if this is for the current event
      if (data.eventId === eventId) {
        console.log('Received contribution updated for event:', eventId);

        try {
          // Refetch event to get updated contributions
          const updatedEvent = await apiClient.getEvent(eventId);

          // Non-destructive update: preserve the contribution being edited
          if (editingContributionId) {
            // Find and preserve the editing contribution from current event state
            const preserveEditingContribution = (segments: EventSegment[]) => {
              return segments.map(segment => ({
                ...segment,
                attendees: segment.attendees?.map(attendee => ({
                  ...attendee,
                  contributions: attendee.contributions?.map(contrib =>
                    contrib.id === editingContributionId ? (
                      // Find the current contribution from the existing event state
                      event.segments?.flatMap(s => s.attendees?.flatMap(a => a.contributions || []) || [])
                        .find(c => c.id === editingContributionId) || contrib
                    ) : contrib
                  ) || []
                })) || []
              }));
            };

            updatedEvent.segments = preserveEditingContribution(updatedEvent.segments || []);
          }

          setEvent(updatedEvent);
        } catch (error) {
          console.error('Failed to update event data after contribution updated:', error);
        }
      }
    };

    socket.on('contribution-updated', handleContributionUpdated);

    return () => {
      socket.off('contribution-updated', handleContributionUpdated);
    };
  }, [socket, event, eventId, editingContributionId]);

  // Socket listener for real-time contribution deletions
  useEffect(() => {
    if (!socket || !event) return;

    const handleContributionDeleted = async (data: { contribution: EventSegmentAttendeeContribution; attendee: EventSegmentAttendee; segment: EventSegment; eventId: string }) => {
      // Only update if this is for the current event
      if (data.eventId === eventId) {
        console.log('Received contribution deleted for event:', eventId);

        try {
          // Refetch event to get updated contributions
          const updatedEvent = await apiClient.getEvent(eventId);

          // Non-destructive update: preserve the contribution being edited
          if (editingContributionId) {
            // Find and preserve the editing contribution from current event state
            const preserveEditingContribution = (segments: EventSegment[]) => {
              return segments.map(segment => ({
                ...segment,
                attendees: segment.attendees?.map(attendee => ({
                  ...attendee,
                  contributions: attendee.contributions?.map(contrib =>
                    contrib.id === editingContributionId ? (
                      // Find the current contribution from the existing event state
                      event.segments?.flatMap(s => s.attendees?.flatMap(a => a.contributions || []) || [])
                        .find(c => c.id === editingContributionId) || contrib
                    ) : contrib
                  ) || []
                })) || []
              }));
            };

            updatedEvent.segments = preserveEditingContribution(updatedEvent.segments || []);
          }

          setEvent(updatedEvent);
        } catch (error) {
          console.error('Failed to update event data after contribution deleted:', error);
        }
      }
    };

    socket.on('contribution-deleted', handleContributionDeleted);

    return () => {
      socket.off('contribution-deleted', handleContributionDeleted);
    };
  }, [socket, event, eventId, editingContributionId]);

  // Join/leave event room for presence tracking
  useEffect(() => {
    if (!socket || !eventId) return;

    console.log('Joining event room:', eventId);
    socket.emit('join-event', eventId);

    return () => {
      console.log('Leaving event room:', eventId);
      socket.emit('leave-event', eventId);
    };
  }, [socket, eventId]);

  // Socket listener for user presence
  useEffect(() => {
    if (!socket) {
      console.log('Presence effect skipped - missing socket');
      return;
    }

    const handlePresenceUpdate = async (data: { eventId: string; presentUsers: string[] }) => {
      if (data.eventId !== eventId) return;

      console.log('Received presence update:', data.presentUsers);

      // Collect all known users (current user, host, attendees, cached users)
      const knownUsers = new Map<string, User>();

      // Add current user (they should always be present since they joined the room)
      if (currentUser) {
        knownUsers.set(currentUser.id, currentUser);
      }

      // Add event data if available
      if (event) {
        // Add host
        if (event.host) {
          knownUsers.set(event.host.id, event.host);
        }

        // Add attendees
        event.attendees?.forEach(attendee => {
          knownUsers.set(attendee.user.id, attendee.user);
        });
      }

      // Add cached users
      userCache.forEach((user, userId) => {
        knownUsers.set(userId, user);
      });

      // Find unknown users that need to be fetched
      const unknownUserIds = data.presentUsers.filter(userId => !knownUsers.has(userId));

      // Fetch unknown users
      if (unknownUserIds.length > 0) {
        console.log('Fetching unknown users:', unknownUserIds);
        const fetchPromises = unknownUserIds.map(async (userId) => {
          try {
            const user = await apiClient.getUser(userId);
            console.log('Successfully fetched user:', userId, user.firstName);
            return { userId, user };
          } catch (error) {
            console.error('Failed to fetch user:', userId, error);
            // Create a placeholder user for failed fetches
            const placeholderUser: User = {
              id: userId,
              firstName: '?',
              lastName: '',
              email: '',
              phoneNumber: '',
              dateOfBirth: new Date(),
              allergies: [],
              verified: false,
              locked: false,
              lastLogin: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            return { userId, user: placeholderUser };
          }
        });

        const results = await Promise.all(fetchPromises);
        const newUsers = results.filter((result): result is { userId: string; user: User } => result !== null);

        // Update cache
        setUserCache(prev => {
          const updated = new Map(prev);
          newUsers.forEach(({ userId, user }) => {
            updated.set(userId, user);
          });
          return updated;
        });

        // Add fetched users to known users
        newUsers.forEach(({ userId, user }) => {
          knownUsers.set(userId, user);
        });
      }

      // Convert user IDs to User objects
      const users = data.presentUsers
        .map(userId => {
          const user = knownUsers.get(userId);
          if (!user) {
            console.warn('Could not find user for presence:', userId);
          }
          return user;
        })
        .filter((user): user is User => user !== undefined);

      console.log('Setting present users:', users.map(u => `${u.firstName} ${u.lastName} (${u.id})`));
      setPresentUsers(users);
    };

    const handleUserPresent = async (data: { userId: string; eventId: string }) => {
      if (data.eventId !== eventId) return;

      console.log('User joined event:', data.userId);

      // Check if user is already in presentUsers
      const existingUser = presentUsers.find(u => u.id === data.userId);
      if (existingUser) {
        console.log('User already in presence list:', data.userId);
        return;
      }

      // Check if user is already in cache
      let user = userCache.get(data.userId);

      // If not in cache, try to find in known sources
      if (!user) {
        // Check current user
        if (currentUser?.id === data.userId) {
          user = currentUser;
        }
        // Check event data if available
        else if (event) {
          // Check host
          if (event.host?.id === data.userId) {
            user = event.host;
          }
          // Check attendees
          else {
            user = event.attendees?.find(a => a.userId === data.userId)?.user;
          }
        }
        // If still not found, fetch from API
        if (!user) {
          try {
            user = await apiClient.getUser(data.userId);
            console.log('Fetched user for presence:', data.userId, user.firstName);
            setUserCache(prev => new Map(prev).set(data.userId, user!));
          } catch (error) {
            console.error('Failed to fetch user for presence:', data.userId, error);
            // Create placeholder user
            user = {
              id: data.userId,
              firstName: '?',
              lastName: '',
              email: '',
              phoneNumber: '',
              dateOfBirth: new Date(),
              allergies: [],
              verified: false,
              locked: false,
              lastLogin: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            setUserCache(prev => new Map(prev).set(data.userId, user!));
          }
        }
      }

      if (user) {
        console.log('Adding user to presence:', user.firstName, user.id);
        setPresentUsers(prev => {
          if (!prev.some(u => u.id === user!.id)) {
            return [...prev, user!];
          }
          return prev;
        });
      }
    };

    const handleUserLeft = (data: { userId: string; eventId: string }) => {
      if (data.eventId === eventId) {
        console.log('User left event:', data.userId);
        setPresentUsers(prev => prev.filter(u => u.id !== data.userId));
      }
    };

    socket.on('presence-update', handlePresenceUpdate);
    socket.on('user-present', handleUserPresent);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('presence-update', handlePresenceUpdate);
      socket.off('user-present', handleUserPresent);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, eventId, event, userCache, currentUser, presentUsers]);

  // Socket listener for real-time chat messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (data: ChatMessage) => {
      // Ensure user is in cache
      if (!userCache.has(data.userId)) {
        try {
          const user = await apiClient.getUser(data.userId);
          setUserCache(prev => new Map(prev).set(data.userId, user));
        } catch (error) {
          // Create placeholder user
          const placeholderUser: User = {
            id: data.userId,
            firstName: '?',
            lastName: '',
            email: '',
            phoneNumber: '',
            dateOfBirth: new Date(),
            allergies: [],
            verified: false,
            locked: false,
            lastLogin: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setUserCache(prev => new Map(prev).set(data.userId, placeholderUser));
        }
      }

      setMessages(prev => [...prev, data]);
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, userCache]);

  // Disable scrolling when modals are open
  useEffect(() => {
    if (showPresenceModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPresenceModal, isChatMinimized]);

  const joinSegment = async (segmentId: string) => {
    if (!currentUser) return;
    try {
      await apiClient.createEventSegmentAttendee({ userId: currentUser.id, segmentId });
      // Refetch event
      const updatedEvent = await apiClient.getEvent(eventId);
      setEvent(updatedEvent);
    } catch (err) {
      console.error('Error joining segment:', err);
    }
  };

  const addContribution = async (
    eventSegmentAttendeeId: string,
    item: string,
    description: string,
    quantity: number
  ) => {
    try {
      await apiClient.createEventSegmentAttendeeContribution({ eventSegmentAttendeeId, item, description, quantity });
      // Refetch
      const updatedEvent = await apiClient.getEvent(eventId);
      setEvent(updatedEvent);
    } catch (err) {
      console.error('Error adding contribution:', err);
    }
  };

  const leaveSegment = async (attendeeId: string) => {
    try {
      await apiClient.deleteEventSegmentAttendee(attendeeId);
      // Refetch event
      const updatedEvent = await apiClient.getEvent(eventId);
      setEvent(updatedEvent);
    } catch (err) {
      console.error('Error leaving segment:', err);
    }
  };

  const deleteContribution = async (contributionId: string) => {
    try {
      await apiClient.deleteEventSegmentAttendeeContribution(contributionId);
      // Refetch
      const updatedEvent = await apiClient.getEvent(eventId);
      setEvent(updatedEvent);
    } catch (err) {
      console.error('Error deleting contribution:', err);
    }
  };

  const updateContribution = async (contributionId: string, item: string, description: string, quantity: number) => {
    try {
      await apiClient.updateEventSegmentAttendeeContribution(contributionId, { item, description, quantity });
      // Refetch
      const updatedEvent = await apiClient.getEvent(eventId);
      setEvent(updatedEvent);
      setEditingContributionId(null);
    } catch (err) {
      console.error('Error updating contribution:', err);
    }
  };

  const sendInvitation = async (phoneNumber: string, message: string) => {
    try {
      setInvitationError(null);
      await apiClient.createEventInvitation({ phoneNumber, eventId, message });
      // Refetch invitations
      const updatedInvitations = await apiClient.getEventInvitations(undefined, eventId);
      setInvitations(updatedInvitations);
    } catch (err) {
      let errorMessage = 'Failed to send invitation';
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes('not found') || msg.includes('user not found')) {
          errorMessage = '⚠️ No user found with that phone number. Please check the number and try again.';
        } else {
          errorMessage = err.message.replace(/API/gi, '').trim() || errorMessage;
        }
      }
      setInvitationError(errorMessage);
      console.error('Error sending invitation:', err);
    }
  };

  const withdrawInvitation = async (invitationId: string) => {
    try {
      await apiClient.deleteEventInvitation(invitationId);
      const updatedInvitations = await apiClient.getEventInvitations(undefined, eventId);
      setInvitations(updatedInvitations);
    } catch (err) {
      console.error('Error withdrawing invitation:', err);
    }
  };

  const removeAttendee = async (userId: string) => {
    if (!event) return;
    try {
      // Find all attendee IDs for this user in the event
      const attendeeIds = event.segments?.filter((seg) => seg.attendees.map(a => a.userId).includes(userId)).reduce<string[]>((ids, seg) => {
        const segAttendeeIds = seg.attendees.filter(a => a.userId === userId).map(a => a.id);
        return ids.concat(segAttendeeIds);
      }, []) || [];

      // Also delete any invitations for this user to this event
      const eventInvitations = await apiClient.getEventInvitations(undefined, eventId);
      const userInvitations = eventInvitations.filter(inv => inv.recipientId === userId);
      await Promise.all(userInvitations.map(inv => apiClient.deleteEventInvitation(inv.id)));

      // Remove from all segments
      await Promise.all(attendeeIds.map(id => apiClient.deleteEventSegmentAttendee(id)));

      // Remove the EventAttendee record
      const attendeeToRemove = event.attendees?.find(a => a.userId === userId);
      if (attendeeToRemove) {
        await apiClient.deleteEventAttendee(attendeeToRemove.id);
      }

      // Refetch event
      const updatedEvent = await apiClient.getEvent(eventId);
      setEvent(updatedEvent);
    } catch (err) {
      console.error('Error removing attendee:', err);
    }
  };

  const handleWheel = (e: React.WheelEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    const isAtTop = scrollTop <= 1;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
      // Let it bubble to window
      return;
    }
    // Prevent window scroll
    e.stopPropagation();
    e.preventDefault();
  };

  const sendMessage = (message: string) => {
    if (!socket || !message.trim()) return;
    socket.emit('send-message', { message: message.trim() });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-foreground text-xl">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background-secondary bg-cover bg-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 lg:p-12">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full mb-6">
                <Icon name="question" size={24} />
                <span className="text-accent-foreground font-semibold">Event Not Found</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-4">Oops!</h1>
              <p className="text-xl text-foreground/80 mb-8">This event doesn't exist or you don't have access to it.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button href="/events" variant="primary" className="px-8 py-4 text-lg">
                  <Icon name="arrowBack" size={20} text="Back to Events" />
                </Button>
                <Button href="/events/create" variant="accent" className="px-8 py-4 text-lg">
                  ➕ Create New Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canInteract = currentUser && (event.hostId === currentUser.id || event.attendees?.some(att => att.userId === currentUser.id));

  return (
    <div className="min-h-screen bg-background-secondary bg-cover bg-center py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="p-4 lg:p-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full mb-6">
              <span className="text-2xl">{event.icon}</span>
              <span className="text-accent-foreground font-semibold">Event Details</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-4">{event.name}</h1>
            <p className="text-xl text-foreground/80 mb-4">Join the fun and see who's bringing what</p>

            {/* Presence Indicator */}
            {presentUsers.length > 0 && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-500)]/20 backdrop-blur-sm border border-[var(--primary-500)]/30 rounded-full animate-in fade-in duration-500 cursor-pointer hover:bg-[var(--primary-500)]/30 transition-all duration-200 hover:scale-105"
                onClick={() => setShowPresenceModal(true)}
              >
                <div className="flex -space-x-2">
                  {presentUsers.slice(0, 3).map((user, index) => (
                    <div
                      key={user.id}
                      className="w-6 h-6 bg-[var(--primary-500)] rounded-full border-2 border-white flex items-center justify-center animate-in slide-in-from-left duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-xs text-white font-bold">
                        {user.firstName?.[0] || '?'}
                      </span>
                    </div>
                  ))}
                  {presentUsers.length > 3 && (
                    <div className="w-6 h-6 bg-[var(--primary-500)]/80 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-white font-bold">+{presentUsers.length - 3}</span>
                    </div>
                  )}
                </div>
                <span className="text-[var(--primary-700)] font-medium">
                  {presentUsers.length === 1 ? '1 person here' : `${presentUsers.length} people here`}
                </span>
              </div>
            )}
          </div>

          {/* Event Details Card */}
          <Card className="mb-8 bg-white/10 backdrop-blur-md border border-white/20" hoverEffect="none">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Event Information</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center bg-muted rounded-lg p-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className='text-4xl'>🗓️</span>
                  <h3 className="text-lg font-semibold text-foreground">Date & Time</h3>
                </div>
                <p className="text-foreground/90 text-lg">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-foreground/70 mt-1">
                  {new Date(event.date).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>

              <div className="text-center bg-muted rounded-lg p-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className='text-4xl'>📍</span>
                  <h3 className="text-lg font-semibold text-foreground">Location</h3>
                </div>
                <p className="text-foreground/90 text-lg">{event.location}</p>
              </div>

              <div className="text-center bg-muted rounded-lg p-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className='text-4xl'>👑</span>
                  <h3 className="text-lg font-semibold text-foreground">Host</h3>
                </div>
                <p className="text-foreground/90 text-lg">
                  {currentUser && event.hostId === currentUser.id
                    ? `${currentUser.firstName} ${currentUser.lastName} (You)`
                    : `${event.host?.firstName} ${event.host?.lastName}`}
                </p>
              </div>
            </div>
          </Card>

          {/* Attendees Card */}
          <Card className="mb-8 bg-white/10 backdrop-blur-md border border-white/20" hoverEffect="none">
            <h3 className="text-2xl text-center font-bold text-foreground mb-6 pb-4">Attendees</h3>
            {event.attendees && event.attendees.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[{
                  id: event.host.id,
                  userId: event.host.id,
                  user: event.host,
                  event: event,
                  eventId: event.id,
                } as Omit<EventAttendee, 'createdAt' | 'updatedAt'>, ...event.attendees].map((att, index) => {
                  const isPresent = presentUsers.some(p => p.id === att.userId);
                  const segmentsCount = event.segments?.filter(s => s.attendees?.some(a => a.userId === att.userId)).length || 0;
                  const isHost = event.hostId === att.userId;
                  const isCurrentUser = currentUser?.id === att.userId;

                  return (
                    <div
                      key={att.id}
                      className="group bg-muted/50 rounded-xl p-4 hover:bg-muted/70 hover:ring-2 hover:ring-primary-500/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div className={'w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 bg-primary-500 text-white shadow-lg'}>
                            {att.user.firstName?.[0] || '?'}
                            {att.user.lastName?.[0] || ''}
                          </div>

                          {/* Presence Indicator */}
                          {isPresent && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-pulse">
                              <div className="w-full h-full bg-green-500 rounded-full animate-ping"></div>
                            </div>
                          )}

                          {/* Host Crown */}
                          {isHost && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-200 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white text-xs">👑</span>
                            </div>
                          )}
                        </div>

                        {/* Name and Status */}
                        <div className="space-y-1">
                          <p className="text-foreground font-semibold text-lg leading-tight">
                            {att.user.firstName} {att.user.lastName}
                            {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap justify-center gap-1">
                            {isHost && (
                              <Tag variant="accent" size="sm" className="text-xs px-2 py-0.5">
                                Host
                              </Tag>
                            )}
                            {isPresent && (
                              <Tag variant="primary" size="sm" className="text-xs px-2 py-0.5 bg-green-100 text-green-800">
                                Editing
                              </Tag>
                            )}
                            {segmentsCount > 0 && (
                              <Tag variant="secondary" size="sm" className="text-xs px-2 py-0.5">
                                {segmentsCount} segment{segmentsCount !== 1 ? 's' : ''}
                              </Tag>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {currentUser && event.hostId === currentUser.id && !isCurrentUser && (
                            <Button
                              onClick={() => removeAttendee(att.userId)}
                              variant="destructive"
                              size="sm"
                              className="px-3 py-1.5 text-xs hover:scale-105 transition-transform"
                            >
                              <Icon name="trash" size={14} />
                            </Button>
                          )}
                          {currentUser && isCurrentUser && !isHost && (
                            <Button
                              onClick={() => removeAttendee(att.userId)}
                              variant="destructive"
                              size="sm"
                              className="px-3 py-1.5 text-xs hover:scale-105 transition-transform"
                            >
                              <Icon name="leave" size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center pb-4">
                <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="users" size={32} className="text-foreground" />
                </div>
                <p className="text-foreground/60 italic text-lg">It's a little quiet in here.</p>
                {currentUser && currentUser.id === event.hostId && (
                  <p className="text-foreground/60 italic text-lg">Why don't you invite someone?</p>
                )}
              </div>
            )}
          </Card>

          {/* Segments Section */}
          {event.segments && event.segments.length > 0 && (
            <div>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full mb-6">
                  <Icon name="users" size={24} />
                  <span className="text-accent-foreground font-semibold">Event Segments</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Choose Your Activities</h2>
                <p className="text-xl text-foreground/80">Join segments and see what everyone's bringing</p>
              </div>
              <div className="grid gap-8 grid-cols-1">
                {event.segments.map((segment: EventSegment, segmentIndex) => {
                  const isAttending = segment.attendees?.some((a) => a.userId === currentUser?.id);
                  const myAttendee = segment.attendees?.find((a) => a.userId === currentUser?.id);
                  return (
                    <Card key={segment.id} className="group relative overflow-hidden bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10 animate-in slide-in-from-left duration-700" style={{ animationDelay: `${segmentIndex * 150}ms` }}>
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl"></div>
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-accent/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <span className='text-3xl'>📑</span>
                            </div>
                            <div>
                              <h3 className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary-500 transition-colors duration-300">
                                {segment.name}
                              </h3>
                              <p className="text-foreground/70 text-sm">
                                {segment.attendees?.length || 0} contributor{(segment.attendees?.length || 0) !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {isAttending && (
                            <div className="px-4 py-2 bg-primary-500/20 text-primary-500 rounded-full text-sm font-semibold border border-primary-500/30">
                              ✓ Participating
                            </div>
                          )}
                        </div>

                        {/* Contributors */}
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center">
                              <Icon name="users" size={16} className="text-foreground/70" />
                            </div>
                            <h4 className="text-xl font-semibold text-foreground">Contributors</h4>
                          </div>
                          {segment.attendees && segment.attendees.length > 0 ? (
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                              {segment.attendees.map((attendee: EventSegmentAttendee, attendeeIndex) => (
                                <div key={attendee.id} className="group/attendee bg-gradient-to-r from-muted/30 to-muted/20 border border-muted/40 rounded-2xl p-5 hover:border-muted/60 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-right duration-500" style={{ animationDelay: `${attendeeIndex * 100}ms` }}>
                                  {/* Attendee Header */}
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent/20 rounded-xl flex items-center justify-center group-hover/attendee:scale-105 transition-transform duration-300">
                                        <Icon name="user" size={20} className="text-primary-500" />
                                      </div>
                                      <div>
                                        <p className="text-foreground font-semibold text-lg leading-tight">
                                          {attendee.user?.firstName && attendee.user?.lastName
                                            ? `${attendee.user.firstName} ${attendee.user.lastName}`
                                            : 'Unknown User'}
                                          {currentUser && attendee.userId === currentUser.id && <span className="text-primary ml-1">(You)</span>}
                                        </p>
                                        {attendee.contributions && attendee.contributions.length > 0 && (
                                          <p className="text-foreground/60 text-sm">
                                            {attendee.contributions.length} item{attendee.contributions.length !== 1 ? 's' : ''}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {currentUser && attendee.userId === currentUser.id && (
                                      <Button
                                        onClick={() => leaveSegment(attendee.id)}
                                        variant="destructive"
                                        size="sm"
                                        className="px-3 py-1.5 text-xs opacity-0 group-hover/attendee:opacity-100 transition-opacity duration-300 hover:scale-105"
                                      >
                                        <Icon name="leave" size={14} />
                                        Leave
                                      </Button>
                                    )}
                                  </div>

                                  {/* Contributions Grid */}
                                  {attendee.contributions && attendee.contributions.length > 0 && (
                                    <div className="space-y-3">
                                      {attendee.contributions.map((contrib: EventSegmentAttendeeContribution) => (
                                        editingContributionId === contrib.id ? (
                                          <EditContributionForm
                                            key={contrib.id}
                                            contribution={contrib}
                                            onUpdate={(item, desc, qty) => updateContribution(contrib.id, item, desc, qty)}
                                            onCancel={() => setEditingContributionId(null)}
                                          />
                                        ) : (
                                          <div key={contrib.id} className="group/contrib bg-gradient-to-br from-primary-500/20 to-accent/20 border border-card/50 rounded-xl p-4 hover:border-card/70 hover:shadow-sm transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                                                  <span className="font-semibold text-foreground text-base truncate group-hover/contrib:text-primary-500 transition-colors duration-300">{contrib.item}</span>
                                                  <Tag variant="accent" size="sm" className="font-bold flex-shrink-0">
                                                    × {contrib.quantity}
                                                  </Tag>
                                                </div>
                                                {contrib.description && (
                                                  <p className="text-foreground/80 text-sm ml-4 leading-relaxed group-hover/contrib:text-foreground/90 transition-colors duration-300">
                                                    {contrib.description}
                                                  </p>
                                                )}
                                              </div>

                                              {/* Edit/Delete Actions */}
                                              {currentUser && attendee.userId === currentUser.id && (
                                                <div className="flex gap-1 sm:ml-3 flex-shrink-0 justify-center sm:justify-end w-full sm:w-auto opacity-0 group-hover/contrib:opacity-100 transition-opacity duration-300">
                                                  <Button
                                                    onClick={() => setEditingContributionId(contrib.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-2 hover:bg-accent/20 rounded-full transition-colors text-foreground!"
                                                  >
                                                    <Icon name="edit" size={18} />
                                                  </Button>
                                                  <Button
                                                    onClick={() => deleteContribution(contrib.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-2 hover:bg-destructive/20 text-foreground! hover:text-destructive-500! rounded-full transition-colors"
                                                  >
                                                    <Icon name="trash" size={18} />
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  )}

                                  {/* Empty State */}
                                  {(!attendee.contributions || attendee.contributions.length === 0) && (
                                    <div className="text-center text-foreground/50">
                                      <div className="w-12 h-12 bg-muted/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <Icon name="plus" size={20} className="opacity-50" />
                                      </div>
                                      <p className="text-sm font-medium">No contributions yet</p>
                                      <p className="text-xs mt-1 opacity-70">Don't forget to add something!</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Icon name="users" size={28} className="text-foreground" />
                              </div>
                              <p className="text-foreground/60 italic text-lg mb-2">No contributors yet</p>
                              <p className="text-foreground/40 text-sm">Be the first to join {segment.name}!</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                          {currentUser && !isAttending && canInteract ? (
                            <Button
                              onClick={() => joinSegment(segment.id)}
                              variant="primary"
                              className="flex-1 text-lg py-3 hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-primary-500/25"
                            >
                              <Icon name="check" size={20} text={`Join ${segment.name}`} />
                            </Button>
                          ) : currentUser && isAttending && canInteract ? (
                            <div className="flex flex-col gap-4 w-full">
                              <AddContributionForm
                                eventSegmentAttendeeId={myAttendee!.id}
                                onAdd={(item, desc, qty) =>
                                  addContribution(myAttendee!.id, item, desc, qty)
                                }
                              />
                              <Button
                                onClick={() => leaveSegment(myAttendee!.id)}
                                variant="accent"
                                className="w-full text-lg hover:scale-105 transition-transform duration-300"
                              >
                                <Icon name="close" size={20} text={`Leave ${segment.name}`} />
                              </Button>
                            </div>
                          ) : currentUser && !canInteract ? (
                            <div className="text-center py-6 text-foreground/70 bg-muted/20 rounded-xl border border-muted/30">
                              <Icon name="question" size={24} className="mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Accept the invitation to contribute</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}



          {/* Host Management Section */}
          {currentUser && event.hostId === currentUser.id && (
            <div className="mt-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Manage Event</h2>
                <p className="text-foreground/70">Invite guests and manage attendees</p>
              </div>

              <Card className="mb-8 bg-white/10 backdrop-blur-md border border-white/20" hoverEffect="none">
                <h3 className="text-2xl font-bold text-foreground mb-6">Send Invitations</h3>
                {invitationError && (
                  <div className="mb-4 p-3 bg-destructive/10 border-2 border-destructive/30 text-destructive rounded-lg text-sm">
                    {invitationError}
                  </div>
                )}
                <SendInvitationForm onSend={sendInvitation} />
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border border-white/20" hoverEffect="none">
                <h3 className="text-2xl font-bold text-foreground mb-6">Pending Invitations</h3>
                {invitations.length > 0 ? (
                  <div className="space-y-4">
                    {invitations.map(invitation => (
                      <div key={invitation.id} className="bg-muted border border-muted rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-foreground font-semibold">
                            To: {invitation.recipient.firstName} {invitation.recipient.lastName}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${invitation.rsvpStatus === 'Accepted' ? 'bg-green-100 text-green-800' :
                              invitation.rsvpStatus === 'Declined' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                              {invitation.rsvpStatus}
                            </span>
                            {invitation.rsvpStatus === 'Pending' ? (
                              <Button
                                onClick={() => withdrawInvitation(invitation.id)}
                                variant="destructive"
                                size="sm"
                                className="text-xs px-3 py-1"
                              >
                                <Icon name="close" size={14} text="Withdraw" />
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        <p className="text-foreground/80 text-sm mb-2">{invitation.message}</p>
                        <p className="text-foreground/60 text-xs">
                          Sent {new Date().toLocaleDateString()} {/* Placeholder, need to add sent date */}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-foreground/60 italic text-center py-4">No invitations sent yet</p>
                )}
              </Card>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-muted/30">
            <Button href="/events" variant="primary" className="flex-1 text-lg">
              <Icon name="arrowBack" size={20} text="Back to Events" />
            </Button>
            {currentUser && event.hostId === currentUser.id && (
              <Button href={`/events/${eventId}/edit`} variant="accent" className="flex-1 text-lg">
                <Icon name="edit" size={20} text="Edit Event" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Drawer */}
      {canInteract && (
        <div className="fixed bottom-0 right-0 z-40">
          {/* Desktop: Small square drawer at bottom */}
          <div className="hidden lg:block">
            <div
              className={`absolute bottom-0 right-4 transition-all duration-300 ease-out ${isChatMinimized ? 'w-86 h-12' : 'w-86 h-[70vh]'
                }`}
            >
              <div
                className={`w-full h-full flex flex-col shadow-2xl border border-gray-200 ${isChatMinimized
                  ? 'rounded-t-2xl cursor-pointer hover:shadow-3xl'
                  : 'rounded-t-2xl'
                  } bg-white`}
                onClick={isChatMinimized ? () => setIsChatMinimized(false) : undefined}
              >
                {isChatMinimized ? (
                  /* Minimized State - Small Square */
                  <div className="w-full h-full flex flex-col items-center justify-center bg-primary-500 rounded-t-2xl text-center">
                    <div className="relative">
                      <Icon name="chat" size={20} className="text-white" />
                      <span className={`text-white text-s font-bold leading-tight ml-2`}>Event Chat</span>
                    </div>
                  </div>
                ) : (
                  /* Expanded State - Full Drawer */
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-500 rounded-t-2xl shadow-2xl">
                      <h3 className="text-lg font-bold text-primary-50 flex items-center gap-2">
                        <Icon name="chat" size={20} className="text-primary-50" />
                        Event Chat
                      </h3>
                      <button
                        onClick={() => setIsChatMinimized(true)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        <Icon name="chevronDown" size={16} className="text-gray-600" />
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <div className="px-4 py-2 text-xs text-gray-500 italic text-center border-b border-gray-100 bg-gray-50">
                        Chat messages are temporary and will be cleared when you leave the event.
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={messagesRef} onWheel={(e) => handleWheel(e, messagesRef)}>
                        {messages.length === 0 ? (
                          <p className="text-gray-500 italic text-center">No messages yet. Start the conversation!</p>
                        ) : (
                          messages.map((msg, index) => {
                            const user = userCache.get(msg.userId) || { firstName: '?', lastName: '' };
                            const isCurrentUser = currentUser?.id === msg.userId;
                            return (
                              <div key={index} className={`p-3 rounded-lg ${isCurrentUser ? 'bg-blue-100 ml-4' : 'bg-gray-100 mr-4'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{user.firstName} {user.lastName}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </span>
                                </div>
                                <p className="text-gray-900 text-sm">{msg.message}</p>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Input */}
                      <div className="p-4 border-t border-gray-200 bg-white">
                        <ChatInput onSend={sendMessage} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile: Floating icon that opens drawer */}
          <div className="lg:hidden">
            {/* Floating Chat Icon */}
            <button
              onClick={() => setIsChatMinimized(false)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
            >
              <div className="relative">
                <Icon name="chat" size={24} className="text-white" />
              </div>
            </button>

            {/* Mobile Drawer */}
            {!isChatMinimized && (
              <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300 ease-out">
                <div className="bg-black/50 backdrop-blur-sm h-full" onClick={() => setIsChatMinimized(true)} />
                <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] flex flex-col shadow-2xl border border-gray-200 rounded-t-2xl bg-white">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-500 rounded-t-2xl">
                    <h3 className="text-lg font-bold text-primary-50">Event Chat
                      <Icon name="chat" size={20} className="text-primary-50 inline-block ml-2" />
                    </h3>
                    <button
                      onClick={() => setIsChatMinimized(true)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <Icon name="close" size={16} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="px-4 py-2 text-xs text-gray-500 italic text-center border-b border-gray-100 bg-gray-50">
                      Chat messages are temporary and will be cleared when you leave the event.
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={mobileMessagesRef} onWheel={(e) => handleWheel(e, mobileMessagesRef)}>
                      {messages.length === 0 ? (
                        <p className="text-gray-500 italic text-center">No messages yet. Start the conversation!</p>
                      ) : (
                        messages.map((msg, index) => {
                          const user = userCache.get(msg.userId) || { firstName: '?', lastName: '' };
                          const isCurrentUser = currentUser?.id === msg.userId;
                          return (
                            <div key={index} className={`p-3 rounded-lg ${isCurrentUser ? 'bg-blue-100 ml-4' : 'bg-gray-100 mr-4'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{user.firstName} {user.lastName}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-900 text-sm">{msg.message}</p>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <ChatInput onSend={sendMessage} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Presence Modal */}
      {
        showPresenceModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setShowPresenceModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[var(--primary-500)] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Icon name="users" size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">People Here</h3>
                      <p className="text-[var(--primary-100)] text-sm">
                        {presentUsers.length} {presentUsers.length === 1 ? 'person' : 'people'} currently viewing
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPresenceModal(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                  >
                    <Icon name="close" size={16} className="text-white" />
                  </button>
                </div>
              </div>

              {/* User List */}
              <div className="max-h-96 overflow-y-auto">
                <div className="p-6 space-y-3">
                  {presentUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 animate-in slide-in-from-left duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-12 h-12 bg-[var(--primary-500)] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {user.firstName?.[0] || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-semibold truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        {currentUser && user.id === currentUser.id && (
                          <p className="text-[var(--primary-600)] text-sm font-medium">You</p>
                        )}
                        {event && user.id === event.hostId && currentUser && user.id !== currentUser.id && (
                          <p className="text-[var(--primary-600)] text-sm font-medium">Host</p>
                        )}
                      </div>
                      <div className="w-3 h-3 bg-[var(--primary-500)] rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <p className="text-center text-gray-600 text-sm">
                  Real-time presence • Updates automatically
                </p>
              </div>
            </div>
          </div>
        )
      }


    </div >
  );
}

function SendInvitationForm({ onSend }: { onSend: (phoneNumber: string, message: string) => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(phoneNumber, message);
    setPhoneNumber('');
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Recipient Phone Number</label>
        <Input
          type="tel"
          placeholder="Enter phone number to invite"
          value={phoneNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Invitation Message</label>
        <Textarea
          placeholder="Come join my event!"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <Button type="submit" variant="primary" className="w-full">
        <Icon name="envelope" size={20} text="Send Invitation" />
      </Button>
    </form>
  );
}

function AddContributionForm({
  onAdd,
}: {
  eventSegmentAttendeeId: string;
  onAdd: (item: string, desc: string, qty: number) => void;
}) {
  const [item, setItem] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(item, description, quantity);
    setItem('');
    setDescription('');
    setQuantity(1);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 p-6 border border-muted rounded-lg shadow-lg">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Item</label>
        <Input
          placeholder="e.g., Pizza, Board Games"
          value={item}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItem(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
        <Input
          placeholder="e.g., Vegetarian, Card games"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
        <Input
          type="number"
          placeholder="1"
          value={quantity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
          min={1}
          required
          className="w-full"
        />
      </div>
      <Button type="submit" variant="primary" className="w-full">
        <Icon name="plus" size={20} text="Add Contribution" />
      </Button>
    </form>
  );
}

function EditContributionForm({
  contribution,
  onUpdate,
  onCancel,
}: {
  contribution: EventSegmentAttendeeContribution;
  onUpdate: (item: string, desc: string, qty: number) => void;
  onCancel: () => void;
}) {
  const [item, setItem] = useState(contribution.item);
  const [description, setDescription] = useState(contribution.description);
  const [quantity, setQuantity] = useState(contribution.quantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(item, description, quantity);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-3 p-4 border border-accent rounded-lg bg-accent/5">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Item</label>
        <Input
          value={item}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItem(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
        <Input
          value={description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
        <Input
          type="number"
          value={quantity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
          min={1}
          required
          className="w-full"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" className="flex-1">Update</Button>
        <Button type="button" onClick={onCancel} variant="accent" size="sm" className="flex-1">Cancel</Button>
      </div>
    </form>
  );
}

function ChatInput({ onSend }: { onSend: (message: string) => void }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1"
      />
      <Button type="submit" variant="primary">
        <Icon name="send" size={16} />
      </Button>
    </form>
  );
}
