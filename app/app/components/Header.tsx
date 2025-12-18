'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/design-system';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push('/account/login');
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-10 bg-background shadow-2xl border-b border-accent">
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
            <Button href="/" className="text-primary-50 hover:text-accent hover:bg-muted/20 px-4 py-2 text-sm font-medium transition-all rounded-lg border border-transparent hover:border-accent/30 focus:outline-none" variant="ghost">
              Home
            </Button>
            {user && (
              <>
                <Button href="/events" className="text-primary-50 hover:text-accent hover:bg-muted/20 px-4 py-2 text-sm font-medium transition-all rounded-lg border border-transparent hover:border-accent/30" variant="ghost">
                  Events
                </Button>
                <Button href="/account" className="text-primary-50 hover:text-accent hover:bg-muted/20 px-4 py-2 text-sm font-medium transition-all rounded-lg border border-transparent hover:border-accent/30" variant="ghost">
                  Account
                </Button>
                <Button onClick={handleLogout} variant="destructive" size="sm" className="px-4 py-2">Logout</Button>
              </>
            )}
            {!user && (
              <Button href="/account/login" variant="accent" className="px-4 py-2">Login</Button>
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
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-accent/30 bg-card/95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Button href="/" className="block px-3 py-2 text-base font-medium text-primary-50 hover:text-accent hover:bg-muted/30 rounded-lg transition-all border border-transparent hover:border-accent/30" variant="ghost" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Button>
            {user && (
              <>
                <Button href="/events" className="block px-3 py-2 text-base font-medium text-primary-50 hover:text-accent hover:bg-muted/30 rounded-lg transition-all border border-transparent hover:border-accent/30" variant="ghost" onClick={() => setIsMobileMenuOpen(false)}>
                  Events
                </Button>
                <Button href="/account" className="block px-3 py-2 text-base font-medium text-primary-50 hover:text-accent hover:bg-muted/30 rounded-lg transition-all border border-transparent hover:border-accent/30" variant="ghost" onClick={() => setIsMobileMenuOpen(false)}>
                  Account
                </Button>
                <Button onClick={handleLogout} variant="destructive" size="md" className="block w-full text-left px-3 py-2">Logout</Button>
              </>
            )}
            {!user && (
              <Link
                href="/account/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-accent-foreground bg-accent hover:bg-accent/80 rounded-lg transition-all shadow-md border border-accent"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
