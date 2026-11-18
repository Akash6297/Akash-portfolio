# Content Inventory — Portfolio Migration

Audit date: 2026-11-18
Sources: live site `https://akash-mandal.vercel.app` (public `/api/*` endpoints), this repository, `github.com/Akash6297` (public API), and each project's live URL.

Legend: ✅ verified · ⚠️ conflicting / needs confirmation · ❌ not found · 🔒 private, deliberately not migrated

---

## 1. Identity & contact

| Field | Value | Source | Status |
|---|---|---|---|
| Name | Akash Mandal | all | ✅ |
| Title (hero) | "Fullstack Developer" | `/api/hero` | ✅ |
| Title (resume) | "Full Stack Developer" | `/api/resume` | ✅ |
| Location | Purulia, West Bengal, India | contact section, GitHub | ✅ |
| Email | akashmandal6297@gmail.com | contact section + resume | ✅ publicly displayed |
| GitHub | https://github.com/Akash6297 | hero, footer, resume | ✅ |
| LinkedIn | https://www.linkedin.com/in/akash-mandal07/ | resume only | ⚠️ site's LinkedIn icons link to `#` (broken) |
| Portrait | `i.ibb.co/XkL5fmC7/...jpg` | `/api/hero` | ✅ authentic photo, will be self-hosted |
| Logo | `/public/logo.png`, `/images/logo.jpeg` | repo | ✅ |
| Phone / WhatsApp | present in resume API and WhatsApp button | 🔒 not shown on new site unless you ask |
| Home address | present in resume API | 🔒 not migrated |

## 2. Bio / summary

- **Hero bio (live):** "Results-driven professional skilled in React.js, Next.js, JavaScript, and SEO. Experienced in building responsive web applications and managing digital campaigns to create effective solutions."
- **About ¶1 (live):** "Hello! I'm Akash, a developer from Purulia, West Bengal, with a unique blend of skills in frontend development and digital marketing…"
- **About ¶2 (live):** "I enjoy turning complex problems into simple, elegant solutions. Whether it's crafting a pixel-perfect interface with React and Next.js or optimizing an SEO strategy…"
- **Resume summary (most current, full-stack framing):** "Full Stack Developer with 2+ years of combined professional and freelance experience building responsive web applications and REST APIs using Node.js, Express.js, React.js, Next.js, JavaScript, and MongoDB. Experienced in backend services, database-driven applications, authentication, third-party API integrations, responsive UI, SEO, and cloud deployment…"

→ New copy will be based on the resume summary; "2+ years" is the only number used.

## 3. Experience

| # | Role | Company | Period | Status |
|---|---|---|---|---|
| 1 | Website Developer (site) / **Full Stack Developer** (resume) | MavenPro — Kolkata, West Bengal | 04/2025 – Present | ⚠️ title differs |
| 2 | Digital Marketing Specialist | CrownX Machinery & Equipment — Jamshedpur | 11/2024 – 04/2025 | ⚠️ on site, not on resume |
| 3 | Freelance Frontend Developer — **EREX STUDIO** (site) / Freelance Web Developer (resume) | Remote | 01/2024 – 11/2024 (site) / Jan 2024 – Mar 2025 (resume) | ⚠️ client name + end date differ |
| 4 | Microsoft Developer Intern (virtual) | Microsoft — Future Ready Talent virtual internship | 06/2022 – 08/2022 | ✅ (Cukiss repo confirms program) |

Resume bullet points for MavenPro and Freelance are detailed and will be used verbatim (lightly edited).

## 4. Education

| Institution | Degree | Years | Score |
|---|---|---|---|
| Ramkrishna Mahato Government Engineering College | B.Tech, Electronics & Communication Engineering | 2020 – 2024 | CGPA 8.32 |
| Balarampur Phool Chand High School | Higher Secondary (12th) | 2018 – 2020 | 83% |

## 5. Certifications (live, all with Coursera credential links)

1. Architecting with Google Kubernetes Engine — Google Cloud — Sep 2022 — ID XME4JKXZB67V
2. Introduction to Scripting in Python Specialization — Rice University — May 2022 — ID JJKWGEMY8G6Q
3. Algorithms Specialization — Stanford University — May 2022 — ID 2P9DRQNF8EVM

Achievements: empty on live site.

## 6. Skills — evidence map

