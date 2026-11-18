// Session tokens: signed JWTs (HS256, SESSION_SECRET). Kept free of Node/DB imports
// so the request proxy can verify them too.
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export interface SessionPayload {
  sub: string; // user id
  username: string;
  email: string;
  superAdmin: boolean;
  /** Epoch ms until which OTP-protected actions are allowed. */
  otpUntil?: number;
}

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error('SESSION_SECRET must be set (use a long random string).');
  return new TextEncoder().encode(value);
}

export async function signSession(payload: SessionPayload) {
  const { sub, username, email, superAdmin, otpUntil } = payload; // drop iat/exp from a previous token
  return new SignJWT({ sub, username, email, superAdmin, ...(otpUntil ? { otpUntil } : {}) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
