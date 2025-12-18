'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/design-system';
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
        <div className="bg-card rounded-xl shadow-xl p-8 border-2 border-primary/30">
          <div className="text-center mb-8">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border-2 border-primary/30 rounded-full">
              <span className="text-primary font-semibold text-sm">Event Details</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">📅 {event.name}</h1>
            <p className="text-foreground/70">View and manage event information</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-background/50 p-4 rounded-lg border-2 border-accent/20">
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                📅 Event Date & Time
              </label>
              <p className="text-foreground font-semibold">{event.date.toLocaleString()}</p>
            </div>

            <div className="bg-background/50 p-4 rounded-lg border-2 border-accent/20">
              <label className="block text-sm font-medium text-foreground/70 mb-2">📍 Location</label>
              <p className="text-foreground font-semibold">{event.location}</p>
            </div>
          </div>

          {event.segments && event.segments.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6 border-b-2 border-accent/30 pb-2">Event Segments</h2>
              {event.segments.map((segment: EventSegment) => {
                const isAttending = segment.attendees?.some((a) => a.userId === currentUser?.id);
                const myAttendee = segment.attendees?.find((a) => a.userId === currentUser?.id);
                return (
                  <div key={segment.id} className="mb-6 p-6 bg-muted/30 rounded-xl border-2 border-secondary/30 shadow-md hover:shadow-secondary/30 transition-all">
                    <h3 className="text-xl font-bold text-secondary mb-4">{segment.name}</h3>
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-foreground mb-2">
                        Attendees & Contributions
                      </h4>
                      {segment.attendees && segment.attendees.length > 0 ? (
                        <ul className="space-y-3">
                          {segment.attendees.map((attendee: EventAttendee) => (
                            <li key={attendee.id} className="bg-card p-4 rounded-lg border-2 border-primary/20 shadow-sm">
                              <p className="text-foreground font-bold flex items-center">
                                <span className="mr-2">👤</span>
                                {attendee.user.firstName} {attendee.user.lastName}
                              </p>
                              {attendee.contributions && attendee.contributions.length > 0 && (
                                <ul className="ml-6 mt-2 space-y-1">
                                  {attendee.contributions.map(
                                    (contrib: EventAttendeeContribution) => (
                                      <li key={contrib.id} className="text-foreground/80 text-sm flex items-start">
                                        <span className="mr-2 text-accent">•</span>
                                        <span>{contrib.quantity}x {contrib.item} - {contrib.description}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-foreground/60 italic">No one has signed up yet.</p>
                      )}
                    </div>
                    {currentUser && !isAttending ? (
                      <Button
                        onClick={() => joinSegment(segment.id)}
                        variant="accent"
                        className="px-6 py-3"
                      >
                        ✓ Join {segment.name}
                      </Button>
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

          <div className="flex gap-4 pt-6 mt-6 border-t-2 border-muted/30">
            <Button href="/events" variant="primary" className="flex-1 flex justify-center py-3 px-4">
              ← Back to Events
            </Button>
            {currentUser && event.hostId === currentUser.id && (
              <Button href={`/events/${eventId}/edit`} variant="accent" className="flex-1 flex justify-center py-3 px-4">
                ✏️ Edit Event
              </Button>
            )}
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
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 p-4 bg-card rounded-lg border-2 border-accent/20">
      <Input
        placeholder="Food item"
        value={item}
        onChange={(e: any) => setItem(e.target.value)}
        required
        className="w-full"
      />
      <Input
        placeholder="Description"
        value={description}
        onChange={(e: any) => setDescription(e.target.value)}
        className="w-full"
      />
      <Input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e: any) => setQuantity(Number(e.target.value))}
        min={1}
        required
        className="w-full"
      />
      <Button type="submit" variant="primary" className="w-full">➕ Add Contribution</Button>
    </form>
  );
}
