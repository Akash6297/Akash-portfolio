import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth/token';

// Guards the admin area. Each admin API route also checks the session itself.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/admin');
  const isPublic = pathname === '/admin/login' || pathname === '/api/admin/login';

  // CSRF defence: state-changing admin requests must come from this site.
  if (isApi && request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin');
    if (!origin || new URL(origin).host !== request.headers.get('host')) {
      return NextResponse.json({ ok: false, message: 'Cross-site request blocked.' }, { status: 403 });
    }
  }

  if (isPublic) return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (isApi) return NextResponse.json({ ok: false, message: 'Please sign in again.' }, { status: 401 });
  const login = new URL('/admin/login', request.url);
  if (pathname !== '/admin') login.searchParams.set('next', pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
