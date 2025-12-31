# BlytzWork Platform - Comprehensive API Endpoint Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication & User Management](#authentication--user-management)
3. [VA Profiles](#va-profiles)
4. [Company Profiles](#company-profiles)
5. [Job Marketplace](#job-marketplace)
6. [Contracts & Milestones](#contracts--milestones)
7. [Payments & Billing](#payments--billing)
8. [Messaging & Chat](#messaging--chat)
9. [File Upload](#file-upload)
10. [Browse & Discovery](#browse--discovery)
11. [Health Checks](#health-checks)
12. [Duplicate/Conflicting Routes](#duplicateconflicting-routes)
13. [Mock vs Working Implementations](#mock-vs-working-implementations)
14. [Frontend Usage Analysis](#frontend-usage-analysis)
15. [Missing Critical Endpoints](#missing-critical-endpoints)

---

## Overview

**Base URL**: `https://api.blytz.work/api` (production) or `http://localhost:3002/api` (development)

**Authentication**: All protected endpoints require Firebase JWT token via `Authorization: Bearer <token>` header

**Rate Limiting**: 100 requests per 15-minute window per IP

**Response Format**:
```json
{
  "success": true|false,
  "data": { ... }, // optional, on success
  "message": "Success message", // optional
  "error": "Error message", // on failure
  "code": "ERROR_CODE", // on failure
  "details": { ... }, // optional error details
  "pagination": { // optional, for paginated endpoints
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Authentication & User Management

### Route File: `/backend/src/routes/auth.ts`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/auth/profile` | ✅ Yes | Get current user profile with VA/Company details |
| PUT | `/auth/profile` | ✅ Yes | Update user profile (email, role, profile completion) |
| POST | `/auth/forgot-password` | ❌ No | Request password reset link |
| POST | `/auth/sync` | ✅ Yes | Sync user from Firebase to database |
| POST | `/auth/create` | ✅ Yes | Create new user record |
| POST | `/auth/token` | ✅ Yes | Generate custom Firebase token |

### Endpoints Detail

#### GET `/auth/profile`
**Purpose**: Retrieve current authenticated user's profile

**Authentication**: Required (Firebase JWT)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_uid",
    "email": "user@example.com",
    "role": "va" | "company",
    "profileComplete": true,
    "vaProfile": { ... }, // if user is VA
    "company": { ... }, // if user is company
    "payments": [ ... ] // last 5 payments
  }
}
```

**Frontend Usage**: ❌ Not directly used (frontend uses `/api/auth/me` which doesn't exist)

---

#### PUT `/auth/profile`
**Purpose**: Update user profile information

**Authentication**: Required

**Request Body**:
```json
{
  "email": "newemail@example.com", // optional
  "role": "va" | "company", // optional
  "profileComplete": true // optional
}
```

**Response**:
```json
{
  "success": true,
  "data": { ...updatedUser },
  "message": "Profile updated successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### POST `/auth/forgot-password`
**Purpose**: Generate password reset link for user

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset link generated (check console/response for dev)",
  "debug_link": "https://firebase.auth.link/..." // dev only
}
```

**Frontend Usage**: ✅ Used via `/api/auth/forgot-password` (Next.js API route)

---

#### POST `/auth/sync`
**Purpose**: Sync Firebase user to database

**Authentication**: Required

**Request Body**:
```json
{
  "uid": "firebase_user_id",
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": { ...userRecord },
  "message": "User synced successfully"
}
```

**Frontend Usage**: ✅ Used via `/api/auth/sync` (Next.js API route)

---

#### POST `/auth/create`
**Purpose**: Create new user record in database

**Authentication**: Required

**Request Body**:
```json
{
  "uid": "firebase_user_id",
  "email": "user@example.com",
  "role": "va" | "company"
}
```

**Response**:
```json
{
  "success": true,
  "data": { ...newUser },
  "message": "User created successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### POST `/auth/token`
**Purpose**: Generate custom Firebase token for client

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "custom_jwt_token",
    "expiresIn": "1h"
  }
}
```

**Frontend Usage**: ❌ Not used

---

## VA Profiles

### Route File: `/backend/src/routes/va.ts` (Main VA Routes)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/va/profile` | ✅ Yes | Get current VA's profile |
| POST | `/va/profile` | ✅ Yes | Create new VA profile |
| PUT | `/va/profile` | ✅ Yes | Update VA profile |
| POST | `/va/upload-portfolio` | ✅ Yes | Upload portfolio item |
| POST | `/va/upload-resume` | ✅ Yes | Upload resume |
| POST | `/va/upload-video` | ✅ Yes | Upload video intro |
| POST | `/va/skills-assessment` | ✅ Yes | Complete skills assessment |
| GET | `/va/skills-assessments` | ✅ Yes | Get skills assessments |
| POST | `/va/verification` | ✅ Yes | Request verification |
| GET | `/va/analytics` | ✅ Yes | Get VA analytics |

### Endpoints Detail

#### GET `/va/profile`
**Purpose**: Retrieve authenticated VA's profile

**Authentication**: Required (VA role only)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "va_profile_id",
    "userId": "user_uid",
    "name": "John Doe",
    "bio": "Experienced VA...",
    "country": "Philippines",
    "hourlyRate": 15,
    "skills": ["Virtual Assistance", "Admin Support"],
    "availability": true,
    "email": "va@example.com",
    "phone": "+1234567890",
    "timezone": "UTC+8",
    "languages": [
      {
        "code": "en",
        "level": "native"
      }
    ],
    "workExperience": [
      {
        "company": "ABC Corp",
        "role": "Executive Assistant",
        "years": 3,
        "description": "Supported CEO...",
        "achievements": ["Award 1", "Award 2"]
      }
    ],
    "education": [
      {
        "institution": "University",
        "degree": "Bachelor's",
        "field": "Business Administration",
        "startDate": "2015-09-01",
        "endDate": "2019-05-01",
        "gpa": 3.8,
        "achievements": ["Dean's List"]
      }
    ],
    "resumeUrl": "https://s3.../resume.pdf",
    "videoIntroUrl": "https://s3.../intro.mp4",
    "avatarUrl": "https://s3.../avatar.jpg",
    "completionPercentage": 85,
    "portfolioItems": [],
    "reviews": [],
    "responseRate": 95,
    "averageRating": 4.8,
    "totalReviews": 25,
    "featuredProfile": true,
    "profileViews": 150,
    "skillsScore": 85,
    "verificationLevel": "basic",
    "earnedAmount": 5000.50,
    "completedJobs": 15
  }
}
```

**Frontend Usage**: ✅ Used in `/va/dashboard` page

---

#### POST `/va/profile`
**Purpose**: Create new VA profile

**Authentication**: Required (VA role only)

**Request Body**:
```json
{
  "name": "John Doe",
  "bio": "Experienced virtual assistant...",
  "country": "Philippines",
  "hourlyRate": 15,
  "skills": ["Virtual Assistance", "Admin Support", "Customer Service"],
  "availability": true,
  "email": "va@example.com",
  "phone": "+1234567890",
  "timezone": "UTC+8",
  "languages": [
    {
      "code": "en",
      "level": "native"
    },
    {
      "code": "es",
      "level": "conversational"
    }
  ],
  "workExperience": [
    {
      "company": "ABC Corp",
      "role": "Executive Assistant",
      "years": 3,
      "description": "Supported CEO with daily operations",
      "achievements": ["Improved efficiency by 30%"]
    }
  ],
  "education": [
    {
      "institution": "University of the Philippines",
      "degree": "Bachelor's Degree",
      "field": "Business Administration",
      "startDate": "2015-09-01",
      "endDate": "2019-05-01",
      "gpa": 3.8
    }
  ]
}
```

**Validation**:
- `name`: min 2 characters
- `bio`: min 10 characters
- `country`: min 2 characters
- `hourlyRate`: min $5, max $200
- `skills`: at least 1 skill required

**Response**:
```json
{
  "success": true,
  "data": { ...createdProfile },
  "message": "VA profile created successfully"
}
```

**Frontend Usage**: ✅ Used in `/va/profile/create` page

---

#### PUT `/va/profile`
**Purpose**: Update existing VA profile

**Authentication**: Required (VA role only)

**Request Body**: Same as POST, all fields optional

**Response**:
```json
{
  "success": true,
  "data": { ...updatedProfile },
  "message": "VA profile updated successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### POST `/va/upload-portfolio`
**Purpose**: Upload portfolio item

**Authentication**: Required (VA role only)

**Request Body**:
```json
{
  "title": "Website Redesign",
  "description": "Complete redesign of company website",
  "fileUrl": "https://s3.../project.pdf",
  "fileType": "image" | "video" | "document",
  "category": "Web Development",
  "technologies": ["React", "Node.js", "MongoDB"],
  "projectUrl": "https://example.com",
  "featured": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "portfolio_item_id",
    "vaProfileId": "va_profile_id",
    "title": "Website Redesign",
    "description": "...",
    "fileUrl": "https://s3.../project.pdf",
    "thumbnailUrl": "https://s3.../project.pdf?thumbnail=300x200",
    "fileType": "document",
    "category": "Web Development",
    "technologies": ["React", "Node.js", "MongoDB"],
    "projectUrl": "https://example.com",
    "featured": true,
    "views": 0,
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "Portfolio item uploaded successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### POST `/va/upload-resume`
**Purpose**: Upload resume URL to profile

**Authentication**: Required (VA role only)

**Request Body**:
```json
{
  "resumeUrl": "https://s3.../resume.pdf"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "resumeUrl": "https://s3.../resume.pdf"
  },
  "message": "Resume uploaded successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### POST `/va/upload-video`
**Purpose**: Upload video introduction URL to profile

**Authentication**: Required (VA role only)

**Request Body**:
```json
{
  "videoUrl": "https://s3.../intro.mp4"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "videoIntroUrl": "https://s3.../intro.mp4"
  },
  "message": "Video introduction uploaded successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### POST `/va/skills-assessment`
**Purpose**: Complete skills assessment

**Authentication**: Required (VA role only)

**Request Body**:
```json
{
  "skillName": "Microsoft Excel",
  "category": "technical" | "language" | "soft",
  "difficulty": "beginner" | "intermediate" | "advanced"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "assessment_id",
      "vaProfileId": "va_profile_id",
      "skillName": "Microsoft Excel",
      "category": "technical",
      "difficulty": "intermediate",
      "score": 85,
      "assessmentType": "automated",
      "completedAt": "2024-01-15T10:00:00Z",
      "expiresAt": "2024-07-15T10:00:00Z"
    }
  },
  "message": "Skills assessment completed successfully"
}
```

**Note**: Score is randomly generated (60-100) for MVP

**Frontend Usage**: ❌ Not used

---

#### GET `/va/skills-assessments`
**Purpose**: Get VAs skills assessments

**Authentication**: Required (VA role only)

**Query Parameters**:
- `skill` (optional): Filter by skill name
- `category` (optional): Filter by category

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "assessment_id",
      "vaProfileId": "va_profile_id",
      "skillName": "Microsoft Excel",
      "category": "technical",
      "difficulty": "intermediate",
      "score": 85,
      "completedAt": "2024-01-15T10:00:00Z",
      "expiresAt": "2024-07-15T10:00:00Z"
    }
  ]
}
```

**Frontend Usage**: ❌ Not used

---

#### POST `/va/verification`
**Purpose**: Request profile verification

**Authentication**: Required (VA role only)

**Request Body**:
```json
{
  "level": "professional" | "premium"
}
```

**Response**:
```json
{
  "success": true,
  "data": { ...updatedProfile },
  "message": "Verification request submitted for professional level"
}
```

**Note**: `premium` level sets `backgroundCheckPassed` to true

**Frontend Usage**: ❌ Not used

---

#### GET `/va/analytics`
**Purpose**: Get VA profile analytics and performance metrics

**Authentication**: Required (VA role only)

**Response**:
```json
{
  "success": true,
  "data": {
    "profile": {
      "name": "John Doe",
      "profileViews": 150,
      "averageRating": 4.8,
      "totalReviews": 25,
      "responseRate": 95
    },
    "portfolio": {
      "totalItems": 10,
      "totalViews": 500,
      "featuredItems": 3
    },
    "performance": {
      "totalMatches": 47,
      "totalReviews": 25,
      "conversionRate": 15.5,
      "averageResponseTime": 2.3
    },
    "trends": [
      {
        "date": "2024-01-01",
        "views": 45,
        "matches": 8
      },
      {
        "date": "2024-01-02",
        "views": 52,
        "matches": 11
      },
      {
        "date": "2024-01-03",
        "views": 38,
        "matches": 6
      }
    ]
  }
}
```

**Note**: Analytics are partially mocked for MVP

**Frontend Usage**: ❌ Not used

---

## Company Profiles

### Route File: `/backend/src/routes/company.ts` (Main Company Routes)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/company/profile` | ✅ Yes | Get current company's profile |
| POST | `/company/profile` | ✅ Yes | Create new company profile |
| PUT | `/company/profile` | ✅ Yes | Update company profile |
| POST | `/company/upload-logo` | ✅ Yes | Upload company logo |
| POST | `/company/verification` | ✅ Yes | Request verification |
| GET | `/company/analytics` | ✅ Yes | Get company analytics |

### Endpoints Detail

#### GET `/company/profile`
**Purpose**: Retrieve authenticated company's profile

**Authentication**: Required (Company role only)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "company_id",
    "userId": "user_uid",
    "name": "ABC Corporation",
    "bio": "Leading tech company...",
    "country": "United States",
    "website": "https://abc-corp.com",
    "logoUrl": "https://s3.../logo.png",
    "industry": "Technology",
    "companySize": "11-50",
    "foundedYear": 2010,
    "description": "Full company description...",
    "mission": "To innovate...",
    "values": ["Innovation", "Excellence", "Integrity"],
    "benefits": ["Health Insurance", "Remote Work", "401k"],
    "email": "company@abc-corp.com",
    "phone": "+1234567890",
    "verificationLevel": "professional",
    "backgroundCheckPassed": true,
    "featuredCompany": true,
    "socialLinks": {
      "linkedin": "https://linkedin.com/company/abc",
      "twitter": "https://twitter.com/abc",
      "facebook": "https://facebook.com/abc"
    },
    "techStack": ["React", "Node.js", "Python", "AWS"],
    "totalSpent": 15000.75,
    "completionPercentage": 90,
    "jobPostings": [ ... ],
    "reviews": []
  }
}
```

**Frontend Usage**: ✅ Used in `/employer/dashboard` page

---

#### POST `/company/profile`
**Purpose**: Create new company profile

**Authentication**: Required (Company role only)

**Request Body**:
```json
{
  "name": "ABC Corporation",
  "bio": "Leading tech company specializing in...",
  "country": "United States",
  "website": "https://abc-corp.com",
  "industry": "Technology",
  "companySize": "11-50",
  "foundedYear": 2010,
  "description": "Full company description...",
  "mission": "To innovate and transform industries",
  "values": ["Innovation", "Excellence", "Integrity"],
  "benefits": ["Health Insurance", "Remote Work", "401k"],
  "email": "contact@abc-corp.com",
  "phone": "+1234567890",
  "socialLinks": {
    "linkedin": "https://linkedin.com/company/abc",
    "twitter": "https://twitter.com/abc",
    "facebook": "https://facebook.com/abc"
  },
  "techStack": ["React", "Node.js", "Python", "AWS"]
}
```

**Validation**:
- `name`: min 2 characters
- `bio`: min 10 characters
- `country`: min 2 characters
- `industry`: min 2 characters
- `description`: min 20 characters
- `mission`: min 10 characters

**Response**:
```json
{
  "success": true,
  "data": { ...createdCompany },
  "message": "Company profile created successfully"
}
```

**Frontend Usage**: ❌ Not used directly

---

#### PUT `/company/profile`
**Purpose**: Update existing company profile

**Authentication**: Required (Company role only)

**Request Body**: Same as POST, all fields optional

**Response**:
```json
{
  "success": true,
  "data": { ...updatedCompany },
  "message": "Company profile updated successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### POST `/company/upload-logo`
**Purpose**: Upload company logo

**Authentication**: Required (Company role only)

**Request Body** (multipart/form-data):
- File upload via file upload service
- File URL attached to request

**Response**:
```json
{
  "success": true,
  "data": {
    "logoUrl": "https://s3.../logo.png"
  },
  "message": "Company logo uploaded successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### POST `/company/verification`
**Purpose**: Request company verification

**Authentication**: Required (Company role only)

**Request Body**:
```json
{
  "level": "professional" | "premium"
}
```

**Response**:
```json
{
  "success": true,
  "data": { ...updatedCompany },
  "message": "Verification request submitted for professional level"
}
```

**Frontend Usage**: ❌ Not used

---

#### GET `/company/analytics`
**Purpose**: Get company analytics and performance metrics

**Authentication**: Required (Company role only)

**Response**:
```json
{
  "success": true,
  "data": {
    "company": {
      "name": "ABC Corporation",
      "verificationLevel": "professional",
      "totalJobs": 15,
      "totalReviews": 12
    },
    "performance": {
      "totalMatches": 47,
      "conversionRate": 12.5,
      "averageTimeToHire": 14.3,
      "costPerHire": 2500
    },
    "quality": {
      "averageRating": 4.2,
      "responseRate": 85.5,
      "satisfactionScore": 4.1
    },
    "trends": [
      {
        "date": "2024-01-01",
        "jobs": 5,
        "matches": 23,
        "hires": 3
      },
      {
        "date": "2024-01-02",
        "jobs": 8,
        "matches": 37,
        "hires": 5
      },
      {
        "date": "2024-01-03",
        "jobs": 6,
        "matches": 28,
        "hires": 4
      }
    ]
  }
}
```

**Note**: Analytics are partially mocked for MVP

**Frontend Usage**: ❌ Not used

---

## Job Marketplace

### Route File: `/backend/src/routes/jobMarketplace.ts`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/jobs/marketplace` | ✅ Yes | Create job posting (company only) |
| GET | `/jobs/marketplace` | ❌ No | Get all job postings with filters |
| GET | `/jobs/marketplace/:id` | ❌ No | Get single job posting |
| PUT | `/jobs/marketplace/:id` | ✅ Yes | Update job posting (owner only) |
| DELETE | `/jobs/marketplace/:id` | ✅ Yes | Delete job posting (owner only) |
| POST | `/jobs/marketplace/proposals` | ✅ Yes | Submit proposal (VA only) |
| PUT | `/jobs/marketplace/proposals/:id` | ✅ Yes | Update proposal (owner only) |
| DELETE | `/jobs/marketplace/proposals/:id` | ✅ Yes | Withdraw proposal (owner only) |
| GET | `/jobs/marketplace/categories` | ❌ No | Get job categories |

### Endpoints Detail

#### POST `/jobs/marketplace`
**Purpose**: Create new job posting

**Authentication**: Required (Company role only)

**Request Body**:
```json
{
  "title": "Executive Virtual Assistant",
  "description": "Looking for experienced VA to support...",
  "requirements": ["5+ years experience", "Fluent English", "Tech-savvy"],
  "responsibilities": ["Email management", "Calendar management", "Research"],
  "benefits": ["Health insurance", "Performance bonuses", "Growth opportunities"],
  "rateRange": "$15-25/hr",
  "budget": 5000,
  "location": "Remote",
  "remote": true,
  "category": "Virtual Assistance",
  "tags": ["admin", "executive", "support"],
  "experienceLevel": "senior",
  "employmentType": "fulltime",
  "jobType": "hourly",
  "duration": "6 months",
  "urgency": "medium",
  "skillsRequired": ["Virtual Assistance", "Admin Support", "Communication"],
  "toolsUsed": ["Microsoft Office", "Google Suite", "Zoom"],
  "teamSize": 5,
  "reportingTo": "CEO",
  "travelRequired": "None",
  "workSchedule": ["Monday-Friday", "9AM-5PM EST"],
  "featured": false
}
```

**Validation**:
- `title`: min 5 characters
- `description`: min 10 characters
- `rateRange`: min 1 character
- `skillsRequired`: at least 1 skill
- `hourlyRate`: min $5, max $200

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "job_posting_id",
    "companyId": "company_id",
    "title": "Executive Virtual Assistant",
    "description": "Looking for experienced VA...",
    "requirements": [...],
    "responsibilities": [...],
    "benefits": [...],
    "rateRange": "$15-25/hr",
    "budget": 5000,
    "location": "Remote",
    "remote": true,
    "category": "Virtual Assistance",
    "tags": [...],
    "experienceLevel": "senior",
    "employmentType": "fulltime",
    "jobType": "hourly",
    "duration": "6 months",
    "urgency": "medium",
    "skillsRequired": [...],
    "toolsUsed": [...],
    "teamSize": 5,
    "reportingTo": "CEO",
    "travelRequired": "None",
    "workSchedule": [...],
    "featured": false,
    "status": "open",
    "views": 0,
    "proposalCount": 0,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Job posting created successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### GET `/jobs/marketplace`
**Purpose**: Get all job postings with filtering and pagination

**Authentication**: Not required

**Query Parameters**:
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `search`: Search in title, description, skills, tags
- `category`: Filter by category
- `jobType`: Filter by job type (fixed/hourly)
- `experienceLevel`: Filter by experience level (entry/mid/senior/executive)
- `skills`: Comma-separated skills to filter
- `budgetRange`: Budget range (e.g., "1000-5000")
- `duration`: Filter by duration
- `urgent` (true/false): Show only urgent jobs
- `featured` (true/false): Show only featured jobs
- `status` (default: "open"): Filter by status

**Response**:
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_posting_id",
        "title": "Executive Virtual Assistant",
        "description": "...",
        "rateRange": "$15-25/hr",
        "budget": 5000,
        "remote": true,
        "category": "Virtual Assistance",
        "tags": ["admin", "executive", "support"],
        "experienceLevel": "senior",
        "jobType": "hourly",
        "urgency": "medium",
        "status": "open",
        "views": 150,
        "createdAt": "2024-01-15T10:00:00Z",
        "company": {
          "id": "company_id",
          "name": "ABC Corporation",
          "logoUrl": "https://s3.../logo.png",
          "country": "United States",
          "verificationLevel": "professional"
        },
        "_count": {
          "proposals": 12
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**Frontend Usage**: ❌ Not used

---

#### GET `/jobs/marketplace/:id`
**Purpose**: Get single job posting details

**Authentication**: Not required (but returns user's proposals if authenticated)

**Path Parameters**:
- `id`: Job posting ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "job_posting_id",
    "title": "Executive Virtual Assistant",
    "description": "...",
    "requirements": [...],
    "responsibilities": [...],
    "benefits": [...],
    "rateRange": "$15-25/hr",
    "budget": 5000,
    "location": "Remote",
    "remote": true,
    "category": "Virtual Assistance",
    "tags": [...],
    "experienceLevel": "senior",
    "employmentType": "fulltime",
    "jobType": "hourly",
    "duration": "6 months",
    "urgency": "medium",
    "skillsRequired": [...],
    "toolsUsed": [...],
    "teamSize": 5,
    "reportingTo": "CEO",
    "travelRequired": "None",
    "workSchedule": [...],
    "featured": false,
    "status": "open",
    "views": 151,
    "proposalCount": 12,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "company": {
      "id": "company_id",
      "name": "ABC Corporation",
      "logoUrl": "https://s3.../logo.png",
      "country": "United States",
      "verificationLevel": "professional",
      "description": "Leading tech company...",
      "foundedYear": 2010,
      "companySize": "11-50",
      "industry": "Technology"
    },
    "proposals": [
      {
        "id": "proposal_id",
        "vaProfile": {
          "id": "va_profile_id",
          "name": "John Doe",
          "avatarUrl": "https://s3.../avatar.jpg",
          "country": "Philippines",
          "averageRating": 4.8,
          "totalReviews": 25,
          "skills": ["Virtual Assistance"],
          "hourlyRate": 15
        }
      }
    ]
  }
}
```

**Note**: View count incremented on each request

**Frontend Usage**: ❌ Not used

---

#### PUT `/jobs/marketplace/:id`
**Purpose**: Update job posting

**Authentication**: Required (Company role, owner only)

**Path Parameters**:
- `id`: Job posting ID

**Request Body**: Same as POST, all fields optional

**Response**:
```json
{
  "success": true,
  "data": { ...updatedJob },
  "message": "Job posting updated successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### DELETE `/jobs/marketplace/:id`
**Purpose**: Delete job posting

**Authentication**: Required (Company role, owner only)

**Path Parameters**:
- `id`: Job posting ID

**Response**:
```json
{
  "success": true,
  "message": "Job posting deleted successfully"
}
```

**Error Cases**:
- 400 if job has active contracts
- 403 if not owner
- 404 if not found

**Frontend Usage**: ❌ Not used

---

#### POST `/jobs/marketplace/proposals`
**Purpose**: Submit proposal for job posting

**Authentication**: Required (VA role only)

**Request Body**:
```json
{
  "jobPostingId": "job_posting_id",
  "coverLetter": "I'm excited to apply for this position. I have 5 years of experience...",
  "bidAmount": 5000,
  "bidType": "fixed",
  "hourlyRate": 20,
  "estimatedHours": 250,
  "deliveryTime": "2 weeks",
  "attachments": ["https://s3.../resume.pdf"]
}
```

**Validation**:
- `jobPostingId`: Required string
- `coverLetter`: min 10 characters
- `bidAmount`: min 1
- `deliveryTime`: min 1 character

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "proposal_id",
    "jobPostingId": "job_posting_id",
    "vaProfileId": "va_profile_id",
    "coverLetter": "...",
    "bidAmount": 5000,
    "bidType": "fixed",
    "hourlyRate": 20,
    "estimatedHours": 250,
    "deliveryTime": "2 weeks",
    "attachments": [...],
    "status": "pending",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Proposal submitted successfully"
}
```

**Error Cases**:
- 400 if VA already has proposal for this job
- 400 if job is not accepting proposals

**Frontend Usage**: ❌ Not used

---

#### PUT `/jobs/marketplace/proposals/:id`
**Purpose**: Update proposal

**Authentication**: Required (VA role, owner only)

**Path Parameters**:
- `id`: Proposal ID

**Request Body**: Same as POST, all fields optional

**Response**:
```json
{
  "success": true,
  "data": { ...updatedProposal },
  "message": "Proposal updated successfully"
}
```

**Error Cases**:
- 400 if proposal already accepted/rejected

**Frontend Usage**: ❌ Not used

---

#### DELETE `/jobs/marketplace/proposals/:id`
**Purpose**: Withdraw proposal

**Authentication**: Required (VA role, owner only)

**Path Parameters**:
- `id`: Proposal ID

**Response**:
```json
{
  "success": true,
  "message": "Proposal withdrawn successfully"
}
```

**Error Cases**:
- 400 if proposal already accepted

**Frontend Usage**: ❌ Not used

---

#### GET `/jobs/marketplace/categories`
**Purpose**: Get all job categories with counts

**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "name": "Virtual Assistance",
      "count": 45
    },
    {
      "name": "Web Development",
      "count": 32
    },
    {
      "name": "Graphic Design",
      "count": 28
    }
  ]
}
```

**Frontend Usage**: ❌ Not used

---

## Contracts & Milestones

### Route File: `/backend/src/routes/contracts.ts`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/contracts` | ✅ Yes | Create contract from proposal (company only) |
| GET | `/contracts` | ✅ Yes | Get user's contracts |
| GET | `/contracts/:id` | ✅ Yes | Get single contract |
| PUT | `/contracts/:id` | ✅ Yes | Update contract status |
| POST | `/contracts/:id/milestones` | ✅ Yes | Create milestone (company only) |
| GET | `/contracts/:id/milestones` | ✅ Yes | Get contract milestones |
| PUT | `/milestones/:milestoneId` | ✅ Yes | Update milestone |
| DELETE | `/milestones/:milestoneId` | ✅ Yes | Delete milestone (owner only) |
| POST | `/contracts/:id/timesheets` | ✅ Yes | Create timesheet (VA only) |
| GET | `/contracts/:id/timesheets` | ✅ Yes | Get contract timesheets |
| PUT | `/timesheets/:timesheetId` | ✅ Yes | Update timesheet (owner only) |
| DELETE | `/timesheets/:timesheetId` | ✅ Yes | Delete timesheet (owner only) |

### Endpoints Detail

#### POST `/contracts`
**Purpose**: Create contract from accepted proposal

**Authentication**: Required (Company role only)

**Request Body**:
```json
{
  "proposalId": "proposal_id",
  "startDate": "2024-01-20",
  "endDate": "2024-07-20",
  "contractTerms": {
    "terms": "Contract terms...",
    "conditions": "...",
    "deliverables": "..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job_id",
      "jobPostingId": "job_posting_id",
      "vaProfileId": "va_profile_id",
      "companyId": "company_id",
      "status": "active",
      "title": "Executive Virtual Assistant",
      "description": "...",
      "budget": 5000,
      "hourlyRate": null,
      "startDate": "2024-01-20T00:00:00Z",
      "endDate": "2024-07-20T00:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    },
    "contract": {
      "id": "contract_id",
      "jobId": "job_id",
      "jobPostingId": "job_posting_id",
      "vaProfileId": "va_profile_id",
      "companyId": "company_id",
      "proposalId": "proposal_id",
      "contractType": "fixed",
      "amount": 5000,
      "hourlyRate": null,
      "currency": "USD",
      "startDate": "2024-01-20T00:00:00Z",
      "endDate": "2024-07-20T00:00:00Z",
      "status": "active",
      "terms": { ... },
      "paymentSchedule": "upon_completion",
      "totalPaid": 0,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  },
  "message": "Contract created successfully"
}
```

**Side Effects**:
- Creates new Job record
- Updates proposal status to "accepted"
- Updates job posting status to "in_progress"

**Frontend Usage**: ❌ Not used

---

#### GET `/contracts`
**Purpose**: Get user's contracts (as VA or Company)

**Authentication**: Required

**Query Parameters**:
- `type` (default: "active"): "active" | "completed"
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page

**Response**:
```json
{
  "success": true,
  "data": {
    "contracts": [
      {
        "id": "contract_id",
        "jobId": "job_id",
        "job": {
          "id": "job_id",
          "title": "Executive Virtual Assistant",
          "description": "...",
          "status": "active",
          "createdAt": "2024-01-15T10:00:00Z",
          "updatedAt": "2024-01-15T10:00:00Z"
        },
        "jobPosting": {
          "id": "job_posting_id",
          "title": "Executive Virtual Assistant",
          "category": "Virtual Assistance",
          "tags": ["admin", "executive", "support"]
        },
        "vaProfile": {
          "id": "va_profile_id",
          "name": "John Doe",
          "country": "Philippines",
          "bio": "...",
          "averageRating": 4.8,
          "totalReviews": 25,
          "skills": ["Virtual Assistance"],
          "hourlyRate": 15,
          "avatarUrl": "https://s3.../avatar.jpg"
        },
        "company": {
          "id": "company_id",
          "name": "ABC Corporation",
          "logoUrl": "https://s3.../logo.png",
          "verificationLevel": "professional"
        },
        "proposal": {
          "id": "proposal_id",
          "coverLetter": "...",
          "bidAmount": 5000,
          "bidType": "fixed"
        },
        "contractType": "fixed",
        "amount": 5000,
        "currency": "USD",
        "startDate": "2024-01-20T00:00:00Z",
        "endDate": "2024-07-20T00:00:00Z",
        "status": "active",
        "totalPaid": 0,
        "createdAt": "2024-01-15T10:00:00Z",
        "_count": {
          "milestones": 3,
          "payments": 1
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

**Frontend Usage**: ❌ Not used

---

#### GET `/contracts/:id`
**Purpose**: Get single contract details

**Authentication**: Required (access verified: own contracts only)

**Path Parameters**:
- `id`: Contract ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "contract_id",
    "jobId": "job_id",
    "job": {
      "id": "job_id",
      "title": "Executive Virtual Assistant",
      "description": "...",
      "status": "active",
      "payments": [...],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    },
    "jobPosting": { ... },
    "vaProfile": { ... },
    "company": { ... },
    "proposal": { ... },
    "payments": [ ... ],
    "milestones": [ ... ],
    "timesheets": [ ... ],
    "contractType": "fixed",
    "amount": 5000,
    "currency": "USD",
    "startDate": "2024-01-20T00:00:00Z",
    "endDate": "2024-07-20T00:00:00Z",
    "status": "active",
    "terms": { ... },
    "paymentSchedule": "upon_completion",
    "totalPaid": 0,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Frontend Usage**: ❌ Not used

---

#### PUT `/contracts/:id`
**Purpose**: Update contract status

**Authentication**: Required (Company role, owner only)

**Path Parameters**:
- `id`: Contract ID

**Request Body**:
```json
{
  "status": "active" | "paused" | "completed" | "cancelled"
}
```

**Response**:
```json
{
  "success": true,
  "data": { ...updatedContract },
  "message": "Contract completed successfully"
}
```

**Note**: Setting status to "completed" sets endDate to current date

**Frontend Usage**: ❌ Not used

---

#### POST `/contracts/:id/milestones`
**Purpose**: Create milestone for contract

**Authentication**: Required (Company role, owner only)

**Path Parameters**:
- `id`: Contract ID

**Request Body**:
```json
{
  "title": "Phase 1: Onboarding",
  "description": "Complete onboarding process...",
  "amount": 1500,
  "dueDate": "2024-02-01"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "milestone_id",
    "contractId": "contract_id",
    "jobId": "job_id",
    "title": "Phase 1: Onboarding",
    "description": "Complete onboarding process...",
    "amount": 1500,
    "status": "pending",
    "dueDate": "2024-02-01T00:00:00Z",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Milestone created successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### GET `/contracts/:id/milestones`
**Purpose**: Get all milestones for contract

**Authentication**: Required (access verified: own contracts only)

**Path Parameters**:
- `id`: Contract ID

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "milestone_id",
      "contractId": "contract_id",
      "jobId": "job_id",
      "title": "Phase 1: Onboarding",
      "description": "...",
      "amount": 1500,
      "status": "pending",
      "dueDate": "2024-02-01T00:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Frontend Usage**: ❌ Not used

---

#### PUT `/milestones/:milestoneId`
**Purpose**: Update milestone

**Authentication**: Required (owner: company or VA)

**Path Parameters**:
- `milestoneId`: Milestone ID

**Request Body**:
```json
{
  "title": "Phase 1: Onboarding",
  "description": "Updated description...",
  "amount": 1500,
  "status": "in_progress",
  "dueDate": "2024-02-01"
}
```

**Response**:
```json
{
  "success": true,
  "data": { ...updatedMilestone },
  "message": "Milestone updated successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### DELETE `/milestones/:milestoneId`
**Purpose**: Delete milestone

**Authentication**: Required (Company role, owner only)

**Path Parameters**:
- `milestoneId`: Milestone ID

**Response**:
```json
{
  "success": true,
  "message": "Milestone deleted successfully"
}
```

**Error Cases**:
- 400 if milestone is completed/approved

**Frontend Usage**: ❌ Not used

---

#### POST `/contracts/:id/timesheets`
**Purpose**: Create timesheet entry

**Authentication**: Required (VA role, owner only)

**Path Parameters**:
- `id`: Contract ID

**Request Body**:
```json
{
  "date": "2024-01-15",
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "description": "Completed daily tasks..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "timesheet_id",
    "contractId": "contract_id",
    "jobId": "job_id",
    "vaProfileId": "va_profile_id",
    "date": "2024-01-15T00:00:00Z",
    "startTime": "2024-01-15T09:00:00Z",
    "endTime": "2024-01-15T17:00:00Z",
    "totalHours": 8,
    "description": "Completed daily tasks...",
    "status": "pending",
    "createdAt": "2024-01-15T18:00:00Z",
    "updatedAt": "2024-01-15T18:00:00Z"
  },
  "message": "Timesheet created successfully"
}
```

**Note**: `totalHours` is calculated automatically from startTime/endTime

**Frontend Usage**: ❌ Not used

---

#### GET `/contracts/:id/timesheets`
**Purpose**: Get all timesheets for contract

**Authentication**: Required (access verified: own contracts only)

**Path Parameters**:
- `id`: Contract ID

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "timesheet_id",
      "contractId": "contract_id",
      "jobId": "job_id",
      "vaProfileId": "va_profile_id",
      "date": "2024-01-15T00:00:00Z",
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T17:00:00Z",
      "totalHours": 8,
      "description": "Completed daily tasks...",
      "status": "pending",
      "createdAt": "2024-01-15T18:00:00Z",
      "updatedAt": "2024-01-15T18:00:00Z"
    }
  ]
}
```

**Frontend Usage**: ❌ Not used

---

#### PUT `/timesheets/:timesheetId`
**Purpose**: Update timesheet entry

**Authentication**: Required (VA role, owner only)

**Path Parameters**:
- `timesheetId`: Timesheet ID

**Request Body**:
```json
{
  "date": "2024-01-15",
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "description": "Updated description..."
}
```

**Response**:
```json
{
  "success": true,
  "data": { ...updatedTimesheet },
  "message": "Timesheet updated successfully"
}
```

**Error Cases**:
- 400 if timesheet is already approved

**Frontend Usage**: ❌ Not used

---

#### DELETE `/timesheets/:timesheetId`
**Purpose**: Delete timesheet entry

**Authentication**: Required (VA role, owner only)

**Path Parameters**:
- `timesheetId`: Timesheet ID

**Response**:
```json
{
  "success": true,
  "message": "Timesheet deleted successfully"
}
```

**Error Cases**:
- 400 if timesheet is already approved

**Frontend Usage**: ❌ Not used

---

## Payments & Billing

### Route File: `/backend/src/routes/payments.ts`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/payments/intent` | ✅ Yes | Create Stripe payment intent |
| POST | `/payments/confirm` | ✅ Yes | Confirm payment |
| GET | `/payments/status/:paymentId` | ✅ Yes | Get payment status |
| GET | `/payments/history` | ✅ Yes | Get payment history |
| POST | `/payments/refund` | ✅ Yes | Process refund |
| POST | `/payments/disputes` | ✅ Yes | Handle disputes |
| GET | `/payments/summary` | ✅ Yes | Get financial summary |
| POST | `/payments/invoices` | ✅ Yes | Create invoice |

### Endpoints Detail

#### POST `/payments/intent`
**Purpose**: Create Stripe payment intent

**Authentication**: Required

**Request Body**:
```json
{
  "jobId": "job_id", // optional
  "contractId": "contract_id", // optional
  "milestoneId": "milestone_id", // optional
  "receiverId": "recipient_user_id",
  "amount": 100.00, // in dollars
  "method": "card" | "bank" | "crypto",
  "type": "payment" | "refund" | "payout",
  "metadata": {
    "description": "Payment for milestone"
  }
}
```

**Validation**:
- `amount`: min $1.00 (100 cents)
- `receiverId`: Required and cannot be self

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentIntent": {
      "id": "pi_xxx",
      "client_secret": "pi_xxx_secret_xxx",
      "amount": 10000,
      "currency": "usd"
    },
    "paymentId": "payment_id",
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 100.00,
    "platformFee": 10.00,
    "totalAmount": 100.00
  }
}
```

**Platform Fee Calculation**:
- Default: 10% (configurable via `PLATFORM_FEE_PERCENTAGE`)
- Stripe Fee: 2.9% + $0.30 (added automatically)

**Frontend Usage**: ❌ Not used

---

#### POST `/payments/confirm`
**Purpose**: Confirm payment after Stripe processing

**Authentication**: Required

**Request Body**:
```json
{
  "paymentIntentId": "pi_xxx"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "payment_id",
    "stripePaymentIntentId": "pi_xxx",
    "userId": "payer_user_id",
    "receiverId": "recipient_user_id",
    "amount": 10000,
    "status": "succeeded",
    "processedAt": "2024-01-15T10:00:00Z",
    "stripeFee": 320,
    "platformFee": 1000,
    "method": "card",
    "type": "payment",
    "contract": { ... },
    "job": { ... }
  },
  "message": "Payment confirmed successfully"
}
```

**Side Effects**:
- Updates contract totalPaid
- Updates milestone status (if milestone payment)
- Creates notifications for both parties
- Updates VA earnedAmount
- Updates company totalSpent

**Frontend Usage**: ❌ Not used

---

#### GET `/payments/status/:paymentId`
**Purpose**: Get payment status

**Authentication**: Required (access verified: payer or receiver only)

**Path Parameters**:
- `paymentId`: Payment ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "payment_id",
    "stripePaymentIntentId": "pi_xxx",
    "userId": "payer_user_id",
    "receiverId": "recipient_user_id",
    "amount": 10000,
    "status": "succeeded",
    "stripeFee": 320,
    "platformFee": 1000,
    "method": "card",
    "type": "payment",
    "processedAt": "2024-01-15T10:00:00Z",
    "contract": { ... },
    "job": { ... }
  }
}
```

**Frontend Usage**: ❌ Not used

---

#### GET `/payments/history`
**Purpose**: Get payment history

**Authentication**: Required

**Query Parameters**:
- `type`: "sent" | "received" | "all" (default: "all")
- `status`: Filter by status
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `startDate`: Filter by start date (ISO string)
- `endDate`: Filter by end date (ISO string)

**Response**:
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment_id",
        "stripePaymentIntentId": "pi_xxx",
        "userId": "payer_user_id",
        "receiverId": "recipient_user_id",
        "amount": 10000,
        "status": "succeeded",
        "method": "card",
        "type": "payment",
        "processedAt": "2024-01-15T10:00:00Z",
        "contract": { ... },
        "job": { ... }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

**Frontend Usage**: ❌ Not used

---

#### POST `/payments/refund`
**Purpose**: Process refund

**Authentication**: Required (payer only)

**Request Body**:
```json
{
  "paymentId": "payment_id",
  "reason": "Service not delivered as described",
  "amount": 50.00 // optional, defaults to full amount
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "payment_id",
    "status": "refunded",
    "refundAmount": 5000,
    "refundedAt": "2024-01-15T11:00:00Z",
    "metadata": {
      "refundReason": "Service not delivered as described"
    }
  },
  "message": "Refund processed successfully"
}
```

**Side Effects**:
- Creates notifications for both parties

**Frontend Usage**: ❌ Not used

---

#### POST `/payments/disputes`
**Purpose**: Handle payment disputes

**Authentication**: Required (payer or receiver)

**Request Body**:
```json
{
  "paymentId": "pi_xxx",
  "type": "refund" | "escalate" | "resolve",
  "reason": "Dispute reason",
  "description": "Detailed description...", // optional
  "resolution": "Resolution details...", // optional for 'resolve'
  "amount": 50.00 // optional for 'refund'
}
```

**Response**:
```json
{
  "success": true,
  "message": "Dispute refund processed successfully"
}
```

**Dispute Types**:
- `refund`: Process refund
- `escalate`: Create dispute record and notify admin
- `resolve`: Mark dispute as resolved

**Frontend Usage**: ❌ Not used

---

#### GET `/payments/summary`
**Purpose**: Get financial summary

**Authentication**: Required

**Query Parameters**:
- `period`: "all" | "month" | "year" (default: "all")

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSent": 15000.50,
      "totalReceived": 5000.25,
      "netEarnings": -10000.25,
      "totalPlatformFees": 2000.50,
      "userEarnings": 5000.25, // if VA
      "companySpending": 15000.50 // if company
    },
    "transactions": {
      "sentCount": 25,
      "receivedCount": 12,
      "totalCount": 37
    },
    "period": "all"
  }
}
```

**Frontend Usage**: ❌ Not used

---

#### POST `/payments/invoices`
**Purpose**: Create invoice

**Authentication**: Required (Company role only)

**Request Body**:
```json
{
  "contractId": "contract_id",
  "items": [
    {
      "id": "item_1",
      "description": "Phase 1: Onboarding",
      "quantity": 1,
      "amount": 1500.00
    },
    {
      "id": "item_2",
      "description": "Phase 2: Implementation",
      "quantity": 1,
      "amount": 2000.00
    }
  ],
  "dueDate": "2024-02-01",
  "currency": "USD",
  "taxRate": 10,
  "discount": 0,
  "notes": "Payment terms: Net 30 days"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "invoice_id",
    "contractId": "contract_id",
    "userId": "company_user_id",
    "receiverId": "va_user_id",
    "invoiceNumber": "INV-202401-1234",
    "items": [...],
    "subtotal": 3500.00,
    "taxRate": 10,
    "taxAmount": 350.00,
    "discount": 0,
    "totalAmount": 3850.00,
    "dueDate": "2024-02-01T00:00:00Z",
    "currency": "USD",
    "notes": "Payment terms: Net 30 days",
    "status": "pending",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Invoice created successfully"
}
```

**Side Effects**:
- Creates notification for VA

**Frontend Usage**: ❌ Not used

---

## Messaging & Chat

### Route File: `/backend/src/routes/chat-final-fix.ts`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/chat/send-message` | ✅ Yes | Send message to user |
| GET | `/chat/messages` | ✅ Yes | Get messages for current user |
| PUT | `/chat/messages/:messageId/read` | ✅ Yes | Mark message as read |
| DELETE | `/chat/messages/:messageId` | ✅ Yes | Delete message |
| GET | `/chat/unread-count` | ✅ Yes | Get unread message count |

