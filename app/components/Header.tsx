'use client';

import { useState } from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-ink-black shadow-sm border-b border-jungle-teal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold text-peach-glow">UpSign</h1>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="/"
              className="text-peach-glow hover:text-racing-red px-3 py-2 text-sm font-medium transition-colors"
            >
              Home
            </a>
            <a
              href="/events"
              className="text-peach-glow hover:text-racing-red px-3 py-2 text-sm font-medium transition-colors"
            >
              Events
            </a>
            <a
              href="/account/login"
              className="text-peach-glow hover:text-racing-red px-3 py-2 text-sm font-medium transition-colors"
            >
              Account
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-peach-glow hover:text-racing-red p-2"
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
        <div className="md:hidden border-t border-jungle-teal">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-peach-glow hover:text-racing-red hover:bg-jungle-teal rounded-md transition-colors"
            >
              Home
            </a>
            <a
              href="/events"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-peach-glow hover:text-racing-red hover:bg-jungle-teal rounded-md transition-colors"
            >
              Events
            </a>
            <a
              href="/account/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-peach-glow hover:text-racing-red hover:bg-jungle-teal rounded-md transition-colors"
            >
              Account
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
