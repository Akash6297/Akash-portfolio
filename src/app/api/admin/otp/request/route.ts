import { randomInt } from 'node:crypto';
import { hashOtp } from '@/lib/auth/otp';
import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { Otp } from '@/lib/db/models';
import { sendEmail } from '@/lib/email/mailer';
import { fail, handleError, json, rateLimited } from '@/lib/api';

export const runtime = 'nodejs';

export async function POST() {
  const { session, error } = await requireAdmin();
  if (error) return error;
  if (rateLimited(`otp:${session.sub}`, 3, 10 * 60_000)) return fail(429, 'Too many codes requested. Wait a few minutes.');
  try {
    await requireDb();
    const code = String(randomInt(100000, 1000000));
    await Otp.deleteMany({ userId: session.sub });
    const otp = await Otp.create({ userId: session.sub, codeHash: hashOtp(code), expiresAt: new Date(Date.now() + 10 * 60_000), attempts: 0 });
    await sendEmail({
      to: session.email,
      subject: 'Your admin verification code',
      text: `Your verification code is ${code}. It expires in 10 minutes. If you didn't request it, change your password.`,
      html: `<div style="font-family:system-ui,sans-serif;text-align:center;padding:32px"><p>Your admin verification code is</p><p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p><p style="color:#666">It expires in 10 minutes. If you didn't request it, change your password.</p></div>`,
      fromName: 'Portfolio Admin',
    }).catch(async (sendError) => {
      await otp.deleteOne(); // never leave behind a code nobody received
      throw sendError;
    });
    const [user, domain] = session.email.split('@');
    return json({ ok: true, message: `Code sent to ${user.slice(0, 2)}•••@${domain}.` });
  } catch (err) {
    return handleError(err, 'otp/request');
  }
}
