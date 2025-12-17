'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api';

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
        date: new Date(formData.date).toISOString(),
      });
      router.push('/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-ink-black">Create Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink-black">
            Event Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-jungle-teal rounded-md shadow-sm focus:outline-none focus:ring-deep-ocean focus:border-deep-ocean bg-white"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-ink-black">
            Event Date
          </label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-jungle-teal rounded-md shadow-sm focus:outline-none focus:ring-deep-ocean focus:border-deep-ocean bg-white"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-ink-black">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-jungle-teal rounded-md shadow-sm focus:outline-none focus:ring-deep-ocean focus:border-deep-ocean bg-white"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-deep-ocean hover:bg-jungle-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-ocean disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
