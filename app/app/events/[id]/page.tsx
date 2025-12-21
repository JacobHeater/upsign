'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Icon } from '@/components/design-system';
import { apiClient } from '@/lib/api';
import { Event, EventSegment, User, EventInvitation, EventSegmentAttendee, EventSegmentAttendeeContribution, EventAttendee, EventChatMessageReaction, EventChatMessage } from 'common/schema';
import { useEventRoom } from '@/lib/use-socket';
import { useRouter } from 'next/navigation';
import { EventHeroSection } from './components/EventHeroSection';
import { toast } from 'sonner';
import { EventDetailsCard } from './components/EventDetailsCard';
import { AttendeesCard } from './components/AttendeesCard';
import { EventSegments } from './components/EventSegments';
import { HostManagementSection } from './components/HostManagementSection';
import { ChatDrawer } from './components/ChatDrawer';
import { PresenceModal } from './components/PresenceModal';
import { ProfileModal } from './components/ProfileModal';

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<EventChatMessage[]>([]);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const { socket, eventData } = useEventRoom(eventId);
  const router = useRouter();

  const fetchUserIfNeeded = async (userId: string) => {
    if (userCache.has(userId)) return;
    try {
      const user = await apiClient.getUser(userId);
      setUserCache(prev => new Map(prev).set(userId, user));
    } catch (error) {
      console.error('Failed to fetch user:', userId, error);
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
      setUserCache(prev => new Map(prev).set(userId, placeholderUser));
    }
  };

  // Disable page scrolling when mobile chat is open
  useEffect(() => {
    if (!isChatMinimized) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isChatMinimized]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, userData] = await Promise.all([
          apiClient.getEvent(eventId),
          apiClient.getCurrentUser().catch(() => null),
        ]);
        setEvent(eventData);
        setCurrentUser(userData);

        if (userData) {
          setUserCache(prev => new Map(prev).set(userData.id, userData));
        }

        // Fetch chat messages
        const messagesData = await apiClient.getEventChatMessages(eventId);
        setMessages(messagesData);

        // Fetch users for messages and reactions
        const messageUserIds = new Set<string>();
        messagesData.forEach(msg => {
          messageUserIds.add(msg.userId);
          msg.reactions?.forEach(r => messageUserIds.add(r.userId));
        });
        const unknownUserIds = Array.from(messageUserIds).filter(id => !userCache.has(id));
        if (unknownUserIds.length > 0) {
          await Promise.all(unknownUserIds.map(userId => fetchUserIfNeeded(userId)));
        }

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

  const isIsoDateString = (value: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
  };

  const transformDates = (obj: unknown): unknown => {
    if (!obj) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => transformDates(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const transformed = { ...(obj as Record<string, unknown>) };
      for (const key in transformed) {
        if (typeof transformed[key] === 'string' && isIsoDateString(transformed[key])) {
          transformed[key] = new Date(transformed[key]);
        } else {
          transformed[key] = transformDates(transformed[key]);
        }
      }
      return transformed;
    }

    return obj;
  };

  // Handle event updates from useEventRoom
  useEffect(() => {
    if (eventData) {
      console.log('Received event updated from useEventRoom:', eventId);
      const transformedEvent = transformDates(eventData) as Event;
      setEvent(transformedEvent);
    }
  }, [eventData, eventId]);

  // Socket listener for event updates
  useEffect(() => {
    if (!socket) return;

    const handleEventUpdated = (updatedEvent: Event) => {
      if (updatedEvent.id === eventId) {
        setEvent(updatedEvent);
        if (updatedEvent.cancelled && !event?.cancelled) {
          toast.error('This event has been cancelled.');
        }
      }
    };

    socket.on('event-updated', handleEventUpdated);

    return () => {
      socket.off('event-updated', handleEventUpdated);
    };
  }, [socket, eventId, event]);

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

    const handleNewMessage = async (data: EventChatMessage) => {
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

    const handleMessageReaction = async (reaction: EventChatMessageReaction) => {
      // Ensure user is in cache
      await fetchUserIfNeeded(reaction.userId);
      setMessages(prev => prev.map(msg =>
        msg.id === reaction.messageId
          ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
          : msg
      ));
    };

    const handleRemoveReaction = (reactionId: string) => {
      setMessages(prev => prev.map(msg => ({
        ...msg,
        reactions: (msg.reactions || []).filter(r => r.id !== reactionId)
      })));
    };

    socket.on('message-reaction-update', handleMessageReaction);
    socket.on('remove-reaction', handleRemoveReaction);

    const handleMessageEdited = (data: { messageId: string; newMessage: string }) => {
      setMessages(prev => prev.map(msg =>
        msg.id === data.messageId
          ? { ...msg, message: data.newMessage, updatedAt: new Date() }
          : msg
      ));
    };

    socket.on('message-edited', handleMessageEdited);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-reaction-update', handleMessageReaction);
      socket.off('remove-reaction', handleRemoveReaction);
      socket.off('message-edited', handleMessageEdited);
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
  };

  const sendMessage = async (message: string) => {
    if (!socket || !message.trim() || !eventId) return;
    try {
      const savedMessage = await apiClient.createEventChatMessage({ eventId, message: message.trim() });
      socket.emit('send-message', savedMessage);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const sendReaction = async (messageId: string, reaction: string) => {
    if (!socket) return;
    try {
      const savedReaction = await apiClient.createEventChatMessageReaction({ messageId, reaction });
      socket.emit('message-reaction', savedReaction);
    } catch (err) {
      console.error('Error sending reaction:', err);
    }
  };

  const removeReaction = async (reactionId: string) => {
    try {
      await apiClient.deleteEventChatMessageReaction(reactionId);
      // Emit socket event for real-time removal
      socket?.emit('remove-reaction', reactionId);
      // Refetch messages to update reactions as fallback
      const messagesData = await apiClient.getEventChatMessages(eventId);
      setMessages(messagesData);
    } catch (err) {
      console.error('Error removing reaction:', err);
    }
  };

  const editMessage = async (messageId: string, newMessage: string) => {
    if (!socket || !newMessage.trim()) return;
    try {
      await apiClient.updateEventChatMessage(messageId, { message: newMessage.trim() });
      socket.emit('edit-message', { messageId, newMessage: newMessage.trim() });
    } catch (err) {
      console.error('Error editing message:', err);
    }
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

  const canInteract = !!(currentUser && (event.hostId === currentUser.id || event.attendees?.some(att => att.userId === currentUser.id)));

  return (
    <div className="min-h-screen bg-background-secondary bg-cover bg-center py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="p-4 lg:p-12">
          {/* Hero Section */}
          <EventHeroSection
            event={event}
            presentUsers={presentUsers}
            onPresenceClick={() => setShowPresenceModal(true)}
          />

          {/* Cancellation Banner */}
          {event.cancelled && (
            <div className="p-6 rounded-lg mb-6 text-center font-bold text-xl mx-4 lg:mx-12 shadow-md" style={{
              background: 'var(--destructive-500)',
              color: 'var(--destructive-foreground)',
            }}>
              <Icon name="decline" size={24} className="inline mr-2" />
              This event has been cancelled.
            </div>
          )}

          {/* Event Details Card */}
          <EventDetailsCard event={event} currentUser={currentUser} />

          {/* Attendees Card */}
          <AttendeesCard
            event={event}
            currentUser={currentUser}
            presentUsers={presentUsers}
            onUserClick={(user) => { setSelectedUser(user); setShowProfileModal(true); }}
            onRemoveAttendee={removeAttendee}
            cancelled={event.cancelled ?? false}
          />

          {/* Segments Section */}
          {!event.cancelled && (
            <EventSegments
              event={event}
              currentUser={currentUser}
              canInteract={canInteract}
              cancelled={event.cancelled ?? false}
              joinSegment={joinSegment}
              addContribution={addContribution}
              leaveSegment={leaveSegment}
              deleteContribution={deleteContribution}
              updateContribution={updateContribution}
              editingContributionId={editingContributionId}
              setEditingContributionId={setEditingContributionId}
            />
          )}

          <HostManagementSection
            currentUser={currentUser}
            eventId={eventId}
            eventHostId={event.hostId}
            invitations={invitations}
            invitationError={invitationError}
            sendInvitation={sendInvitation}
            withdrawInvitation={withdrawInvitation}
            cancelled={event.cancelled ?? false}
          />

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
      <ChatDrawer
        canInteract={canInteract}
        isChatMinimized={isChatMinimized}
        setIsChatMinimized={setIsChatMinimized}
        messages={messages}
        userCache={userCache}
        currentUser={currentUser}
        sendMessage={sendMessage}
        sendReaction={sendReaction}
        removeReaction={removeReaction}
        editMessage={editMessage}
        handleWheel={handleWheel}
        socket={socket}
        cancelled={event.cancelled ?? false}
        eventHostId={event.hostId}
      />

      <PresenceModal
        showPresenceModal={showPresenceModal}
        setShowPresenceModal={setShowPresenceModal}
        presentUsers={presentUsers}
        currentUser={currentUser}
        event={event}
      />

      <ProfileModal
        showProfileModal={showProfileModal}
        setShowProfileModal={setShowProfileModal}
        selectedUser={selectedUser}
        currentUser={currentUser}
        event={event}
      />

    </div >
  );
}
