import { timingSafeEqual } from 'node:crypto';
import { requireAdmin, setSessionCookie } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { Otp } from '@/lib/db/models';
import { fail, handleError, json, readJson, str } from '@/lib/api';
import { hashOtp } from '@/lib/auth/otp';

export const runtime = 'nodejs';
const OTP_WINDOW_MS = 15 * 60_000; // sensitive actions allowed for 15 minutes after verifying

export async function POST(request: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const code = str((await readJson(request, 1024))?.code, 10).replace(/\D/g, '');
  if (code.length !== 6) return fail(400, 'Enter the 6-digit code.');
  try {
    await requireDb();
    const otp = await Otp.findOne({ userId: session.sub });
    if (!otp || otp.expiresAt.getTime() < Date.now()) return fail(400, 'The code has expired. Request a new one.');
    if (otp.attempts >= 5) {
      await otp.deleteOne();
      return fail(429, 'Too many wrong attempts. Request a new code.');
    }
    const a = Buffer.from(hashOtp(code));
    const b = Buffer.from(otp.codeHash);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      otp.attempts += 1;
      await otp.save();
      return fail(400, 'That code is not correct.');
    }
    await otp.deleteOne();
    await setSessionCookie({ ...session, otpUntil: Date.now() + OTP_WINDOW_MS });
    return json({ ok: true, message: 'Verified. Sensitive settings are unlocked for 15 minutes.' });
  } catch (err) {
    return handleError(err, 'otp/verify');
  }
}
