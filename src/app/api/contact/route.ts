import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { CONTACT_LIMITS, validateContact, type ContactInput } from '@/lib/contact';
import { profile } from '@/data/profile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16 * 1024;

// Best-effort rate limit: 5 messages per IP per 10 minutes. It lives in memory, so on
// serverless it applies per warm instance — enough to stop casual abuse. For stricter
// limits, swap this for Vercel KV / Upstash.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return false;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const singleLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

function fail(status: number, message: string, fields?: Record<string, string>) {
  return NextResponse.json({ ok: false, message, fields }, { status });
}

export async function POST(request: Request) {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) return fail(413, 'That message is too large.');

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail(400, 'Invalid request.');
  }

  // Spam traps: a hidden field humans never fill, and a minimum time on the form.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return fail(400, 'Your message could not be sent.');
  }
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < CONTACT_LIMITS.minFillMs) {
    return fail(400, 'That was a little fast — please take a moment and submit again.');
  }

  const input: ContactInput = {
    name: String(body.name ?? ''),
    email: String(body.email ?? ''),
    subject: String(body.subject ?? ''),
    message: String(body.message ?? ''),
  };
  const errors = validateContact(input);
  if (Object.keys(errors).length) return fail(422, 'Please check the highlighted fields.', errors);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return fail(429, 'Too many messages in a short time. Please try again later or email me directly.');

  const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, CONTACT_TO_EMAIL } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('[contact] EMAIL_USER / EMAIL_PASS are not set');
    return fail(503, `The contact form isn't configured yet. Please email ${profile.email} directly.`);
  }

  const port = Number(EMAIL_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  const name = singleLine(input.name);
  const email = input.email.trim();
  const subject = singleLine(input.subject);
  const message = input.message.trim();

  try {
    await transporter.sendMail({
      from: { name: 'Portfolio contact form', address: EMAIL_USER },
      to: CONTACT_TO_EMAIL || EMAIL_USER,
      replyTo: { name, address: email },
      subject: `[Portfolio] ${subject}`,
      text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}\n`,
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.6;color:#111">
          <p style="margin:0 0 4px;color:#666;font-size:13px">New message from your portfolio</p>
          <h2 style="margin:0 0 16px;font-size:18px">${escapeHtml(subject)}</h2>
          <p style="margin:0 0 16px"><strong>${escapeHtml(name)}</strong> &lt;<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>&gt;</p>
          <div style="white-space:pre-wrap;border-left:3px solid #4F7DFF;padding-left:12px">${escapeHtml(message)}</div>
          <p style="margin:24px 0 0;color:#666;font-size:13px">Reply to this email to answer ${escapeHtml(name)} directly.</p>
        </div>`,
    });
  } catch (error) {
    console.error('[contact] send failed:', (error as Error).message);
    return fail(502, `Your message couldn't be delivered right now. Please email ${profile.email} directly.`);
  }

  return NextResponse.json({ ok: true, message: "Thanks — your message is in my inbox. I'll reply to the email you provided." });
}