### Endpoints Detail

#### POST `/chat/send-message`
**Purpose**: Send message to another user

**Authentication**: Required

**Request Body**:
```json
{
  "recipientId": "recipient_user_id",
  "content": "Hello, I'm interested in this job posting...",
  "type": "text" | "image" | "file"
}
```

**Validation**:
- `content`: min 1 character, max 1000 characters
- `recipientId`: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "messageId": "notification_id",
    "content": "Hello, I'm interested in this job posting...",
    "createdAt": "2024-01-15T10:00:00Z",
    "recipient": {
      "id": "recipient_user_id",
      "email": "recipient@example.com"
    }
  }
}
```

**Note**: Messages stored as Notification records with type 'chat_message'

**Frontend Usage**: ❌ Not used

---

#### GET `/chat/messages`
**Purpose**: Get messages for current user

**Authentication**: Required

**Query Parameters**:
- `limit` (default: 50): Number of messages to return
- `before`: ISO date string for pagination (messages before this date)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "notification_id",
      "content": "Hello, I'm interested in this job posting...",
      "type": "chat_message",
      "status": "read" | "sent",
      "createdAt": "2024-01-15T10:00:00Z",
      "sender": {
        "id": "sender_user_id",
        "name": "sender@example.com",
        "role": "va" | "company"
      }
    }
  ]
}
```

