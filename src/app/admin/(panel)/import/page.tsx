import type { Metadata } from 'next';
import { SmartImport } from '@/components/admin/pages/SmartImport';

export const metadata: Metadata = { title: 'Smart import' };

export default function ImportPage() {
  return <SmartImport />;
}
