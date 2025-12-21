import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import { AuthProvider } from './lib/auth-context';
import { Toasts } from './components/Toasts';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'UpSign - Event Management',
  description: 'Professional event management platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Header />

          <main className="flex-1 bg-background-secondary pt-16 pb-24 md:pb-8">{children}</main>

          <footer className="bg-background border-t border-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-center gap-3">
                <div className="text-center text-sm text-primary-50">
                  &copy; {new Date().getFullYear()} UpSign. The better way to manage events.
                </div>
              </div>
            </div>
          </footer>
          <Toasts />
        </AuthProvider>
      </body>
    </html>
  );
}