| Skill | Evidence | Status |
|---|---|---|
| HTML, CSS, JavaScript | many repos | ✅ |
| React.js | Tribal Trends, ExpensaZen, Placement Cell, LAKSHYA, RoomLedger, SmoothWeb | ✅ |
| Next.js | mission-2026 repo, resume, existing site | ✅ |
| TypeScript | LAKSHYA (714 KB TS) | ✅ |
| Vite | LAKSHYA, RoomLedger, SmoothWeb bundle | ✅ |
| React Router | Tribal Trends, ExpensaZen | ✅ |
| Tailwind CSS | this repo, Sayandip portfolio | ✅ |
| SCSS | eshop-ecommerce-master | ✅ |
| Framer Motion | SmoothWeb bundle (`vendor-framer`) | ✅ |
| Node.js / Express | Tribal Trends, RoomLedger, this repo | ✅ |
| REST APIs, JWT, bcrypt | Tribal Trends backend, this repo | ✅ |
| Nodemailer / transactional email | Tribal Trends, this repo | ✅ |
| MongoDB / Mongoose | Tribal Trends, this repo | ✅ |
| Firebase | ExpensaZen | ✅ |
| Supabase / PostgreSQL (RLS, Edge Functions, pg_cron) | LAKSHYA | ✅ |
| SQLite | RoomLedger | ✅ |
| Google Apps Script / Sheets | SmoothWeb, Secure Docs, Udeline | ✅ |
| Python / Streamlit | Movie-Recommender-System | ✅ |
| Java / Android | LAKSHYA "Jarvis" Android app, resume | ✅ |
| PWA, Service Worker, Web Push | LAKSHYA, SmoothWeb | ✅ |
| Razorpay | SmoothWeb | ✅ |
| WordPress, SEO | MavenPro role, resume | ✅ |
| AWS, Azure | resume, Microsoft internship | ✅ (claimed) |
| Git / GitHub / Vercel / Netlify | repos, deployments | ✅ |
| PHP, MySQL, Bootstrap, Elementor, ACF, Postman, OpenAI API | not found in public work | ⚠️ include only if you confirm |

## 7. Projects

### On the live portfolio (must be preserved)

| Project | Live | Source | Screenshot | Notes |
|---|---|---|---|---|
| Udeline Ventures — corporate site | https://udeline.com/ ✅ | — | ✅ | resume has a good description |
| Sayandip Dutta — video editor portfolio | https://sayandipdutta.online/ ✅ | — | ✅ | |
| Mission 2026 — daily-work manager | https://mission-2026.vercel.app/ ✅ | github.com/Akash6297/mission-2026 | ✅ | ⚠️ live description is speculative ("likely associated with…"); needs a real one. Repo = Next.js |
| BackgroundBlaster — AI photo/background editor | https://akash6297.github.io/BackgroundBlaster/ ✅ | ✅ | ✅ | rich README (remove.bg API, passport sizes, export formats) |
| SmoothWeb — digital agency platform | https://smoothweb.in/ ✅ | — | ✅ | ⚠️ tags say Next.js; bundle is React + Vite + Framer Motion + Razorpay + PWA |
| Secure Docs — family document vault | https://family-secure-doc.vercel.app/ ✅ | — | ✅ | ⚠️ live description is speculative; needs a real one |

### From your requested list

| Project | Found | Live | Source | Notes |
|---|---|---|---|---|
| Tribal Trends (MERN e-commerce) | ✅ | ❌ GitHub Pages 404 | github.com/Akash6297/Tribal-Trends | React storefront + React admin + Express/Mongoose/JWT/bcrypt/Nodemailer API — verified MERN |
| ExpenzaZen | ✅ repo is spelled **ExpensaZen** | ❌ | github.com/Akash6297/ExpensaZen | React + Firebase + React Router |
| Purulia Business Directory | ❌ | ❌ | ❌ | need URL |
| SmoothWeb | ✅ | ✅ | — | see above |
| Digital Business Card (NFC) | ✅ **SmoothCard** | https://card.smoothweb.in ✅, creator at smoothweb.in/create | — | |
| Tools by SmoothWeb | ✅ | https://tools.smoothweb.in ✅ | — | resume: 15 client-side utilities, no sign-up |
| SmoothCollab | ❌ | ❌ | ❌ | need URL |
| Media Swipe | ❌ | ❌ | ❌ | need URL |
| Placement Cell | ✅ | https://placementcellrkmgec.netlify.app ✅ | github.com/Akash6297/Placement-Cell | React (CRA); 2nd version: Placement-Cell-MNCUD |
| Text to Voice Converter | ⚠️ | ❌ | github.com/Akash6297/Text-To-Speech- | repo is HTML/CSS/JS (no React/Python); README clone path points to another author's repo |

