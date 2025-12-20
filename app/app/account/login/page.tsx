'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button, Input, Card, Icon } from '@/components/design-system';

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
      <Card size="lg">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border-2 border-accent/30 rounded-full">
            <span className="text-accent font-semibold text-sm">Welcome Back</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Log In</h1>
          <p className="text-foreground/70">Access your account to manage events</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-primary/10 border-2 border-primary/30 text-foreground rounded-lg shadow-md">
            {message}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                📱 Phone Number
              </label>
              <Input type="tel" id="phone" value={phone} onChange={(e: any) => setPhone(e.target.value)} required placeholder="Enter your phone number" className="w-full" />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border-2 border-destructive/30 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Sending OTP...' : 'Send OTP'}</Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2">
                🔐 OTP Code
              </label>
              <Input type="number" id="otp" value={otp} onChange={(e: any) => setOtp(e.target.value)} required placeholder="Enter the 6-digit code" className="w-full" />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border-2 border-destructive/30 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Verifying...' : 'Verify OTP'}</Button>

            <Button type="button" onClick={() => setStep('phone')} variant="ghost" className="w-full text-foreground!">
              <Icon name="arrowBack" size={16} text="Back to phone" />
            </Button>
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
      </Card>
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
