/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix Turbopack workspace root detection
  turbopack: {
    root: './',
  },
  
  reactStrictMode: true,
  images: {
    remotePatterns: [{ hostname: "firebasestorage.googleapis.com" }],
  },
  
  // Ensure environment variables are available in browser
  env: {
    // Firebase - Production values
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    
    // API
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    
    // Configuration
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  },
  
  // Standalone output for Docker
  output: 'standalone',
  
  // Build optimizations
  swcMinify: true,
  
  // Development vs Production
  development: {
    env: {
      NEXT_PUBLIC_ENVIRONMENT: 'development',
    }
  }
};

module.exports = nextConfig;