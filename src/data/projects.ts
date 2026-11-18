// Every project on the site, including its case study.
//
// To add a project:
//   1. Put screenshots in public/images/projects/<slug>/ (or run `npm run assets:screenshots`).
//   2. Copy an entry below, give it a unique `slug`, and fill in the fields.
//   3. Set `featured: true` to show it in the large editorial layout on the home page.
//
// Only write what can be verified. Leave `results` empty rather than estimating numbers.

import type { ImageAsset, Project, ProjectFilter } from './types';

const img = (slug: string, file: string) => `/images/projects/${slug}/${file}.webp`;

const desktop = (slug: string, file: string, alt: string, caption?: string): ImageAsset => ({
  src: img(slug, file), width: 1440, height: 900, alt, caption, device: 'desktop',
});
const mobile = (slug: string, alt: string, caption?: string): ImageAsset => ({
  src: img(slug, 'mobile'), width: 780, height: 1688, alt, caption, device: 'mobile',
});
const wide = (slug: string, height: number, alt: string, caption?: string): ImageAsset => ({
  src: img(slug, 'cover'), width: 1800, height, alt, caption, device: 'desktop',
});

export const filterLabels: Record<'all' | ProjectFilter, string> = {
  all: 'All',
  'full-stack': 'Full-Stack',
  frontend: 'Frontend',
  backend: 'Backend',
  products: 'SaaS / Products',
  experiments: 'Experiments',
};

