'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Event, EventSegment, EventAttendee, EventAttendeeContribution, User } from 'common/schema';

export default function ViewEventPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, userData] = await Promise.all([
          apiClient.getEvent(eventId),
          apiClient.getCurrentUser().catch(() => null),
        ]);
        setEvent(eventData);
        setCurrentUser(userData);
      } catch (err) {
        setError('Failed to load event data');
        console.error('Error fetching event:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const joinSegment = async (segmentId: string) => {
    if (!currentUser) return;
    try {
      await apiClient.createEventAttendee({ userId: currentUser.id, segmentId });
      // Refetch event
      const updatedEvent = await apiClient.getEvent(eventId);
      setEvent(updatedEvent);
    } catch (err) {
      console.error('Error joining segment:', err);
    }
  };

  const addContribution = async (
    attendeeId: string,
    item: string,
    description: string,
    quantity: number
  ) => {
    try {
      await apiClient.createEventAttendeeContribution({ attendeeId, item, description, quantity });
      // Refetch
      const updatedEvent = await apiClient.getEvent(eventId);
      setEvent(updatedEvent);
    } catch (err) {
      console.error('Error adding contribution:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading event...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-destructive text-center mb-4">{error || 'Event not found'}</div>
          <Link
            href="/events"
            className="block w-full text-center py-3 px-4 bg-accent text-accent-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-card-foreground text-center mb-2">📅 {event.name}</h1>
            <p className="text-secondary text-center">Event Details</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Event Date & Time
              </label>
              <p className="text-card-foreground">{event.date.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Location</label>
              <p className="text-card-foreground">{event.location}</p>
            </div>

            {event.segments && event.segments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Segments</h2>
                {event.segments.map((segment: EventSegment) => {
                  const isAttending = segment.attendees?.some((a) => a.userId === currentUser?.id);
                  const myAttendee = segment.attendees?.find((a) => a.userId === currentUser?.id);
                  return (
                    <div key={segment.id} className="mb-6 p-4 bg-muted rounded-lg">
                      <h3 className="text-lg font-medium text-foreground mb-2">{segment.name}</h3>
                      <div className="mb-4">
                        <h4 className="text-md font-medium text-foreground mb-2">
                          Attendees & Contributions
                        </h4>
                        {segment.attendees && segment.attendees.length > 0 ? (
                          <ul className="space-y-2">
                            {segment.attendees.map((attendee: EventAttendee) => (
                              <li key={attendee.id} className="bg-card p-2 rounded">
                                <p className="text-card-foreground font-medium">
                                  {attendee.user.firstName} {attendee.user.lastName}
                                </p>
                                {attendee.contributions && attendee.contributions.length > 0 && (
                                  <ul className="ml-4 mt-1 space-y-1">
                                    {attendee.contributions.map(
                                      (contrib: EventAttendeeContribution) => (
                                        <li key={contrib.id} className="text-muted-foreground text-sm">
                                          {contrib.quantity}x {contrib.item} - {contrib.description}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">No one has signed up yet.</p>
                        )}
                      </div>
                      {currentUser && !isAttending ? (
                        <button
                          onClick={() => joinSegment(segment.id)}
                          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent"
                        >
                          Join {segment.name}
                        </button>
                      ) : currentUser && isAttending ? (
                        <AddContributionForm
                          attendeeId={myAttendee!.id}
                          onAdd={(item, desc, qty) =>
                            addContribution(myAttendee!.id, item, desc, qty)
                          }
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <Link
                href="/events"
                className="flex-1 flex justify-center py-3 px-4 border border-secondary rounded-lg shadow-sm text-sm font-medium text-secondary bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
              >
                Back to Events
              </Link>
              {currentUser && event.hostId === currentUser.id && (
                <Link
                  href={`/events/${eventId}/edit`}
                  className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-accent-foreground bg-accent hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                >
                  Edit Event
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddContributionForm({
  onAdd,
}: {
  attendeeId: string;
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
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <input
        type="text"
        placeholder="Food item"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        required
        className="block w-full px-3 py-2 border border-border rounded bg-input text-foreground"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="block w-full px-3 py-2 border border-border rounded bg-input text-foreground"
      />
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        min="1"
        required
        className="block w-full px-3 py-2 border border-border rounded bg-input text-foreground"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-secondary"
      >
        Add Item
      </button>
    </form>
  );
}
