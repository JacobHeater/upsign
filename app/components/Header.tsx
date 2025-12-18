'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    <header className="bg-card shadow-lg border-b-2 border-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 hover:scale-105 transition-transform group">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent group-hover:from-accent group-hover:to-accent transition-all">
              UpSign
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            <Link
              href="/"
              className="text-foreground hover:text-accent hover:bg-muted/20 px-4 py-2 text-sm font-medium transition-all rounded-lg border border-transparent hover:border-accent/30"
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/events"
                  className="text-foreground hover:text-accent hover:bg-muted/20 px-4 py-2 text-sm font-medium transition-all rounded-lg border border-transparent hover:border-accent/30"
                >
                  Events
                </Link>
                <Link
                  href="/account"
                  className="text-foreground hover:text-accent hover:bg-muted/20 px-4 py-2 text-sm font-medium transition-all rounded-lg border border-transparent hover:border-accent/30"
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 px-4 py-2 text-sm font-medium transition-all rounded-lg border border-destructive/30 hover:border-destructive"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <Link
                href="/account/login"
                className="text-accent-foreground bg-accent hover:bg-accent/80 px-4 py-2 text-sm font-medium transition-all rounded-lg shadow-md hover:shadow-lg border border-accent"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-accent hover:text-accent/80 p-2 hover:bg-muted/20 rounded-lg transition-all"
              aria-label="Toggle menu"
            >
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
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-accent/30 bg-card/95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent hover:bg-muted/30 rounded-lg transition-all border border-transparent hover:border-accent/30"
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/events"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent hover:bg-muted/30 rounded-lg transition-all border border-transparent hover:border-accent/30"
                >
                  Events
                </Link>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent hover:bg-muted/30 rounded-lg transition-all border border-transparent hover:border-accent/30"
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-destructive hover:text-destructive-foreground hover:bg-destructive/90 rounded-lg transition-all border border-destructive/30"
                >
                  Logout
                </button>
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
