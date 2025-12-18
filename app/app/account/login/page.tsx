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
    <div className="max-w-md mx-auto mt-12 px-4 pb-12">
      <div className="bg-card rounded-xl shadow-xl p-8 border-2 border-accent/30">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border-2 border-accent/30 rounded-full">
            <span className="text-accent font-semibold text-sm">Welcome Back</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Log In</h1>
          <p className="text-foreground/70">Access your account to manage events</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-primary/10 border-2 border-primary/30 text-primary-foreground rounded-lg shadow-md">
            {message}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                📱 Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="block w-full px-4 py-3 border-2 border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent bg-input text-foreground transition-all"
                placeholder="Enter your phone number"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border-2 border-destructive/30 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border-2 border-accent rounded-lg shadow-md text-base font-bold text-accent-foreground bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 transition-all hover:scale-105 hover:shadow-accent/50"
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2">
                🔐 OTP Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="block w-full px-4 py-3 border-2 border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent bg-input text-foreground transition-all"
                placeholder="Enter the 6-digit code"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border-2 border-destructive/30 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border-2 border-accent rounded-lg shadow-md text-base font-bold text-accent-foreground bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 transition-all hover:scale-105 hover:shadow-accent/50"
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-sm text-primary hover:text-accent font-medium transition-colors py-2 px-4 border border-primary/30 rounded-lg hover:bg-primary/10"
            >
              ← Back to phone
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t-2 border-muted/30 text-center">
          <p className="text-sm text-foreground/70">
            Don't have an account?{' '}
            <Link
              href="/account/signup"
              className="font-bold text-primary hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent"
            >
              Sign up
            </Link>
          </p>
        </div>
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
