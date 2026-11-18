import { notFound } from 'next/navigation';
import { collectionConfig } from '@/lib/admin/fields';
import { CollectionList } from '@/components/admin/pages/CollectionList';

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!collectionConfig(collection)) notFound();
  return <CollectionList collectionKey={collection} />;
}
