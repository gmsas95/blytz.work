import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = [
    '/employer/dashboard',
    '/va/dashboard',
    '/select-role'
  ];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check for auth token cookie (set during login)
  const authToken = request.cookies.get('authToken');
  const userCookie = request.cookies.get('user');

  // Check if user is authenticated (has auth token or user cookie)
  const isAuthenticated = authToken !== undefined || userCookie !== undefined;

  // If it's a protected route and user is not authenticated, redirect to auth
  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
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