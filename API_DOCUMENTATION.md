# 📚 BlytzHire API Documentation

## **🔑 Authentication**

All API endpoints require authentication using Firebase Auth tokens.

**Headers:**
```http
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Get Firebase Token:**
```javascript
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
```

---

## **👥 User Management APIs**

### **User Authentication**

#### **POST /api/auth/login**
Authenticate user and get user data.

**Request Body:**
```json
{
  "token": "firebase_id_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "company|va|admin",
      "profileComplete": true,
      "lastSeenAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Login successful"
}
```

#### **GET /api/auth/profile**
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "company|va|admin",
    "profileComplete": true,
    "lastSeenAt": "2024-01-01T00:00:00.000Z",
    "preferences": {
      "notifications": true,
      "timezone": "UTC"
    }
  }
}
```

#### **PUT /api/auth/profile**
Update current user profile.

**Request Body:**
```json
{
  "preferences": {
    "notifications": true,
    "timezone": "America/New_York"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "company|va|admin",
    "preferences": {
      "notifications": true,
      "timezone": "America/New_York"
    }
  },
  "message": "Profile updated successfully"
}
```

---

## **🏢 Company Profile APIs**

### **Company Profile Management**

#### **POST /api/company/profile**
Create company profile.

**Request Body:**
```json
{
  "name": "Tech Corp",
  "bio": "Leading technology company",
  "country": "United States",
  "website": "https://techcorp.com",
  "logoUrl": "https://example.com/logo.png",
  "industry": "technology",
  "companySize": "51-200",
  "foundedYear": 2010,
  "description": "We build innovative solutions",
  "mission": "To transform technology",
  "values": ["innovation", "excellence"],
  "benefits": ["health insurance", "remote work"],
  "email": "contact@techcorp.com",
  "phone": "+1-555-0123",
  "socialLinks": {
    "linkedin": "https://linkedin.com/company/techcorp",
    "twitter": "https://twitter.com/techcorp"
  },
  "techStack": ["React", "Node.js", "AWS"],
  "verificationLevel": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "company_id",
    "userId": "user_id",
    "name": "Tech Corp",
    "bio": "Leading technology company",
    "country": "United States",
    "website": "https://techcorp.com",
    "logoUrl": "https://example.com/logo.png",
    "industry": "technology",
    "companySize": "51-200",
    "foundedYear": 2010,
    "description": "We build innovative solutions",
    "mission": "To transform technology",
    "values": ["innovation", "excellence"],
    "benefits": ["health insurance", "remote work"],
    "email": "contact@techcorp.com",
    "phone": "+1-555-0123",
    "verificationLevel": "professional",
    "backgroundCheckPassed": false,
    "featuredCompany": false,
    "socialLinks": {
      "linkedin": "https://linkedin.com/company/techcorp",
      "twitter": "https://twitter.com/techcorp"
    },
    "techStack": ["React", "Node.js", "AWS"],
    "totalSpent": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Company profile created successfully"
}
```

#### **GET /api/company/profile**
Get company profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "company_id",
    "userId": "user_id",
    "name": "Tech Corp",
    "bio": "Leading technology company",
    "country": "United States",
    "website": "https://techcorp.com",
    "logoUrl": "https://example.com/logo.png",
    "industry": "technology",
    "companySize": "51-200",
    "foundedYear": 2010,
    "description": "We build innovative solutions",
    "mission": "To transform technology",
    "values": ["innovation", "excellence"],
    "benefits": ["health insurance", "remote work"],
    "verificationLevel": "professional",
    "featuredCompany": false,
    "totalSpent": 15000.00,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### **PUT /api/company/profile**
Update company profile.

**Request Body:**
```json
{
  "name": "Updated Tech Corp",
  "bio": "Updated bio",
  "website": "https://updated-techcorp.com",
  "industry": "software",
  "companySize": "201+"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "company_id",
    "name": "Updated Tech Corp",
    "bio": "Updated bio",
    "website": "https://updated-techcorp.com",
    "industry": "software",
    "companySize": "201+",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Company profile updated successfully"
}
```

#### **DELETE /api/company/profile**
Delete company profile.

**Response:**
```json
{
  "success": true,
  "message": "Company profile deleted successfully"
}
```

---

## **👤 VA Profile APIs**

### **VA Profile Management**