**Note**: Messages returned in chronological order (oldest first)

**Frontend Usage**: ❌ Not used

---

#### PUT `/chat/messages/:messageId/read`
**Purpose**: Mark message as read

**Authentication**: Required

**Path Parameters**:
- `messageId`: Notification ID

**Response**:
```json
{
  "success": true,
  "data": {
    "messageId": "notification_id",
    "status": "read"
  }
}
```

**Frontend Usage**: ❌ Not used

---

#### DELETE `/chat/messages/:messageId`
**Purpose**: Delete message

**Authentication**: Required

**Path Parameters**:
- `messageId`: Notification ID

**Response**:
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

**Frontend Usage**: ❌ Not used

---

#### GET `/chat/unread-count`
**Purpose**: Get unread message count

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

**Frontend Usage**: ❌ Not used

---

## File Upload

### Route File: `/backend/src/routes/upload.ts`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/upload/presigned-url` | ✅ Yes | Get presigned S3 upload URL |
| POST | `/upload/confirm` | ✅ Yes | Confirm upload completion |
| GET | `/upload/status/:uploadId` | ✅ Yes | Get upload status |
| DELETE | `/upload/:fileKey` | ✅ Yes | Delete uploaded file |
| GET | `/uploads` | ✅ Yes | Get user uploads |
| POST | `/upload/process` | ✅ Yes | Process uploaded file |

