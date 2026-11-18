import { notFound } from 'next/navigation';
import { collectionConfig } from '@/lib/admin/fields';
import { CollectionEditor } from '@/components/admin/pages/CollectionEditor';

export default async function EditPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  if (!collectionConfig(collection)) notFound();
  return <CollectionEditor collectionKey={collection} id={id} />;
}
