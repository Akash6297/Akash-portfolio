import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession, type SessionPayload } from './token';

export type { SessionPayload };

export async function getSession() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !process.env.ALLOW_INSECURE_COOKIES,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** For admin pages: redirects to the login page when there's no valid session. */
export async function requireAdminPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}

/** Error response helper for admin API routes. */
export function apiError(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, message, ...extra }, { status });
}

type Guard = { session: SessionPayload; error?: never } | { session?: never; error: NextResponse };

/** For admin API routes. Also enforces the OTP step and super-admin role when asked. */
export async function requireAdmin(options: { otp?: boolean; superAdmin?: boolean } = {}): Promise<Guard> {
  const session = await getSession();
  if (!session) return { error: apiError(401, 'Please sign in again.') };
  if (options.superAdmin && !session.superAdmin) return { error: apiError(403, 'Only the super admin can do this.') };
  if (options.otp && !(session.otpUntil && session.otpUntil > Date.now())) {
    return { error: apiError(403, 'Verify with the one-time code sent to your email first.', { needsOtp: true }) };
  }
  return { session };
}