#### **POST /api/va/profile**
Create VA profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Experienced full-stack developer",
  "country": "United States",
  "hourlyRate": 75,
  "skills": ["React", "Node.js", "TypeScript", "AWS"],
  "availability": true,
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "timezone": "America/New_York",
  "languages": [
    {
      "code": "en",
      "level": "fluent"
    },
    {
      "code": "es",
      "level": "intermediate"
    }
  ],
  "workExperience": [
    {
      "company": "Tech Company",
      "years": 5,
      "role": "Senior Developer"
    }
  ],
  "education": [
    {
      "institution": "University",
      "degree": "BS Computer Science"
    }
  ],
  "responseRate": 95.5,
  "averageRating": 4.8,
  "totalReviews": 50,
  "resumeUrl": "https://example.com/resume.pdf",
  "videoIntroUrl": "https://example.com/intro.mp4",
  "skillsScore": 85,
  "verificationLevel": "professional",
  "backgroundCheckPassed": true,
  "featuredProfile": false,
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "va_profile_id",
    "userId": "user_id",
    "name": "John Doe",
    "bio": "Experienced full-stack developer",
    "country": "United States",
    "hourlyRate": 75,
    "skills": ["React", "Node.js", "TypeScript", "AWS"],
    "availability": true,
    "languages": [
      {
        "code": "en",
        "level": "fluent"
      }
    ],
    "workExperience": [
      {
        "company": "Tech Company",
        "years": 5,
        "role": "Senior Developer"
      }
    ],
    "education": [
      {
        "institution": "University",
        "degree": "BS Computer Science"
      }
    ],
    "responseRate": 95.5,
    "averageRating": 4.8,
    "totalReviews": 50,
    "featuredProfile": false,
    "profileViews": 0,
    "skillsScore": 85,
    "verificationLevel": "professional",
    "backgroundCheckPassed": true,
    "featured": false,
    "earnedAmount": 0.00,
    "completedJobs": 0,
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "VA profile created successfully"
}
```

#### **GET /api/va/profile**
Get VA profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "va_profile_id",
    "userId": "user_id",
    "name": "John Doe",
    "bio": "Experienced full-stack developer",
    "country": "United States",
    "hourlyRate": 75,
    "skills": ["React", "Node.js", "TypeScript", "AWS"],
    "availability": true,
    "languages": [
      {
        "code": "en",
        "level": "fluent"
      }
    ],
    "workExperience": [
      {
        "company": "Tech Company",
        "years": 5,
        "role": "Senior Developer"
      }
    ],
    "education": [
      {
        "institution": "University",
        "degree": "BS Computer Science"
      }
    ],
    "responseRate": 95.5,
    "averageRating": 4.8,
    "totalReviews": 50,
    "featuredProfile": false,
    "profileViews": 125,
    "skillsScore": 85,
    "verificationLevel": "professional",
    "backgroundCheckPassed": true,
    "featured": false,
    "earnedAmount": 15000.00,
    "completedJobs": 25,
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### **PUT /api/va/profile**
Update VA profile.

**Request Body:**
```json
{
  "name": "John Updated",
  "bio": "Updated bio",
  "hourlyRate": 85,
  "skills": ["React", "Node.js", "TypeScript", "AWS", "Python"],
  "availability": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "va_profile_id",
    "name": "John Updated",
    "bio": "Updated bio",
    "hourlyRate": 85,
    "skills": ["React", "Node.js", "TypeScript", "AWS", "Python"],
    "availability": false,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "VA profile updated successfully"
}
```

#### **DELETE /api/va/profile**
Delete VA profile.

**Response:**
```json
{
  "success": true,
  "message": "VA profile deleted successfully"
}
```

#### **GET /api/va/profiles/:id**
Get VA profile by ID (public view).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "va_profile_id",
    "name": "John Doe",
    "bio": "Experienced full-stack developer",
    "country": "United States",
    "hourlyRate": 75,
    "skills": ["React", "Node.js", "TypeScript", "AWS"],
    "availability": true,
    "responseRate": 95.5,
    "averageRating": 4.8,
    "totalReviews": 50,
    "featuredProfile": false,
    "featured": false,
    "earnedAmount": 15000.00,
    "completedJobs": 25,
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

#### **GET /api/va/profiles**
List VA profiles with filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `skills` (string, comma-separated)
- `country` (string)
- `minRate` (number)
- `maxRate` (number)
- `available` (boolean)
- `search` (string)

**Example Request:**
```
GET /api/va/profiles?skills=React,Node.js&country=United States&minRate=50&maxRate=100&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vaProfiles": [
      {
        "id": "va_profile_id",
        "name": "John Doe",
        "bio": "Experienced full-stack developer",
        "country": "United States",
        "hourlyRate": 75,
        "skills": ["React", "Node.js", "TypeScript", "AWS"],
        "availability": true,
        "responseRate": 95.5,
        "averageRating": 4.8,
        "totalReviews": 50,
        "featuredProfile": false,
        "featured": false,
        "earnedAmount": 15000.00,
        "completedJobs": 25,
        "avatarUrl": "https://example.com/avatar.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

## **💼 Job Marketplace APIs**

### **Job Posting Management**

#### **POST /api/jobs/marketplace**
Create job posting.

**Request Body:**
```json
{
  "title": "Senior React Developer",
  "description": "We need an experienced React developer",
  "requirements": [
    "5+ years React experience",
    "TypeScript knowledge",
    "AWS experience"
  ],
  "responsibilities": [
    "Develop React applications",
    "Code reviews",
    "Mentoring junior developers"
  ],
  "benefits": [
    "Remote work",
    "Health insurance",
    "Flexible hours"
  ],
  "rateRange": "$50-$100/hour",
  "budget": 5000,
  "location": "Remote",
  "remote": true,
  "category": "development",
  "tags": ["react", "typescript", "aws"],
  "experienceLevel": "senior",
  "employmentType": "freelance",
  "jobType": "hourly",
  "duration": "3-6 months",
  "urgency": "high",
  "skillsRequired": ["React", "TypeScript", "AWS", "Node.js"],
  "toolsUsed": ["Git", "Jira", "VS Code"],
  "teamSize": 5,
  "reportingTo": "Engineering Manager",
  "travelRequired": "none",
  "workSchedule": {
    "timezone": "America/New_York",
    "hours": "9am-5pm EST",
    "flexibility": "core hours only"
  },
  "featured": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job_posting_id",
    "companyId": "company_id",
    "title": "Senior React Developer",
    "description": "We need an experienced React developer",
    "requirements": [
      "5+ years React experience",
      "TypeScript knowledge",
      "AWS experience"
    ],
    "responsibilities": [
      "Develop React applications",
      "Code reviews",
      "Mentoring junior developers"
    ],
    "benefits": [
      "Remote work",
      "Health insurance",
      "Flexible hours"
    ],
    "rateRange": "$50-$100/hour",
    "budget": 5000,
    "location": "Remote",
    "remote": true,
    "category": "development",
    "tags": ["react", "typescript", "aws"],
    "experienceLevel": "senior",
    "employmentType": "freelance",
    "jobType": "hourly",
    "duration": "3-6 months",
    "urgency": "high",
    "skillsRequired": ["React", "TypeScript", "AWS", "Node.js"],
    "toolsUsed": ["Git", "Jira", "VS Code"],
    "teamSize": 5,
    "reportingTo": "Engineering Manager",
    "travelRequired": "none",
    "workSchedule": {
      "timezone": "America/New_York",
      "hours": "9am-5pm EST",
      "flexibility": "core hours only"
    },
    "featured": true,
    "status": "open",
    "views": 0,
    "proposals": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Job posting created successfully"
}
```

#### **GET /api/jobs/marketplace**
Get job listings with filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string)
- `category` (string)
- `jobType` (string: "fixed" | "hourly")
- `experienceLevel` (string: "entry" | "mid" | "senior" | "executive")
- `skills` (string, comma-separated)
- `budgetRange` (string: "min-max")
- `duration` (string)
- `urgent` (boolean)
- `featured` (boolean)
- `status` (string, default: "open")

