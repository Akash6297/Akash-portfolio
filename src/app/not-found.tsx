import { ArrowLeft } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[80vh] flex-col justify-center pt-28">
      <p className="label-mono">Error 404</p>
      <h1 className="font-display mt-4 text-[clamp(3rem,10vw,7rem)] text-fg">
        This page <em className="italic">doesn&apos;t exist</em>.
      </h1>
      <p className="mt-6 max-w-md text-lg text-muted">The link may be outdated, or the page has moved in the redesign.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/">
          <ArrowLeft className="size-4" aria-hidden /> Back home
        </ButtonLink>
        <ButtonLink href="/#projects" variant="secondary">View projects</ButtonLink>
      </div>
    </section>
  );
}
