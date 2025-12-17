import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
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
    // Get the token from the request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.log('🔍 No authorization header - redirecting to auth');
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }

    // Verify the token with Firebase Admin SDK (server-side)
    const { getFirebase } = require('./lib/firebase-runtime-final');
    let firebaseAdmin;
    
    try {
      const firebaseResult = getFirebase();
      firebaseAdmin = firebaseResult.admin;
    } catch (authError) {
      console.error('❌ Failed to initialize Firebase Admin:', authError);
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }

    if (!firebaseAdmin) {
      console.log('🔍 Firebase Admin not available - redirecting to auth');
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }

    // Extract token from Bearer header
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('🔍 No token found - redirecting to auth');
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }

    try {
      // Verify token using Firebase Admin
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      console.log('🔍 Token verified for user:', decodedToken.email);
      
      // User is authenticated, continue to the route
      return NextResponse.next();
    } catch (tokenError) {
      console.error('❌ Invalid token:', tokenError);
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('❌ Middleware error:', error);
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