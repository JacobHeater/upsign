'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Button, Input, IconSelector, Toggle, Icon } from '@/components/design-system';

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
  icon: string;
  description: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    date: '',
    description: '',
    location: '',
    icon: '📅',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAutocomplete, setUseAutocomplete] = useState(false);
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
        // Already loaded
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (
        useAutocomplete &&
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
    <div className="min-h-screen bg-background-secondary py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button
            href="/events"
            variant="link"
          >
            <Icon name="arrowBack" size={16} text="Back to Events" />
          </Button>
        </div>

        <div>
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">{formData.icon}</div>
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
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Summer BBQ, Team Meeting" className="w-full" />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                📝 Description
              </label>
              <Input id="description" name="description" value={formData.description} onChange={handleChange} required placeholder="Describe your event" className="w-full" />
            </div>

            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-foreground mb-2">
                🎨 Event Icon
              </label>
              <IconSelector value={formData.icon} onChange={(value) => setFormData(prev => ({ ...prev, icon: value }))} className="w-full" />
              <p className="text-xs text-foreground/60 mt-2">
                Choose an icon that represents your event
              </p>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                📅 Event Date & Time
              </label>
              <Input id="date" name="date" type="datetime-local" value={formData.date} onChange={handleChange} required className="w-full" />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                📍 Location
              </label>
              <Input id="location" name="location" ref={locationInputRef as any} value={formData.location} onChange={handleChange} required placeholder="Search for a location..." className="w-full" autoComplete="off" key={useAutocomplete ? 'autocomplete' : 'no-autocomplete'} />
              {useAutocomplete && (
                <p className="text-xs text-foreground/60 mt-2">
                  Start typing to search for addresses, businesses, or landmarks (powered by Google Maps)
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

            {error && (
              <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4">
                <div className="text-destructive text-sm font-medium">{error}</div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button href="/events" className="flex-1 flex justify-center py-3 px-4">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} variant="accent" className="flex-1 flex justify-center py-3 px-4">
                {isSubmitting ? 'Creating...' : '✨ Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
