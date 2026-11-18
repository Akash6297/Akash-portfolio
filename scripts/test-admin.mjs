// End-to-end test of the admin panel against a throwaway in-memory MongoDB.
// Never touches your real database.
//
//   npm run build && npm run test:admin
//
// Seeds a test super admin plus legacy-format data (resume with HTML descriptions,
// an old contact message) to prove existing data from the previous site loads.

import { spawn } from 'node:child_process';
import { cpSync, existsSync, rmSync } from 'node:fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const PORT = 3200;
const DIST = '.next-admin-test';

// Admin tests edit content, and on-demand revalidation writes regenerated pages into
// the build directory. Work on a throwaway copy so the real build stays untouched.
if (!existsSync('.next/BUILD_ID')) {
  console.error('Run `npm run build` first.');
  process.exit(1);
}
rmSync(DIST, { recursive: true, force: true });
// Skip the (large) build cache and dev output; works with \ and / path separators.
// dereference: the build links some server packages via symlinks, which Windows can't
// create without elevated rights, so copy their files instead.
cpSync('.next', DIST, {
  recursive: true,
  dereference: true,
  filter: (src) => !/(^|[\\/])\.next[\\/](cache|dev)([\\/]|$)/.test(src),
});
export const TEST_ADMIN = { username: 'testadmin', email: 'super@example.test', password: 'Test-Password-123' };

const mongo = await MongoMemoryServer.create();
const uri = mongo.getUri('portfolio_test');
console.log(`[test-admin] in-memory MongoDB at ${uri}`);

await mongoose.connect(uri);
const db = mongoose.connection.db;
await db.collection('users').insertOne({ username: TEST_ADMIN.username, email: TEST_ADMIN.email, password: await bcrypt.hash(TEST_ADMIN.password, 10) });
await db.collection('users').insertOne({ username: 'editor', email: 'editor@example.test', password: await bcrypt.hash('Editor-Password-1', 10) });
await db.collection('messages').insertOne({ name: 'Legacy Visitor', email: 'legacy@example.test', message: 'A message saved by the old site.', isRead: false, replied: false, createdAt: new Date('2026-01-10'), updatedAt: new Date('2026-01-10') });
await db.collection('resumes').insertOne({
  personalInfo: { name: 'Akash Mandal', title: 'Full Stack Developer', email: 'akash@example.test', phone: '9000000000', address: 'Test Village, Test District', linkedin: 'https://www.linkedin.com/in/example/', github: 'https://github.com/example', photoUrl: '', photoShape: 'circle', summary: '<p>Full Stack Developer with <b>2+ years</b>&nbsp;of experience.</p>' },
  experience: [{ company: 'MavenPro', position: 'Full Stack Developer', startDate: 'April 2025', endDate: 'Present', description: '<p>• Built REST APIs.</p><p>• Maintained web apps.</p>' }],
  education: [{ institution: 'RKMGEC', degree: 'B.Tech ECE', startDate: '2020', endDate: '2024', scoreType: 'CGPA', scoreValue: '8.32', description: '<p><br></p>' }],
  skills: [], skillCategories: [{ name: 'Backend', items: 'Node.js, Express.js' }], languages: [{ language: 'English', proficiency: 'Proficient' }],
  projects: [{ name: 'Test Project', description: '<p>Legacy project description.</p>', link: 'https://example.com/' }],
  sections: [{ id: 'summary', name: 'Summary', order: 0, isVisible: true }, { id: 'experience', name: 'Experience', order: 1, isVisible: true }],
  selectedTemplate: 'classic', typography: { font: "'Inter', sans-serif", size: 13, lineHeight: 1.5, sectionGap: 10, accentColor: '#1e3a5f' },
});
await mongoose.disconnect();

const env = {
  ...process.env,
  MONGO_URI: uri,
  SESSION_SECRET: 'test-session-secret-not-for-production',
  SUPER_ADMIN_EMAIL: TEST_ADMIN.email,
  // Empty values override .env so tests never send real email or upload images.
  EMAIL_USER: '', EMAIL_PASS: '', CONTACT_TO_EMAIL: '', IMGBB_API_KEY: '', GITHUB_TOKEN: '',
  PORT: String(PORT),
  NEXT_DIST_DIR: DIST,
  TEST_MONGO_URI: uri,
};

const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
server.stdout.on('data', (d) => process.env.DEBUG_SERVER && process.stdout.write(`[server] ${d}`));
server.stderr.on('data', (d) => process.stderr.write(`[server] ${d}`));

for (let i = 0; i < 60; i++) {
  try {
    await fetch(`http://localhost:${PORT}/admin/login`);
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
  }
}

const args = ['node_modules/@playwright/test/cli.js', 'test', '--project=admin', ...process.argv.slice(2)];
const tests = spawn(process.execPath, args, { env, stdio: 'inherit' });
const code = await new Promise((resolve) => tests.on('exit', resolve));

server.kill();
await mongo.stop();
rmSync(DIST, { recursive: true, force: true });
process.exit(code ?? 1);
