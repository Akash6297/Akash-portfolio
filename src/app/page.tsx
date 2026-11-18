import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Experience } from '@/components/sections/Experience';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { OpenSource } from '@/components/sections/OpenSource';
import { Approach } from '@/components/sections/Approach';
import { Services } from '@/components/sections/Services';
import { Contact } from '@/components/sections/Contact';

// Static page; the GitHub section re-validates hourly (see src/lib/github.ts).
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <OpenSource />
      <Approach />
      <Services />
      <Contact />
    </>
  );
}
