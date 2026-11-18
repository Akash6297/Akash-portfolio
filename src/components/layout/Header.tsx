'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { Download, Menu, X } from 'lucide-react';
import { navItems } from '@/lib/site';
import { profile } from '@/data/profile';
import { socials } from '@/data/socials';
import { cn } from '@/lib/utils';

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => observer.observe(s));
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.5) setActive(null);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled]);
  return active;
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const active = useActiveSection(isHome);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300',
        scrolled || open ? 'border-line bg-bg/85 backdrop-blur-md' : 'border-transparent bg-transparent',
      )}
    >
      <nav aria-label="Main" className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" className="relative z-10 text-[15px] font-semibold tracking-[0.12em] text-fg" aria-label={`${profile.name} — home`}>
          AKASH<span className="text-accent">.</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id} className="relative">
                <Link
                  href={`/#${item.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn('relative block px-3 py-2 text-sm transition-colors', isActive ? 'text-fg' : 'text-muted hover:text-fg')}
                >
                  {isActive && (
                    <m.span layoutId="nav-indicator" className="absolute inset-0 -z-10 rounded-md bg-raised" aria-hidden />
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={profile.resume.href}
            download={profile.resume.fileName}
            className="hidden min-h-9 items-center gap-2 rounded-md border border-line-strong px-3.5 text-sm text-fg transition-colors hover:border-subtle hover:bg-raised sm:inline-flex"
          >
            <Download className="size-3.5" aria-hidden />
            Resume
          </a>
          <button
            ref={menuButton}
            type="button"
            className="relative z-10 grid size-11 place-items-center rounded-md text-fg md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto bg-bg md:hidden"
          >
            <ul className="container-page flex flex-col pt-6">
              {navItems.map((item, i) => (
                <m.li
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-line"
                >
                  <Link
                    ref={i === 0 ? firstLink : undefined}
                    href={`/#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between py-5"
                  >
                    <span className="font-display text-4xl">{item.label}</span>
                    <span className="label-mono">0{i + 1}</span>
                  </Link>
                </m.li>
              ))}
            </ul>
            <div className="container-page mt-auto flex flex-col gap-4 py-8">
              <a
                href={profile.resume.href}
                download={profile.resume.fileName}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-fg text-sm font-medium text-bg"
              >
                <Download className="size-4" aria-hidden /> Download resume
              </a>
              <div className="flex justify-between text-sm text-muted">
                {socials.map((s) => (
                  <a key={s.id} href={s.href} className="py-2 hover:text-fg" {...(s.id !== 'email' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
