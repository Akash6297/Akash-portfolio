// Checks every external URL in src/data (project links, socials, certifications).
//   node scripts/check-links.mjs
// LinkedIn blocks automated requests (HTTP 999), so it is reported as "blocked", not broken.

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const files = readdirSync('src/data').filter((f) => f.endsWith('.ts')).map((f) => path.join('src/data', f));
const urls = new Set();
for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(/https?:\/\/[^\s'"`)]+/g)) urls.add(m[0]);

const results = await Promise.all(
  [...urls].map(async (url) => {
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (link-check)' }, signal: AbortSignal.timeout(20000) });
      return { url, status: res.status };
    } catch (e) {
      return { url, status: `ERR ${e.cause?.code ?? e.message}` };
    }
  }),
);

let broken = 0;
for (const r of results.sort((a, b) => a.url.localeCompare(b.url))) {
  const ok = r.status === 200 || (typeof r.status === 'number' && r.status < 400);
  const blocked = r.status === 999;
  if (!ok && !blocked) broken++;
  console.log(`${ok ? 'ok     ' : blocked ? 'blocked' : 'BROKEN '} ${r.status}  ${r.url}`);
}
console.log(`\n${results.length} links, ${broken} broken`);
process.exitCode = broken ? 1 : 0;
