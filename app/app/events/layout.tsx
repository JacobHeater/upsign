import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

export default async function EventsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt')?.value;

  if (!jwt) {
    redirect('/account/login?returnUrl=' + encodeURIComponent('/events'));
  }

  try {
    // Verify the JWT
    await jwtVerify(jwt, secret);
  } catch {
    // Invalid or expired token
    redirect('/account/login?returnUrl=' + encodeURIComponent('/events'));
  }

  return <>{children}</>;
}
