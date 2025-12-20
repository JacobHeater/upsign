'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Icon, Tooltip } from '@/components/design-system';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { usePendingInvitations } from '@/lib/use-pending-invitations';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pendingCount } = usePendingInvitations();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push('/account/login');
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-10 bg-background shadow-2xl border-b border-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 hover:scale-105 transition-transform group flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary-50">
              UpSign
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            <Button href="/" variant="ghost">
              <Icon name="home" size={16} className="mr-2" />
              Home
            </Button>
            {user && (
              <>
                <Button href="/events" variant="ghost">
                  <Icon name="calendar" size={16} className="mr-2" />
                  Events
                  {pendingCount > 0 && (
                    <Tooltip content={`You have ${pendingCount} invitation${pendingCount === 1 ? '' : 's'} awaiting RSVP.`}>
                      <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 inline-flex items-center justify-center">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    </Tooltip>
                  )}
                </Button>
                <Button href="/account" variant="ghost">
                  <Icon name="user" size={16} className="mr-2" />
                  Account
                </Button>
                <Button onClick={handleLogout} variant="ghost">
                  <Icon name="logout" size={16} className="mr-2" />
                  Logout
                </Button>
              </>
            )}
            {!user && (
              <Button href="/account/login" variant="ghost" className="px-4 py-2">
                <Icon name="user" size={16} className="mr-2" />
                Login
              </Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" className="text-accent p-2" aria-label="Toggle menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden border-t-2 border-primary-900 bg-background backdrop-blur-sm overflow-hidden transition-all duration-300 ease-in-out shadow-xl ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Button href="/" variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
            <Icon name="home" size={18} className="mr-3" />
            Home
          </Button>
          {user && (
            <>
              <Button href="/events" variant="ghost" className="w-full justify-start relative" onClick={() => setIsMobileMenuOpen(false)}>
                <Icon name="calendar" size={18} className="mr-3" />
                Events
                {pendingCount > 0 && (
                  <Tooltip content={`You have ${pendingCount} invitation${pendingCount === 1 ? '' : 's'} awaiting RSVP.`}>
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  </Tooltip>
                )}
              </Button>
              <Button href="/account" variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                <Icon name="user" size={18} className="mr-3" />
                Account
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
                <Icon name="logout" size={18} className="mr-3" />
                Logout
              </Button>
            </>
          )}
          {!user && (
            <Button href="/account/login" variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
              <Icon name="user" size={18} className="mr-3" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
