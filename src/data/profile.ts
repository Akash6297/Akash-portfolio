// Personal details, availability and copy used across the site.
//
// These are the built-in defaults. Once you import content in the admin panel
// (/admin), the database copy is used instead and this file becomes the fallback.

import type { ProfileData } from './types';

export const profile: ProfileData = {
  name: 'Akash Mandal',
  shortName: 'Akash',
  brand: 'AKASH.',
  role: 'Full-Stack Developer',
  roles: ['Full-Stack Developer', 'Software Engineer', 'Creative Technologist'],
  location: {
    city: 'Purulia',
    region: 'West Bengal',
    country: 'India',
    countryCode: 'IN',
    label: 'Purulia, West Bengal, India',
    timezone: 'Asia/Kolkata',
  },
  email: 'akashmandal6297@gmail.com',
  /** WhatsApp number in international format, digits only (e.g. 9198xxxxxxxx). Empty hides the WhatsApp option. */
  whatsapp: '',
  socials: [
    { id: 'github', label: 'GitHub', handle: '@Akash6297', href: 'https://github.com/Akash6297' },
    { id: 'linkedin', label: 'LinkedIn', handle: 'in/akash-mandal07', href: 'https://www.linkedin.com/in/akash-mandal07/' },
    { id: 'email', label: 'Email', handle: 'akashmandal6297@gmail.com', href: 'mailto:akashmandal6297@gmail.com' },
  ],
  resume: {
    href: '/resume/Akash-Mandal-Resume.pdf',
    fileName: 'Akash-Mandal-Resume.pdf',
  },
  portrait: {
    src: '/images/profile/akash-mandal-portrait.webp',
    alt: 'Portrait of Akash Mandal',
    width: 696,
    height: 870,
  },

  /**
   * Availability shown in the hero, contact section and terminal.
   * Set `open` to false to show "Not taking new work" instead.
   */
  availability: {
    open: true,
    label: 'Available for opportunities',
    detail: 'Open to full-time roles and freelance projects.',
  },

  /** Current position, shown in the hero meta strip. */
  current: { role: 'Full-Stack Developer', company: 'MavenPro' },

  experienceSummary: '2+ years',

  hero: {
    /** Wrap words in *asterisks* to set them in italics. */
    /** Wrap words in *asterisks* to set them in italics. */
    headline: 'Building digital experiences that *actually work*.',
    statement:
      'I engineer modern web applications, scalable backend systems, and digital products that solve real problems.',
    intro:
      'Full-stack developer working across React, Next.js, Node.js and the databases behind them — from interface to API to deployment.',
  },

  about: {
    lead: 'I build complete web products: the interface people touch, the API behind it, and the database underneath.',
    paragraphs: [
      "I'm a full-stack developer from Purulia, West Bengal, with over two years of combined professional and freelance experience. Today I build and maintain full-stack web applications at MavenPro — REST APIs, database-driven features, authentication, email workflows and the responsive interfaces on top of them.",
      'I studied Electronics and Communication Engineering, and I learned software by shipping it: a MERN storefront with its own admin panel, a placement portal for my college, client websites, and products of my own — the SmoothWeb platform, NFC business cards, a browser-only business toolkit, and LAKSHYA, a productivity app built on Postgres with row-level security on every table.',
      'I care about the parts users never see: clear data models, input validated on both sides, secrets kept on the server, and tests that prove the important paths work. I would rather ship something small that works than something impressive that breaks.',
    ],
    principles: [
      { title: 'Understand first', text: 'Requirements and constraints before frameworks.' },
      { title: 'Build the whole thing', text: 'UI, API, data and deployment as one system.' },
      { title: 'Keep it maintainable', text: 'Readable code, typed data, documented setup.' },
    ],
    languages: [
      { language: 'Bengali', level: 'Native' },
      { language: 'English', level: 'Proficient' },
      { language: 'Hindi', level: 'Proficient' },
    ],
  },

  contact: {
    headline: "Have an idea? Let's build something meaningful.",
    text: 'Tell me what you are building, what is in the way, and when you need it. Every message comes straight to my inbox.',
  },

  footer: {
    statement: 'Designed and engineered by Akash Mandal. Built with Next.js, deployed on Vercel.',
    closing: 'Thanks for scrolling this far.',
  },
};
