import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ALWAYS log middleware execution for debugging
  console.log('🔐 MIDDLEWARE CALLED:', {
    pathname,
    method: request.method,
    hasCookies: request.cookies.getAll().length > 0,
    cookieNames: request.cookies.getAll().map(c => c.name)
  });

  // Skip middleware for static files, API routes, and auth-related pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/auth' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-email-sent' ||
    pathname === '/select-role'
  ) {
    console.log('🔐 Middleware skipped (public route)');
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    '/employer/dashboard',
    '/va/dashboard',
    '/select-role',
    '/employer/onboarding',
    '/va/onboarding',
    '/chat',
    '/contract'
  ];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Skip authentication check for non-protected routes
  if (!isProtectedRoute) {
    console.log('🔐 Not a protected route, skipping auth check');
    return NextResponse.next();
  }

  // Check for authentication token in cookies or headers
  const token = request.cookies.get('authToken')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Check for user role in cookies
  const userRole = request.cookies.get('userRole')?.value;

  // Check localStorage fallback via header (client-side should set this)
  const hasAuthHeader = request.headers.get('x-has-auth') === 'true';

  // Log authentication state for debugging
  console.log('🔐 Middleware auth check:', {
    pathname,
    isProtectedRoute,
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token?.substring(0, 30) + '...',
    hasRole: !!userRole,
    userRole,
    userRoleType: typeof userRole,
    userRoleLength: userRole?.length,
    userRoleValue: userRole,
    hasAuthHeader,
    allCookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value, length: c.value?.length })),
    cookieString: request.cookies.toString().substring(0, 200),
    userAgent: request.headers.get('user-agent')?.substring(0, 100)
  });

  if (!token && !hasAuthHeader) {
    // No authentication found - redirect to auth page
    console.log('🚫 Redirecting to auth: No token found');
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Additional role-based checks
  if (pathname.startsWith('/employer') && userRole !== 'employer') {
    console.log('🚫 Redirecting to auth: Wrong role for employer route');
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/va') && userRole !== 'va') {
    console.log('🚫 Redirecting to auth: Wrong role for VA route');
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // User is authenticated - continue to protected route
  console.log('✅ Auth verified, proceeding to protected route');
  return NextResponse.next();
}

export const config = {
  // Match all paths except:
  // - api routes
  // - _next (Next.js internals)
  // - static files (images, etc)
  // - auth-related pages
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|auth|forgot-password|reset-email-sent|select-role).*)',
  ]
};
