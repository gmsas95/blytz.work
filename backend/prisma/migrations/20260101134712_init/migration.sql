-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "blytz_hire";

-- CreateTable
CREATE TABLE "blytz_hire"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."va_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "country" TEXT NOT NULL,
    "hourlyRate" INTEGER NOT NULL,
    "skills" TEXT[],
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT,
    "phone" TEXT,
    "timezone" TEXT,
    "languages" JSONB,
    "workExperience" JSONB,
    "education" JSONB,
    "responseRate" DOUBLE PRECISION,
    "averageRating" DOUBLE PRECISION,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "featuredProfile" BOOLEAN NOT NULL DEFAULT false,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "resumeUrl" TEXT,
    "videoIntroUrl" TEXT,
    "skillsScore" INTEGER,
    "verificationLevel" TEXT NOT NULL DEFAULT 'basic',
    "backgroundCheckPassed" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN DEFAULT false,
    "earnedAmount" DOUBLE PRECISION DEFAULT 0,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "avatarUrl" TEXT,

    CONSTRAINT "va_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."companies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "country" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "industry" TEXT,
    "companySize" TEXT,
    "foundedYear" INTEGER,
    "description" TEXT,
    "mission" TEXT,
    "values" JSONB,
    "benefits" JSONB,
    "email" TEXT,
    "phone" TEXT,
    "verificationLevel" TEXT NOT NULL DEFAULT 'basic',
    "backgroundCheckPassed" BOOLEAN NOT NULL DEFAULT false,
    "featuredCompany" BOOLEAN NOT NULL DEFAULT false,
    "socialLinks" JSONB,
    "techStack" JSONB,
    "totalSpent" DOUBLE PRECISION DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "channels" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."portfolio_items" (
    "id" TEXT NOT NULL,
    "vaProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "category" TEXT,
    "technologies" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "projectUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."skills_assessments" (
    "id" TEXT NOT NULL,
    "vaProfileId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "skills_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."badges" (
    "id" TEXT NOT NULL,
    "vaProfileId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."reviews" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "categories" JSONB,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."job_postings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" JSONB,
    "responsibilities" JSONB,
    "benefits" JSONB,
    "rateRange" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "location" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT,
    "tags" TEXT[],
    "experienceLevel" TEXT,
    "employmentType" TEXT,
    "jobType" TEXT DEFAULT 'fixed',
    "duration" TEXT,
    "status" TEXT DEFAULT 'open',
    "urgency" TEXT DEFAULT 'medium',
    "skillsRequired" TEXT[],
    "toolsUsed" JSONB,
    "teamSize" INTEGER,
    "reportingTo" TEXT,
    "travelRequired" TEXT,
    "workSchedule" JSONB,
    "views" INTEGER NOT NULL DEFAULT 0,
    "proposalCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."jobs" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "vaProfileId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "hourlyRate" DOUBLE PRECISION,
    "totalHours" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."proposals" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "vaProfileId" TEXT NOT NULL,
    "jobId" TEXT,
    "coverLetter" TEXT NOT NULL,
    "bidAmount" DOUBLE PRECISION NOT NULL,
    "bidType" TEXT NOT NULL DEFAULT 'fixed',
    "hourlyRate" DOUBLE PRECISION,
    "estimatedHours" DOUBLE PRECISION,
    "deliveryTime" TEXT NOT NULL,
    "attachments" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "viewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."contracts" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "vaProfileId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "proposalId" TEXT,
    "contractType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "hourlyRate" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "terms" JSONB,
    "deliverables" JSONB[],
    "milestonesData" JSONB[],
    "paymentSchedule" TEXT DEFAULT 'upon_completion',
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."milestones" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."timesheets" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "vaProfileId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "totalHours" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."payments" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "contractId" TEXT,
    "milestoneId" TEXT,
    "matchId" TEXT,
    "userId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "stripeFee" INTEGER,
    "platformFee" INTEGER,
    "method" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'payment',
    "metadata" JSONB,
    "refundAmount" INTEGER,
    "refundedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."invoices" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "items" JSONB[],
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."match_votes" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "vaProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vote" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blytz_hire"."matches" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "vaProfileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "blytz_hire"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "va_profiles_userId_key" ON "blytz_hire"."va_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_userId_key" ON "blytz_hire"."companies"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripePaymentIntentId_key" ON "blytz_hire"."payments"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "match_votes_jobPostingId_vaProfileId_userId_key" ON "blytz_hire"."match_votes"("jobPostingId", "vaProfileId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "matches_jobPostingId_vaProfileId_key" ON "blytz_hire"."matches"("jobPostingId", "vaProfileId");

-- AddForeignKey
ALTER TABLE "blytz_hire"."va_profiles" ADD CONSTRAINT "va_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "blytz_hire"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."companies" ADD CONSTRAINT "companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "blytz_hire"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "blytz_hire"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."portfolio_items" ADD CONSTRAINT "portfolio_items_vaProfileId_fkey" FOREIGN KEY ("vaProfileId") REFERENCES "blytz_hire"."va_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."skills_assessments" ADD CONSTRAINT "skills_assessments_vaProfileId_fkey" FOREIGN KEY ("vaProfileId") REFERENCES "blytz_hire"."va_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."badges" ADD CONSTRAINT "badges_vaProfileId_fkey" FOREIGN KEY ("vaProfileId") REFERENCES "blytz_hire"."va_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."reviews" ADD CONSTRAINT "reviews_va_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "blytz_hire"."va_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."reviews" ADD CONSTRAINT "reviews_company_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "blytz_hire"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."job_postings" ADD CONSTRAINT "job_postings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "blytz_hire"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."jobs" ADD CONSTRAINT "jobs_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "blytz_hire"."job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."jobs" ADD CONSTRAINT "jobs_vaProfileId_fkey" FOREIGN KEY ("vaProfileId") REFERENCES "blytz_hire"."va_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."jobs" ADD CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "blytz_hire"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."proposals" ADD CONSTRAINT "proposals_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "blytz_hire"."job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."proposals" ADD CONSTRAINT "proposals_vaProfileId_fkey" FOREIGN KEY ("vaProfileId") REFERENCES "blytz_hire"."va_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."proposals" ADD CONSTRAINT "proposals_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "blytz_hire"."jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."contracts" ADD CONSTRAINT "contracts_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "blytz_hire"."jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."contracts" ADD CONSTRAINT "contracts_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "blytz_hire"."job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."contracts" ADD CONSTRAINT "contracts_vaProfileId_fkey" FOREIGN KEY ("vaProfileId") REFERENCES "blytz_hire"."va_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."contracts" ADD CONSTRAINT "contracts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "blytz_hire"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."contracts" ADD CONSTRAINT "contracts_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "blytz_hire"."proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."milestones" ADD CONSTRAINT "milestones_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "blytz_hire"."contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."milestones" ADD CONSTRAINT "milestones_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "blytz_hire"."jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."timesheets" ADD CONSTRAINT "timesheets_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "blytz_hire"."contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."timesheets" ADD CONSTRAINT "timesheets_vaProfileId_fkey" FOREIGN KEY ("vaProfileId") REFERENCES "blytz_hire"."va_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."timesheets" ADD CONSTRAINT "timesheets_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "blytz_hire"."jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."payments" ADD CONSTRAINT "payments_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "blytz_hire"."jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."payments" ADD CONSTRAINT "payments_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "blytz_hire"."contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."payments" ADD CONSTRAINT "payments_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "blytz_hire"."matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "blytz_hire"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."match_votes" ADD CONSTRAINT "match_votes_jobPostingId_vaProfileId_fkey" FOREIGN KEY ("jobPostingId", "vaProfileId") REFERENCES "blytz_hire"."matches"("jobPostingId", "vaProfileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."matches" ADD CONSTRAINT "matches_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "blytz_hire"."job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blytz_hire"."matches" ADD CONSTRAINT "matches_vaProfileId_fkey" FOREIGN KEY ("vaProfileId") REFERENCES "blytz_hire"."va_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