### Found on GitHub, not on the current portfolio (candidates)

| Project | Live | Stack | Strength |
|---|---|---|---|
| **LAKSHYA** — personal productivity OS | https://lakshya-ved.vercel.app ✅ | React + Vite + TypeScript, Supabase Postgres + RLS, Edge Functions, pg_cron, PWA, Web Push, Telegram bot, Android app | strongest engineering case study |
| **RoomLedger** — WhatsApp-chat expense splitter | ❌ | Node/Express + SQLite, React + Vite, custom chat parser | strong full-stack case study |
| Movie Recommender System | Streamlit app (sleeping) | Python, Streamlit | experiment |
| Student YouTube | https://studentyt.netlify.app ✅ | React | experiment |
| Client sites: KATARUKA, MISK Healthcare, B-S-T-C Pvt Ltd | B-S-T-C on GitHub Pages | HTML | ask before listing client work |

## 8. Services (live)

1. UI/UX Implementation — Figma/XD to pixel-perfect code
2. Custom Web Development
3. API & Backend Development
4. Website Maintenance & Support

## 9. Existing-site issues found

- LinkedIn links in hero and footer point to `#`.
- Two project descriptions (Mission 2026, Secure Docs) are speculative text, not descriptions.
- Hero stat "100% Commitment" is filler; "Projects shipped" counts DB rows.
- No meta description, Open Graph, canonical, sitemap, robots or structured data.
- Full-screen preloader waits for `window.load` (delays content); Calendly script loaded but unused.
- `/resume.html` renders HTML from the API; there is no downloadable PDF.
- Contact/booking emails interpolate user input into HTML unescaped; no validation or spam protection.
- `/api/resume` publicly returns phone number and home address.
- Booking email links to an old Render URL.

## 10. Security issues outside this repo (action required)

- `github.com/Akash6297/Tribal-Trends` → `Tribal-Trends-B/index.js` contains a hard-coded MongoDB Atlas connection string (with password) and a JWT secret in a **public** repo. It's a different cluster from this portfolio's, but you should rotate that database user's password and stop using that secret. Rewriting git history alone isn't enough: rotate the password first.
- The Tribal-Trends repo also commits `node_modules/`.

---

## 11. Decisions applied in the redesign (approved defaults, 2026-11-18)

| Item | Decision |
|---|---|
| Admin panel, booking system, WhatsApp lead form, email templates, resume builder | Dropped. Content moved to `src/data/*.ts`; contact form emails directly. Old app kept on the `legacy` branch. |
| MavenPro title | "Full-Stack Developer" (from resume) |
| Freelance | "Web Developer, Freelance (Remote)", Jan 2024 – Mar 2025 (from resume); client name EREX STUDIO not shown |
| CrownX Machinery & Equipment | Kept on the timeline (verified on old site) — remove from `experience.ts` if you prefer the resume's version |
| Purulia Business Directory, SmoothCollab, Media Swipe | Left out — no public URL or repo found |
| Text to Voice Converter | Left out — repo is plain HTML/CSS/JS, not React/Python |
| PHP, MySQL, Bootstrap, Elementor, ACF, Postman, OpenAI API | Left out of skills — no public evidence |
| Mission 2026 / Secure Docs descriptions | Rewritten from the repo code and the live UI |
| Movie Recommender live link | Removed — repo is missing `similarity.pkl`, so the Streamlit app is unlikely to run |
| Resume | `public/resume/Akash-Mandal-Resume.pdf`, printed from the old builder without phone number or street address |
| Secure Docs screenshot | Family members' names and emails blurred |
| Portrait | Re-cropped from the original avatar to a 4:5 frame without the circular ring |
| Accent colour | Electric blue `#4F7DFF` |

### Remaining items needing your input
- Confirm the CrownX role should stay on the timeline.
- Provide URLs for Purulia Business Directory, SmoothCollab and Media Swipe if they should be added.
- Confirm which of PHP, MySQL, Bootstrap, Elementor, ACF, Postman and OpenAI API to list.
- The LinkedIn URL comes from your resume data; LinkedIn blocks automated checks, so please click it once to confirm.
- Rotate the MongoDB password exposed in the public Tribal-Trends repo.
- The Movie-Recommender repo also contains a TMDB API key in `streamlit_app.py`; consider revoking it.
