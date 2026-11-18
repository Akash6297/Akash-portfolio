# Akash Mandal — Portfolio

Personal portfolio of **Akash Mandal**, Full-Stack Developer (Purulia, West Bengal, India), with a built-in **admin panel** for content, messages, bookings and the resume.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Motion** and **MongoDB (Mongoose)**. Public pages are statically generated and refresh instantly when you edit content in the admin panel.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # MONGO_URI, SESSION_SECRET, SUPER_ADMIN_EMAIL, EMAIL_USER, EMAIL_PASS…
npm run dev                    # site: http://localhost:3000   admin: http://localhost:3000/admin
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (type-checks, prerenders public pages) |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript only |
| `npm run test:e2e` | Public-site test suite (run `npm run build` first) |
| `npm run test:admin` | Admin test suite on a throwaway in-memory MongoDB (run `npm run build` first) |
| `npm run admin:create <user> <email> <password>` | Create an admin account, or reset its password |
| `npm run assets:screenshots [slug]` | Re-capture project screenshots from live sites |
| `node scripts/check-links.mjs` | Check every external link in `src/data` |
| `node scripts/update-github-snapshot.mjs` | Refresh the offline GitHub fallback |

Requires Node.js 20.9+ (developed on Node 24). For tests and screenshots: `npx playwright install chromium`.

---

## Admin panel (`/admin`)

Sign in with the **same admin account as the previous site** — accounts, messages, bookings, email templates and resume data are read from the same MongoDB collections.

| Section | What you can do |
|---|---|
| **Overview** | Unread messages, pending call requests, and whether each content section is in the database |
| **Messages** | Read, mark unread, delete and **reply by email** to contact-form messages and WhatsApp leads |
| **Bookings** | Confirm (with meeting link), decline, complete or delete discovery-call requests — guests are emailed; edit the **weekly schedule** (slots and daily limits, IST) |
| **Profile & hero** | Headline (`*italics*` supported), statement, about text, portrait, availability, contact copy, social links, WhatsApp number, resume PDF link |
| **Projects, Experience, Education, Certifications, Achievements, Skills, Services** | Create, edit, reorder, hide (projects) and delete; image upload; full case-study fields |
| **Resume builder** | Classic / Modern / Minimal templates, typography, section order and visibility, live preview; publishes to **`/resume`** (print / save as PDF). Phone and address are **hidden publicly unless you tick "show"** |
| **Smart import** | Paste text or upload a screenshot (OCR in the browser) → it detects the section and pre-fills the form for you to review. Pattern matching, not an AI writer — it never invents details |
| **Email templates** | Edit the six emails the site sends, live preview, send a test to yourself, switch the visitor confirmation off |
| **Settings** | Change password and manage admin users (super admin only) — both require a one-time code emailed to you |

### First-time setup
1. Set `MONGO_URI`, `SESSION_SECRET` and `SUPER_ADMIN_EMAIL` (your existing values work).
2. Sign in at `/admin`. (Locked out? `npm run admin:create <user> <email> <new-password>`.)
3. On **Overview**, click **Import site content**. This copies the curated content (`src/data`) into the database once — the site looks identical afterwards, and from then on edits in the admin panel go live immediately. It never overwrites anything already in the database.

### How content flows
- Database content wins when present; otherwise the site uses the built-in files in `src/data/` (also the automatic fallback if MongoDB is unreachable).
- Saving in the admin panel triggers on-demand revalidation, so the public page regenerates on the next visit. Pages also refresh hourly.
- New collections use a `site_` prefix (`site_projects`, `site_profile`, …). Existing collections (`users`, `messages`, `bookings`, `bookingsettings`, `emailtemplates`, `resumes`) are shared with the previous site. Old fields are kept.

### Security
- Sessions: signed, `httpOnly`, `SameSite=Lax` cookie (8 hours). Every admin page and API route checks it; a request proxy also guards `/admin` and `/api/admin`.
- Cross-site requests to admin APIs are rejected (Origin check).
- Login is rate-limited and doesn't reveal whether a username exists. Passwords are bcrypt-hashed.
- Password changes and admin management require a 6-digit code emailed to you (stored hashed, 10-minute expiry, 5 attempts).
- All input is validated server-side against the same field definitions the forms use (`src/lib/admin/fields.ts`); email content escapes visitor input.
- `/admin` is `noindex` and excluded in `robots.txt`.

---

## Project structure

```
src/
  app/
    (site)/                  Public site: home, /work/[slug] case studies (header + footer layout)
    resume/                  Public printable resume (from the resume builder)
    admin/                   Admin panel: login + (panel)/ pages
    api/
      contact, bookings, leads/whatsapp     Public endpoints (validation, spam traps, rate limits)
      admin/…                               Admin endpoints (auth, content, messages, bookings, resume, templates, users, upload)
    layout.tsx, sitemap.ts, robots.ts, opengraph-image.tsx, …
  proxy.ts                   Guards /admin and /api/admin
  components/
    sections/ hero/ projects/ contact/ resume/ ui/ layout/     Public site
    admin/                   Admin shell, form renderer, pages
  data/                      Built-in content (defaults + fallback)
  lib/
    content.ts               Reads content from MongoDB with fallback to src/data
    db/                      Connection + models
    auth/                    Sessions, OTP
    admin/                   Field definitions, content API helpers, Smart import parser
    email/                   Templates + mailer
    bookings.ts, resume*.ts, github.ts, structured-data.ts, …
scripts/                     Assets, admin creation, test runner
tests/                       Playwright suites (site, admin, Smart import unit tests)
```

