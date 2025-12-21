import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getFirebase } from './lib/firebase-simplified';

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

  // Check if user is authenticated using simplified Firebase
  const { auth: firebaseAuth } = getFirebase();
  const user = firebaseAuth?.currentUser || null;

  // If it's a protected route and user is not authenticated, redirect to auth
  if (isProtectedRoute && !user) {
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