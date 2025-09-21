import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Standardize legacy paths and root to Next.js App Router counterparts
// - "/"                           -> "/homepage"
// - "/environments"              -> "/dashboard/environments"
// - "/environments/new"          -> "/dashboard/environments/new"
// - "/environments/:owner/:slug" -> "/dashboard/environments/:owner/:slug"
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  // Redirect root to hub
  if (pathname === '/') {
    url.pathname = '/homepage';
    return NextResponse.redirect(url);
  }

  // Normalize legacy "/environments" paths to "/dashboard/environments"
  if (pathname === '/environments' || pathname === '/environments/') {
    url.pathname = '/dashboard/environments';
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/environments/')) {
    const rest = pathname.replace('/environments', '');
    url.pathname = `/dashboard/environments${rest}`;
    return NextResponse.redirect(url);
  }

  // Otherwise, continue
  return NextResponse.next();
}

// Only run on selected paths to keep middleware lean
export const config = {
  matcher: ['/', '/environments/:path*'],
};
