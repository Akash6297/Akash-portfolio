import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import { EMAIL_RE, fail, handleError, json, readJson, str } from '@/lib/api';

export const runtime = 'nodejs';

const isSuper = (email: string) => email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL ?? '').toLowerCase();

export async function GET() {
  const { error } = await requireAdmin({ superAdmin: true });
  if (error) return error;
  try {
    await requireDb();
    const users = await User.find().select('username email').lean();
    return json({ ok: true, users: users.map((u) => ({ id: u._id.toString(), username: u.username, email: u.email, superAdmin: isSuper(u.email) })) });
  } catch (err) {
    return handleError(err, 'users/list');
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin({ superAdmin: true, otp: true });
  if (error) return error;
  const body = await readJson(request, 2048);
  const username = str(body?.username, 60);
  const email = str(body?.email, 254).toLowerCase();
  const password = typeof body?.password === 'string' ? body.password : '';
  if (username.length < 3) return fail(400, 'Username must be at least 3 characters.');
  if (!EMAIL_RE.test(email)) return fail(400, 'Enter a valid email address.');
  if (password.length < 8) return fail(400, 'Password must be at least 8 characters.');
  try {
    await requireDb();
    if (await User.exists({ $or: [{ username }, { email }] })) return fail(409, 'That username or email is already in use.');
    await User.create({ username, email, password: await bcrypt.hash(password, 10) });
    return json({ ok: true, message: `Admin "${username}" created.` }, 201);
  } catch (err) {
    return handleError(err, 'users/create');
  }
}
