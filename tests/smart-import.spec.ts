import { test, expect } from '@playwright/test';
import { detectSection, extract, tidy } from '../src/lib/admin/smart-import';

// Unit tests for the Smart import parser (no browser needed).
const run = (text: string) => {
  const clean = tidy(text);
  const { target } = detectSection(clean);
  return { target, data: extract(target, clean) as Record<string, unknown> };
};

test('experience: role, company, dates, bullets, stack', () => {
  const { target, data } = run('Senior Developer at Example Corp\nJan 2023 – Dec 2024 · Remote\n• Built a Next.js dashboard with PostgreSQL\n• Led API work in Node.js');
  expect(target).toBe('experience');
  expect(data).toMatchObject({ role: 'Senior Developer', company: 'Example Corp', start: '2023-01', end: '2024-12', location: 'Remote' });
  expect(data.responsibilities).toEqual(['Built a Next.js dashboard with PostgreSQL', 'Led API work in Node.js']);
  expect(data.stack).toEqual(expect.arrayContaining(['Next.js', 'PostgreSQL', 'Node.js']));
});

test('experience: "present" and multi-word locations', () => {
  const { target, data } = run('Website Developer — MavenPro\n04/2025 - Present\nKolkata, West Bengal\n- Built responsive sites with React and WordPress');
  expect(target).toBe('experience');
  expect(data).toMatchObject({ role: 'Website Developer', company: 'MavenPro', start: '2025-04', end: 'present', location: 'Kolkata, West Bengal' });
});

test('project: name, tagline, GitHub link and features', () => {
  const { target, data } = run('RoomLedger: split expenses from WhatsApp chats\nUpload an exported chat and the app parses expenses.\nhttps://github.com/Akash6297/RoomLedger\n• Chat import\n• Settlement\nBuilt with React, Express and SQLite.');
  expect(target).toBe('projects');
  expect(data).toMatchObject({ name: 'RoomLedger', tagline: 'split expenses from WhatsApp chats', links: { source: 'https://github.com/Akash6297/RoomLedger' } });
  expect(data.published).toBe(false); // imported projects start hidden until reviewed
});

test('education, certification, service and achievement', () => {
  expect(run('B.Tech in Electronics and Communication Engineering\nRamkrishna Mahato Government Engineering College\n2020 - 2024\nCGPA: 8.32')).toMatchObject({
    target: 'education',
    data: { institution: 'Ramkrishna Mahato Government Engineering College', start: '2020', end: '2024', score: 'CGPA 8.32' },
  });
  expect(run('Algorithms Specialization\nIssued by Stanford University on Coursera\nMay 2022\nCredential ID 2P9DRQNF8EVM\nhttps://www.coursera.org/account/accomplishments/specialization/2P9DRQNF8EVM')).toMatchObject({
    target: 'certifications',
    data: { issuer: 'Stanford University', platform: 'Coursera', date: 'May 2022', credentialId: '2P9DRQNF8EVM', url: expect.stringContaining('coursera.org') },
  });
  expect(run('E-commerce Development\nI provide online stores with carts, payments and an admin panel.\n• Catalogue\n• Payments').target).toBe('services');
  expect(run('Winner — Smart India Hackathon 2023\nOur team won first prize.')).toMatchObject({ target: 'achievements', data: { date: '2023' } });
});

test('tidy never changes wording or URLs', () => {
  expect(tidy('  built   things\n* item one\nhttps://example.com/Path')).toBe('Built things\n• item one\nhttps://example.com/Path');
});
