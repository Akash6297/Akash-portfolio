import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { Message } from '@/lib/db/models';
import { handleError, json } from '@/lib/api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const filter = new URL(request.url).searchParams.get('filter');
  const query: { isRead?: boolean; source?: 'whatsapp' } = filter === 'unread' ? { isRead: false } : filter === 'whatsapp' ? { source: 'whatsapp' } : {};
  try {
    await requireDb();
    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(500).lean();
    return json({
      ok: true,
      messages: messages.map((m) => ({
        id: m._id.toString(),
        name: m.name,
        email: m.email,
        subject: m.subject ?? '',
        message: m.message,
        source: m.source ?? (m.message.startsWith('[WhatsApp Lead]') ? 'whatsapp' : 'contact'),
        isRead: m.isRead,
        replied: m.replied,
        replies: m.replies ?? [],
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    return handleError(err, 'messages/list');
  }
}
