import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { Booking, type BookingStatus } from '@/lib/db/models';
import { handleError, json } from '@/lib/api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const status = new URL(request.url).searchParams.get('status');
  const query: { status?: BookingStatus } = status && ['pending', 'confirmed', 'rejected', 'completed'].includes(status) ? { status: status as BookingStatus } : {};
  try {
    await requireDb();
    const bookings = await Booking.find(query).sort({ date: -1, time: 1 }).limit(500).lean();
    return json({
      ok: true,
      bookings: bookings.map((b) => ({
        id: b._id.toString(), name: b.name, email: b.email, date: b.date, time: b.time,
        message: b.message, status: b.status, meetingLink: b.meetingLink ?? '', createdAt: b.createdAt,
      })),
    });
  } catch (err) {
    return handleError(err, 'admin/bookings');
  }
}
