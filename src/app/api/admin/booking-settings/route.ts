import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { BookingSetting } from '@/lib/db/models';
import { getSchedule, SLOT_RE, toMinutes, WEEKDAYS } from '@/lib/bookings';
import { fail, handleError, json, readJson } from '@/lib/api';

export const runtime = 'nodejs';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await requireDb();
    return json({ ok: true, weeklySchedule: await getSchedule() });
  } catch (err) {
    return handleError(err, 'booking-settings/get');
  }
}

export async function PUT(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await readJson<{ weeklySchedule?: Record<string, { maxBookings?: unknown; slots?: unknown }> }>(request, 16 * 1024);
  const input = body?.weeklySchedule;
  if (!input || typeof input !== 'object') return fail(400, 'Invalid schedule.');

  const schedule: Record<string, { maxBookings: number; slots: string[] }> = {};
  for (let i = 0; i < 7; i++) {
    const day = input[String(i)] ?? {};
    const slots = (Array.isArray(day.slots) ? day.slots : [])
      .map((s) => String(s).trim().toUpperCase().replace(/^(\d):/, '0$1:').replace(/(\d)(AM|PM)$/, '$1 $2'))
      .filter(Boolean);
    const bad = slots.find((s) => !SLOT_RE.test(s));
    if (bad) return fail(400, `${WEEKDAYS[i]}: "${bad}" is not a time like 10:00 AM.`);
    const unique = [...new Set(slots)].sort((a, b) => toMinutes(a) - toMinutes(b)).slice(0, 24);
    schedule[String(i)] = { maxBookings: Math.max(0, Math.min(24, Math.round(Number(day.maxBookings) || 0))), slots: unique };
  }

  try {
    await requireDb();
    await BookingSetting.findOneAndUpdate({}, { weeklySchedule: schedule, updatedAt: new Date() }, { upsert: true });
    return json({ ok: true, message: 'Schedule saved.', weeklySchedule: schedule });
  } catch (err) {
    return handleError(err, 'booking-settings/put');
  }
}
