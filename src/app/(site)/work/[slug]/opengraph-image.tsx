import { renderOg, OG_SIZE } from '@/lib/og';
import { getProfile, getProject, getProjects } from '@/lib/content';

export const alt = 'Project case study';
export const size = OG_SIZE;
export const contentType = 'image/png';

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, profile] = await Promise.all([getProject(slug), getProfile()]);
  if (!project) return new Response('Not found', { status: 404 });
  return renderOg({
    eyebrow: `Case study · ${project.category}`,
    title: project.name,
    subtitle: project.tagline,
    footer: `${profile.name} · ${project.stack.slice(0, 4).join(' · ')}`,
  });
}
