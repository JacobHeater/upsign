import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-peach-glow flex flex-col`}
      >
        <Header />

        <main className="flex-1">{children}</main>

        <footer className="bg-ink-black border-t border-jungle-teal mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-peach-glow">
              &copy; {new Date().getFullYear()} UpSign. The better way to manage events.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
