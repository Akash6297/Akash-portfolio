import type { Metadata } from 'next';
import { ResumeBuilder } from '@/components/admin/pages/ResumeBuilder';

export const metadata: Metadata = { title: 'Resume builder' };

export default function ResumeBuilderPage() {
  return <ResumeBuilder />;
}
