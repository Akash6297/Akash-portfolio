import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { Resume } from '@/lib/db/models';
import { sanitize } from '@/lib/admin/fields';
import { revalidateSite } from '@/lib/admin/content-api';
import { getResumeAdmin } from '@/lib/resume';
import { normaliseResume, RESUME_FIELDS } from '@/lib/resume-shared';
import { fail, handleError, json, readJson } from '@/lib/api';

export const runtime = 'nodejs';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { resume, stored } = await getResumeAdmin();
    const photo = resume.personalInfo.photoUrl ? { src: resume.personalInfo.photoUrl, alt: resume.personalInfo.name, width: 400, height: 400 } : undefined;
    return json({ ok: true, stored, resume: { ...resume, photo } });
  } catch (err) {
    return handleError(err, 'resume/get');
  }
}

export async function PUT(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await readJson(request, 256 * 1024);
  if (!body) return fail(400, 'Invalid data.');
  const { value, errors } = sanitize(RESUME_FIELDS, body);
  if (Object.keys(errors).length) return fail(422, 'Please fix the highlighted fields.', { fields: errors });

  const { photo, ...rest } = value as Record<string, unknown> & { photo?: { src: string } };
  const personalInfo = { ...(rest.personalInfo as object), photoUrl: photo?.src ?? '' };
  const sections = ((rest.sections as Array<Record<string, unknown>>) ?? []).map((s, i) => ({ ...s, order: i }));

  try {
    await requireDb();
    const { resume: current } = await getResumeAdmin();
    const next = normaliseResume({ ...rest, personalInfo, sections } as never, current);
    await Resume.findOneAndUpdate({}, { $set: next }, { upsert: true });
    revalidateSite();
    return json({ ok: true, message: 'Resume saved. /resume is updated.' });
  } catch (err) {
    return handleError(err, 'resume/put');
  }
}
