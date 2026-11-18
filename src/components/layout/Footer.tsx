import Link from 'next/link';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { profile } from '@/data/profile';
import { socials } from '@/data/socials';
import { navItems } from '@/lib/site';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { CurrentYear } from './CurrentYear';

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="container-page grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-6">
          <Link href="/" className="inline-block text-[clamp(3.5rem,11vw,7.5rem)] font-semibold leading-[0.85] tracking-[-0.04em] text-fg">
            AKASH<span className="text-accent">.</span>
          </Link>
          <p className="mt-5 text-muted">{profile.role} · {profile.location.label}</p>
          <p className="mt-2 max-w-sm text-sm text-subtle">{profile.footer.statement}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <p className="label-mono mb-4">Navigate</p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link href={`/#${item.id}`} className="inline-flex min-h-9 items-center text-muted transition-colors hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={profile.resume.href} download={profile.resume.fileName} className="inline-flex min-h-9 items-center text-muted transition-colors hover:text-fg">
                Resume (PDF)
              </a>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="label-mono mb-4">Connect</p>
          <ul className="space-y-1">
            {socials.map((s) => (
              <li key={s.id}>
                <a
                  href={s.href}
                  className="group inline-flex min-h-9 items-center gap-2.5 text-muted transition-colors hover:text-fg"
                  {...(s.id !== 'email' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <SocialIcon id={s.id} className="size-3.5" />
                  {s.label}
                  <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-4 py-6 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {profile.name}. {profile.footer.closing}
          </p>
          <a href="#main" className="inline-flex min-h-9 items-center gap-2 self-start text-muted transition-colors hover:text-fg sm:self-auto">
            Back to top <ArrowUp className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