---

## Editing content without the admin panel

The built-in content lives in `src/data/` (`profile.ts`, `projects.ts`, `experience.ts`, `skills.ts`, `services.ts`, `achievements.ts`). It's used until you import content into the database, and as the fallback afterwards. Once imported, **edit content in the admin panel** — changes to these files no longer show while the database has content.

To add screenshots for a live project: add it to `TARGETS` in `scripts/capture-screenshots.mjs` and run `npm run assets:screenshots <slug>`, or upload images in the admin panel.

## Images

- Admin uploads go to ImgBB (`IMGBB_API_KEY`); you can also paste any `https://` image URL or a `/images/…` path.
- Built-in images are in `public/images/`. When replacing one, use a **new file name** (optimised images are cached by URL).
- Images are served through `next/image` (AVIF/WebP, responsive sizes, lazy loading).

## Resume

- **`/resume`** is the live resume from the resume builder, with **Print / Save as PDF**. The old `/resume.html` link redirects there.
- A static PDF (`public/resume/Akash-Mandal-Resume.pdf`, phone and street address removed) is offered as a direct download; change its link under **Profile → Resume PDF link**.

---

## Email

Used for: contact notifications, the optional visitor confirmation, replies from the inbox, booking requests/confirmations/declines, and admin verification codes.

| Variable | Required | Notes |
|---|---|---|
| `EMAIL_USER` | yes | Gmail address that sends mail |
| `EMAIL_PASS` | yes | Gmail **App Password** (Google Account → Security → 2-Step Verification → App passwords) |
| `CONTACT_TO_EMAIL` | no | Where notifications go; defaults to `EMAIL_USER` |
| `EMAIL_HOST` / `EMAIL_PORT` | no | Defaults to `smtp.gmail.com:465` |

Contact messages are saved to the inbox even if email fails; the form only reports success when the message was stored or delivered. Rate limits are in-memory per server instance — swap in Vercel KV / Upstash for stricter global limits.

## GitHub section

Fetched server-side from the GitHub API, cached for an hour. Optional `GITHUB_TOKEN` (server-only) raises the rate limit. If GitHub is unreachable or rate-limited, the section shows the snapshot in `src/data/github-snapshot.json` and says so.

## SEO

- Metadata: `src/app/layout.tsx`, `generateMetadata` in `src/app/(site)/work/[slug]/page.tsx`; site-wide text in `src/lib/site.ts`.
- Structured data (Person, WebSite, CreativeWork): `src/lib/structured-data.ts`.
- Generated Open Graph images, `sitemap.xml` (home, resume, every project) and `robots.txt`.
- Set **`NEXT_PUBLIC_SITE_URL`** to the production domain.

---

## Deploying to Vercel

1. Push to GitHub and open the existing Vercel project.
2. **Framework preset: Next.js.** The previous site deployed `server.js` via a `vercel.json`, which has been removed — if the project has custom build/output settings from that setup, reset them (Settings → Build & Development).
3. Environment variables: `NEXT_PUBLIC_SITE_URL`, `MONGO_URI`, `SESSION_SECRET`, `SUPER_ADMIN_EMAIL`, `EMAIL_USER`, `EMAIL_PASS`, and optionally `IMGBB_API_KEY`, `CONTACT_TO_EMAIL`, `GITHUB_TOKEN`. (`BREVO_API_KEY` is no longer used.)
4. In MongoDB Atlas → Network Access, allow Vercel to connect (e.g. `0.0.0.0/0` with a strong database password, or Vercel's integration).
5. Deploy, sign in at `/admin`, and click **Import site content** once.
6. Submit `https://<your-domain>/sitemap.xml` in Google Search Console.

The previous Express site is preserved on the `legacy` branch.

## Testing

- `npm run build && npm run test:e2e` — 39 tests: home page at 360/390/430/768/1024/1440/1920 px (no console errors, failed requests, broken images or horizontal overflow), every case study, navigation and mobile menu, project filters, terminal, contact validation and spam rejection, resume page/PDF/redirects (no private details), SEO, axe accessibility checks, and Smart import parser unit tests.
- `npm run build && npm run test:admin` — 16 tests against a throwaway in-memory MongoDB and a **copy** of the build (your real database and build are never touched): sign-in and CSRF protection, content import, profile/project/experience/achievement edits appearing on the live site, validation errors, inbox and replies, the full booking flow and schedule, email templates, resume builder (legacy data, privacy, templates), OTP-gated password and admin management, Smart import, uploads and sign-out.
- Tests run with email and image uploads disabled, so they never send real mail.