**Example Request:**
```
GET /api/jobs/marketplace?category=development&jobType=hourly&experienceLevel=senior&featured=true&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_posting_id",
        "title": "Senior React Developer",
        "description": "We need an experienced React developer",
        "category": "development",
        "tags": ["react", "typescript", "aws"],
        "experienceLevel": "senior",
        "jobType": "hourly",
        "duration": "3-6 months",
        "urgency": "high",
        "featured": true,
        "status": "open",
        "views": 150,
        "proposals": 12,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "company": {
          "id": "company_id",
          "name": "Tech Corp",
          "logoUrl": "https://example.com/logo.png",
          "country": "United States",
          "verificationLevel": "professional",
          "totalReviews": 25
        },
        "_count": {
          "proposals": 12
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

#### **GET /api/jobs/marketplace/:id**
Get single job posting.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job_posting_id",
    "title": "Senior React Developer",
    "description": "We need an experienced React developer",
    "requirements": [
      "5+ years React experience",
      "TypeScript knowledge",
      "AWS experience"
    ],
    "responsibilities": [
      "Develop React applications",
      "Code reviews",
      "Mentoring junior developers"
    ],
    "benefits": [
      "Remote work",
      "Health insurance",
      "Flexible hours"
    ],
    "rateRange": "$50-$100/hour",
    "budget": 5000,
    "location": "Remote",
    "remote": true,
    "category": "development",
    "tags": ["react", "typescript", "aws"],
    "experienceLevel": "senior",
    "employmentType": "freelance",
    "jobType": "hourly",
    "duration": "3-6 months",
    "urgency": "high",
    "skillsRequired": ["React", "TypeScript", "AWS", "Node.js"],
    "toolsUsed": ["Git", "Jira", "VS Code"],
    "teamSize": 5,
    "reportingTo": "Engineering Manager",
    "travelRequired": "none",
    "workSchedule": {
      "timezone": "America/New_York",
      "hours": "9am-5pm EST",
      "flexibility": "core hours only"
    },
    "featured": true,
    "status": "open",
    "views": 150,
    "proposals": 12,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "company": {
      "id": "company_id",
      "name": "Tech Corp",
      "logoUrl": "https://example.com/logo.png",
      "country": "United States",
      "verificationLevel": "professional",
      "totalReviews": 25,
      "description": "Leading technology company",
      "foundedYear": 2010,
      "companySize": "51-200",
      "industry": "technology"
    },
    "proposals": [
      {
        "id": "proposal_id",
        "coverLetter": "I have 5+ years of React experience...",
        "bidAmount": 75,
        "bidType": "hourly",
        "deliveryTime": "2 weeks",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "vaProfile": {
          "id": "va_profile_id",
          "name": "John Doe",
          "avatarUrl": "https://example.com/avatar.jpg",
          "country": "United States",
          "averageRating": 4.8,
          "totalReviews": 50,
          "skills": ["React", "Node.js", "TypeScript", "AWS"],
          "hourlyRate": 75
        }
      }
    ]
  }
}
```

