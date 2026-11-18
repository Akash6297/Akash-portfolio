// Technical skills, grouped. No proficiency percentages: each skill gets a short note,
// and the site lists the projects that use it automatically (matching project `stack`
// entries by name or alias).

import type { SkillGroup } from './types';

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    title: 'Frontend Engineering',
    description: 'Responsive, accessible interfaces with a component architecture that scales.',
    skills: [
      { name: 'React', icon: 'react', note: 'Primary UI library across client and product work.' },
      { name: 'Next.js', icon: 'nextdotjs', note: 'App and Pages Router, API routes, SSG and deployment on Vercel.' },
      { name: 'TypeScript', icon: 'typescript', note: 'Strictly typed apps and data models.' },
      { name: 'JavaScript', icon: 'javascript', note: 'ES modules, browser APIs, DOM and Canvas.' },
      { name: 'HTML5', icon: 'html5', note: 'Semantic, accessible markup.', aliases: ['HTML'] },
      { name: 'CSS3', icon: 'css', note: 'Layout, responsive design and animation.', aliases: ['CSS'] },
      { name: 'Tailwind CSS', icon: 'tailwindcss', note: 'Design-token driven styling.' },
      { name: 'SCSS / Sass', icon: 'sass', note: 'Modular stylesheets in larger React apps.', aliases: ['SCSS'] },
      { name: 'React Router', icon: 'reactrouter', note: 'Client-side routing for SPAs.' },
      { name: 'Framer Motion', icon: 'framer', note: 'Purposeful UI motion.' },
      { name: 'Progressive Web Apps', icon: 'pwa', note: 'Installable apps, service workers, offline shells.', aliases: ['PWA'] },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Engineering',
    description: 'APIs, authentication and scheduled work that hold up in production.',
    skills: [
      { name: 'Node.js', icon: 'nodedotjs', note: 'Runtime for APIs, scripts and tooling.' },
      { name: 'Express.js', icon: 'express', note: 'Layered REST APIs with middleware.', aliases: ['Express'] },
      { name: 'REST APIs', note: 'Resource design, validation and error handling.' },
      { name: 'JWT Authentication', icon: 'jsonwebtokens', note: 'Token auth with bcrypt-hashed passwords.', aliases: ['JWT', 'bcrypt'] },
      { name: 'Supabase Edge Functions', icon: 'deno', note: 'Serverless workers on Deno, triggered by pg_cron.', aliases: ['Edge Functions'] },
      { name: 'Google Apps Script', icon: 'googleappsscript', note: 'Lightweight APIs over Sheets and Drive.' },
      { name: 'Email workflows', note: 'Transactional mail with Nodemailer and SMTP.', aliases: ['Nodemailer'] },
      { name: 'Third-party APIs', note: 'Payments, image processing, messaging and data APIs.', aliases: ['remove.bg API', 'Razorpay', 'Telegram Bot API', 'TMDB API', 'Google Sheets API', 'Google Drive API'] },
    ],
  },
  {
    id: 'database',
    title: 'Database Systems',
    description: 'Choosing the right store and modelling data so it stays correct.',
    skills: [
      { name: 'MongoDB', icon: 'mongodb', note: 'Document models for content and commerce.' },
      { name: 'Mongoose', icon: 'mongoose', note: 'Schemas and validation on top of MongoDB.' },
      { name: 'PostgreSQL', icon: 'postgresql', note: 'Relational modelling, constraints and row-level security.' },
      { name: 'Supabase', icon: 'supabase', note: 'Postgres, Auth, Realtime and Storage.' },
      { name: 'Firebase', icon: 'firebase', note: 'Auth and Cloud Firestore.', aliases: ['Firebase Auth', 'Cloud Firestore'] },
      { name: 'SQLite', icon: 'sqlite', note: "Embedded storage via Node's built-in driver." },
      { name: 'SQL', note: 'Queries, joins, migrations and constraints.', aliases: ['pg_cron'] },
    ],
  },
  {
    id: 'libraries',
    title: 'Frameworks & Libraries',
    description: 'Tooling that keeps projects fast to build and safe to change.',
    skills: [
      { name: 'Vite', icon: 'vite', note: 'Fast builds for React SPAs.' },
      { name: 'Zod', icon: 'zod', note: 'Schema validation at the edges.' },
      { name: 'Vitest', icon: 'vitest', note: 'Unit and integration tests.' },
      { name: 'Playwright', note: 'End-to-end and visual smoke tests.' },
      { name: 'Chart.js', icon: 'chartdotjs', note: 'Dashboards and analytics views.' },
      { name: 'Axios', icon: 'axios', note: 'HTTP client layer for React apps.' },
    ],
  },
  {
    id: 'platforms',
    title: 'Tools & Platforms',
    description: 'Shipping, hosting and the everyday developer toolchain.',
    skills: [
      { name: 'Git', icon: 'git', note: 'Branching, history and collaboration.' },
      { name: 'GitHub', icon: 'github', note: '60+ public repositories.' },
      { name: 'Vercel', icon: 'vercel', note: 'Next.js hosting, cron jobs and previews.', aliases: ['Vercel Cron'] },
      { name: 'Netlify', icon: 'netlify', note: 'Static and SPA hosting.' },
      { name: 'WordPress', icon: 'wordpress', note: 'Business websites at MavenPro.' },
      { name: 'AWS', note: 'Cloud hosting and services at MavenPro.' },
      { name: 'Microsoft Azure', note: 'Cloud services, from the Microsoft virtual internship.', aliases: ['Azure'] },
      { name: 'Google Cloud', icon: 'googlecloud', note: 'Certified: Architecting with Google Kubernetes Engine.' },
      { name: 'VS Code', note: 'Daily editor.' },
    ],
  },
  {
    id: 'additional',
    title: 'Additional Technologies',
    description: 'Range beyond the web stack.',
    skills: [
      { name: 'Python', icon: 'python', note: 'Scripting and data work (Rice University specialization).' },
      { name: 'Streamlit', icon: 'streamlit', note: 'Shipping Python models as web apps.' },
      { name: 'Jupyter', icon: 'jupyter', note: 'Notebooks for data preparation.' },
      { name: 'Java / Android', icon: 'android', note: 'Companion Android app for LAKSHYA.' },
      { name: 'SEO', note: 'Technical SEO, meta data and structured data.' },
      { name: 'Algorithms', note: 'Stanford Algorithms Specialization.' },
    ],
  },
];
