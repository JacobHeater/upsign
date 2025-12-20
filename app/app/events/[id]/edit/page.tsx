'use client';

// Declare Google Maps types
declare global {
  interface Window {
    google: typeof google;
  }
}
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Event, EventSegment } from 'common/schema';
import { Button, Input, Card, IconSelector, Toggle } from '@/components/design-system';
import { useState, useRef, useEffect } from 'react';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [segments, setSegments] = useState<EventSegment[]>([]);
  const [useAutocomplete, setUseAutocomplete] = useState(false);

  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

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
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        // Already loaded
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    };

    if (!isLoading) {
      loadGoogleMaps();
    }
  }, [isLoading]);

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (
        useAutocomplete &&
        locationInputRef.current &&
        window.google &&
        window.google.maps &&
        window.google.maps.places
      ) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(locationInputRef.current, {
          types: ['establishment', 'geocode'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.formatted_address) {
            setEvent((prev) => (prev ? { ...prev, location: place.formatted_address! } : prev));
          }
        });
      } else {
        // Cleanup
        if (autocompleteRef.current) {
          window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }
      }
    };

    initializeAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [useAutocomplete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEvent((prev) =>
      prev ? { ...prev, [name]: name === 'date' ? new Date(value) : value } : prev
    );
  };

  const addSegment = () => {
    setSegments((prev) => [...prev, { id: '', name: '', eventId, attendees: [], createdAt: new Date(), updatedAt: new Date() } as EventSegment]);
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
        icon: event?.icon,
        description: event?.description,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground text-xl">Loading event...</div>
      </div>
    );
  }

  if (error && !event?.name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-background-secondary bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground text-center mb-2">✏️ Edit Event</h1>
          <p className="text-foreground text-center">Update your event details</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 bg-white/10 backdrop-blur-md border border-white/20">
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Event Details</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Event Name
                </label>
                <Input id="name" name="name" value={event?.name || ''} onChange={handleChange} required placeholder="Enter event name..." className="w-full" />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Input id="description" name="description" value={event?.description || ''} onChange={handleChange} required placeholder="Enter event description..." className="w-full" />
              </div>

              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-foreground mb-2">
                  Event Icon
                </label>
                <IconSelector value={event?.icon || '📅'} onChange={(value) => setEvent(prev => prev ? { ...prev, icon: value } : prev)} className="w-full" />
                <p className="text-xs text-foreground/60 mt-2">
                  Choose an icon that represents your event
                </p>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                  Event Date & Time
                </label>
                <Input id="date" name="date" type="datetime-local" value={event?.date ? event.date.toISOString().slice(0, 16) : ''} onChange={handleChange} required className="w-full" />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <Input id="location" name="location" value={event?.location || ''} onChange={handleChange} required ref={locationInputRef as any} placeholder="Search for a location..." className="w-full" autoComplete="off" key={useAutocomplete ? 'autocomplete' : 'no-autocomplete'} />
                {useAutocomplete && (
                  <p className="text-xs text-foreground/60">
                    Start typing to search for addresses, businesses, or landmarks (powered by Google
                    Maps)
                  </p>
                )}
                <div className="flex items-center mt-2">
                  <Toggle
                    id="autocomplete-toggle"
                    checked={useAutocomplete}
                    onChange={setUseAutocomplete}
                    className="mr-2"
                  />
                  <label htmlFor="autocomplete-toggle" className="text-xs text-foreground/60">
                    Enable Google Maps autocomplete
                  </label>
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-white/20">
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Segments</h2>
              {segments.map((segment, index) => (
                <div key={segment.id || `new-${index}`} className="flex items-center space-x-2 mb-4">
                  <Input value={segment.name} onChange={(e: any) => updateSegmentName(index, e.target.value)} placeholder="Segment name (e.g., Day 1, Breakfast, Lunch, etc.)" className="flex-1" />
                  <Button type="button" onClick={() => removeSegment(index)} variant="destructive" size="sm" className="px-3 py-2" aria-label="Remove segment">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addSegment} className="mt-2 px-4 py-2">➕ Add Segment</Button>
            </div>
          </Card>

          <div className="w-full lg:col-span-3">
            {error && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-4">
                <div className="text-destructive text-sm">{error}</div>
              </div>
            )}

            <div className="flex space-x-4 pt-4 w-full">
              <Button href="/events" variant="accent" className="flex-1 flex justify-center px-4">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 flex justify-center px-4">{isSubmitting ? 'Updating...' : 'Update Event'}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
