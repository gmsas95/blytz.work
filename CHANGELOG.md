# Changelog

All notable changes to the BlytzWork platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- (No changes yet)

### Changed
- (No changes yet)

### Fixed
- (No changes yet)

---

## [1.0.0] - January 3, 2026

### Added
- Cloudflare R2 integration for file uploads (replacing S3)
- Enhanced error handling for authentication flows
- User role validation and profile completion tracking
- Missing `/api/auth/me` endpoint for frontend profile checks
- Cookie-based auth middleware for dashboard access

### Changed
- Firebase authentication configuration for production environment
- Dashboard API calls to use correct backend endpoints
- File upload endpoints to support Cloudflare R2 S3-compatible API
- VA and Employer onboarding flows with better error handling
- Merged staging to main (production-ready onboarding implementation)

### Fixed
- **Critical**: Company onboarding database persistence
  - Fixed missing `bio` and `companySize` fields in company profile creation
  - Removed URL validation from website field to allow empty strings
  - Company profiles now properly save to database on onboarding completion
- **Critical**: Authentication flow persistence
  - Logout and relogin no longer triggers onboarding (profile data persists)
  - Cookie-based auth middleware properly handles dashboard access
  - User sessions now correctly maintain state across authentication cycles
- **Critical**: Firebase environment variable loading in production
  - Replaced dynamic `process.env[varName]` access with direct `process.env.NEXT_PUBLIC_*` access
  - Fixed camelCase conversion bug in backend (creating `projectid` instead of `project_id`)
  - Next.js build-time replacement mechanism now properly injects env vars into browser bundle
  - Both frontend and backend Firebase now fully operational in production
- **Critical**: User database synchronization after Firebase authentication
  - Added `syncUserToDatabase()` function to create PostgreSQL user records after Firebase sign-in
  - Frontend automatically calls `/api/auth/sync` endpoint after user is authenticated
  - Backend `/api/auth/sync` endpoint creates/retrieves PostgreSQL user records
  - Fixes 401 Unauthorized errors for newly authenticated users
  - Complete authentication flow working end-to-end (Firebase → PostgreSQL → API)
- Dashboard data loading issues (wrong API endpoints)
- Frontend-backend API mismatches causing 404 errors
- Silent failures in user creation and role selection
- Firebase initialization and fallback to mock

### Security
- Improved Firebase token verification
- Enhanced input validation on all authentication endpoints
- Added proper error responses without data exposure

### Technical
- Fixed TypeScript compilation errors in auth routes
- Updated Prisma client generation
- Improved logging throughout authentication flows
- Added comprehensive environment variable validation
- Phase 1 (Auth & Onboarding) completed successfully

---

## [0.1.0] - November 2024 - Initial MVP Release

### Added
- User authentication with Firebase (Email/Password, Google OAuth)
- VA profile creation with 34+ fields
- Company profile creation
- Basic job posting and browsing
- Contract management with milestones
- Real-time chat with Socket.IO (REST endpoints only)
- Stripe payment integration (mock implementation)
- File upload system (mock S3 implementation)
- Comprehensive database schema with 17 models
- Docker deployment with Traefik reverse proxy

### Security
- Firebase Admin SDK integration for token verification
- Zod schema validation on all endpoints
- Rate limiting (100 req/15min per IP)
- CORS protection
- Input sanitization

### Infrastructure
- PostgreSQL 15 database with Prisma ORM
- Redis caching for session management
- Multi-stage Docker builds
- Automated deployment scripts
- Health check endpoints

---

## Version Format

This changelog follows the format:

**[Version]** - Date
### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
### Technical

---

## Links

- [BlytzWork Platform](https://blytz.work)
- [API Documentation](./docs/API_ENDPOINT_DOCUMENTATION.md)
- [Development Guide](./AGENTS.md)
- [Security Guide](./SECURITY_FIXES_AND_GUIDE.md)
