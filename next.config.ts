import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    // Keep links that pointed at the old site working.
    return [
      { source: '/resume.html', destination: '/resume/Akash-Mandal-Resume.pdf', permanent: false },
      { source: '/resume', destination: '/resume/Akash-Mandal-Resume.pdf', permanent: false },
      { source: '/index.html', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
