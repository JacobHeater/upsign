'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Toggle, Tooltip, Icon, Tag } from '@/components/design-system';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { Event, EventInvitation, RsvpStatus, User } from 'common/schema';
import { usePendingInvitations } from '@/lib/use-pending-invitations';
import { useSocket } from '@/lib/use-socket';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [invitations, setInvitations] = useState<EventInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mineOnly, setMineOnly] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { refreshPendingInvitations } = usePendingInvitations();
  const socket = useSocket();

  useEffect(() => {
    fetchEvents();
  }, [showPastEvents]);

  useEffect(() => {
    if (!socket) return;

    const handleInvitationReceived = async (invitation: EventInvitation) => {
      try {
        console.log('Received new invitation via socket:', invitation.id);

        const fullInvitation = await apiClient.getEventInvitation(invitation.id);
        const event = await apiClient.getEvent(fullInvitation.eventId);

        setInvitations(prev => [{ ...fullInvitation, event }, ...prev]);

        refreshPendingInvitations();
      } catch (error) {
        console.error('Failed to process received invitation:', error);
      }
    };

    socket.on('invitation-received', handleInvitationReceived);

    return () => {
      socket.off('invitation-received', handleInvitationReceived);
    };
  }, [socket, refreshPendingInvitations]);

  const fetchEvents = async () => {
    try {
      const [eventsData, invitationsData, userData] = await Promise.all([
        apiClient.getEvents({ includePast: showPastEvents }),
        apiClient.getEventInvitations('received').catch(() => []), // If not logged in, empty array
        apiClient.getCurrentUser().catch(() => null), // If not logged in, null
      ]);
      setEvents(eventsData || []);
      setCurrentUser(userData);

      // Fetch full event data for invitations to include segments
      let fullInvitations = invitationsData || [];
      if (fullInvitations.length > 0) {
        const eventIds = [...new Set(fullInvitations.map(inv => inv.eventId))];
        const fullEvents = await Promise.all(eventIds.map(id => apiClient.getEvent(id)));
        const eventsMap = new Map(fullEvents.map(event => [event.id, event]));
        fullInvitations = fullInvitations.map(inv => ({
          ...inv,
          event: eventsMap.get(inv.eventId)!,
        }));
      }
      setInvitations(fullInvitations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const displayedEvents = mineOnly && currentUser
    ? events.filter(event => event.hostId === currentUser.id)
    : events;

  const handleInvitationResponse = async (invitation: EventInvitation, rsvpStatus: RsvpStatus) => {
    try {
      await apiClient.updateEventInvitation(invitation.id, { rsvpStatus, viewed: true });

      // Delete the invitation after responding
      await apiClient.deleteEventInvitation(invitation.id);

      // Update invitations state - favor socket.io if available to avoid unnecessary API call
      if (socket && socket.connected) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      } else {
        const updatedInvitations = await apiClient.getEventInvitations('received');
        setInvitations(updatedInvitations || []);
      }

      // Refresh events to show updated attendee counts
      await fetchEvents();

      // Refresh the header badge after all operations complete
      refreshPendingInvitations();
      // Force a re-render to ensure header updates
      setRefreshTrigger(prev => prev + 1);
      // Multiple calls to ensure it updates
      setTimeout(() => refreshPendingInvitations(), 50);
      setTimeout(() => refreshPendingInvitations(), 150);
      setTimeout(() => refreshPendingInvitations(), 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invitation');
    }
  };

  if (loading) {
    return <div className="text-center mt-8 text-foreground">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-destructive">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 mb-12 md:mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Events</h1>
        <div className="flex flex-col gap-2 md:flex-row md:items-center gap-4">
          {currentUser && events.length > 0 && (
            <>
              <label className="flex items-center gap-2 text-sm cursor-pointer text-foreground">
                <Toggle checked={showPastEvents} onChange={(v) => setShowPastEvents(v)} />
                <span>Show past events</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer text-foreground">
                <Toggle checked={mineOnly} onChange={(v) => setMineOnly(v)} />
                <span>Mine only</span>
              </label>
            </>
          )}
          <Button href="/events/create" className="px-4 py-2">➕ Create Event</Button>
        </div>
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Pending Invitations</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {invitations
              .filter(invitation => invitation.rsvpStatus === 'Pending')
              .map((invitation) => (
                <Card
                  key={invitation.id}
                  className="p-5"
                  hoverEffect="lift"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl text-card-foreground">📨</div>
                    <div className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full font-bold shadow-md border border-accent">
                      Pending RSVP
                    </div>
                  </div>
                  <p className="text-sm text-card-foreground/80 mb-2">
                    <span className="font-semibold text-primary">From:</span> {invitation.sender.firstName} {invitation.sender.lastName}
                  </p>
                  <p className="text-sm text-card-foreground/80 mb-2">
                    <span className="font-semibold text-primary">Phone:</span> {invitation.sender.phoneNumber}
                  </p>
                  <p className="text-sm text-card-foreground/80 mb-2">
                    <span className="font-semibold text-primary">Event:</span> {invitation.event.name} {invitation.event.icon}
                  </p>
                  <p className="text-sm text-card-foreground/80 mb-2">
                    <span className="font-semibold text-primary">Location:</span> {invitation.event.location}
                  </p>
                  <Tooltip content={`${(() => {
                    const attendees = invitation.event.segments.flatMap(s => s.attendees);
                    const uniqueAttendees = [...new Map(attendees.map(a => [a.userId, a.user])).values()];
                    return uniqueAttendees.length > 0 ? uniqueAttendees.map(u => `${u.firstName} ${u.lastName}`).join('\n') : 'No one has RSVP\'d yet.';
                  })()}`}>
                    <p className="text-card-foreground/80 flex items-center mb-2">
                      <span className="mr-2">👥</span>
                      {invitation.event.segments.flatMap(s => s.attendees).length} guest{invitation.event.segments.flatMap(s => s.attendees).length !== 1 ? 's' : ''} RSVP'd
                    </p>
                  </Tooltip>
                  <p className="text-card-foreground text-sm mb-4 border-l-4 border-accent/50 pl-3">{invitation.message}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/events/${invitation.eventId}`)}
                      variant="link"
                      size="sm"
                      className="text-xs px-4 py-2"
                    >
                      <Icon name="eye" size={16} className="mr-1" /> Preview
                    </Button>
                    <Button
                      onClick={() => handleInvitationResponse(invitation, 'Accepted')}
                      variant="primary"
                      size="sm"
                      className="text-xs px-4 py-2"
                    >
                      ✓ Accept
                    </Button>
                    <Button
                      onClick={() => handleInvitationResponse(invitation, 'Declined')}
                      variant="destructive"
                      size="sm"
                      className="text-xs px-4 py-2"
                    >
                      <Icon name="decline" className='mr-3' size={16} /> Decline
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Events Section */}
      {events.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {mineOnly ? 'My Events' : 'All Events'}
          </h2>
        </div>
      )}
      {displayedEvents.length === 0 ? (
        <div className="flex flex-col md:flex-row min-h-[60vh]">
          <div className="md:w-1/2 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-3xl font-bold text-foreground mb-4">No events yet</h2>
              <p className="text-secondary mb-6 max-w-md">
                Start planning your first event. Create gatherings, manage segments, and track
                contributions all in one place.
              </p>
              <Button href="/events/create" variant="primary" className="inline-flex items-center">
                <span className="mr-2">➕</span>
                Create Your First Event
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex items-center justify-center p-8">
            <Card className="max-w-sm" size="lg" hoverEffect="lift">
              <h3 className="text-lg font-semibold text-foreground mb-2">What you can do:</h3>
              <ul className="text-secondary space-y-1">
                <li>• Plan events with multiple segments</li>
                <li>• Invite attendees and track RSVPs</li>
                <li>• Manage contributions and potlucks</li>
                <li>• Send SMS notifications</li>
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-48 md:pb-8">
          {displayedEvents.map((event: Event) => (
            <Card
              key={event.id}
              onClick={() => router.push(`/events/${event.id}`)}
              className="cursor-pointer group"
              hoverEffect="lift"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl mb-2">{event.icon}</div>
                <div className="flex flex-col gap-1">
                  <div className="text-xs bg-secondary text-foreground px-3 py-1 rounded-full font-bold shadow-md border-2 border-secondary">
                    {event.segments.length} segment{event.segments.length !== 1 ? 's' : ''}
                  </div>
                  {event.cancelled && (
                    <Tag variant="danger" size="sm" className='text-center justify-center'>Cancelled</Tag>
                  )}
                </div>
              </div>
              <h2 className="text-xl font-bold text-card-foreground mb-3 group-hover:text-primary transition-colors">
                {event.name}
              </h2>
              <div className="space-y-2 text-sm">
                <p className="text-foreground flex items-center">
                  <span className="mr-2">📅</span>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-card-foreground/80 flex items-center">
                  <span className="mr-2">📍</span>
                  {event.location}
                </p>
                <p className="text-card-foreground/80 flex items-center">
                  <span className="mr-2">👑</span>
                  Hosted by {event.host.firstName} {event.host.lastName}{currentUser && event.hostId === currentUser.id ? ' (You)' : ''}
                </p>
              </div>
              <div className={`mt-4 pt-3 border-t-2 border-muted/30 flex ${currentUser && event.hostId === currentUser.id ? 'justify-between' : 'justify-start'} items-center`}>
                <p className="text-xs text-accent font-bold group-hover:text-accent/80 transition-colors py-1">
                  Click to view <Icon name="arrowForward" size={12} />
                </p>
                {currentUser && event.hostId === currentUser.id && (
                  <Button href={`/events/${event.id}/edit`} variant="ghost" size="sm" className="text-xs px-3 py-1 text-foreground!" onClick={(e: any) => e.stopPropagation()}>
                    <Icon name="edit" size={16} className='mr-3' /> Edit
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
