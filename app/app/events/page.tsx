'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  segments: any[]; // Simplified for now
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/event');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/account/login');
          return;
        }
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink-black">Events</h1>
        <Link
          href="/events/create"
          className="bg-deep-ocean text-ink-black px-4 py-2 rounded-md hover:bg-jungle-teal font-medium"
        >
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-jungle-teal">No events found.</p>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border border-jungle-teal rounded-lg p-4 shadow-sm bg-white"
            >
              <h2 className="text-xl font-semibold text-ink-black">{event.name}</h2>
              <p className="text-jungle-teal">
                {new Date(event.date).toLocaleDateString()} at {event.location}
              </p>
              <p className="text-sm text-racing-red">
                {event.segments.length} segment{event.segments.length !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
