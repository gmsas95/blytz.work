import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = [
    '/employer/dashboard',
    '/va/dashboard',
    '/select-role'
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a protected route, we'll let the client-side handle auth checking
  // This allows the pages to load and then redirect if needed
  if (isProtectedRoute) {
    // Continue to the page, client-side will handle auth checks
    return NextResponse.next();
  }

  // For all other routes, continue as normal
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/employer/dashboard/:path*',
    '/va/dashboard/:path*',
    '/select-role/:path*'
  ]
};