### Endpoints Detail

#### POST `/upload/presigned-url`
**Purpose**: Generate presigned S3 URL for file upload

**Authentication**: Required

**Request Body**:
```json
{
  "fileName": "my-resume.pdf",
  "fileType": "application/pdf",
  "fileSize": 2048576, // bytes (max 100MB)
  "uploadType": "va_portfolio" | "va_resume" | "va_video" | "company_logo" | "profile_picture",
  "category": "Web Development", // optional
  "description": "Portfolio item" // optional
}
```

**Allowed File Types by Upload Type**:
- `va_portfolio`: images (jpeg, png, gif, webp), pdf, docs, videos, html, css, js
- `va_resume`: pdf, doc, docx
- `va_video`: mp4, mov, avi, webm
- `company_logo`: jpeg, png, svg, webp
- `profile_picture`: jpeg, png, webp, gif

**Max File Sizes**:
- `va_portfolio`: 100MB
- `va_resume`: 10MB
- `va_video`: 500MB
- `company_logo`: 5MB
- `profile_picture`: 5MB

**Response**:
```json
{
  "success": true,
  "data": {
    "presignedUrl": "https://s3.amazonaws.com/bucket/key?presigned=...",
    "fileKey": "user_id/upload_type/timestamp_filename",
    "fileUrl": "https://bucket.s3.amazonaws.com/user_id/upload_type/timestamp_filename",
    "expiresIn": 3600, // seconds
    "maxSize": 104857600 // bytes
  }
}
```

