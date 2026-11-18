import { sortedProjects, filterLabels } from '@/data/projects';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectsExplorer, type ProjectSummary } from '@/components/projects/ProjectsExplorer';

export function Projects() {
  // Send only what the list needs; case-study text stays on the server.
  const items: ProjectSummary[] = sortedProjects.map(({ caseStudy: _caseStudy, gallery: _gallery, ...rest }) => rest);

  return (
    <section id="projects" aria-labelledby="projects-title" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          id="projects-title"
          index="03"
          label="Selected work"
          title={<>Products, platforms and <em className="italic">client work</em>.</>}
          intro="Every project below is real and linked to a live site or its source. Open any of them for the full case study."
        />
        <ProjectsExplorer items={items} labels={filterLabels} />
      </div>
    </section>
  );
}
