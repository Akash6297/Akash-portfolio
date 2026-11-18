# Akash Mandal — Portfolio

Personal portfolio of **Akash Mandal**, Full-Stack Developer (Purulia, West Bengal, India).

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4** and **Motion**. All content lives in typed data files, every page is statically generated, and the only server code is the contact-form endpoint.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in EMAIL_USER / EMAIL_PASS for the contact form
npm run dev                    # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (type-checks, prerenders every page) |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript only |
| `npm run test:e2e` | Playwright end-to-end suite (run `npm run build` first) |
| `npm run assets:screenshots [slug]` | Re-capture project screenshots from live sites |
| `node scripts/check-links.mjs` | Check every external link in `src/data` |
| `node scripts/update-github-snapshot.mjs` | Refresh the offline GitHub fallback |

Requires Node.js 20.9+ (developed on Node 24). For tests and screenshots: `npx playwright install chromium`.

---

## Project structure

```
src/
  app/
    page.tsx                 Home (all sections)
    work/[slug]/page.tsx     Case study pages (one per project, statically generated)
    api/contact/route.ts     Contact form endpoint (validation, spam traps, SMTP)
    layout.tsx               Fonts, metadata, JSON-LD, header/footer
    opengraph-image.tsx      Generated social-sharing image (+ one per case study)
    sitemap.ts, robots.ts, manifest.ts, icon.svg, apple-icon.tsx, not-found.tsx
  components/
    layout/                  Header, Footer, providers, scroll-reveal observer
    sections/                Hero, About, Experience, Projects, Skills, OpenSource, Approach, Services, Contact
    hero/Terminal.tsx        Interactive terminal
    projects/                Filterable project showcase
    ui/                      Buttons, frames, icons, section headers
  data/                      ← all editable content
  lib/                       Site config, GitHub client, contact rules, SEO helpers
public/
  images/profile/            Portrait
  images/projects/<slug>/    Project screenshots
  resume/                    Resume PDF
scripts/                     Asset and maintenance scripts
tests/                       Playwright suite
docs/content-inventory.md    Audit of the previous site and content sources
```

---

## Editing content

Everything visitors read comes from `src/data/`. You never need to edit a component to update content.

| To change… | Edit |
|---|---|
| Name, headline, bio, location, email, availability | `src/data/profile.ts` |
| Projects and case studies | `src/data/projects.ts` |
| Jobs, education, certifications | `src/data/experience.ts` |
| Skills | `src/data/skills.ts` |
| Services and the 5-step process | `src/data/services.ts` |
| GitHub / LinkedIn / email links | `src/data/socials.ts` |

### Change availability
In `src/data/profile.ts`, set `availability.open` to `true` or `false` and edit `label` / `detail`. It is a setting, not a live status.

### Add a project
1. Create `public/images/projects/<slug>/` and add screenshots (WebP or PNG). For a live site, add it to `TARGETS` in `scripts/capture-screenshots.mjs` and run `npm run assets:screenshots <slug>`.
2. Copy an entry in `src/data/projects.ts`, give it a unique `slug`, and fill in the fields. The helpers `desktop()`, `mobile()` and `wide()` set image sizes for you.
3. `featured: true` puts it in the large editorial layout; `order` controls position; `filters` controls which filter tabs show it.
4. No screenshot? Leave out `cover` — a labelled cover is generated from the project's `architecture` and `stack`.

The case study page, sitemap entry, Open Graph image, terminal `projects` command and skills "Used in" lists all update automatically.

### Add a job
Add an entry at the top of `experience` in `src/data/experience.ts`. Dates use `YYYY-MM`; use `'present'` for a current role.

### Update skills
Add to a group in `src/data/skills.ts`. `icon` is a key from `src/components/ui/TechIcon.tsx` (Simple Icons, CC0); without one, a monogram is shown. `aliases` connect a skill to differently named entries in project stacks.

---

## Images

- **Portrait:** add the new image to `public/images/profile/` under a **new file name** (cached optimised images are keyed by URL), then update `portrait.src`, `width` and `height` in `profile.ts`. A 4:5 crop works best.
- **Project screenshots:** replace files in `public/images/projects/<slug>/` keeping the same names, or update paths in `projects.ts`. Desktop captures are 1440×900; mobile are 780×1688.
- Images are served through `next/image` (AVIF/WebP, responsive sizes, lazy loading). Keep source files under ~400 KB.

