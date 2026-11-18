import type { Metadata } from 'next';
import { EmailTemplates } from '@/components/admin/pages/EmailTemplates';

export const metadata: Metadata = { title: 'Email templates' };

export default function EmailTemplatesPage() {
  return <EmailTemplates />;
}
