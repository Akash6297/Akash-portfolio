import bcrypt from 'bcryptjs';
import { isValidObjectId } from 'mongoose';
import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import { EMAIL_RE, fail, handleError, json, readJson, str } from '@/lib/api';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ id: string }> };

const isSuper = (email: string) => email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL ?? '').toLowerCase();

export async function PUT(request: Request, { params }: Ctx) {
  const { error } = await requireAdmin({ superAdmin: true, otp: true });
  if (error) return error;
  const { id } = await params;
  if (!isValidObjectId(id)) return fail(404, 'Admin not found.');
  const body = await readJson(request, 2048);
  const username = str(body?.username, 60);
  const email = str(body?.email, 254).toLowerCase();
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
  if (username.length < 3 || !EMAIL_RE.test(email)) return fail(400, 'Enter a username (3+ characters) and a valid email.');
  if (newPassword && newPassword.length < 8) return fail(400, 'New password must be at least 8 characters.');
  try {
    await requireDb();
    const user = await User.findById(id);
    if (!user) return fail(404, 'Admin not found.');
    if (await User.exists({ _id: { $ne: id }, $or: [{ username }, { email }] })) return fail(409, 'That username or email is already in use.');
    if (isSuper(user.email) && !isSuper(email)) return fail(400, "The super admin's email can only be changed via SUPER_ADMIN_EMAIL.");
    user.username = username;
    user.email = email;
    if (newPassword) user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return json({ ok: true, message: 'Admin updated.' });
  } catch (err) {
    return handleError(err, 'users/update');
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { session, error } = await requireAdmin({ superAdmin: true, otp: true });
  if (error) return error;
  const { id } = await params;
  if (!isValidObjectId(id)) return fail(404, 'Admin not found.');
  try {
    await requireDb();
    const user = await User.findById(id);
    if (!user) return fail(404, 'Admin not found.');
    if (isSuper(user.email)) return fail(400, 'The super admin account cannot be deleted.');
    if (user._id.toString() === session.sub) return fail(400, "You can't delete your own account.");
    await user.deleteOne();
    return json({ ok: true, message: 'Admin deleted.' });
  } catch (err) {
    return handleError(err, 'users/delete');
  }
}
