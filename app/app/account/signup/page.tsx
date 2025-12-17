'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  allergies: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    allergies: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const allergiesArray = formData.allergies
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);

      await apiClient.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        phoneNumber: formData.phoneNumber,
        allergies: allergiesArray,
        verified: false,
        locked: false,
        lastLogin: null,
      });

      // After signup, redirect to login
      router.push('/auth/login?message=Account created successfully. Please log in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-ink-black">Sign Up</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-ink-black">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-jungle-teal rounded-md shadow-sm focus:outline-none focus:ring-deep-ocean focus:border-deep-ocean bg-white"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-ink-black">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-jungle-teal rounded-md shadow-sm focus:outline-none focus:ring-deep-ocean focus:border-deep-ocean bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-black">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-jungle-teal rounded-md shadow-sm focus:outline-none focus:ring-deep-ocean focus:border-deep-ocean bg-white"
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-ink-black">
            Date of Birth
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-jungle-teal rounded-md shadow-sm focus:outline-none focus:ring-deep-ocean focus:border-deep-ocean bg-white"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-ink-black">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-jungle-teal rounded-md shadow-sm focus:outline-none focus:ring-deep-ocean focus:border-deep-ocean bg-white"
          />
        </div>

        <div>
          <label htmlFor="allergies" className="block text-sm font-medium text-ink-black">
            Allergies (comma-separated)
          </label>
          <textarea
            id="allergies"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-jungle-teal rounded-md shadow-sm focus:outline-none focus:ring-deep-ocean focus:border-deep-ocean bg-white"
            placeholder="e.g., peanuts, dairy, gluten"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-deep-ocean hover:bg-jungle-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-ocean disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-jungle-teal">
          Already have an account?{' '}
          <Link href="/account/login" className="font-medium text-deep-ocean hover:text-racing-red">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
