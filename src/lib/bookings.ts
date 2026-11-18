import 'server-only';
import { Booking, BookingSetting, type DaySchedule } from '@/lib/db/models';

export const DEFAULT_DAY: DaySchedule = { maxBookings: 5, slots: ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'] };
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Weekly schedule as a plain object keyed '0' (Sunday) … '6' (Saturday). */
export async function getSchedule(): Promise<Record<string, DaySchedule>> {
  const doc = await BookingSetting.findOne().lean();
  const raw = (doc?.weeklySchedule ?? {}) as Record<string, DaySchedule> | Map<string, DaySchedule>;
  const entries = raw instanceof Map ? Object.fromEntries(raw) : raw;
  return Object.fromEntries(
    WEEKDAYS.map((_, i) => {
      const day = entries[String(i)];
      return [String(i), day ? { maxBookings: Number(day.maxBookings) || 0, slots: [...(day.slots ?? [])] } : { ...DEFAULT_DAY, slots: [...DEFAULT_DAY.slots] }];
    }),
  );
}

/** Today in India (bookings are scheduled in IST). */
export function todayIst() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

export function validateDate(date: string) {
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) return 'Choose a valid date.';
  if (date < todayIst()) return 'That date is in the past.';
  const max = new Date(`${todayIst()}T00:00:00Z`);
  max.setUTCDate(max.getUTCDate() + 90);
  if (date > max.toISOString().slice(0, 10)) return 'Bookings open up to 90 days ahead.';
  return null;
}

/** Available slots for a date, honouring the daily limit and existing (non-rejected) bookings. */
export async function availableSlots(date: string) {
  const day = (await getSchedule())[String(new Date(`${date}T00:00:00Z`).getUTCDay())];
  const existing = await Booking.find({ date, status: { $ne: 'rejected' } }).select('time').lean();
  if (day.maxBookings <= 0 || day.slots.length === 0) return { slots: [] as string[], message: 'No calls on this day of the week.' };
  if (existing.length >= day.maxBookings) return { slots: [] as string[], message: 'This day is fully booked.' };
  const taken = new Set(existing.map((b) => b.time));
  let slots = day.slots.filter((s) => !taken.has(s));
  if (date === todayIst()) {
    // Hide times that have already passed today (IST).
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    slots = slots.filter((s) => toMinutes(s) > now.getHours() * 60 + now.getMinutes() + 60);
  }
  return { slots, message: slots.length ? undefined : 'No times left on this day — try another date.' };
}

/** "01:30 PM" → minutes after midnight. */
export function toMinutes(slot: string) {
  const m = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + Number(m[2]);
}

export const SLOT_RE = /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i;
