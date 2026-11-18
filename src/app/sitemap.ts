import type { MetadataRoute } from 'next';
import { getProjects } from '@/lib/content';
import { siteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const projects = await getProjects();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/resume`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...projects.map((p) => ({
      url: `${siteUrl}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: p.featured ? 0.8 : 0.6,
    })),
  ];
}