#### **PUT /api/jobs/marketplace/:id**
Update job posting.

**Request Body:**
```json
{
  "title": "Updated Senior React Developer",
  "description": "Updated description",
  "budget": 6000,
  "urgency": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job_posting_id",
    "title": "Updated Senior React Developer",
    "description": "Updated description",
    "budget": 6000,
    "urgency": "medium",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Job posting updated successfully"
}
```

#### **DELETE /api/jobs/marketplace/:id**
Delete job posting.

**Response:**
```json
{
  "success": true,
  "message": "Job posting deleted successfully"
}
```

### **Proposal Management**

#### **POST /api/jobs/marketplace/proposals**
Submit proposal.

**Request Body:**
```json
{
  "jobPostingId": "job_posting_id",
  "coverLetter": "I have extensive experience in React development and would be perfect for this role. I've worked on similar projects for the past 5 years and can deliver high-quality code within the timeline.",
  "bidAmount": 75,
  "bidType": "hourly",
  "hourlyRate": 75,
  "estimatedHours": 40,
  "deliveryTime": "2 weeks",
  "attachments": [
    {
      "type": "resume",
      "url": "https://example.com/resume.pdf"
    },
    {
      "type": "portfolio",
      "url": "https://example.com/portfolio.pdf"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "proposal_id",
    "jobPostingId": "job_posting_id",
    "vaProfileId": "va_profile_id",
    "coverLetter": "I have extensive experience in React development and would be perfect for this role...",
    "bidAmount": 75,
    "bidType": "hourly",
    "hourlyRate": 75,
    "estimatedHours": 40,
    "deliveryTime": "2 weeks",
    "attachments": [
      {
        "type": "resume",
        "url": "https://example.com/resume.pdf"
      }
    ],
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Proposal submitted successfully"
}
```

#### **PUT /api/jobs/marketplace/proposals/:id**
Update proposal.

**Request Body:**
```json
{
  "coverLetter": "Updated cover letter",
  "bidAmount": 80,
  "deliveryTime": "3 weeks"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "proposal_id",
    "coverLetter": "Updated cover letter",
    "bidAmount": 80,
    "deliveryTime": "3 weeks",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Proposal updated successfully"
}
```

#### **DELETE /api/jobs/marketplace/proposals/:id**
Delete/withdraw proposal.

**Response:**
```json
{
  "success": true,
  "message": "Proposal withdrawn successfully"
}
```

#### **GET /api/jobs/marketplace/proposals/my**
Get current user's proposals.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string: "pending" | "viewed" | "accepted" | "rejected")

