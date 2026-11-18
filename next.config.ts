import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  // The admin test runner serves a copy of the build so its edits never touch .next.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Images uploaded from the admin panel are hosted on ImgBB.
    remotePatterns: [{ protocol: 'https', hostname: 'i.ibb.co' }],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Keep the admin area out of search engines.
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
  async redirects() {
    // Keep links that pointed at the old site working.
    return [
      { source: '/resume.html', destination: '/resume', permanent: true },
      { source: '/admin/dashboard.html', destination: '/admin', permanent: true },
      { source: '/admin/login.html', destination: '/admin/login', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
