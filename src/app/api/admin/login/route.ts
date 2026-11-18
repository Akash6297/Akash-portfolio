import bcrypt from 'bcryptjs';
import { requireDb } from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import { setSessionCookie } from '@/lib/auth/session';
import { clientIp, fail, handleError, json, rateLimited, readJson, str } from '@/lib/api';

export const runtime = 'nodejs';

// Compared against when the user doesn't exist, so response time doesn't reveal usernames.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

export async function POST(request: Request) {
  const body = await readJson(request, 4096);
  const username = str(body?.username, 120);
  const password = typeof body?.password === 'string' ? body.password.slice(0, 200) : '';
  if (!username || !password) return fail(400, 'Enter your username and password.');

  const ip = clientIp(request);
  if (rateLimited(`login:ip:${ip}`, 10, 15 * 60_000) || rateLimited(`login:user:${username.toLowerCase()}`, 5, 15 * 60_000)) {
    return fail(429, 'Too many sign-in attempts. Wait 15 minutes and try again.');
  }

  try {
    await requireDb();
    // Case-insensitive match on username or email (no regex built from user input).
    const user = await User.findOne({ $or: [{ username }, { email: username }] })
      .collation({ locale: 'en', strength: 2 })
      .lean();
    const ok = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
    if (!user || !ok) return fail(401, 'Incorrect username or password.');

    const superEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
    await setSessionCookie({
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
      superAdmin: Boolean(superEmail && user.email.toLowerCase() === superEmail),
    });
    return json({ ok: true });
  } catch (error) {
    return handleError(error, 'admin/login');
  }
}
