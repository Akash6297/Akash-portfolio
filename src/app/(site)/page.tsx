import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Experience } from '@/components/sections/Experience';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { OpenSource } from '@/components/sections/OpenSource';
import { Approach } from '@/components/sections/Approach';
import { Services } from '@/components/sections/Services';
import { Contact } from '@/components/sections/Contact';
import {
  getAchievements, getCertifications, getEducation, getExperience, getProfile, getProjects, getServices, getSkillGroups,
} from '@/lib/content';
import { isDbConfigured } from '@/lib/db/connect';

// Static page, regenerated hourly and immediately after admin edits (revalidatePath).
export const revalidate = 3600;

export default async function HomePage() {
  const [profile, projects, experience, education, certifications, achievements, skillGroups, services] = await Promise.all([
    getProfile(), getProjects(), getExperience(), getEducation(), getCertifications(), getAchievements(), getSkillGroups(), getServices(),
  ]);

  return (
    <>
      <Hero profile={profile} skillGroups={skillGroups} projects={projects} experience={experience} />
      <About profile={profile} education={education} />
      <Experience experience={experience} education={education} certifications={certifications} achievements={achievements} />
      <Projects projects={projects} />
      <Skills skillGroups={skillGroups} projects={projects} />
      <OpenSource />
      <Approach />
      <Services services={services} projects={projects} />
      <Contact profile={profile} bookingEnabled={isDbConfigured()} />
    </>
  );
}
