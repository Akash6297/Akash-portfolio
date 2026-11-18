// Employment history, education and certifications. Newest first.
// Dates use "YYYY-MM" so they can be formatted and sorted consistently.

import type { Certification, EducationItem, ExperienceItem } from './types';

export const experience: ExperienceItem[] = [
  {
    company: 'MavenPro',
    role: 'Full-Stack Developer',
    location: 'Kolkata, West Bengal, India',
    start: '2025-04',
    end: 'present',
    type: 'Full-time',
    summary: 'Building and maintaining full-stack web applications and business websites.',
    responsibilities: [
      'Develop and maintain responsive full-stack web applications using Node.js, Express.js, React.js, Next.js, JavaScript and MongoDB.',
      'Build RESTful APIs and database-driven features, integrating authentication, email workflows and third-party services where required.',
      'Optimise application performance, responsive behaviour, SEO and production deployments across client and business websites.',
      'Work with WordPress and AWS alongside the React and Next.js stack.',
      'Collaborate with cross-functional teams to turn business requirements into maintainable, user-focused web solutions.',
    ],
    stack: ['Node.js', 'Express.js', 'React', 'Next.js', 'MongoDB', 'WordPress', 'AWS', 'SEO'],
  },
  {
    company: 'CrownX Machinery & Equipment',
    role: 'Digital Marketing Specialist',
    location: 'Jamshedpur, Jharkhand, India',
    start: '2024-11',
    end: '2025-04',
    type: 'Full-time',
    summary: 'Search and social growth for an industrial equipment business.',
    responsibilities: [
      'Implemented SEO and SMO strategies to grow organic reach and engagement.',
      'Managed social media campaigns that generated leads for the business.',
    ],
    stack: ['SEO', 'SMO', 'Social media campaigns', 'Lead generation'],
  },
  {
    company: 'Freelance',
    role: 'Web Developer',
    location: 'Remote',
    start: '2024-01',
    end: '2025-03',
    type: 'Freelance',
    summary: 'Websites and web applications delivered directly for clients.',
    responsibilities: [
      'Delivered responsive websites and web applications using React.js, Next.js, JavaScript, HTML, CSS and Tailwind CSS.',
      'Integrated APIs, forms, dynamic content and third-party services, and debugged cross-browser and device-specific issues.',
      'Worked directly with clients to turn requirements into production-ready, deployed interfaces.',
      'Collaborated with design and backend teams to improve UI and UX.',
    ],
    stack: ['React', 'Next.js', 'JavaScript', 'Tailwind CSS', 'REST APIs'],
  },
  {
    company: 'Microsoft',
    role: 'Developer Intern (Virtual)',
    location: 'Remote — Future Ready Talent virtual internship',
    start: '2022-06',
    end: '2022-08',
    type: 'Internship',
    summary: 'Cloud fundamentals and a website project on Azure.',
    responsibilities: [
      'Gained hands-on experience with Azure, AI, security and cloud technologies.',
      'Built a website project that used cloud-based services.',
    ],
    stack: ['Azure', 'Cloud', 'HTML', 'CSS', 'JavaScript'],
  },
];

export const education: EducationItem[] = [
  {
    institution: 'Ramkrishna Mahato Government Engineering College',
    degree: 'B.Tech, Electronics and Communication Engineering',
    start: '2020',
    end: '2024',
    score: 'CGPA 8.32',
  },
  {
    institution: 'Balarampur Phool Chand High School',
    degree: 'Higher Secondary (Class 12)',
    start: '2018',
    end: '2020',
    score: '83%',
  },
];

export const certifications: Certification[] = [
  {
    title: 'Architecting with Google Kubernetes Engine',
    issuer: 'Google Cloud',
    platform: 'Coursera',
    date: 'Sep 2022',
    credentialId: 'XME4JKXZB67V',
    url: 'https://www.coursera.org/account/accomplishments/specialization/XME4JKXZB67V',
  },
  {
    title: 'Algorithms Specialization',
    issuer: 'Stanford University',
    platform: 'Coursera',
    date: 'May 2022',
    credentialId: '2P9DRQNF8EVM',
    url: 'https://www.coursera.org/account/accomplishments/specialization/2P9DRQNF8EVM',
  },
  {
    title: 'Introduction to Scripting in Python Specialization',
    issuer: 'Rice University',
    platform: 'Coursera',
    date: 'May 2022',
    credentialId: 'JJKWGEMY8G6Q',
    url: 'https://www.coursera.org/account/accomplishments/specialization/JJKWGEMY8G6Q',
  },
];