**Response:**
```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "id": "proposal_id",
        "coverLetter": "I have extensive experience...",
        "bidAmount": 75,
        "bidType": "hourly",
        "deliveryTime": "2 weeks",
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "jobPosting": {
          "id": "job_posting_id",
          "title": "Senior React Developer",
          "category": "development",
          "status": "open"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

## **🤝 Contract Management APIs**

### **Contract Operations**

#### **POST /api/contracts**
Create contract from proposal.

**Request Body:**
```json
{
  "proposalId": "proposal_id",
  "startDate": "2024-01-15",
  "endDate": "2024-04-15",
  "contractTerms": {
    "deliverables": [
      "React application development",
      "Unit tests",
      "Documentation"
    ],
    "paymentSchedule": "milestone-based",
    "communication": "Weekly progress reports"
  }
}
```

**Response:**
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
      "title": "Senior React Developer",
      "description": "We need an experienced React developer",
      "budget": 12000,
      "hourlyRate": 75,
      "startDate": "2024-01-15",
      "endDate": "2024-04-15",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "contract": {
      "id": "contract_id",
      "jobId": "job_id",
      "jobPostingId": "job_posting_id",
      "vaProfileId": "va_profile_id",
      "companyId": "company_id",
      "proposalId": "proposal_id",
      "contractType": "hourly",
      "amount": 12000,
      "hourlyRate": 75,
      "currency": "USD",
      "startDate": "2024-01-15",
      "endDate": "2024-04-15",
      "status": "active",
      "terms": {
        "deliverables": [
          "React application development",
          "Unit tests",
          "Documentation"
        ],
        "paymentSchedule": "milestone-based",
        "communication": "Weekly progress reports"
      },
      "paymentSchedule": "upon_completion",
      "totalPaid": 0,
      "totalHours": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Contract created successfully"
}
```

#### **GET /api/contracts**
Get user contracts.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `type` (string: "active" | "completed", default: "active")

**Response:**
```json
{
  "success": true,
  "data": {
    "contracts": [
      {
        "id": "contract_id",
        "jobId": "job_id",
        "jobPostingId": "job_posting_id",
        "vaProfileId": "va_profile_id",
        "companyId": "company_id",
        "proposalId": "proposal_id",
        "contractType": "hourly",
        "amount": 12000,
        "hourlyRate": 75,
        "currency": "USD",
        "startDate": "2024-01-15",
        "endDate": "2024-04-15",
        "status": "active",
        "paymentSchedule": "upon_completion",
        "totalPaid": 3000,
        "totalHours": 40,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "job": {
          "id": "job_id",
          "title": "Senior React Developer",
          "description": "We need an experienced React developer",
          "status": "active",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        },
        "jobPosting": {
          "id": "job_posting_id",
          "title": "Senior React Developer",
          "category": "development",
          "tags": ["react", "typescript", "aws"]
        },
        "vaProfile": {
          "id": "va_profile_id",
          "name": "John Doe",
          "country": "United States",
          "bio": "Experienced full-stack developer",
          "averageRating": 4.8,
          "totalReviews": 50,
          "skills": ["React", "Node.js", "TypeScript", "AWS"],
          "hourlyRate": 75,
          "avatarUrl": "https://example.com/avatar.jpg"
        },
        "company": {
          "id": "company_id",
          "name": "Tech Corp",
          "logoUrl": "https://example.com/logo.png",
          "verificationLevel": "professional",
          "totalReviews": 25
        },
        "proposal": {
          "id": "proposal_id",
          "coverLetter": "I have extensive experience...",
          "bidAmount": 75,
          "bidType": "hourly",
          "deliveryTime": "2 weeks"
        },
        "_count": {
          "milestones": 3,
          "payments": 2
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### **GET /api/contracts/:id**
Get single contract.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contract_id",
    "jobId": "job_id",
    "jobPostingId": "job_posting_id",
    "vaProfileId": "va_profile_id",
    "companyId": "company_id",
    "proposalId": "proposal_id",
    "contractType": "hourly",
    "amount": 12000,
    "hourlyRate": 75,
    "currency": "USD",
    "startDate": "2024-01-15",
    "endDate": "2024-04-15",
    "status": "active",
    "terms": {
      "deliverables": [
        "React application development",
        "Unit tests",
        "Documentation"
      ]
    },
    "paymentSchedule": "upon_completion",
    "totalPaid": 3000,
    "totalHours": 40,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "job": {
      "id": "job_id",
      "title": "Senior React Developer",
      "description": "We need an experienced React developer",
      "status": "active",
      "payments": [
        {
          "id": "payment_id",
          "amount": 1500,
          "status": "succeeded",
          "createdAt": "2024-01-20T00:00:00.000Z"
        }
      ]
    },
    "jobPosting": {
      "id": "job_posting_id",
      "title": "Senior React Developer",
      "category": "development",
      "tags": ["react", "typescript", "aws"]
    },
    "vaProfile": {
      "id": "va_profile_id",
      "name": "John Doe",
      "country": "United States",
      "bio": "Experienced full-stack developer",
      "averageRating": 4.8,
      "totalReviews": 50,
      "skills": ["React", "Node.js", "TypeScript", "AWS"],
      "hourlyRate": 75,
      "avatarUrl": "https://example.com/avatar.jpg"
    },
    "company": {
      "id": "company_id",
      "name": "Tech Corp",
      "logoUrl": "https://example.com/logo.png",
      "verificationLevel": "professional",
      "totalReviews": 25
    },
    "proposal": {
      "id": "proposal_id",
      "coverLetter": "I have extensive experience...",
      "bidAmount": 75,
      "bidType": "hourly",
      "deliveryTime": "2 weeks"
    },
    "payments": [
      {
        "id": "payment_id",
        "amount": 1500,
        "status": "succeeded",
        "createdAt": "2024-01-20T00:00:00.000Z"
      }
    ],
    "milestones": [
      {
        "id": "milestone_id",
        "title": "Initial Development",
        "description": "Set up project structure and basic components",
        "amount": 3000,
        "status": "completed",
        "dueDate": "2024-02-01T00:00:00.000Z"
      }
    ],
    "timesheets": [
      {
        "id": "timesheet_id",
        "date": "2024-01-20T00:00:00.000Z",
        "startTime": "2024-01-20T09:00:00.000Z",
        "endTime": "2024-01-20T17:00:00.000Z",
        "totalHours": 8,
        "description": "React component development",
        "status": "approved"
      }
    ]
  }
}
```

