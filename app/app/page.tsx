import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
              Who's Bringing What?
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-primary sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              No more duplicate dishes or forgotten drinks. UpSign makes it easy to coordinate food,
              beverages, and supplies for any gathering—from backyard barbecues to office potlucks.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <a
                  href="/events/create"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-accent-foreground bg-accent hover:bg-secondary md:py-4 md:text-lg md:px-10"
                >
                  Create an Event
                </a>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/events"
                  className="w-full flex items-center justify-center px-8 py-3 border border-secondary text-base font-medium rounded-md text-foreground bg-primary hover:bg-primary/80 md:py-4 md:text-lg md:px-10"
                >
                  Browse Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground">
              Simple sign-ups for any gathering
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-secondary">
              Create an event, share the link, and let everyone claim what they're bringing.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-card rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-accent rounded-md shadow-lg">
                        <svg
                          className="h-6 w-6 text-accent-foreground"
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
                    <h3 className="mt-8 text-lg font-medium text-primary tracking-tight">
                      Create Your Event
                    </h3>
                    <p className="mt-5 text-base text-primary">
                      Set up your potluck, party, or picnic in seconds. Add the items you need and
                      share with your guests.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-card rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-accent rounded-md shadow-lg">
                        <svg
                          className="h-6 w-6 text-accent-foreground"
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
                    <h3 className="mt-8 text-lg font-medium text-primary tracking-tight">
                      Claim &amp; Sign Up
                    </h3>
                    <p className="mt-5 text-base text-primary">
                      Guests tell hosts what they're bringing. A simple way to track guest
                      contributions at a glance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-card rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-accent rounded-md shadow-lg">
                        <svg
                          className="h-6 w-6 text-accent-foreground"
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
                    <h3 className="mt-8 text-lg font-medium text-primary tracking-tight">
                      See It All
                    </h3>
                    <p className="mt-5 text-base text-primary">
                      Everyone can see who's bringing what. No more group text chaos or spreadsheet
                      nightmares.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-primary sm:text-4xl">
            <span className="block">Planning a get-together?</span>
            <span className="block">Let UpSign handle the coordination.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary">
            Free, simple, and easy sign-up for guests. Your next event just got a lot easier.
          </p>
          <a
            href="/account/signup"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-accent-foreground bg-accent hover:bg-secondary sm:w-auto"
          >
            Get Started Now
          </a>
        </div>
      </section>
    </div>
  );
}
