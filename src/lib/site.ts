import { profile } from '@/data/profile';

/** Canonical origin. Set NEXT_PUBLIC_SITE_URL in production if the domain changes. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://akash-mandal.vercel.app').replace(/\/$/, '');

export const site = {
  name: `${profile.name} — ${profile.role}`,
  title: `${profile.name} — Full-Stack Developer in ${profile.location.country}`,
  description:
    'Akash Mandal is a full-stack developer in West Bengal, India, building web applications with React, Next.js, Node.js, MongoDB and PostgreSQL. Selected work, case studies and contact.',
  locale: 'en_IN',
  keywords: [
    'Akash Mandal',
    'Full-Stack Developer',
    'Software Engineer',
    'React developer',
    'Next.js developer',
    'Node.js developer',
    'MERN stack developer',
    'Web developer India',
    'Freelance web developer West Bengal',
  ],
};

export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
] as const;
