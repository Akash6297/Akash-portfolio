import { requireDb } from '@/lib/db/connect';
import { availableSlots, validateDate } from '@/lib/bookings';
import { fail, handleError, json } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get('date') ?? '';
  const invalid = validateDate(date);
  if (invalid) return fail(400, invalid);
  try {
    await requireDb();
    const { slots, message } = await availableSlots(date);
    return json({ ok: true, availableSlots: slots, message });
  } catch (error) {
    return handleError(error, 'bookings/slots');
  }
}
