import { requireAdmin } from '@/lib/auth/session';
import { loadTemplate } from '@/lib/email/mailer';
import { TEMPLATE_DEFINITIONS } from '@/lib/email/templates';
import { handleError, json } from '@/lib/api';

export const runtime = 'nodejs';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const templates = await Promise.all(
      TEMPLATE_DEFINITIONS.map(async (def) => {
        const { subject, config } = await loadTemplate(def.name);
        return { name: def.name, label: def.label, description: def.description, variables: def.variables, optional: Boolean(def.optional), subject, config };
      }),
    );
    return json({ ok: true, templates });
  } catch (err) {
    return handleError(err, 'email-templates/list');
  }
}
