'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Award, Briefcase, CalendarDays, Cpu, ExternalLink, FileText, FolderKanban, GraduationCap, Inbox, LayoutDashboard,
  LogOut, Mail, Menu, ScrollText, Settings, Sparkles, Trophy, UserRound, Wrench, X, type LucideIcon,
} from 'lucide-react';
import { adminFetch } from './api';
import { Notice } from './ui';
import { cn } from '@/lib/utils';

const NAV: Array<{ title: string; items: Array<{ href: string; label: string; icon: LucideIcon }> }> = [
  { title: '', items: [{ href: '/admin', label: 'Overview', icon: LayoutDashboard }] },
  {
    title: 'Inbox',
    items: [
      { href: '/admin/messages', label: 'Messages', icon: Inbox },
      { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/profile', label: 'Profile & hero', icon: UserRound },
      { href: '/admin/content/projects', label: 'Projects', icon: FolderKanban },
      { href: '/admin/content/experience', label: 'Experience', icon: Briefcase },
      { href: '/admin/content/education', label: 'Education', icon: GraduationCap },
      { href: '/admin/content/certifications', label: 'Certifications', icon: Award },
      { href: '/admin/content/achievements', label: 'Achievements', icon: Trophy },
      { href: '/admin/content/skills', label: 'Skills', icon: Cpu },
      { href: '/admin/content/services', label: 'Services', icon: Wrench },
    ],
  },
  {
    title: 'Tools',
    items: [
      { href: '/admin/resume', label: 'Resume builder', icon: ScrollText },
      { href: '/admin/import', label: 'Smart import', icon: Sparkles },
      { href: '/admin/email-templates', label: 'Email templates', icon: Mail },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

interface ShellProps {
  user: { username: string; email: string; superAdmin: boolean };
  dbConfigured: boolean;
  children: React.ReactNode;
}

export function AdminShell({ user, dbConfigured, children }: ShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    await adminFetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-line px-5">
        <Link href="/admin" className="text-[15px] font-semibold tracking-[0.12em] text-fg">
          AKASH<span className="text-accent">.</span> <span className="label-mono ml-1.5">Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((group) => (
          <div key={group.title || 'top'} className="mb-3">
            {group.title && <p className="label-mono mb-1.5 px-2">{group.title}</p>}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn('flex min-h-8 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors', isActive(item.href) ? 'bg-raised text-fg' : 'text-muted hover:bg-raised/60 hover:text-fg')}
                  >
                    <item.icon className="size-4" aria-hidden strokeWidth={1.75} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line p-3">
        <div className="grid grid-cols-2 gap-1">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-8 items-center gap-2 rounded-md px-2.5 text-[13px] text-muted hover:bg-raised/60 hover:text-fg">
            <ExternalLink className="size-3.5" aria-hidden strokeWidth={1.75} /> View site
          </a>
          <Link href="/resume" target="_blank" className="flex min-h-8 items-center gap-2 rounded-md px-2.5 text-[13px] text-muted hover:bg-raised/60 hover:text-fg">
            <FileText className="size-3.5" aria-hidden strokeWidth={1.75} /> Resume
          </Link>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-surface px-2.5 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm text-fg">{user.username}</p>
            <p className="truncate text-xs text-subtle">{user.superAdmin ? 'Super admin' : 'Admin'}</p>
          </div>
          <button type="button" onClick={signOut} className="grid size-9 shrink-0 place-items-center rounded-md text-muted hover:bg-raised hover:text-fg" aria-label="Sign out">
            <LogOut className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15.5rem_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-bg lg:block">{nav}</aside>

      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-bg/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="text-[15px] font-semibold tracking-[0.12em] text-fg">AKASH<span className="text-accent">.</span></Link>
        <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-md text-fg" aria-label="Open admin menu" aria-expanded={open}>
          <Menu className="size-5" aria-hidden />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[17rem] border-r border-line bg-bg">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-md text-muted" aria-label="Close admin menu">
              <X className="size-5" aria-hidden />
            </button>
            {nav}
          </div>
        </div>
      )}

      <main id="main" className="min-w-0 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">
          {!dbConfigured && (
            <div className="mb-6">
              <Notice tone="error">
                <strong>MONGO_URI is not set.</strong> The admin panel needs your MongoDB database. Add MONGO_URI to the environment variables and redeploy.
              </Notice>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
