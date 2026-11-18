import bcrypt from 'bcryptjs';
import { requireAdmin, setSessionCookie } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import { fail, handleError, json, readJson } from '@/lib/api';

export const runtime = 'nodejs';

export async function PUT(request: Request) {
  const { session, error } = await requireAdmin({ otp: true });
  if (error) return error;
  const body = await readJson(request, 2048);
  const current = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
  const next = typeof body?.newPassword === 'string' ? body.newPassword : '';
  if (next.length < 8 || next.length > 200) return fail(400, 'The new password must be at least 8 characters.');
  try {
    await requireDb();
    const user = await User.findById(session.sub);
    if (!user) return fail(404, 'Account not found.');
    if (!(await bcrypt.compare(current, user.password))) return fail(400, 'Your current password is not correct.');
    user.password = await bcrypt.hash(next, 10);
    await user.save();
    await setSessionCookie({ ...session, otpUntil: undefined }); // re-verify for the next sensitive action
    return json({ ok: true, message: 'Password changed.' });
  } catch (err) {
    return handleError(err, 'account/password');
  }
}
