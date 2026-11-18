import type { Metadata } from 'next';
import { ProfileEditor } from '@/components/admin/pages/ProfileEditor';

export const metadata: Metadata = { title: 'Profile & hero' };

export default function ProfilePage() {
  return <ProfileEditor />;
}