**Note**: Presigned URL expires in 1 hour

**Frontend Usage**: ❌ Not used

---

#### POST `/upload/confirm`
**Purpose**: Confirm upload completion after S3 upload

**Authentication**: Required

**Request Body**:
```json
{
  "key": "user_id/upload_type/timestamp_filename",
  "bucket": "bucket-name",
  "etag": "d41d8cd98f00b204e9800998ecf8427e"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "key": "user_id/upload_type/timestamp_filename",
    "bucket": "bucket-name",
    "etag": "d41d8cd98f00b204e9800998ecf8427e",
    "uploadedAt": "2024-01-15T10:00:00Z",
    "processed": true
  },
  "message": "Upload confirmed and processed successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### GET `/upload/status/:uploadId`
**Purpose**: Get upload status

**Authentication**: Required

**Path Parameters**:
- `uploadId`: Upload ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "upload_id",
    "userId": "user_id",
    "status": "completed",
    "createdAt": "2024-01-15T10:00:00Z",
    "fileSize": 2048576,
    "fileType": "application/pdf"
  }
}
```

**Frontend Usage**: ❌ Not used

---

#### DELETE `/upload/:fileKey`
**Purpose**: Delete uploaded file

**Authentication**: Required

**Path Parameters**:
- `fileKey`: S3 file key

