import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('🔍 Middleware called for path:', pathname);

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

  console.log('🔍 Is protected route:', isProtectedRoute);

  // Skip authentication check for non-protected routes
  if (!isProtectedRoute) {
    console.log('🔍 Skipping auth check for non-protected route');
    return NextResponse.next();
  }

  try {
    // Dynamically import auth to avoid build-time issues
    let authModule;
    try {
      authModule = require('./lib/firebase-runtime-final');
    } catch (importError) {
      console.error('❌ Failed to import auth module:', importError);
      // Redirect to auth page if auth module can't be loaded
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }

    const { getFirebase } = authModule;
    let firebaseAuth;
    
    try {
      const firebaseResult = getFirebase();
      firebaseAuth = firebaseResult.auth;
    } catch (authError) {
      console.error('❌ Failed to initialize Firebase auth:', authError);
      // Redirect to auth page if Firebase auth can't be initialized
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
    
    console.log('🔍 Firebase auth initialized:', !!firebaseAuth);
    
    // Check if auth has a currentUser method
    if (!firebaseAuth || typeof firebaseAuth.currentUser === 'undefined') {
      console.log('🔍 Firebase auth not properly initialized - redirecting to auth');
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
    
    const user = firebaseAuth.currentUser;
    console.log('🔍 Current user:', user?.email || 'None');

    // If it's a protected route and user is not authenticated, redirect to auth
    if (!user) {
      console.log('🔍 Redirecting to auth - no user found');
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('❌ Middleware error:', error);
    console.error('❌ Error details:', error.message);
    
    // If there's an error with auth, redirect to auth page for safety
    console.log('🔍 Redirecting to auth - middleware error');
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