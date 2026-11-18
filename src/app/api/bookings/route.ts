import { requireDb } from '@/lib/db/connect';
import { Booking } from '@/lib/db/models';
import { availableSlots, validateDate } from '@/lib/bookings';
import { adminInbox, isEmailConfigured, sendTemplate } from '@/lib/email/mailer';
import { clientIp, EMAIL_RE, fail, handleError, json, rateLimited, readJson, spamCheck, str } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await readJson(request, 8192);
  if (!body) return fail(400, 'Invalid request.');
  const spam = spamCheck(body);
  if (spam) return fail(400, spam);

  const name = str(body.name, 80);
  const email = str(body.email, 254);
  const date = str(body.date, 10);
  const time = str(body.time, 10);
  const message = str(body.message, 1000) || 'No message provided';
  if (name.length < 2) return fail(422, 'Please enter your name.');
  if (!EMAIL_RE.test(email)) return fail(422, 'Please enter a valid email address.');
  const invalidDate = validateDate(date);
  if (invalidDate) return fail(422, invalidDate);
  if (rateLimited(`booking:${clientIp(request)}`, 3, 30 * 60_000)) return fail(429, 'Too many booking requests. Please try again later.');

  try {
    await requireDb();
    const { slots } = await availableSlots(date);
    if (!slots.includes(time)) return fail(409, 'That time is no longer available — please choose another.');
    await Booking.create({ name, email, date, time, message, status: 'pending' });

    if (isEmailConfigured()) {
      try {
        await sendTemplate('bookingRequest', adminInbox(), { name, email, date, time, message }, { name, address: email });
      } catch (error) {
        console.error('[bookings] admin notification failed:', (error as Error).message);
      }
    }
    return json({ ok: true, success: true, message: "Thanks — your call request is in. I'll confirm it by email." }, 201);
  } catch (error) {
    return handleError(error, 'bookings/create');
  }
}