## Resume

The PDF is `public/resume/Akash-Mandal-Resume.pdf`. To update it, overwrite that file with the same name. `/resume` and the old `/resume.html` link both redirect to it. The current file was printed from the old resume builder with the phone number and street address removed.

---

## Contact form

`POST /api/contact` validates input (shared rules in `src/lib/contact.ts`), rejects bots (hidden honeypot field + minimum fill time), rate-limits per IP, escapes all HTML and sends the message via SMTP with `Reply-To` set to the visitor.

Environment variables (see `.env.example`):

| Variable | Required | Notes |
|---|---|---|
| `EMAIL_USER` | yes | Gmail address that sends the notification |
| `EMAIL_PASS` | yes | Gmail **App Password** (Google Account → Security → 2-Step Verification → App passwords) |
| `CONTACT_TO_EMAIL` | no | Where messages go; defaults to `EMAIL_USER` |
| `EMAIL_HOST` / `EMAIL_PORT` | no | Defaults to `smtp.gmail.com:465` |

If the variables are missing, the form shows an honest error asking visitors to email directly — it never fakes success.

The rate limit is in-memory (per serverless instance). For stricter limits, replace it with Vercel KV or Upstash Redis.

## GitHub section

Fetched server-side from the public GitHub API and cached for an hour (ISR). Optional `GITHUB_TOKEN` (server-only) raises the rate limit. If GitHub is unreachable, the section falls back to `src/data/github-snapshot.json` and says so.

---

## SEO

- Titles, descriptions, canonical URLs, Open Graph and Twitter cards: `src/app/layout.tsx` and `generateMetadata` in `src/app/work/[slug]/page.tsx`. Site-wide text: `src/lib/site.ts`.
- Structured data (Person, WebSite, CreativeWork per project): `src/lib/structured-data.ts`.
- Social images are generated at build time: `src/app/opengraph-image.tsx` and `src/app/work/[slug]/opengraph-image.tsx`.
- `sitemap.xml` and `robots.txt` are generated from the project list.
- **Set `NEXT_PUBLIC_SITE_URL`** to the production domain (e.g. a custom domain) so canonical and OG URLs are correct.

---

## Deploying to Vercel

1. Push this branch to GitHub and import the repository in Vercel (or open the existing project).
2. **Framework preset: Next.js.** The previous site deployed `server.js` via a `vercel.json`; that file has been removed. If the existing Vercel project has a custom build/output setting from the old setup, reset it to the Next.js defaults (Settings → Build & Development).
3. Add environment variables (Settings → Environment Variables): `NEXT_PUBLIC_SITE_URL`, `EMAIL_USER`, `EMAIL_PASS`, optionally `CONTACT_TO_EMAIL` and `GITHUB_TOKEN`.
4. Deploy. Build command `next build`, output handled automatically.
5. After deploying, submit `https://<your-domain>/sitemap.xml` in Google Search Console.

Old variables no longer used by this site: `MONGO_URI`, `SESSION_SECRET`, `IMGBB_API_KEY`, `BREVO_API_KEY`, `SUPER_ADMIN_EMAIL`. Remove them from Vercel once the old admin panel is retired.

## The previous version

The Express + MongoDB site (admin panel, booking system, resume builder) is preserved on the `legacy` branch and in git history.

## Testing

`npm run build && npm run test:e2e` runs 34 Playwright tests:

- **Home page at 360, 390, 430, 768, 1024, 1440 and 1920 px:** no console errors, no failed requests, no broken images, no horizontal overflow.
- **Case studies:** every page loads with all sections, and unknown slugs return 404.
- **Navigation:** desktop nav, mobile menu (including Escape) and case-study round trips.
- **Projects:** filter counts.
- **Terminal:** commands, unknown input, and `open`.
- **Contact form:** client validation, plus server rejection of honeypot, too-fast and invalid submissions.
- **Resume:** download and legacy redirects.
- **SEO:** metadata, JSON-LD, sitemap, robots and OG images.
- **Accessibility:** axe (WCAG 2.1 AA) on three pages.
