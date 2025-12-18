import Link from "next/link";
import { Button, Card } from '@/components/design-system';

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,125,0,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(0,103,68,0.1),transparent_50%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border-2 border-accent/30 rounded-full">
              <span className="text-accent font-semibold text-sm">Event Coordination Made Simple</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl mb-6">
              <span className="block">Who's Bringing</span>
              <span className="block bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                What?
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-foreground/80 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl border-l-4 border-accent/50 pl-6">
              No more duplicate dishes or forgotten drinks. UpSign makes it easy to coordinate food,
              beverages, and supplies for any gathering—from backyard barbecues to office potlucks.
            </p>
            <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-12 gap-4">
              <Button href="/events/create" variant="accent" className="group w-full flex items-center justify-center md:text-lg md:px-10">
                <span className="mr-2">✨</span>
                Create an Event
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
              <Button href="/events" variant="primary" className="group mt-3 sm:mt-0 w-full flex items-center justify-center md:text-lg md:px-10">
                <span className="mr-2">📅</span>
                Browse Events
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-primary-100 via-primary-200 to-primary-300 border-y-2 border-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border-2 border-primary/30 rounded-full">
              <span className="text-primary font-semibold text-sm">How It Works</span>
            </div>
            <h2 className="text-3xl font-extrabold text-foreground mb-4">
              Simple sign-ups for any gathering
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-foreground/70 border-l-4 border-primary/50 pl-6">
              Create an event, share the link, and let everyone claim what they're bringing.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6 group relative">
                <div className="absolute -top-3 left-1/8 transform -translate-x-1/2 z-10">
                  <span className="inline-flex items-center justify-center p-4 rounded-xl border-2 border-accent/30 bg-accent/10 text-accent-foreground shadow-sm group-hover:shadow-accent/50 transition-all group-hover:scale-110">
                    <svg
                      className="h-7 w-7 text-accent-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                </div>
                <Card className="flow-root rounded-xl px-6 pb-8 border-2 border-accent/20 hover:border-accent/60 shadow-lg hover:shadow-accent/30 transition-all hover:-translate-y-1">
                  <div>
                    <h3 className="mt-8 text-xl font-bold text-accent tracking-tight">
                      Create Your Event
                    </h3>
                    <p className="mt-5 text-base text-foreground/80 leading-relaxed">
                      Set up your potluck, party, or picnic in seconds. Add the items you need and
                      share with your guests.
                    </p>
                  </div>
                </Card>
              </div>

              <div className="pt-6 group relative">
                <div className="absolute -top-3 left-1/8 transform -translate-x-1/2 z-10">
                  <span className="inline-flex items-center justify-center p-4 rounded-xl border-2 border-accent/30 bg-accent/10 text-accent-foreground shadow-sm group-hover:shadow-accent/50 transition-all group-hover:scale-110">
                    <svg
                      className="h-7 w-7 text-accent-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </span>
                </div>
                <Card className="flow-root rounded-xl px-6 pb-8 border-2 border-primary/20 hover:border-primary/60 shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1">
                  <div>
                    <h3 className="mt-8 text-xl font-bold text-primary tracking-tight">
                      Claim &amp; Sign Up
                    </h3>
                    <p className="mt-5 text-base text-foreground/80 leading-relaxed">
                      Guests tell hosts what they're bringing. A simple way to track guest
                      contributions at a glance.
                    </p>
                  </div>
                </Card>
              </div>

              <div className="pt-6 group relative">
                <div className="absolute -top-3 left-1/8 transform -translate-x-1/2 z-10">
                  <span className="inline-flex items-center justify-center p-4 rounded-xl border-2 border-accent/30 bg-accent/10 text-accent-foreground shadow-sm group-hover:shadow-accent/50 transition-all group-hover:scale-110">
                    <svg
                      className="h-7 w-7 text-accent-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </span>
                </div>
                <Card className="flow-root rounded-xl px-6 pb-8 border-2 border-secondary/20 hover:border-secondary/60 shadow-lg hover:shadow-secondary/30 transition-all hover:-translate-y-1">
                  <div>
                    <h3 className="mt-8 text-xl font-bold text-secondary tracking-tight">
                      See It All
                    </h3>
                    <p className="mt-5 text-base text-foreground/80 leading-relaxed">
                      Everyone can see who's bringing what. No more group text chaos or spreadsheet
                      nightmares.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-primary-100 via-primary-200 to-primary-100 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,103,68,0.08),transparent_70%)]"></div>
        <div className="relative max-w-3xl mx-auto text-center py-20 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="inline-block mb-6 px-5 py-2 bg-accent/10 border-2 border-accent/30 rounded-full">
            <span className="text-accent font-semibold">Ready to Get Started?</span>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground sm:text-5xl mb-6">
            <span className="block mb-3">Planning a get-together?</span>
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Let UpSign handle the coordination.
            </span>
          </h2>
          <p className="mt-6 text-xl leading-8 text-foreground/80 max-w-xl mx-auto border-l-4 border-accent/50 pl-6">
            Free, simple, and easy sign-up for guests. Your next event just got a lot easier.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/account/signup" variant="accent" className="group inline-flex items-center justify-center">
              <span className="mr-2">🚀</span>
              Get Started Now
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
            <Button href="/events" variant="primary" className="group inline-flex items-center justify-center">
              <span className="mr-2">👀</span>
              See Examples
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}