'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

// Declare Google Maps types
declare global {
  interface Window {
    google: typeof google;
  }
}

interface EventFormData {
  name: string;
  date: string;
  location: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    date: '',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found. Address autocomplete disabled.');
        return;
      }

      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
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
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ['establishment', 'geocode'],
            fields: ['formatted_address', 'geometry', 'name'],
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.formatted_address) {
            setFormData((prev) => ({
              ...prev,
              location: place.formatted_address || '',
            }));
          }
        });
      }
    };

    loadGoogleMaps();

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.createEvent({
        ...formData,
        date: new Date(formData.date),
      });
      router.push('/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center text-primary hover:text-accent font-bold transition-colors px-4 py-2 rounded-lg hover:bg-primary/10 border border-primary/30"
          >
            <span className="mr-2">←</span>
            Back to Events
          </Link>
        </div>

        <div className="bg-card rounded-xl shadow-xl p-8 border-2 border-accent/30">
          <div className="text-center mb-8">
            <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border-2 border-accent/30 rounded-full">
              <span className="text-accent font-semibold text-sm">New Event</span>
            </div>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Event</h1>
            <p className="text-foreground/70">
              Plan your next gathering and start organizing segments and attendees.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                🎊 Event Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Summer BBQ, Team Meeting"
                className="block w-full px-4 py-3 border-2 border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent bg-input text-foreground placeholder-foreground/40 transition-all"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                📅 Event Date & Time
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border-2 border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent bg-input text-foreground transition-all"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                📍 Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                ref={locationInputRef}
                placeholder="Search for a location..."
                className="block w-full px-4 py-3 border-2 border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent bg-input text-foreground placeholder-foreground/40 transition-all"
              />
              <p className="text-xs text-foreground/60 mt-2">
                Start typing to search for addresses, businesses, or landmarks (powered by Google Maps)
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4">
                <div className="text-destructive text-sm font-medium">{error}</div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Link
                href="/events"
                className="flex-1 flex justify-center py-3 px-4 border-2 border-muted rounded-lg shadow-md text-base font-bold text-foreground bg-card hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-all hover:scale-105"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex justify-center py-3 px-4 border-2 border-accent rounded-lg shadow-md text-base font-bold text-accent-foreground bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 hover:shadow-accent/50"
              >
                {isSubmitting ? 'Creating...' : '✨ Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
