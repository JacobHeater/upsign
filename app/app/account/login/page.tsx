'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const message = searchParams.get('message');
  const returnUrl = searchParams.get('returnUrl') || '/events';

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.sendOtp(phone);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.verifyOtp(phone, otp);
      await refreshUser(); // Refresh the user state in the auth context
      // Redirect to home or events page
      router.push(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Log In</h1>

      {message && (
        <div className="mb-4 p-4 bg-primary/10 border border-primary text-primary rounded">
          {message}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring bg-input"
              placeholder="Enter your phone number"
            />
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-accent-foreground bg-accent hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
          >
            {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-foreground">
              OTP Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring bg-input"
              placeholder="Enter the 6-digit code"
            />
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-accent-foreground bg-accent hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            onClick={() => setStep('phone')}
            className="w-full text-sm text-secondary hover:text-accent"
          >
            Back to phone
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-secondary">
          Don't have an account?{' '}
          <Link
            href="/account/signup"
            className="font-medium text-accent hover:text-destructive"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-8 text-foreground">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
