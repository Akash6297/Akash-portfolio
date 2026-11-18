import type { Project, SkillGroup } from '@/data/types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TechIcon, brandColor } from '@/components/ui/TechIcon';
import { SkillPanel, type SkillView } from '@/components/skills/SkillPanel';

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function Skills({ skillGroups, projects }: { skillGroups: SkillGroup[]; projects: Project[] }) {
  const groups = skillGroups.map((group) => ({
    ...group,
    skills: group.skills.map<SkillView>((skill) => {
      const names = [skill.name, ...(skill.aliases ?? [])].map(normalise);
      const usedIn = projects
        .filter((p) => p.stack.some((t) => names.includes(normalise(t))))
        .map((p) => ({ slug: p.slug, name: p.name }));
      return {
        name: skill.name,
        note: skill.note,
        usedIn,
        color: brandColor(skill.icon),
        icon: <TechIcon icon={skill.icon} name={skill.name} />,
      };
    }),
  }));

  return (
    <section id="skills" aria-labelledby="skills-title" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          id="skills-title"
          index="04"
          label="Technical expertise"
          title={<>The stack, <em className="italic">end to end</em>.</>}
          intro="No percentage bars. Hover or tap a technology to see what I use it for — and which projects on this page use it."
        />
        <div data-reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => (
            <SkillPanel key={g.id} index={i + 1} title={g.title} description={g.description} skills={g.skills} />
          ))}
        </div>
      </div>
    </section>
  );
}
