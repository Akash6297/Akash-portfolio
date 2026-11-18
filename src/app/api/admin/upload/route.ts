import { requireAdmin } from '@/lib/auth/session';
import { fail, handleError, json } from '@/lib/api';

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];

/** Uploads an image to ImgBB (IMGBB_API_KEY, server-side only) and returns its URL and size. */
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const key = process.env.IMGBB_API_KEY;
  if (!key) return fail(503, 'Image uploads need IMGBB_API_KEY. You can still paste an image URL instead.');

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get('file');
    file = value instanceof File ? value : null;
  } catch {
    return fail(400, 'Invalid upload.');
  }
  if (!file) return fail(400, 'Choose an image to upload.');
  if (!TYPES.includes(file.type)) return fail(415, 'Upload a PNG, JPG, WebP, GIF or AVIF image.');
  if (file.size > MAX_BYTES) return fail(413, 'Images must be 8 MB or smaller.');

  try {
    const body = new FormData();
    body.append('image', Buffer.from(await file.arrayBuffer()).toString('base64'));
    body.append('name', file.name.replace(/\.[^.]+$/, '').slice(0, 80));
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, { method: 'POST', body, signal: AbortSignal.timeout(30_000) });
    const data = (await res.json().catch(() => null)) as { success?: boolean; data?: { url: string; width: string | number; height: string | number } } | null;
    if (!res.ok || !data?.success || !data.data) return fail(502, 'The image host rejected the upload. Try again or paste a URL.');
    return json({ ok: true, url: data.data.url, width: Number(data.data.width) || 1600, height: Number(data.data.height) || 1000 });
  } catch (err) {
    return handleError(err, 'admin/upload');
  }
}
