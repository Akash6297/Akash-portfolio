import 'server-only';
import { NextResponse } from 'next/server';
import { DbNotConfiguredError } from '@/lib/db/connect';
import { EmailNotConfiguredError } from '@/lib/email/mailer';

/** Parses a JSON body with a size limit. Returns null for bad or oversized input. */
export async function readJson<T = Record<string, unknown>>(request: Request, maxBytes = 64 * 1024): Promise<T | null> {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > maxBytes) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    const data = JSON.parse(text);
    return data && typeof data === 'object' ? (data as T) : null;
  } catch {
    return null;
  }
}

export function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

// Best-effort in-memory limiter (per server instance). Enough to slow down abuse;
// swap for Vercel KV / Upstash if you need a global limit.
const buckets = new Map<string, number[]>();
export function rateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  const limited = recent.length >= max;
  if (!limited) recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 10_000) buckets.clear();
  return limited;
}

/** Honeypot + minimum time on the form. Returns an error message for bots. */
export function spamCheck(body: Record<string, unknown>, minFillMs = 3000) {
  if (typeof body.website === 'string' && body.website.trim() !== '') return 'Your submission could not be sent.';
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < minFillMs) {
    return 'That was a little fast — please take a moment and submit again.';
  }
  return null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const str = (value: unknown, max = 500) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, success: false, message, ...extra }, { status });
}

/** Maps known configuration errors to helpful responses; logs everything else. */
export function handleError(error: unknown, context: string) {
  if (error instanceof DbNotConfiguredError) return fail(503, 'The database is not configured (MONGO_URI).');
  if (error instanceof EmailNotConfiguredError) return fail(503, 'Email is not configured (EMAIL_USER / EMAIL_PASS), so nothing was sent.');
  console.error(`[${context}]`, error);
  return fail(500, 'Something went wrong. Please try again.');
}
