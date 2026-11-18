import 'server-only';
import { createHash } from 'node:crypto';

/** One-time codes are stored hashed (with the session secret as pepper), never in plain text. */
export const hashOtp = (code: string) => createHash('sha256').update(`${code}:${process.env.SESSION_SECRET}`).digest('hex');
