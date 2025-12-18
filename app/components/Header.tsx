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
    <header className="bg-background shadow-sm border-b border-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold text-primary">UpSign</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-primary hover:text-accent px-3 py-2 text-sm font-medium transition-colors"
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/events"
                  className="text-primary hover:text-accent px-3 py-2 text-sm font-medium transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/account"
                  className="text-primary hover:text-accent px-3 py-2 text-sm font-medium transition-colors"
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-primary hover:text-accent px-3 py-2 text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <Link
                href="/account/login"
                className="text-primary hover:text-accent px-3 py-2 text-sm font-medium transition-colors"
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
              className="text-primary hover:text-accent p-2"
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
        <div className="md:hidden border-t border-secondary">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-primary hover:text-accent hover:bg-secondary rounded-md transition-colors"
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/events"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-primary hover:text-accent hover:bg-secondary rounded-md transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-primary hover:text-accent hover:bg-secondary rounded-md transition-colors"
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-primary hover:text-accent hover:bg-secondary rounded-md transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <Link
                href="/account/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-primary hover:text-accent hover:bg-secondary rounded-md transition-colors"
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
