import { isValidObjectId } from 'mongoose';
import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { Booking, type BookingStatus } from '@/lib/db/models';
import { isEmailConfigured, sendTemplate } from '@/lib/email/mailer';
import { fail, handleError, json, readJson, str } from '@/lib/api';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ id: string }> };
const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'rejected', 'completed'];

export async function PATCH(request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  if (!isValidObjectId(id)) return fail(404, 'Booking not found.');
  const body = await readJson(request, 2048);
  const status = str(body?.status, 20) as BookingStatus;
  const meetingLink = str(body?.meetingLink, 500);
  const notify = body?.notify !== false;
  if (!STATUSES.includes(status)) return fail(400, 'Invalid status.');
  if (meetingLink && !/^https:\/\//.test(meetingLink)) return fail(400, 'The meeting link must start with https://');

  try {
    await requireDb();
    const booking = await Booking.findById(id);
    if (!booking) return fail(404, 'Booking not found.');
    booking.status = status;
    if (meetingLink) booking.meetingLink = meetingLink;
    await booking.save();

    let emailNote = '';
    if (notify && (status === 'confirmed' || status === 'rejected')) {
      if (!isEmailConfigured()) {
        emailNote = ' Email is not configured, so the guest was not notified.';
      } else {
        try {
          await sendTemplate(status === 'confirmed' ? 'bookingConfirmed' : 'bookingRejected', booking.email, {
            name: booking.name,
            date: booking.date,
            time: booking.time,
            meetingLink: booking.meetingLink || 'I will send the link shortly.',
          });
          emailNote = ` ${booking.name} was emailed.`;
        } catch (err) {
          console.error('[bookings] guest email failed:', (err as Error).message);
          emailNote = ' The status was saved, but the email to the guest failed.';
        }
      }
    }
    return json({ ok: true, message: `Marked as ${status}.${emailNote}` });
  } catch (err) {
    return handleError(err, 'admin/bookings/update');
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  if (!isValidObjectId(id)) return fail(404, 'Booking not found.');
  try {
    await requireDb();
    await Booking.findByIdAndDelete(id);
    return json({ ok: true, message: 'Booking deleted.' });
  } catch (err) {
    return handleError(err, 'admin/bookings/delete');
  }
}