#### **PUT /api/contracts/:id**
Update contract.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contract_id",
    "status": "completed",
    "endDate": "2024-01-20T00:00:00.000Z",
    "updatedAt": "2024-01-20T00:00:00.000Z"
  },
  "message": "Contract completed successfully"
}
```

---

## **📅 Milestone Management APIs**

### **Milestone Operations**

#### **POST /api/contracts/:id/milestones**
Create milestone.

**Request Body:**
```json
{
  "title": "Initial Development",
  "description": "Set up project structure and basic components",
  "amount": 3000,
  "dueDate": "2024-02-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "milestone_id",
    "contractId": "contract_id",
    "jobId": "job_id",
    "title": "Initial Development",
    "description": "Set up project structure and basic components",
    "amount": 3000,
    "status": "pending",
    "dueDate": "2024-02-01T00:00:00.000Z",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  "message": "Milestone created successfully"
}
```

#### **PUT /api/milestones/:id**
Update milestone.

**Request Body:**
```json
{
  "title": "Updated Initial Development",
  "status": "completed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "milestone_id",
    "title": "Updated Initial Development",
    "status": "completed",
    "completedAt": "2024-01-20T00:00:00.000Z",
    "updatedAt": "2024-01-20T00:00:00.000Z"
  },
  "message": "Milestone updated successfully"
}
```

#### **GET /api/contracts/:id/milestones**
Get contract milestones.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "milestone_id",
      "contractId": "contract_id",
      "jobId": "job_id",
      "title": "Initial Development",
      "description": "Set up project structure and basic components",
      "amount": 3000,
      "status": "completed",
      "dueDate": "2024-02-01T00:00:00.000Z",
      "completedAt": "2024-01-20T00:00:00.000Z",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-20T00:00:00.000Z"
    }
  ]
}
```

#### **DELETE /api/milestones/:id**
Delete milestone.

**Response:**
```json
{
  "success": true,
  "message": "Milestone deleted successfully"
}
```

---

## **⏰ Timesheet Management APIs**

### **Timesheet Operations**

#### **POST /api/contracts/:id/timesheets**
Create timesheet.

**Request Body:**
```json
{
  "date": "2024-01-20",
  "startTime": "09:00",
  "endTime": "17:00",
  "description": "React component development and API integration"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "timesheet_id",
    "contractId": "contract_id",
    "vaProfileId": "va_profile_id",
    "date": "2024-01-20T00:00:00.000Z",
    "startTime": "2024-01-20T09:00:00.000Z",
    "endTime": "2024-01-20T17:00:00.000Z",
    "totalHours": 8,
    "description": "React component development and API integration",
    "status": "pending",
    "createdAt": "2024-01-20T00:00:00.000Z",
    "updatedAt": "2024-01-20T00:00:00.000Z"
  },
  "message": "Timesheet created successfully"
}
```

#### **PUT /api/timesheets/:id**
Update timesheet.

**Request Body:**
```json
{
  "description": "Updated description for React development",
  "startTime": "08:30",
  "endTime": "17:30"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "timesheet_id",
    "description": "Updated description for React development",
    "startTime": "2024-01-20T08:30:00.000Z",
    "endTime": "2024-01-20T17:30:00.000Z",
    "totalHours": 9,
    "updatedAt": "2024-01-20T00:00:00.000Z"
  },
  "message": "Timesheet updated successfully"
}
```