**Response**:
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Frontend Usage**: ❌ Not used

---

#### GET `/uploads`
**Purpose**: Get user's uploaded files

**Authentication**: Required

**Query Parameters**:
- `uploadType`: Filter by upload type
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page

**Response**:
```json
{
  "success": true,
  "data": {
    "uploads": [
      {
        "id": "upload_1",
        "userId": "user_id",
        "fileKey": "user_id/va_portfolio/timestamp_sample_project.pdf",
        "uploadType": "va_portfolio",
        "fileName": "sample_project.pdf",
        "fileSize": 2048576,
        "fileType": "application/pdf",
        "status": "completed",
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Note**: Returns mock data for MVP

**Frontend Usage**: ❌ Not used

---

#### POST `/upload/process`
**Purpose**: Process uploaded file (thumbnail, optimize, extract)

**Authentication**: Required

**Request Body**:
```json
{
  "fileKey": "user_id/upload_type/timestamp_filename",
  "processingType": "thumbnail" | "optimize" | "extract"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "fileUrl": "https://bucket.s3.amazonaws.com/user_id/upload_type/timestamp_filename",
    "processingType": "thumbnail",
    "processed": true,
    "thumbnailUrl": "https://bucket.s3.amazonaws.com/user_id/upload_type/timestamp_filename?thumbnail=300x300",
    "optimizedUrl": null
  },
  "message": "File processed successfully"
}
```

**Frontend Usage**: ❌ Not used

---

## Browse & Discovery

### Route File: `/backend/src/routes/vaBrowse.ts`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/va/subcategories` | ✅ Yes | Get subcategories for vertical |
| GET | `/va/profiles/list` | ✅ Yes | Browse VAs with filtering |

### Endpoints Detail

#### GET `/va/subcategories`
**Purpose**: Get available subcategories for a vertical

**Authentication**: Required

**Query Parameters**:
- `vertical`: "technical" | "operations" | "creatives"

**Response**:
```json
{
  "success": true,
  "data": {
    "vertical": "technical",
    "subcategories": [
      "Programming",
      "DevOps",
      "Tech Support",
      "Data Science",
      "Quality Assurance",
      "Security",
      "Database Administration",
      "Mobile Development",
      "Web Development",
      "Cloud Computing",
      "Network Engineering",
      "System Administration",
      "API Development",
      "Machine Learning",
      "AI Engineering",
      "Blockchain",
      "Game Development",
      "Embedded Systems",
      "UI/UX Design",
      "Testing"
    ]
  }
}
```

**Available Verticals & Subcategories**:

**Technical**:
- Programming, DevOps, Tech Support, Data Science, Quality Assurance, Security, Database Administration, Mobile Development, Web Development, Cloud Computing, Network Engineering, System Administration, API Development, Machine Learning, AI Engineering, Blockchain, Game Development, Embedded Systems, UI/UX Design, Testing

**Operations**:
- Virtual Assistance, Admin Support, Customer Service, Project Management, Bookkeeping, Data Entry, Executive Assistant, Personal Assistant, Research Assistant, Scheduling, Email Management, Calendar Management, Document Preparation, HR Support, Operations, Logistics, Virtual Receptionist, Transcription, Translation, Customer Onboarding

**Creatives**:
- Design, Content Writing, Marketing, Social Media, Branding, Animation, Video Editing, Graphic Design, Copywriting, SEO, Photography, Illustration, Voice Over, Audio Production, Podcast Production, 3D Modeling, Motion Graphics, Brand Strategy

**Frontend Usage**: ❌ Not used

---

#### GET `/va/profiles/list`
**Purpose**: Browse VAs with advanced filtering

**Authentication**: Required (Employer/Company role)

**Query Parameters**:
- `vertical`: Filter by vertical (technical, operations, creatives)
- `subcategories`: Comma-separated subcategories
- `search`: Search in name, bio, skills
- `skills`: Comma-separated skills
- `minRate`: Minimum hourly rate
- `maxRate`: Maximum hourly rate
- `country`: Filter by country
- `availability`: "true" | "false"
- `verificationLevel`: "basic" | "professional" | "premium"
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `sortBy`: "rating" | "rate_low" | "rate_high" | "experience" | "recent" (default: "rating")

