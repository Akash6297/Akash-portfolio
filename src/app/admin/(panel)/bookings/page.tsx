import type { Metadata } from 'next';
import { Bookings } from '@/components/admin/pages/Bookings';

export const metadata: Metadata = { title: 'Bookings' };

export default function BookingsPage() {
  return <Bookings />;
}
