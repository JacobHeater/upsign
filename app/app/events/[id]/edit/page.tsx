'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Event, EventSegment } from 'common/schema';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [segments, setSegments] = useState<EventSegment[]>([]);

  const locationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const event = await apiClient.getEvent(eventId);
        setEvent(event);
        setSegments(event.segments || []);
      } catch (err) {
        setError('Failed to load event data');
        console.error('Error fetching event:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    // Load Google Maps API for location autocomplete
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeAutocomplete;
        document.head.appendChild(script);
      }
    };

    const initializeAutocomplete = () => {
      if (
        locationInputRef.current &&
        window.google &&
        window.google.maps &&
        window.google.maps.places
      ) {
        const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
          types: ['establishment', 'geocode'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setEvent((prev) => (prev ? { ...prev, location: place.formatted_address! } : prev));
          }
        });
      }
    };

    if (!isLoading) {
      loadGoogleMaps();
    }
  }, [isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEvent((prev) =>
      prev ? { ...prev, [name]: name === 'date' ? new Date(value) : value } : prev
    );
  };

  const addSegment = () => {
    setSegments((prev) => [...prev, { id: '', name: '', eventId, attendees: [] } as EventSegment]);
  };

  const removeSegment = (index: number) => {
    setSegments((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSegmentName = (index: number, name: string) => {
    setSegments((prev) => prev.map((s, i) => (i === index ? { ...s, name } : s)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.updateEvent(eventId, {
        name: event?.name,
        date: event?.date,
        location: event?.location,
      });

      // Handle segments
      const originalSegments = event?.segments || [];
      const toCreate = segments.filter((s) => !s.id);
      const toUpdate = segments.filter(
        (s) => s.id && originalSegments.find((os) => os.id === s.id && os.name !== s.name)
      );
      const toDelete = originalSegments.filter((os) => !segments.find((s) => s.id === os.id));

      await Promise.all([
        ...toCreate.map((s) => apiClient.createEventSegment({ name: s.name, eventId })),
        ...toUpdate.map((s) => apiClient.updateEventSegment(s.id, { name: s.name })),
        ...toDelete.map((s) => apiClient.deleteEventSegment(s.id)),
      ]);

      router.push('/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      console.error('Error updating event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading event...</div>
      </div>
    );
  }

  if (error && !event?.name) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-destructive text-center mb-4">{error}</div>
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
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground text-center mb-2">✏️ Edit Event</h1>
          <p className="text-foreground text-center">Update your event details</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Event Details</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Event Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={event?.name || ''}
                onChange={handleChange}
                required
                placeholder="Enter event name..."
                className="block w-full px-4 py-3 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground placeholder-muted-foreground"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                Event Date & Time
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={event?.date ? event.date.toISOString().slice(0, 16) : ''}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={event?.location || ''}
                onChange={handleChange}
                required
                ref={locationInputRef}
                placeholder="Search for a location..."
                className="block w-full px-4 py-3 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground placeholder-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Start typing to search for addresses, businesses, or landmarks (powered by Google
                Maps)
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Segments</h2>
            {segments.map((segment, index) => (
              <div key={segment.id || `new-${index}`} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={segment.name}
                  onChange={(e) => updateSegmentName(index, e.target.value)}
                  placeholder="Segment name (e.g., Day 1, Breakfast, Lunch, etc.)"
                  className="flex-1 px-4 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground placeholder-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => removeSegment(index)}
                  className="px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSegment}
              className="mt-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent"
            >
              Add Segment
            </button>
          </div>

          <div className="lg:col-span-3 p-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-4">
                <div className="text-destructive text-sm">{error}</div>
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <Link
                href="/events"
                className="flex-1 flex justify-center py-3 px-4 border border-secondary rounded-lg shadow-sm text-sm font-medium text-secondary bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-accent-foreground bg-accent hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