**Response**:
```json
{
  "success": true,
  "data": {
    "vaProfiles": [
      {
        "id": "va_profile_id",
        "userId": "user_id",
        "name": "John Doe",
        "bio": "Experienced virtual assistant...",
        "country": "Philippines",
        "hourlyRate": 15,
        "skills": ["Virtual Assistance", "Admin Support", "Communication"],
        "availability": true,
        "vertical": "operations",
        "subcategories": ["Virtual Assistance", "Admin Support"],
        "languages": [
          {
            "code": "en",
            "level": "native"
          }
        ],
        "responseRate": 95,
        "averageRating": 4.8,
        "totalReviews": 25,
        "featuredProfile": true,
        "earnedAmount": 5000.50,
        "completedJobs": 15,
        "avatarUrl": "https://s3.../avatar.jpg",
        "user": {
          "email": "va@example.com"
        },
        "portfolioItems": [...],
        "skillsAssessments": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**Frontend Usage**: ✅ Used in `/employer/dashboard` page

---

### Route File: `/backend/src/routes/companiesBrowse.ts`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/companies/list` | ✅ Yes | Browse companies with filtering |

### Endpoints Detail

#### GET `/companies/list`
**Purpose**: Browse companies with filtering

**Authentication**: Required (VA role only)

**Query Parameters**:
- `search`: Search in name, bio, industry
- `industry`: Filter by industry
- `companySize`: "1-10" | "11-50" | "51-200" | "201+"
- `minSpent`: Minimum amount spent
- `maxSpent`: Maximum amount spent
- `verificationLevel`: "basic" | "professional" | "premium"
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `sortBy`: "spent" | "size" | "recent" | "jobs" (default: "spent")

**Response**:
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "company_id",
        "userId": "user_id",
        "name": "ABC Corporation",
        "bio": "Leading tech company...",
        "country": "United States",
        "website": "https://abc-corp.com",
        "logoUrl": "https://s3.../logo.png",
        "industry": "Technology",
        "companySize": "11-50",
        "foundedYear": 2010,
        "description": "Full company description...",
        "mission": "To innovate...",
        "values": ["Innovation", "Excellence"],
        "benefits": ["Health Insurance", "Remote Work"],
        "verificationLevel": "professional",
        "featuredCompany": true,
        "socialLinks": { ... },
        "techStack": ["React", "Node.js"],
        "totalSpent": 15000.75,
        "user": {
          "email": "company@abc-corp.com"
        },
        "jobPostings": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

**Frontend Usage**: ❌ Not used

---

## Health Checks

### Route File: `/backend/src/routes/health.ts`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/health` | ❌ No | Health check endpoint |
| GET | `/api/health` | ❌ No | Health check with /api prefix |

### Endpoints Detail

#### GET `/health` & `/api/health`
**Purpose**: Server health check

**Authentication**: Not required

