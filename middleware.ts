import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isAuthenticated(cookieValue: string | undefined) {
  if (!cookieValue) return false;

  try {
    const decoded = Buffer.from(cookieValue, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return Boolean(parsed?.isAuthenticated);
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('admin-session')?.value;
    const authenticated = isAuthenticated(sessionCookie);

    if (pathname.startsWith('/admin/login')) {
      return authenticated ? NextResponse.redirect(new URL('/admin/dashboard', request.url)) : NextResponse.next();
    }

    if (!authenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
