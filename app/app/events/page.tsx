'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Event, EventInvitation, User } from 'common/schema';
import { RsvpStatus } from '@/lib/constants';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [invitations, setInvitations] = useState<EventInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mineOnly, setMineOnly] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [eventsData, invitationsData, userData] = await Promise.all([
        apiClient.getEvents(),
        apiClient.getEventInvitations('received').catch(() => []), // If not logged in, empty array
        apiClient.getCurrentUser().catch(() => null), // If not logged in, null
      ]);
      setEvents(eventsData || []);
      setInvitations(invitationsData || []);
      setCurrentUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const displayedEvents = mineOnly && currentUser
    ? events.filter(event => event.hostId === currentUser.id)
    : events;

  const handleInvitationResponse = async (invitationId: string, rsvpStatus: RsvpStatus) => {
    try {
      await apiClient.updateEventInvitation(invitationId, { rsvpStatus, viewed: true });
      // Refresh invitations
      const updatedInvitations = await apiClient.getEventInvitations('received');
      setInvitations(updatedInvitations || []);
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
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Events</h1>
        <div className="flex items-center gap-4">
          {currentUser && (
            <label className="flex items-center gap-2 text-sm cursor-pointer text-foreground">
              <div className="relative inline-block w-10 h-6">
                <input
                  type="checkbox"
                  checked={mineOnly}
                  onChange={(e) => setMineOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-muted rounded-full peer-checked:bg-accent transition-colors duration-300"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-background rounded-full shadow-md transform peer-checked:translate-x-4 transition-transform duration-300"></div>
              </div>
              Mine only
            </label>
          )}
          <Link
            href="/events/create"
            className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-secondary font-medium"
          >
            Create Event
          </Link>
        </div>
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Pending Invitations</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {invitations
              .filter(invitation => invitation.rsvpStatus === RsvpStatus.Pending)
              .map((invitation) => (
                <div
                  key={invitation.id}
                  className="border border-border rounded-xl p-4 shadow-sm bg-card hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl">📨</div>
                    <div className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full font-medium">
                      Pending RSVP
                    </div>
                  </div>
                  <p className="text-sm text-secondary mb-2">
                    From: {invitation.sender.firstName} {invitation.sender.lastName}
                  </p>
                  <p className="text-foreground text-sm mb-3">{invitation.message}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInvitationResponse(invitation.id, RsvpStatus.Accepted)}
                      className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full hover:bg-primary/80 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleInvitationResponse(invitation.id, RsvpStatus.Declined)}
                      className="text-xs bg-destructive text-destructive-foreground px-3 py-1 rounded-full hover:bg-destructive/80 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Events Section */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">
          {mineOnly ? 'My Events' : 'All Events'}
        </h2>
      </div>

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
              <Link
                href="/events/create"
                className="inline-flex items-center px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-secondary font-medium shadow-lg transition-colors"
              >
                <span className="mr-2">+</span>
                Create Your First Event
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex items-center justify-center p-8">
            <div className="bg-card rounded-lg shadow-md p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">What you can do:</h3>
              <ul className="text-secondary space-y-1">
                <li>• Plan events with multiple segments</li>
                <li>• Invite attendees and track RSVPs</li>
                <li>• Manage contributions and potlucks</li>
                <li>• Send SMS notifications</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedEvents.map((event: Event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/events/${event.id}`)}
              className="border border-border rounded-xl p-6 shadow-sm bg-card hover:shadow-lg hover:border-accent transition-all duration-300 cursor-pointer group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl mb-2">🎉</div>
                <div className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full font-medium">
                  {event.segments.length} segment{event.segments.length !== 1 ? 's' : ''}
                </div>
              </div>
              <h2 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-accent transition-colors">
                {event.name}
              </h2>
              <div className="space-y-1 text-sm">
                <p className="text-secondary flex items-center">
                  <span className="mr-2">📅</span>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-secondary flex items-center">
                  <span className="mr-2">📍</span>
                  {event.location}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                <p className="text-xs text-destructive font-medium group-hover:text-accent transition-colors">
                  Click to view →
                </p>
                {currentUser && event.hostId === currentUser.id && (
                  <Link
                    href={`/events/${event.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-medium hover:bg-accent transition-colors"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
