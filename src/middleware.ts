
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  
  // Define public pages
  const publicPages = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/pricing',
    '/contact',
    '/privacy-policy',
    '/terms-conditions',
    '/cancellation-refund',
  ];

  const isPublicPage = publicPages.some(page => request.nextUrl.pathname === page) || request.nextUrl.pathname.startsWith('/_next/') || request.nextUrl.pathname.startsWith('/api/auth/');

  // If the user has no session cookie and is trying to access a protected page, redirect to login
  if (!session && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // If the user has a session cookie and is trying to access login/signup, redirect to the welcome page
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
      const url = request.nextUrl.clone();
      url.pathname = '/welcome-guest';
      return NextResponse.redirect(url);
  }
  
  // If the user has a session cookie, try to verify it on the server
  // This helps to refresh the session or log them out if it's invalid/expired
  if(session && !isPublicPage) {
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
        headers: {
          Cookie: `session=${session.value}`,
        },
      });
      // If verification fails, redirect to login
      if (response.status !== 200) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        // Clear the invalid cookie
        const res = NextResponse.redirect(url);
        res.cookies.set('session', '', { maxAge: -1 });
        return res;
      }
    } catch (e) {
      // If the verify endpoint is down or there's an error, it's safer to redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (logo file)
     */
    '/((?!api/auth/verify|_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
};