#### **GET /api/contracts/:id/timesheets**
Get contract timesheets.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "timesheet_id",
      "contractId": "contract_id",
      "vaProfileId": "va_profile_id",
      "date": "2024-01-20T00:00:00.000Z",
      "startTime": "2024-01-20T09:00:00.000Z",
      "endTime": "2024-01-20T17:00:00.000Z",
      "totalHours": 8,
      "description": "React component development and API integration",
      "status": "approved",
      "approvedAt": "2024-01-21T00:00:00.000Z",
      "approvedBy": "company_user_id",
      "createdAt": "2024-01-20T00:00:00.000Z",
      "updatedAt": "2024-01-21T00:00:00.000Z"
    }
  ]
}
```

#### **DELETE /api/timesheets/:id**
Delete timesheet.

**Response:**
```json
{
  "success": true,
  "message": "Timesheet deleted successfully"
}
```

---

## **💳 Payment Management APIs**

### **Payment Processing**

#### **POST /api/payments/intent**
Create payment intent.

**Request Body:**
```json
{
  "amount": 150000,
  "currency": "USD",
  "contractId": "contract_id",
  "milestoneId": "milestone_id",
  "description": "Payment for milestone completion"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment_id",
    "amount": 150000,
    "currency": "USD",
    "contractId": "contract_id",
    "milestoneId": "milestone_id",
    "stripePaymentIntentId": "pi_1234567890",
    "status": "pending",
    "method": "card",
    "type": "payment",
    "description": "Payment for milestone completion",
    "createdAt": "2024-01-20T00:00:00.000Z"
  },
  "message": "Payment intent created"
}
```

#### **POST /api/payments/confirm**
Confirm payment.

**Request Body:**
```json
{
  "paymentId": "payment_id",
  "paymentIntentId": "pi_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment_id",
    "status": "succeeded",
    "processedAt": "2024-01-20T00:00:00.000Z",
    "updatedAt": "2024-01-20T00:00:00.000Z"
  },
  "message": "Payment confirmed successfully"
}
```

#### **GET /api/payments/status/:paymentId**
Get payment status.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment_id",
    "amount": 150000,
    "status": "succeeded",
    "stripePaymentIntentId": "pi_1234567890",
    "processedAt": "2024-01-20T00:00:00.000Z",
    "createdAt": "2024-01-20T00:00:00.000Z"
  }
}
```

#### **GET /api/payments/history**
Get payment history.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string: "pending" | "succeeded" | "failed" | "refunded")
- `type` (string: "payment" | "refund" | "payout")

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment_id",
        "amount": 150000,
        "status": "succeeded",
        "method": "card",
        "type": "payment",
        "stripePaymentIntentId": "pi_1234567890",
        "stripeFee": 4350,
        "platformFee": 1500,
        "processedAt": "2024-01-20T00:00:00.000Z",
        "createdAt": "2024-01-20T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

#### **GET /api/payments/summary**
Get financial summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarned": 15000.00,
    "totalSpent": 12500.00,
    "totalFees": 1250.00,
    "pendingAmount": 1500.00,
    "refundedAmount": 500.00,
    "successfulPayments": 20,
    "failedPayments": 2,
    "refundedPayments": 1,
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  }
}
```

#### **POST /api/payments/refund**
Process refund.

**Request Body:**
```json
{
  "paymentId": "payment_id",
  "reason": "Service not delivered as expected",
  "amount": 75000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "refund_payment_id",
    "amount": 75000,
    "status": "succeeded",
    "type": "refund",
    "metadata": {
      "reason": "Service not delivered as expected",
      "originalPaymentId": "payment_id"
    },
    "createdAt": "2024-01-21T00:00:00.000Z"
  },
  "message": "Refund processed successfully"
}
```

---

## **📤 File Upload APIs**

### **File Management**

#### **POST /api/upload/avatar**
Upload user avatar.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- File: `avatar` (image file)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/avatars/avatar.jpg",
    "filename": "avatar.jpg",
    "size": 123456,
    "contentType": "image/jpeg"
  },
  "message": "Avatar uploaded successfully"
}
```

#### **POST /api/upload/resume**
Upload VA resume.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- File: `resume` (PDF file)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/resumes/resume.pdf",
    "filename": "resume.pdf",
    "size": 234567,
    "contentType": "application/pdf"
  },
  "message": "Resume uploaded successfully"
}
```

#### **POST /api/upload/logo**
Upload company logo.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- File: `logo` (image file)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/logos/logo.png",
    "filename": "logo.png",
    "size": 345678,
    "contentType": "image/png"
  },
  "message": "Logo uploaded successfully"
}
```

