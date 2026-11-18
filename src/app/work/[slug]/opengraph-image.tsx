import { renderOg, OG_SIZE } from '@/lib/og';
import { projects, getProject } from '@/data/projects';
import { profile } from '@/data/profile';

export const alt = 'Project case study';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug)!;
  return renderOg({
    eyebrow: `Case study · ${project.category}`,
    title: project.name,
    subtitle: project.tagline,
    footer: `${profile.name} · ${project.stack.slice(0, 4).join(' · ')}`,
  });
}
