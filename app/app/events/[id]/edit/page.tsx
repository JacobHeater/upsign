'use client';

// Declare Google Maps types
declare global {
  interface Window {
    google: typeof google;
  }
}
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Event, EventSegment } from 'common/schema';
import { Button, Input, Card, Toggle, Icon, Modal } from '@/components/design-system';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [segments, setSegments] = useState<EventSegment[]>([]);
  const [useAutocomplete, setUseAutocomplete] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancelAction, setPendingCancelAction] = useState<boolean | null>(null);

  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerContentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!pickerContentRef.current) return;
      if (!(pickerContentRef.current as HTMLElement).contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleDocClick);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showEmojiPicker]);

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

  const handleCancelConfirm = () => {
    if (pendingCancelAction !== null) {
      setEvent((prev) => prev ? { ...prev, cancelled: pendingCancelAction } : prev);
    }
    setShowCancelModal(false);
    setPendingCancelAction(null);
  };

  const handleCancelCancel = () => {
    setShowCancelModal(false);
    setPendingCancelAction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      setIsSubmitting(true);
      setError(null);

      try {
        await apiClient.updateEvent(eventId, {
          name: event?.name,
          date: event?.date,
          location: event?.location,
          icon: event?.icon,
          description: event?.description,
          cancelled: event?.cancelled,
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
          ...toUpdate.map((s) => apiClient.updateEventSegment(s.id, { name: s.name, eventId })),
          ...toDelete.map((s) => apiClient.deleteEventSegment(s.id)),
        ]);

        toast.success('Event updated successfully!');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update event');
        console.error('Error updating event:', err);
      } finally {
        setIsSubmitting(false);
      }
    })();
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
                <Input id="name" name="name" value={event?.name || ''} onChange={handleChange} required placeholder="Enter event name..." className="w-full" disabled={event?.cancelled} />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Input id="description" name="description" value={event?.description || ''} onChange={handleChange} required placeholder="Enter event description..." className="w-full" disabled={event?.cancelled} />
              </div>

              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-foreground mb-2">
                  Event Icon
                </label>
                <div className="relative">
                  <Button
                    variant="white"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowEmojiPicker(!showEmojiPicker);
                    }}
                    disabled={event?.cancelled}
                    className="w-full p-3 border border-input rounded-lg bg-background text-left flex items-center gap-3 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <span className="text-2xl">{event?.icon || '📅'}</span>
                    <span className="text-sm">Click to choose event icon</span>
                    <Icon name="chevronDown" size={16} className="ml-auto" />
                  </Button>
                </div>
                <p className="text-xs text-foreground/60 mt-2">
                  Choose an icon that represents your event
                </p>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                  Event Date & Time
                </label>
                <Input id="date" name="date" type="datetime-local" value={event?.date ? event.date.toISOString().slice(0, 16) : ''} onChange={handleChange} required className="w-full" disabled={event?.cancelled} />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <Input id="location" name="location" value={event?.location || ''} onChange={handleChange} required ref={locationInputRef as any} placeholder="Search for a location..." className="w-full" autoComplete="off" key={useAutocomplete ? 'autocomplete' : 'no-autocomplete'} disabled={event?.cancelled} />
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
                    disabled={event?.cancelled}
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
                  <Input value={segment.name} onChange={(e: any) => updateSegmentName(index, e.target.value)} placeholder="Segment name (e.g., Day 1, Breakfast, Lunch, etc.)" className="flex-1" disabled={event?.cancelled} />
                  <Button type="button" onClick={() => removeSegment(index)} variant="destructive" size="sm" className="px-3 py-2" aria-label="Remove segment" disabled={event?.cancelled}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addSegment} className="mt-2 px-4 py-2" disabled={event?.cancelled}>➕ Add Segment</Button>
            </div>
          </Card>

          <Card className="lg:col-span-3 bg-destructive/5 border-destructive">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{
                color: 'var(--destructive-500)'
              }}>🚨 Danger Zone 🚨</h2>
              <p className="text-sm text-foreground mb-4">
                Cancelling an event will notify all attendees and prevent new sign-ups.
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setPendingCancelAction(!event?.cancelled);
                  setShowCancelModal(true);
                }}
                className="w-full"
              >
                {event?.cancelled ? 'Uncancel Event' : 'Cancel Event'}
              </Button>
            </div>
          </Card>

          <div className="w-full lg:col-span-3">
            {error && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-4">
                <div className="text-destructive text-sm">{error}</div>
              </div>
            )}

            <div className="flex space-x-4 pt-4 w-full">
              <Button href="/events" variant="accent" className="flex-1 flex justify-center px-4">
                <Icon name="arrowBack" size={20} text="Back to Events" />
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 flex justify-center px-4">{isSubmitting ? 'Updating...' : 'Update Event'}</Button>
            </div>
          </div>
        </form>

        {/* Emoji Picker Portal */}
        {showEmojiPicker && (
          <div ref={pickerRef} className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm">
            <Card ref={pickerContentRef} className="shadow-2xl p-4 max-w-md w-full mx-4 max-h-[80vh] overflow-auto">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setEvent(prev => prev ? { ...prev, icon: emojiData.emoji } : prev);
                  setShowEmojiPicker(false);
                }}
                width="100%"
                height={400}
                skinTonesDisabled={true}
                emojiStyle={EmojiStyle.NATIVE}
                autoFocusSearch={false}
              />
            </Card>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={handleCancelCancel}
          title={pendingCancelAction ? 'Cancel Event' : 'Uncancel Event'}
          closeOnOutsideClick={false}
        >
          <p className="mb-6" style={{
            color: 'var(--accent-foreground)',
          }}>
            {pendingCancelAction
              ? 'Are you sure you want to cancel this event? This will notify all attendees and prevent new sign-ups. This action can be undone.'
              : 'Are you sure you want to uncancel this event? This will allow new sign-ups again.'
            }
          </p>
          <p className="text mb-4" style={{
            color: 'var(--accent-foreground)',
          }}>
            Click "Confirm" to update the event status, then click "Update Event" below to save your changes.
          </p>
          <div className="flex space-x-4">
            <Button variant="accent" onClick={handleCancelCancel} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCancelConfirm} className="flex-1">
              Confirm
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}