// Services offered and the development process. `proof` links a service to a
// project slug that demonstrates it.

import type { Service } from './types';

export const services: Service[] = [
  {
    title: 'Full-Stack Web Development',
    description: 'Complete applications — interface, API, database, auth and deployment — built as one system.',
    icon: 'layers',
    deliverables: ['React / Next.js frontend', 'Node.js API', 'Database design', 'Deployment'],
    proof: 'lakshya',
  },
  {
    title: 'Frontend Development',
    description: 'Fast, responsive, accessible interfaces from your Figma or Adobe XD designs, or designed with you.',
    icon: 'layout',
    deliverables: ['Pixel-accurate UI', 'Responsive layouts', 'Accessibility', 'Motion'],
    proof: 'sayandip-portfolio',
  },
  {
    title: 'Backend & API Development',
    description: 'Secure, documented REST APIs with authentication, validation and third-party integrations.',
    icon: 'server',
    deliverables: ['REST API design', 'JWT auth', 'Integrations', 'Email workflows'],
    proof: 'roomledger',
  },
  {
    title: 'E-commerce Development',
    description: 'Storefronts with accounts, carts, orders, payments and an admin panel to run them.',
    icon: 'shopping-bag',
    deliverables: ['Catalogue & cart', 'Orders', 'Payments', 'Admin panel'],
    proof: 'tribal-trends',
  },
  {
    title: 'Business Website Development',
    description: 'Credible company websites that explain what you do and turn visitors into enquiries.',
    icon: 'building',
    deliverables: ['Service pages', 'Enquiry forms', 'SEO setup', 'Hosting'],
    proof: 'udeline',
  },
  {
    title: 'Custom Web Applications',
    description: 'Internal tools and products shaped around your workflow instead of a generic template.',
    icon: 'app-window',
    deliverables: ['Dashboards', 'Role-based access', 'Reports & exports', 'PWAs'],
    proof: 'mission-2026',
  },
  {
    title: 'Website Optimization',
    description: 'Performance, SEO and reliability work on existing sites — plus ongoing maintenance and support.',
    icon: 'gauge',
    deliverables: ['Core Web Vitals', 'Technical SEO', 'Security updates', 'Maintenance'],
    proof: 'smoothweb-toolkit',
  },
  {
    title: 'WordPress Development',
    description: 'WordPress business websites set up, customised and maintained.',
    icon: 'pen-tool',
    deliverables: ['Theme setup', 'Custom pages', 'Plugins', 'Maintenance'],
  },
];

export const approach = [
  {
    step: '01',
    title: 'Discover',
    text: 'Understand the requirements, the people using it and the business objective behind it.',
    outputs: ['Goals & constraints', 'User flows', 'Scope'],
  },
  {
    step: '02',
    title: 'Architect',
    text: 'Plan the application structure: data model, API surface, auth and where each piece runs.',
    outputs: ['Data model', 'API contract', 'Stack decision'],
  },
  {
    step: '03',
    title: 'Design & Develop',
    text: 'Build responsive interfaces and robust backend systems in small, reviewable steps.',
    outputs: ['UI components', 'API & database', 'Preview deploys'],
  },
  {
    step: '04',
    title: 'Test & Optimize',
    text: 'Improve quality, performance, security and usability before anyone depends on it.',
    outputs: ['Automated tests', 'Performance pass', 'Security review'],
  },
  {
    step: '05',
    title: 'Deploy & Maintain',
    text: 'Launch to production, monitor it and keep it updated after release.',
    outputs: ['Production deploy', 'Documentation', 'Ongoing support'],
  },
] as const;