export const projects: Project[] = [
  {
    slug: 'lakshya',
    name: 'LAKSHYA',
    tagline: 'A personal productivity OS — calendar, tasks, projects, study and focus in one installable app.',
    category: 'Productivity SaaS',
    filters: ['full-stack', 'backend', 'products'],
    featured: true,
    order: 1,
    year: '2026',
    role: 'Product design, frontend, database and backend',
    kind: 'product',
    stack: ['React', 'TypeScript', 'Vite', 'Supabase', 'PostgreSQL', 'Edge Functions', 'pg_cron', 'PWA', 'Web Push', 'Telegram Bot API', 'Zod', 'Vitest', 'Playwright'],
    links: { live: 'https://lakshya-ved.vercel.app', source: 'https://github.com/Akash6297/LAKSHYA' },
    cover: desktop('lakshya', 'desktop', 'LAKSHYA sign-in screen with the tagline "Your Goals. Your Time. Your Journey."'),
    gallery: [
      desktop('lakshya', 'desktop', 'LAKSHYA sign-in screen on desktop', 'Sign-in — the app itself sits behind Supabase Auth.'),
      mobile('lakshya', 'LAKSHYA on a phone-sized screen', 'Installable PWA, designed mobile-first.'),
    ],
    architecture: ['React + Vite PWA', 'IndexedDB sync queue', 'Supabase Auth + REST', 'Postgres (RLS on every table)', 'Edge Functions + pg_cron'],
    caseStudy: {
      overview:
        'LAKSHYA brings calendar, My Day planning, tasks, projects, work hours, study plans, meetings, notes, goals, habits and a focus timer into one installable web app — with reminders delivered by push, email and Telegram. It is designed to run at zero cost on free tiers.',
      problem:
        'Planning a day usually means juggling a calendar, a to-do app, a notes app and a study tracker that do not know about each other. Reminders from free tools are unreliable, and most productivity apps hide how their "scores" are calculated.',
      solution:
        'One data model for everything that competes for your time. The React PWA talks to Supabase, where Postgres enforces row-level security on every user table. Scheduled reminders run through Edge Functions triggered by pg_cron, and the app keeps working offline with an IndexedDB sync queue that never overwrites newer server data.',
      process: [
        'Modelled every domain (events, tasks, projects, study, meetings, notes, habits) in Postgres with composite foreign keys so rows can never be linked across users.',
        'Wrote RLS policies against auth.uid() and revoked client access to worker functions, delivery logs and secret tables.',
        'Built the offline layer: cached tasks, a coalescing sync queue and a conflict-review screen.',
        'Added scheduled delivery with Edge Functions, pg_cron, Web Push, SMTP and the Telegram Bot API, with a scheduler-health banner in the UI.',
        'Covered the risky paths with tests: migrations run in PGlite to prove user isolation, and a Playwright smoke test checks every page at desktop and mobile widths.',
      ],
      features: [
        'Calendar with day, week, month, year, agenda and timeline views, drag-and-resize and recurring events (RRULE)',
        'Tasks with subtasks, dependencies, recurrence, Kanban and bulk editing',
        'My Day time-blocking with conflict detection and suggested free slots',
        'Study planner with spaced revision (1 → 3 → 7 → 14 → 30 → 60 days)',
        'Pomodoro focus timer that survives navigation and reload',
        'Analytics where every number states how it is calculated, with a table view for every chart',
        'Command palette search (Ctrl/⌘ K) and keyboard shortcuts',
        'Full JSON backup, CSV export with formula-injection protection, and transactional restore',
      ],
      results: [
        '43 unit and integration tests (Vitest), including RLS isolation tests that run the real migrations in PGlite.',
        'Playwright smoke test that visits every page at 1440 px and 390 px and fails on runtime errors or horizontal overflow.',
        'Runs on free tiers only: Vercel Hobby, Supabase Free, GitHub, Web Push and the Telegram Bot API.',
      ],
    },
  },
  {
    slug: 'smoothweb',
    name: 'SmoothWeb',
    tagline: 'A digital agency platform — portfolio sites, growth services, bookings and NFC cards under one brand.',
    category: 'Agency platform',
    filters: ['full-stack', 'products'],
    featured: true,
    order: 2,
    role: 'Founder — design, development and operations',
    kind: 'product',
    stack: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Google Apps Script', 'Google Sheets', 'Razorpay', 'PWA'],
    links: { live: 'https://smoothweb.in/' },
    cover: wide('smoothweb', 819, 'SmoothWeb home page with the headline "SMOOTHWEB — Digital excellence redefined"'),
    gallery: [
      wide('smoothweb', 819, 'SmoothWeb home page', 'Home — positioning for creators and small businesses.'),
      desktop('smoothweb', 'services', 'SmoothWeb services page', 'Services — portfolio websites, SEO and digital solutions.'),
      mobile('smoothweb', 'SmoothWeb home page on mobile'),
    ],
    architecture: ['React + Vite SPA (PWA)', 'Google Apps Script API', 'Google Sheets', 'Razorpay checkout'],
    caseStudy: {
      overview:
        'SmoothWeb is the agency I founded to build custom portfolio websites for creators and small businesses, alongside strategic marketing, NFC-ready business cards and digital branding. The site is both the storefront and the operations tool behind it.',
      problem:
        'A one-person agency needs to sell services, take bookings, accept payments and manage orders without paying for a stack of SaaS subscriptions.',
      solution:
        'A code-split React + Vite single-page app with a private admin area. Google Apps Script exposes a lightweight API over Google Sheets for bookings, contact messages, card orders, team applications and finance records, and Razorpay handles checkout.',
      process: [
        'Designed the brand and the public pages: mission, solutions, consulting, portfolio and booking.',
        'Split the app into lazily loaded routes so the landing page stays light.',
        'Built an admin app for bookings, card orders, contact messages, member applications and finance.',
        'Connected Razorpay checkout and made the site installable as a PWA.',
      ],
      features: [
        'Public site with services, portfolio, about, booking and review pages',
        'Digital business-card creator with live preview (see SmoothCard)',
        'Team sign-up flow for collaborators',
        'Admin dashboard for bookings, orders, messages, applications and finance',
        'Razorpay payments',
        'FAQ assistant on the landing page',
      ],
    },
  },
  {
    slug: 'tribal-trends',
    name: 'Tribal Trends',
    tagline: 'A MERN e-commerce store with customer accounts, cart, orders and a separate admin panel.',
    category: 'E-commerce',
    filters: ['full-stack', 'backend'],
    featured: true,
    order: 3,
    year: '2023',
    role: 'Full-stack development',
    kind: 'personal',
    stack: ['React', 'React Router', 'Axios', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'JWT', 'bcrypt', 'Nodemailer'],
    links: { source: 'https://github.com/Akash6297/Tribal-Trends' },
    gallery: [],
    architecture: ['React storefront', 'React admin panel', 'Express REST API (JWT)', 'MongoDB (Mongoose)', 'Nodemailer'],
    caseStudy: {
      overview:
        'Tribal Trends is a complete MERN-stack store split into three apps: a customer storefront, an admin panel, and an Express API backed by MongoDB.',
      problem:
        'A small online store needs more than a product grid. Customers need accounts, a cart and an order form; the owner needs to add products, update them and track orders without editing code.',
      solution:
        'Two React clients share one Express API. Customers sign up and sign in with bcrypt-hashed passwords and JWTs, browse by category, add to cart and place orders. The admin panel manages products, orders and contact messages, and Nodemailer sends password-reset and contact emails.',
      process: [
        'Designed Mongoose schemas for users, products, orders and messages.',
        'Built the Express API with JWT authentication and bcrypt password hashing.',
        'Built the storefront: home, categories, products, cart and order form.',
        'Built a separate admin client for product CRUD, order status and messages.',
        'Added transactional email for password resets and the contact form.',
      ],
      features: [
        'Sign up, sign in and password reset',
        'Category browsing and product listings',
        'Cart and order placement',
        'Admin: add and update products',
        'Admin: order list and contact messages',
        'Contact form with email notification',
      ],
    },
  },
  {
    slug: 'roomledger',
    name: 'RoomLedger',
    tagline: 'Split shared expenses by uploading the WhatsApp chat your roommates already use.',
    category: 'Full-stack web app',
    filters: ['full-stack', 'backend', 'products'],
    featured: true,
    order: 4,
    year: '2026',
    role: 'Product design, frontend and backend',
    kind: 'product',
    stack: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'SQLite', 'JWT', 'bcrypt', 'Multer', 'Chart.js', 'ExcelJS', 'PDFKit', 'PWA'],
    links: { source: 'https://github.com/Akash6297/RoomLedger' },
    gallery: [],
    architecture: ['WhatsApp chat export', 'React + Vite PWA', 'Express API (JWT, rate limits)', 'Parser + settlement services', 'SQLite (node:sqlite)'],
    caseStudy: {
      overview:
        'RoomLedger lets roommates keep logging expenses the way they already do — "Milk 40", "Water - 12" in a WhatsApp group — then turns an exported chat into a ledger, analytics and a settle-up plan.',
      problem:
        'Expense-splitting apps fail when nobody opens them. Roommates already record spending in their group chat, but nobody adds it up.',
      solution:
        'Upload the exported .txt chat. A parser recognises many expense formats ("Water ₹12", "Balti + Mug -110"), ignores ordinary chatter with regex and heuristic filters, auto-categorises each line and shows a preview before anything is saved. The settlement service then works out who owes whom.',
      process: [
        'Wrote the chat parser and its filters as an isolated service.',
        'Structured the API in layers: routes → controllers → services → repositories.',
        "Chose Node's built-in node:sqlite driver so the project installs with a plain npm install — no native compilation.",
        'Added JWT auth, validation, rate limiting and upload limits as middleware.',
        'Built the React dashboard with charts, settlement views and Excel, PDF and CSV reports.',
      ],
      features: [
        'Rooms with invite codes',
        'WhatsApp chat import with preview before commit',
        'Automatic expense categorisation',
        'Who-owes-whom settlement',
        'Dashboard and charts per member and category',
        'Excel, PDF and CSV exports',
        'Installable PWA',
      ],
    },
  },
  {
    slug: 'mission-2026',
    name: 'Mission 2026',
    tagline: 'A gamified goal tracker where daily logs earn XP, rewards spend it, and scheduled emails keep you on track.',
    category: 'Full-stack web app',
    filters: ['full-stack', 'backend', 'products'],
    featured: true,
    order: 5,
    year: '2025',
    role: 'Full-stack development',
    kind: 'personal',
    stack: ['Next.js', 'React', 'MongoDB', 'Mongoose', 'JWT', 'bcrypt', 'Nodemailer', 'Vercel Cron', 'Tailwind CSS'],
    links: { live: 'https://mission-2026.vercel.app/', source: 'https://github.com/Akash6297/mission-2026' },
    cover: wide('mission-2026', 815, 'Mission 2026 dashboard with goal categories, XP progress and a timeline of logs'),
    gallery: [
      wide('mission-2026', 815, 'Mission 2026 dashboard', 'Dashboard — goal categories, streak, XP and the log timeline.'),
      desktop('mission-2026', 'desktop', 'Mission 2026 sign-in screen', '"Mission Access" — the sign-in screen.'),
      mobile('mission-2026', 'Mission 2026 sign-in on mobile'),
    ],
    architecture: ['Next.js pages', 'API routes (JWT cookies)', 'MongoDB (Mongoose)', 'Vercel Cron → Nodemailer'],
    caseStudy: {
      overview:
        'Mission 2026 turns a year of personal goals — new skills, savings, content creation, networking and more — into a game. Each daily log earns XP; rewards you define cost XP; and the app emails a morning briefing and an evening check-in.',
      problem:
        'Goal lists are easy to write and easy to forget. Without feedback or reminders, progress stalls in the first few weeks.',
      solution:
        'A Next.js app with its own auth and API routes. Logs store completed tasks, mood and XP gained or spent in MongoDB. Two Vercel Cron jobs call API routes that send the daily emails, and an admin area can broadcast messages and manage users and motivation content.',
      process: [
        'Built sign-up, login, logout, forgot-password and reset flows with bcrypt and JWT cookies.',
        'Modelled users, settings, daily logs and motivation content in Mongoose.',
        'Scheduled morning-briefing and evening emails with Vercel Cron.',
        'Built the admin panel: broadcast email, personal mail, global settings and user management.',
      ],
      features: [
        'Goal categories with XP and streaks',
        'Daily logs with mood and completed tasks',
        'Custom rewards that spend XP',
        'Morning briefing and evening check-in emails',
        'Diary view with page-flip',
        'Admin broadcast and user management',
      ],
    },
  },
  {
    slug: 'backgroundblaster',
    name: 'BackgroundBlaster',
    tagline: 'An AI photo editor for background removal, passport photos and print sheets — all in the browser.',
    category: 'AI image tool',
    filters: ['frontend', 'products'],
    featured: true,
    order: 6,
    year: '2023',
    role: 'Design and development',
    kind: 'product',
    stack: ['JavaScript', 'HTML', 'CSS', 'remove.bg API', 'Fabric.js', 'Canvas API'],
    links: { live: 'https://akash6297.github.io/BackgroundBlaster/', source: 'https://github.com/Akash6297/BackgroundBlaster' },
    cover: desktop('backgroundblaster', 'desktop', 'BackgroundBlaster landing page: "Remove image backgrounds in seconds" with an upload panel'),
    gallery: [
      desktop('backgroundblaster', 'desktop', 'BackgroundBlaster upload screen', 'Upload, drop or paste an image to start.'),
      mobile('backgroundblaster', 'BackgroundBlaster on mobile', 'Works on mobile.'),
    ],
    architecture: ['Browser upload', 'remove.bg API', 'Mask applied in browser', 'Fabric.js editor', 'Export'],
    caseStudy: {
      overview:
        'BackgroundBlaster removes image backgrounds in one step, then lets you swap backgrounds, size passport and visa photos at 300 DPI, and export print-ready sheets — without an account.',
      problem:
        'Removing a background is easy to find online; producing a correctly sized passport photo with a clean background usually takes several tools and a paid plan.',
      solution:
        "The app checks the remove.bg balance first. With credits, it requests a full-resolution cutout; without, it uses the free preview-size mask and applies it to the full-resolution original in the browser, so the subject stays sharp. Editing and export run client-side with Fabric.js.",
      process: [
        'Started as a single-click background remover in 2023.',
        'Rebuilt the editing flow around Fabric.js: crop, backgrounds, sizes and export.',
        'Added passport and visa presets with automatic head positioning and embedded print DPI.',
        'Let visitors use their own remove.bg API key, stored only in their browser.',
      ],
      features: [
        'Upload, drag-and-drop or paste (Ctrl+V)',
        'Transparent, colour, blurred or custom-image backgrounds',
        'Passport/visa sizes for the US, India, UK/EU, Canada and China at 300 DPI',
        '4×6 in print sheet with cut guides',
        'Export to PNG, JPG, WEBP, BMP and AVIF with quality and resolution controls',
        'Light and dark theme',
      ],
    },
  },
  {
    slug: 'smoothcard',
    name: 'SmoothCard',
    tagline: 'NFC and QR digital business cards that open an always-current profile — no app required.',
    category: 'SaaS product',
    filters: ['frontend', 'products'],
    featured: false,
    order: 7,
    role: 'Product design and development',
    kind: 'product',
    stack: ['Next.js', 'React', 'NFC', 'QR codes', 'Razorpay'],
    links: { live: 'https://card.smoothweb.in' },
    cover: desktop('smoothcard', 'desktop', 'SmoothCard landing page: "One tap. Unlimited connections."'),
    gallery: [
      desktop('smoothcard', 'desktop', 'SmoothCard landing page', 'Landing page for the card product.'),
      desktop('smoothcard', 'creator', 'SmoothCard creator with live card preview', 'Card Architect — design a card and preview front and back.'),
      mobile('smoothcard', 'SmoothCard landing page on mobile'),
    ],
    caseStudy: {
      overview:
        'SmoothCard is the digital business-card product from SmoothWeb. One tap of an NFC card or a QR scan opens a profile with services, products, gallery and contact details.',
      problem:
        'Paper business cards get lost, go out of date the day details change, and tell you nothing about who is interested.',
      solution:
        'A card that points to a profile you can update at any time, so every card in circulation stays current. The card creator on smoothweb.in lets customers design the physical card and choose a package before checkout.',
      process: [
        'Defined the product: card packages, profile content and the tap-to-profile flow.',
        'Built the marketing site with features, pricing, FAQ and a blog.',
        'Built the card creator with palette, pattern and template options and a live front/back preview.',
      ],
      features: [
        'NFC tap and QR scan, iOS and Android, no app install',
        'Rich profile: logo, services, products, gallery and contacts',
        'Card creator with live preview',
        'Standard and premium packages',
      ],
    },
  },
  {
    slug: 'smoothweb-toolkit',
    name: 'SmoothWeb Toolkit',
    tagline: 'Free business tools that run entirely in the browser — nothing is uploaded or stored.',
    category: 'Productivity toolkit',
    filters: ['frontend', 'products'],
    featured: false,
    order: 8,
    role: 'Design and development',
    kind: 'product',
    stack: ['Next.js', 'React', 'JavaScript', 'Browser APIs'],
    links: { live: 'https://tools.smoothweb.in' },
    cover: desktop('smoothweb-toolkit', 'desktop', 'SmoothWeb Toolkit home: "The business toolkit that respects your data."'),
    gallery: [
      desktop('smoothweb-toolkit', 'desktop', 'SmoothWeb Toolkit home page'),
      mobile('smoothweb-toolkit', 'SmoothWeb Toolkit on mobile'),
    ],
    caseStudy: {
      overview:
        'A public toolkit for founders, freelancers and agencies: a website health report, SEO meta generator, QR code generator, brand-kit generator and more across SEO, marketing, branding, design, business, finance, content and developer workflows.',
      problem:
        'Most free online tools want an account, upload your data, or hide the useful part behind a paid tier.',
      solution:
        'Every tool runs on-device in the browser — no sign-up, no uploads, no tracking of what you type. When a tool cannot fully check something (such as fetching another site’s HTML), it says so instead of showing a fake result.',
      process: [
        'Picked tools that produce something usable: exports to PDF, PNG, copy or download.',
        'Kept every computation client-side using browser APIs.',
        'Organised tools by category with search (⌘K).',
      ],
      features: [
        'Website Health Report: SEO, accessibility, security and UX audit',
        'SEO Meta Generator: meta tags, Open Graph, Twitter Cards and JSON-LD',
        'QR Code Generator: URL, Wi-Fi, vCard and WhatsApp codes with logos',
        'Rule-based Brand Kit Generator',
      ],
      results: ['17 tools live as of November 2026.'],
    },
  },
  {
    slug: 'udeline',
    name: 'Udeline Ventures',
    tagline: 'Corporate website for a heavy fabrication and mining solutions company.',
    category: 'Client website',
    filters: ['frontend'],
    featured: false,
    order: 9,
    role: 'Development and deployment',
    kind: 'client',
    stack: ['React', 'Next.js', 'Node.js', 'Google Sheets API', 'SEO'],
    links: { live: 'https://udeline.com/' },
    cover: wide('udeline', 824, 'Udeline Ventures home page: "Decades of industrial heritage"'),
    gallery: [
      wide('udeline', 824, 'Udeline Ventures home page hero'),
      desktop('udeline', 'desktop', 'Udeline Ventures home page, second hero slide: "Integrated industrial solutions"'),
      mobile('udeline', 'Udeline Ventures on mobile'),
    ],
    caseStudy: {
      overview:
        'A responsive corporate website for Udeline Ventures India Pvt. Ltd., presenting its fabrication, mining, transportation and engineering services.',
      problem:
        'The company needed a credible online presence to show its products and services and connect with potential clients.',
      solution:
        'A business-focused site with clear service sections and enquiry paths, with form submissions connected through the Google Sheets API, built with SEO and deployment in mind.',
      process: ['Structured content around the company’s service lines.', 'Built responsive pages and enquiry forms.', 'Deployed and set up SEO basics.'],
      features: ['Service pages for fabrication, mining, transportation and engineering', 'Enquiry and quote forms', 'Responsive layout'],
    },
  },
  {
    slug: 'sayandip-portfolio',
    name: 'Sayandip Dutta Portfolio',
    tagline: 'A premium portfolio for a video editor and motion designer.',
    category: 'Client website',
    filters: ['frontend'],
    featured: false,
    order: 10,
    role: 'Design and development',
    kind: 'client',
    stack: ['React', 'Tailwind CSS', 'Google Apps Script'],
    links: { live: 'https://sayandipdutta.online/' },
    cover: wide('sayandip-portfolio', 818, 'Sayandip Dutta portfolio hero: "Turn ideas into gold" with a portrait'),
    gallery: [
      wide('sayandip-portfolio', 818, 'Sayandip Dutta portfolio hero'),
      desktop('sayandip-portfolio', 'desktop', 'Sayandip Dutta portfolio: project folders by service', 'Work organised as folders by service.'),
      mobile('sayandip-portfolio', 'Sayandip Dutta portfolio on mobile'),
    ],
    caseStudy: {
      overview:
        'A portfolio that showcases video-editing work, motion projects, colour-grading examples and testimonials, with a project-inquiry flow.',
      problem: 'A video editor’s work has to be seen, not described — and clients need an easy next step once they like what they see.',
      solution: 'Interactive sections that let visitors pick a service and watch the proof, followed by a project-inquiry form.',
      process: ['Organised work by service.', 'Built interactive, media-heavy sections.', 'Connected the inquiry form.'],
      features: ['Work grouped by service', 'Colour-grading examples', 'Testimonials', 'Project-inquiry form'],
    },
  },
  {
    slug: 'secure-docs',
    name: 'Secure Docs',
    tagline: 'A private family vault that backs up documents straight to each member’s Google Drive.',
    category: 'Web app',
    filters: ['full-stack'],
    featured: false,
    order: 11,
    role: 'Design and development',
    kind: 'personal',
    stack: ['React', 'Google Apps Script', 'Google Drive API'],
    links: { live: 'https://family-secure-doc.vercel.app/' },
    cover: wide('secure-docs', 814, 'Secure Docs vault dashboard with upload area and vault switcher (family details blurred)'),
    gallery: [
      wide('secure-docs', 814, 'Secure Docs vault dashboard (family details blurred)', 'Vault dashboard — family members’ details blurred for privacy.'),
      desktop('secure-docs', 'desktop', 'Secure Docs sign-in screen', 'Sign-in gateway.'),
      mobile('secure-docs', 'Secure Docs on mobile'),
    ],
    caseStudy: {
      overview:
        'Secure Docs is a private gateway for my family to back up important documents directly to Google Drive, with a separate vault per member.',
      problem: 'Family documents were scattered across phones and chats, with no single, private place to find them.',
      solution:
        'Each member signs in and uploads to their own Drive-backed vault. Vaults can be shared, and documents can be searched, sorted and viewed as a grid or list.',
      process: ['Built the React interface and sign-in gateway.', 'Used Google Apps Script to write files into Google Drive.', 'Added sharing, search and view options.'],
      features: ['Per-member vaults', 'Multi-file drag-and-drop upload', 'Vault sharing', 'Search, sort, grid and list views'],
    },
  },
  {
    slug: 'placement-cell',
    name: 'Placement Cell RKMGEC',
    tagline: 'A placement portal for my engineering college, with separate student and admin areas.',
    category: 'Institutional web app',
    filters: ['frontend'],
    featured: false,
    order: 12,
    year: '2023',
    role: 'Developer (college team project)',
    kind: 'team',
    stack: ['React', 'JavaScript', 'CSS', 'Netlify'],
    links: { live: 'https://placementcellrkmgec.netlify.app', source: 'https://github.com/Akash6297/Placement-Cell' },
    cover: desktop('placement-cell', 'desktop', 'Placement Cell RKMGEC home page with the college building'),
    gallery: [
      desktop('placement-cell', 'desktop', 'Placement Cell home page'),
      mobile('placement-cell', 'Placement Cell on mobile'),
    ],
    caseStudy: {
      overview: 'A placement website for Ramkrishna Mahato Government Engineering College with a notice board, internships and separate student and admin portals.',
      problem: 'Students needed one place for placement notices, internships and registration, and the placement office needed a way to manage them.',
      solution: 'One portal where admins post notices and approve student registrations, and students sign in to see notices and internships.',
      process: ['Built the public pages: home, about, process and contact.', 'Built student and admin sign-up and sign-in flows.', 'Built admin tools to post notices and approve students.'],
      features: ['Notice board and upcoming events', 'Internship listings', 'Student sign-up and dashboard', 'Admin approval of student accounts', 'Admin notice posting'],
    },
  },
  {
    slug: 'expensazen',
    name: 'ExpensaZen',
    tagline: 'An expense tracker with Firebase sign-in and per-user transactions.',
    category: 'Web app',
    filters: ['frontend', 'experiments'],
    featured: false,
    order: 13,
    year: '2023',
    role: 'Development',
    kind: 'personal',
    stack: ['React', 'React Router', 'Firebase Auth', 'Cloud Firestore'],
    links: { source: 'https://github.com/Akash6297/ExpensaZen' },
    gallery: [],
    caseStudy: {
      overview: 'ExpensaZen records transactions for each signed-in user and keeps them in Firebase.',
      problem: 'A simple way to log transactions from any device without running a backend.',
      solution: 'Firebase Authentication for sign-in and Cloud Firestore for storage, wrapped in custom React hooks.',
      process: ['Set up Firebase Auth and Firestore.', 'Wrote hooks for adding transactions, reading them and reading the user profile.', 'Built the auth page and the tracker page.'],
      features: ['Sign-in with Firebase', 'Add and list transactions', 'Per-user data'],
    },
  },
  {
    slug: 'movie-recommender',
    name: 'Movie Recommender',
    tagline: 'A similarity-based movie recommender with TMDB posters, served with Streamlit.',
    category: 'Machine-learning experiment',
    filters: ['experiments'],
    featured: false,
    order: 14,
    year: '2023',
    role: 'Development',
    kind: 'personal',
    stack: ['Python', 'Jupyter', 'Streamlit', 'TMDB API'],
    links: { source: 'https://github.com/Akash6297/Movie-Recommender-System' },
    gallery: [],
    caseStudy: {
      overview: 'A small Python app: choose a movie and it shows the five most similar titles with their posters.',
      problem: 'An experiment in turning a notebook model into something people can try in a browser.',
      solution:
        'The model is prepared in a Jupyter notebook and saved as a precomputed similarity matrix. The Streamlit app ranks titles by similarity to the selected movie and fetches posters from the TMDB API.',
      process: ['Built the dataset and similarity matrix in a notebook.', 'Wrapped recommendation and poster lookup in a Streamlit interface.'],
      features: ['Searchable movie dropdown', 'Top five similar movies', 'Posters from TMDB'],
    },
  },
];

export const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string) {
  const index = sortedProjects.findIndex((p) => p.slug === slug);
  return {
    previous: index > 0 ? sortedProjects[index - 1] : sortedProjects[sortedProjects.length - 1],
    next: index < sortedProjects.length - 1 ? sortedProjects[index + 1] : sortedProjects[0],
  };
}
