import { requireAdmin } from '@/lib/auth/session';
import { json } from '@/lib/api';

export async function GET() {
  const { session, error } = await requireAdmin();
  if (error) return error;
  return json({
    ok: true,
    user: { id: session.sub, username: session.username, email: session.email, superAdmin: session.superAdmin },
    otpVerified: Boolean(session.otpUntil && session.otpUntil > Date.now()),
  });
}