**Response**:
```json
{
  "ok": true,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Frontend Usage**: ❌ Not used

---

## Duplicate/Conflicting Routes

### ❌ **CRITICAL DUPLICATE ROUTES FOUND**

#### 1. Company Profile CRUD Duplication

**Conflict**: Both `company.ts` and `companyProfiles.ts` define identical routes

| Route | File 1 | File 2 | Registered? |
|-------|---------|---------|-------------|
| GET `/company/profile` | ✅ `company.ts` | ✅ `companyProfiles.ts` | **company.ts only** |
| POST `/company/profile` | ✅ `company.ts` | ✅ `companyProfiles.ts` | **company.ts only** |
| PUT `/company/profile` | ✅ `company.ts` | ✅ `companyProfiles.ts` | **company.ts only** |
| DELETE `/company/profile` | ❌ `company.ts` | ✅ `companyProfiles.ts` | **companyProfiles.ts only** |
| GET `/company/profiles/:id` | ❌ `company.ts` | ✅ `companyProfiles.ts` | **NOT REGISTERED** |
| GET `/company/profiles` | ❌ `company.ts` | ✅ `companyProfiles.ts` | **NOT REGISTERED** |

**Issue**: `companyProfiles.ts` is NOT registered in `server.ts`, so its routes are unavailable

**Recommendation**: Merge or choose one implementation:
- Use `company.ts` for simplified MVP routes
- Use `companyProfiles.ts` if you need public profile browsing and additional routes

---

#### 2. VA Profile CRUD Duplication

**Conflict**: Both `va.ts` and `vaProfiles.ts` define similar routes

| Route | File 1 | File 2 | Registered? |
|-------|---------|---------|-------------|
| GET `/va/profile` | ✅ `va.ts` | ❌ `vaProfiles.ts` | **va.ts only** |
| POST `/va/profile` | ✅ `va.ts` | ❌ `vaProfiles.ts` | **va.ts only** |
| PUT `/va/profile` | ✅ `va.ts` | ❌ `vaProfiles.ts` | **va.ts only** |
| DELETE `/va/profile` | ❌ `va.ts` | ✅ `vaProfiles.ts` | **vaProfiles.ts only** |
| GET `/va/profiles/:id` | ❌ `va.ts` | ✅ `vaProfiles.ts` | **NOT REGISTERED** |
| GET `/va/profiles` | ❌ `va.ts` | ✅ `vaProfiles.ts` | **NOT REGISTERED** |

**Issue**: `vaProfiles.ts` is NOT registered in `server.ts`, so its routes are unavailable

**Recommendation**: Merge or choose one implementation:
- Use `va.ts` for simplified MVP routes
- Use `vaProfiles.ts` if you need public profile browsing and delete functionality

---

#### 3. Unregistered Route Files

**Files NOT registered in `server.ts`**:
- ❌ `/backend/src/routes/vaProfiles.ts` - Additional VA profile routes
- ❌ `/backend/src/routes/companyProfiles.ts` - Additional company profile routes
- ❌ `/backend/src/routes/user.routes.ts` - Example SoC routes (demo only)

**Note**: These routes exist but are NOT accessible

---

## Mock vs Working Implementations

### ✅ **FULLY WORKING (Database Operations)**

| Feature | Endpoints | Implementation |
|---------|-----------|----------------|
| VA Profile CRUD | `/va/*` | ✅ Full Prisma database operations |
| Company Profile CRUD | `/company/*` | ✅ Full Prisma database operations |
| Job Marketplace | `/jobs/marketplace/*` | ✅ Full Prisma database operations |
| Contracts CRUD | `/contracts/*` | ✅ Full Prisma database operations |
| Milestones CRUD | `/contracts/*/milestones`, `/milestones/:id` | ✅ Full Prisma database operations |
| Timesheets CRUD | `/contracts/*/timesheets`, `/timesheets/:id` | ✅ Full Prisma database operations |
| Chat/Messaging | `/chat/*` | ✅ Full Prisma database operations (via Notification model) |
| Browse VAs | `/va/profiles/list`, `/va/subcategories` | ✅ Full Prisma database operations |
| Browse Companies | `/companies/list` | ✅ Full Prisma database operations |

---

### ⚠️ **PARTIALLY WORKING (Mock Data)**

| Feature | Endpoints | Mock Parts |
|---------|-----------|-----------|
| File Upload | `/upload/*` | ⚠️ Presigned URL generation, S3 upload, confirmation all mocked |
| User Uploads | `/uploads` | ⚠️ Returns mock data |
| VA Analytics | `/va/analytics` | ⚠️ Analytics trends are mocked (real profile data) |
| Company Analytics | `/company/analytics` | ⚠️ Analytics trends are mocked (real profile data) |
| Skills Assessment | `/va/skills-assessment` | ⚠️ Score is randomly generated (60-100) |

---

### ❌ **MOCK ONLY (No Real Implementation)**

| Feature | Endpoints | Status |
|---------|-----------|--------|
| Stripe Payment Intent | `/payments/intent` | ❌ Mock Stripe integration |
| Stripe Payment Verification | `/payments/confirm` | ❌ Mock Stripe integration |
| Stripe Refund | `/payments/refund` | ❌ Mock Stripe integration |
| Payment Disputes | `/payments/disputes` | ❌ Mock implementation (console logging) |
| Invoice Creation | `/payments/invoices` | ✅ Creates database record, but no actual invoice PDF/generation |

---

### ✅ **FULLY WORKING (External Services)**

| Feature | Endpoints | Implementation |
|---------|-----------|----------------|
| Firebase Auth | `/auth/*` | ✅ Full Firebase Admin SDK integration |
| Firebase Password Reset | `/auth/forgot-password` | ✅ Uses Firebase Admin SDK |

---

## Frontend Usage Analysis

### ✅ **ENDPOINTS ACTUALLY USED BY FRONTEND**

| Endpoint | Used In | Notes |
|----------|----------|-------|
| `/api/auth/sync` | ✅ `EnhancedAuthForm.tsx`, `SimpleAuthForm.tsx` | Via Next.js API route `/api/auth/sync` |
| `/api/auth/forgot-password` | ✅ `forgot-password/page.tsx` | Via Next.js API route `/api/auth/forgot-password` |
| `/api/va/profile` | ✅ `va/dashboard/page.tsx` | Direct API call |
| `/api/va/profiles/search` | ✅ `employer/dashboard/page.tsx` | ❌ **This endpoint does not exist in backend** |
| `/api/va/profiles/:id` | ✅ `va/profiles/[id]/page.tsx` | ❌ **This endpoint does not exist in backend** |
| `/api/va/profiles/:id/save` | ✅ `va/profiles/[id]/page.tsx` | ❌ **This endpoint does not exist in backend** |
| `/api/messages/send` | ✅ `va/profiles/[id]/page.tsx` | ❌ **This endpoint does not exist in backend** |
| `/api/va/profile` (POST) | ✅ `va/profile/create/page.tsx` | Direct API call |
| `/api/auth/me` | ✅ `va/profile/create/page.tsx` | ❌ **This endpoint does not exist in backend** |

---

### ❌ **FRONTEND CALLING NON-EXISTENT BACKEND ENDPOINTS**

| Frontend Call | Expected Backend | Status | Solution |
|--------------|------------------|---------|----------|
| `/api/va/profiles/search?...` | ❌ Not found | **BROKEN** | Use `/api/va/profiles/list` |
| `/api/va/profiles/:id` | ❌ Not found | **BROKEN** | Route exists in `vaProfiles.ts` but not registered |
| `/api/va/profiles/:id/save` | ❌ Not found | **BROKEN** | Endpoint doesn't exist - needs to be implemented |
| `/api/messages/send` | ❌ Not found | **BROKEN** | Use `/api/chat/send-message` |
| `/api/auth/me` | ❌ Not found | **BROKEN** | Use `/api/auth/profile` |

---

### ❌ **BACKEND ENDPOINTS NOT USED BY FRONTEND**

| Feature | Unused Endpoints |
|---------|-----------------|
| All Job Marketplace endpoints | `/jobs/marketplace/*` |
| All Contracts endpoints | `/contracts/*` |
| All Payments endpoints | `/payments/*` |
| All Chat endpoints | `/chat/*` |
| All Upload endpoints | `/upload/*` |
| Browse VAs with filters | `/va/subcategories` |
| Browse Companies | `/companies/list` |
| VA Profile updates | `PUT /va/profile` |
| Company Profile updates | `PUT /company/profile` |
| Portfolio/Resume/Video uploads | `/va/upload-*` |
| Skills assessments | `/va/skills-assessment*` |
| Verification requests | `/va/verification`, `/company/verification` |
| Analytics | `/va/analytics`, `/company/analytics` |
| Invoices | `/payments/invoices` |

---

## Missing Critical Endpoints

### ❌ **HIGH PRIORITY - User Flow Blockers**

#### 1. User Profile Management
```
GET /api/auth/me - Get current user (frontend expects this, doesn't exist)
GET /api/users/:id - Get public user profile
PUT /api/users/:id - Update user account
DELETE /api/users/:id - Delete user account
POST /api/users/change-password - Change password
POST /api/users/change-email - Change email
```

#### 2. Saved/Bookmarked VAs
```
POST /api/va/profiles/:id/save - Save/bookmark VA (frontend calls this)
DELETE /api/va/profiles/:id/save - Unsave VA
GET /api/va/saved - Get saved VAs
```

#### 3. Reviews & Ratings
```
POST /api/reviews - Create review (contractor to worker or vice versa)
GET /api/reviews/:id - Get review
GET /api/reviews/:userId - Get user's reviews
PUT /api/reviews/:id - Update review
DELETE /api/reviews/:id - Delete review
```

#### 4. Notifications
```
GET /api/notifications - Get user notifications
PUT /api/notifications/:id/read - Mark notification as read
PUT /api/notifications/read-all - Mark all as read
DELETE /api/notifications/:id - Delete notification
```

#### 5. Search Functionality
```
GET /api/search - Global search endpoint
GET /api/search/va - Search VAs
GET /api/search/jobs - Search jobs
GET /api/search/companies - Search companies
```

---

### ⚠️ **MEDIUM PRIORITY - Enhanced Features**

#### 6. Badges & Achievements
```
GET /api/va/badges - Get VA badges
POST /api/va/badges/:id/claim - Claim badge
GET /api/badges - Get all available badges
```

#### 7. Dashboard Widgets
```
GET /api/dashboard/stats - Dashboard statistics
GET /api/dashboard/recent-activity - Recent activity feed
GET /api/dashboard/recommendations - Personalized recommendations
```

#### 8. Messaging Enhancements
```
GET /api/chat/conversations - Get all conversations
GET /api/chat/conversations/:id - Get conversation messages
POST /api/chat/conversations/:id/messages - Send message to conversation
DELETE /api/chat/conversations/:id - Delete conversation
```

#### 9. Contract Templates
```
GET /api/contract-templates - Get available contract templates
POST /api/contract-templates - Create custom template
GET /api/contract-templates/:id - Get template details
```

#### 10. Reporting & Analytics
```
GET /api/analytics/user - Detailed user analytics
GET /api/analytics/platform - Platform-wide analytics (admin)
POST /api/reports - Generate report
GET /api/reports/:id - Get report status
```

---

### 💡 **LOW PRIORITY - Nice to Have**

#### 11. Referral System
```
POST /api/referrals - Create referral
GET /api/referrals - Get user's referrals
GET /api/referrals/stats - Referral statistics
```

#### 12. Favorites & Bookmarks
```
POST /api/favorites - Add favorite
GET /api/favorites - Get user's favorites
DELETE /api/favorites/:id - Remove favorite
```

#### 13. Advanced Filtering
```
GET /api/jobs/saved - Get saved jobs
GET /api/va/saved - Get saved VAs
POST /api/jobs/:id/save - Save job
POST /api/va/:id/save - Save VA
```

#### 14. WebSocket Endpoints (Real-time)
```
WS /api/ws - WebSocket connection
WS /api/ws/chat - Chat WebSocket
WS /api/ws/notifications - Notification WebSocket
```

#### 15. Admin Endpoints
```
GET /api/admin/users - Get all users
PUT /api/admin/users/:id - Update user (admin)
DELETE /api/admin/users/:id - Delete user (admin)
GET /api/admin/reports - Get system reports
POST /api/admin/announcements - Create platform announcement
```

---

## API Endpoint Summary

### Total Endpoints: **83**

**By Status**:
- ✅ Working: 65 endpoints (78%)
- ⚠️ Partially Working: 8 endpoints (10%)
- ❌ Mock Only: 10 endpoints (12%)

**By Feature Area**:
- Authentication: 6 endpoints
- VA Profiles: 10 endpoints
- Company Profiles: 6 endpoints
- Job Marketplace: 10 endpoints
- Contracts: 12 endpoints
- Payments: 8 endpoints
- Chat: 5 endpoints
- Upload: 6 endpoints
- Browse/Discovery: 3 endpoints
- Health: 2 endpoints
- Unregistered: 15 endpoints (not available)

**By Authentication**:
- Public: 8 endpoints
- Authenticated: 75 endpoints

**By Method**:
- GET: 31 endpoints (37%)
- POST: 36 endpoints (43%)
- PUT: 11 endpoints (13%)
- DELETE: 5 endpoints (7%)

---

## Recommendations

### 🚨 **IMMEDIATE ACTIONS REQUIRED**

1. **Fix Frontend-Backend Mismatch**
   - Implement missing endpoints: `/api/auth/me`, `/api/va/profiles/:id`, `/api/va/profiles/search`, `/api/messages/send`
   - Update frontend to use correct endpoints: `/api/chat/send-message` instead of `/api/messages/send`

2. **Resolve Route Conflicts**
   - Register `vaProfiles.ts` and `companyProfiles.ts` OR remove unused files
   - Merge duplicate routes or choose single implementation

3. **Implement Critical Missing Endpoints**
   - Save/bookmark VAs functionality
   - Reviews & ratings system
   - Notifications management

4. **Add Real Stripe Integration**
   - Replace mock Stripe payment functions with actual Stripe SDK
   - Implement webhooks for payment confirmation

### 📋 **SHORT TERM (Next Sprint)**

1. Implement Search functionality endpoints
2. Add WebSocket support for real-time features
3. Implement Badges & Achievements system
4. Add Dashboard widgets endpoints

### 🎯 **MEDIUM TERM**

1. Complete File Upload with real S3 integration
2. Implement Referral system
3. Add advanced filtering and saved searches
4. Implement Admin endpoints

---

## Document Metadata

- **Generated**: January 15, 2024
- **Backend Version**: Fastify 5.6.0
- **Frontend Version**: Next.js 16.0.7
- **Database**: PostgreSQL 15 with Prisma ORM
- **Total Routes Analyzed**: 14 route files
- **Total Endpoints Documented**: 83
- **Working Endpoints**: 65 (78%)
- **Mock Endpoints**: 18 (22%)

---

## Appendix: Route File Registration Status

| Route File | Registered | Endpoints | Status |
|-------------|------------|-----------|--------|
| `auth.ts` | ✅ Yes | 6 | ✅ Working |
| `va.ts` | ✅ Yes | 10 | ✅ Working |
| `company.ts` | ✅ Yes | 6 | ✅ Working |
| `jobMarketplace.ts` | ✅ Yes | 10 | ✅ Working |
| `contracts.ts` | ✅ Yes | 12 | ✅ Working |
| `payments.ts` | ✅ Yes | 8 | ⚠️ Mock Stripe |
| `chat-final-fix.ts` | ✅ Yes | 5 | ✅ Working |
| `upload.ts` | ✅ Yes | 6 | ⚠️ Mock S3 |
| `health.ts` | ✅ Yes | 2 | ✅ Working |
| `vaBrowse.ts` | ✅ Yes | 2 | ✅ Working |
| `companiesBrowse.ts` | ✅ Yes | 1 | ✅ Working |
| `vaProfiles.ts` | ❌ No | 5 | ❌ Unavailable |
| `companyProfiles.ts` | ❌ No | 6 | ❌ Unavailable |
| `user.routes.ts` | ❌ No | 3 | ❌ Demo Only |

**Note**: Unregistered routes exist in codebase but are NOT accessible via API
