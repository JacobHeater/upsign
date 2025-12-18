'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Button, Card, Input, Textarea } from '@/components/design-system';

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

      await apiClient.signup({
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
      router.push('/account/login?message=Account created successfully. Please log in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4 pb-12">
      <Card className="rounded-xl shadow-xl p-8 border-2 border-primary/30">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border-2 border-primary/30 rounded-full">
            <span className="text-primary font-semibold text-sm">Join UpSign</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-foreground/70">Get started with event management today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                First Name
              </label>
              <Input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full" />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                Last Name
              </label>
              <Input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              📧 Email Address
            </label>
            <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full" />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground mb-2">
              🎂 Date of Birth
            </label>
            <Input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="w-full" />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-2">
              📱 Phone Number
            </label>
            <Input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="w-full" />
          </div>

          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-foreground mb-2">
              🥜 Allergies (comma-separated, optional)
            </label>
            <Textarea id="allergies" name="allergies" value={formData.allergies} onChange={(e: any) => handleChange(e)} rows={3} className="w-full" placeholder="e.g., peanuts, dairy, gluten" />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border-2 border-destructive/30 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Creating Account...' : '✨ Sign Up'}</Button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-muted/30 text-center">
          <p className="text-sm text-foreground/70">
            Already have an account?{' '}
            <Link
              href="/account/login"
              className="font-bold text-primary hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent"
            >
              Log in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