#### **POST /api/upload/portfolio**
Upload portfolio item.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- File: `file` (any file type)
- Form Data:
  - `title`: "Project Showcase"
  - `description`: "React project with TypeScript"
  - `category`: "website"
  - `technologies`: ["React", "TypeScript", "Node.js"]
  - `projectUrl`: "https://example.com/project"
  - `featured`: true

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/portfolio/project.png",
    "filename": "project.png",
    "size": 456789,
    "contentType": "image/png",
    "portfolioItem": {
      "id": "portfolio_item_id",
      "title": "Project Showcase",
      "description": "React project with TypeScript",
      "category": "website",
      "technologies": ["React", "TypeScript", "Node.js"],
      "projectUrl": "https://example.com/project",
      "featured": true,
      "createdAt": "2024-01-20T00:00:00.000Z"
    }
  },
  "message": "Portfolio item uploaded successfully"
}
```

---

## **❌ Error Responses**

All API endpoints return consistent error responses:

### **Standard Error Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error information"
}
```

### **Common Error Codes:**

| Code | HTTP Status | Description |
|-------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `UNAUTHORIZED` | 401 | Authentication required or invalid |
| `ACCESS_DENIED` | 403 | User doesn't have permission |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `STRIPE_ERROR` | 400 | Payment processing error |
| `FILE_TOO_LARGE` | 400 | Uploaded file too large |
| `INVALID_FILE_TYPE` | 400 | Invalid file type |

### **Example Error Responses:**

**Validation Error:**
```json
{
  "error": "Validation error",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "hourlyRate",
      "message": "Hourly rate must be at least $5"
    }
  ]
}
```

**Authentication Error:**
```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**Access Denied:**
```json
{
  "error": "Only companies can create job postings",
  "code": "ACCESS_DENIED"
}
```

**Not Found:**
```json
{
  "error": "Job posting not found",
  "code": "NOT_FOUND"
}
```

---

## **📊 Rate Limiting**

API requests are rate limited:

| Endpoint | Limit | Time Window |
|----------|-------|-------------|
| Authentication | 5 requests | 1 minute |
| Job Posting | 10 requests | 1 hour |
| Proposal | 20 requests | 1 hour |
| File Upload | 50 requests | 1 hour |
| Payment | 100 requests | 1 hour |

**Rate Limit Response:**
```json
{
  "error": "Too many requests",
  "code": "RATE_LIMITED",
  "details": "Rate limit exceeded. Try again later."
}
```

---

## **🔧 SDK Examples**

### **JavaScript/TypeScript**

```javascript
// Initialize API client
const API_BASE_URL = 'https://api.blytzhire.com';

class BlytzHireAPI {
  constructor(firebaseToken) {
    this.token = firebaseToken;
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Company Profile Methods
  async createCompanyProfile(profileData) {
    return this.request('/api/company/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  async getCompanyProfile() {
    return this.request('/api/company/profile');
  }

  async updateCompanyProfile(profileData) {
    return this.request('/api/company/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Job Posting Methods
  async createJobPosting(jobData) {
    return this.request('/api/jobs/marketplace', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  }

  async getJobListings(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/jobs/marketplace?${query}`);
  }

  // Contract Methods
  async createContract(contractData) {
    return this.request('/api/contracts', {
      method: 'POST',
      body: JSON.stringify(contractData)
    });
  }

  async getContracts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/contracts?${query}`);
  }
}

// Usage Example
const api = new BlytzHireAPI(firebaseToken);

// Create company profile
const companyProfile = await api.createCompanyProfile({
  name: "Tech Corp",
  bio: "Leading technology company",
  country: "United States",
  industry: "technology"
});

// Get job listings
const jobs = await api.getJobListings({
  category: "development",
  page: 1,
  limit: 10
});
```

### **React Hook Example**

```javascript
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

export function useAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (endpoint, options = {}) => {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
}

// Usage in Component
function JobListings() {
  const { request, loading, error } = useAPI();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await request('/api/jobs/marketplace');
        setJobs(response.data.jobs);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      }
    };

    fetchJobs();
  }, [request]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {jobs.map(job => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <p>{job.description}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## **🚀 Getting Started**

### **1. Get Firebase Token**
```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
const token = await user.getIdToken();
```

### **2. Make API Requests**
```javascript
const response = await fetch('https://api.blytzhire.com/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### **3. Handle Responses**
```javascript
if (response.ok && data.success) {
  // Success - use data.data
  console.log('User profile:', data.data);
} else {
  // Error - handle appropriately
  console.error('API Error:', data.error);
}
```

---

## **📞 Support**

For API support:
- **Documentation**: https://docs.blytzhire.com
- **Email**: api-support@blytzhire.com
- **Status Page**: https://status.blytzhire.com

---

## **📋 Changelog**

### **v1.0.0** - 2024-01-01
- Initial API release
- Complete marketplace functionality
- Authentication and user management
- Job posting and proposal system
- Contract and payment processing
- File upload capabilities

---

**📚 This documentation covers all available API endpoints for the BlytzHire marketplace platform.**