-- CreateEnum
CREATE TYPE "public"."ContentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('QUESTION', 'STORY', 'BOTH');

-- CreateEnum
CREATE TYPE "public"."ReportableContent" AS ENUM ('QUESTION', 'STORY', 'ANSWER');

-- CreateEnum
CREATE TYPE "public"."ModerableContent" AS ENUM ('QUESTION', 'STORY');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "public"."ModerationAction" AS ENUM ('APPROVE', 'REJECT', 'ARCHIVE', 'RESTORE', 'EDIT', 'PIN', 'UNPIN', 'FEATURE', 'UNFEATURE');

-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'MODERATOR';

-- CreateTable
CREATE TABLE "public"."parentcircle_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."ContentType" NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parentcircle_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parentcircle_questions" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "slug" TEXT,
    "categoryId" INTEGER NOT NULL,
    "createdBy" TEXT,
    "authorName" TEXT,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'PENDING',
    "views" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "parentcircle_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parentcircle_answers" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parentcircle_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parentcircle_stories" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "slug" TEXT,
    "categoryId" INTEGER,
    "createdBy" TEXT,
    "authorName" TEXT,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'PENDING',
    "views" INTEGER NOT NULL DEFAULT 0,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "parentcircle_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parentcircle_question_votes" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "isHelpful" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parentcircle_question_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parentcircle_story_votes" (
    "id" SERIAL NOT NULL,
    "storyId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parentcircle_story_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parentcircle_reports" (
    "id" SERIAL NOT NULL,
    "contentType" "public"."ReportableContent" NOT NULL,
    "contentId" INTEGER NOT NULL,
    "questionId" INTEGER,
    "storyId" INTEGER,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "reportedBy" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolution" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parentcircle_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parentcircle_moderation_logs" (
    "id" SERIAL NOT NULL,
    "contentType" "public"."ModerableContent" NOT NULL,
    "contentId" INTEGER NOT NULL,
    "questionId" INTEGER,
    "storyId" INTEGER,
    "action" "public"."ModerationAction" NOT NULL,
    "previousStatus" "public"."ContentStatus",
    "newStatus" "public"."ContentStatus" NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parentcircle_moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parentcircle_analytics" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "questionsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "storiesSubmitted" INTEGER NOT NULL DEFAULT 0,
    "questionsApproved" INTEGER NOT NULL DEFAULT 0,
    "storiesApproved" INTEGER NOT NULL DEFAULT 0,
    "questionsRejected" INTEGER NOT NULL DEFAULT 0,
    "storiesRejected" INTEGER NOT NULL DEFAULT 0,
    "answersPosted" INTEGER NOT NULL DEFAULT 0,
    "uniqueContributors" INTEGER NOT NULL DEFAULT 0,
    "anonymousRatio" DOUBLE PRECISION,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "avgModerationTime" DOUBLE PRECISION,
    "topCategories" JSONB NOT NULL,
    "popularTags" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parentcircle_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parentcircle_categories_name_key" ON "public"."parentcircle_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "parentcircle_categories_slug_key" ON "public"."parentcircle_categories"("slug");

-- CreateIndex
CREATE INDEX "parentcircle_categories_type_idx" ON "public"."parentcircle_categories"("type");

-- CreateIndex
CREATE INDEX "parentcircle_categories_isActive_idx" ON "public"."parentcircle_categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "parentcircle_questions_slug_key" ON "public"."parentcircle_questions"("slug");

-- CreateIndex
CREATE INDEX "parentcircle_questions_status_idx" ON "public"."parentcircle_questions"("status");

-- CreateIndex
CREATE INDEX "parentcircle_questions_categoryId_idx" ON "public"."parentcircle_questions"("categoryId");

-- CreateIndex
CREATE INDEX "parentcircle_questions_createdBy_idx" ON "public"."parentcircle_questions"("createdBy");

-- CreateIndex
CREATE INDEX "parentcircle_questions_createdAt_idx" ON "public"."parentcircle_questions"("createdAt");

-- CreateIndex
CREATE INDEX "parentcircle_questions_isPinned_idx" ON "public"."parentcircle_questions"("isPinned");

-- CreateIndex
CREATE INDEX "parentcircle_questions_status_categoryId_idx" ON "public"."parentcircle_questions"("status", "categoryId");

-- CreateIndex
CREATE INDEX "parentcircle_questions_status_createdAt_idx" ON "public"."parentcircle_questions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "parentcircle_answers_questionId_idx" ON "public"."parentcircle_answers"("questionId");

-- CreateIndex
CREATE INDEX "parentcircle_answers_createdBy_idx" ON "public"."parentcircle_answers"("createdBy");

-- CreateIndex
CREATE INDEX "parentcircle_answers_isVerified_idx" ON "public"."parentcircle_answers"("isVerified");

-- CreateIndex
CREATE INDEX "parentcircle_answers_createdAt_idx" ON "public"."parentcircle_answers"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "parentcircle_stories_slug_key" ON "public"."parentcircle_stories"("slug");

-- CreateIndex
CREATE INDEX "parentcircle_stories_status_idx" ON "public"."parentcircle_stories"("status");

-- CreateIndex
CREATE INDEX "parentcircle_stories_categoryId_idx" ON "public"."parentcircle_stories"("categoryId");

-- CreateIndex
CREATE INDEX "parentcircle_stories_createdBy_idx" ON "public"."parentcircle_stories"("createdBy");

-- CreateIndex
CREATE INDEX "parentcircle_stories_createdAt_idx" ON "public"."parentcircle_stories"("createdAt");

-- CreateIndex
CREATE INDEX "parentcircle_stories_isFeatured_idx" ON "public"."parentcircle_stories"("isFeatured");

-- CreateIndex
CREATE INDEX "parentcircle_stories_status_categoryId_idx" ON "public"."parentcircle_stories"("status", "categoryId");

-- CreateIndex
CREATE INDEX "parentcircle_stories_status_createdAt_idx" ON "public"."parentcircle_stories"("status", "createdAt");

-- CreateIndex
CREATE INDEX "parentcircle_question_votes_questionId_idx" ON "public"."parentcircle_question_votes"("questionId");

-- CreateIndex
CREATE INDEX "parentcircle_question_votes_userId_idx" ON "public"."parentcircle_question_votes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "parentcircle_question_votes_questionId_userId_key" ON "public"."parentcircle_question_votes"("questionId", "userId");

-- CreateIndex
CREATE INDEX "parentcircle_story_votes_storyId_idx" ON "public"."parentcircle_story_votes"("storyId");

-- CreateIndex
CREATE INDEX "parentcircle_story_votes_userId_idx" ON "public"."parentcircle_story_votes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "parentcircle_story_votes_storyId_userId_key" ON "public"."parentcircle_story_votes"("storyId", "userId");

-- CreateIndex
CREATE INDEX "parentcircle_reports_status_idx" ON "public"."parentcircle_reports"("status");

-- CreateIndex
CREATE INDEX "parentcircle_reports_contentType_idx" ON "public"."parentcircle_reports"("contentType");

-- CreateIndex
CREATE INDEX "parentcircle_reports_reportedBy_idx" ON "public"."parentcircle_reports"("reportedBy");

-- CreateIndex
CREATE INDEX "parentcircle_reports_createdAt_idx" ON "public"."parentcircle_reports"("createdAt");

-- CreateIndex
CREATE INDEX "parentcircle_moderation_logs_moderatorId_idx" ON "public"."parentcircle_moderation_logs"("moderatorId");

-- CreateIndex
CREATE INDEX "parentcircle_moderation_logs_contentType_idx" ON "public"."parentcircle_moderation_logs"("contentType");

-- CreateIndex
CREATE INDEX "parentcircle_moderation_logs_action_idx" ON "public"."parentcircle_moderation_logs"("action");

-- CreateIndex
CREATE INDEX "parentcircle_moderation_logs_createdAt_idx" ON "public"."parentcircle_moderation_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "parentcircle_analytics_date_key" ON "public"."parentcircle_analytics"("date");

-- CreateIndex
CREATE INDEX "parentcircle_analytics_date_idx" ON "public"."parentcircle_analytics"("date");

-- AddForeignKey
ALTER TABLE "public"."parentcircle_questions" ADD CONSTRAINT "parentcircle_questions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."parentcircle_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_questions" ADD CONSTRAINT "parentcircle_questions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_answers" ADD CONSTRAINT "parentcircle_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."parentcircle_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_answers" ADD CONSTRAINT "parentcircle_answers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_stories" ADD CONSTRAINT "parentcircle_stories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."parentcircle_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_stories" ADD CONSTRAINT "parentcircle_stories_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_question_votes" ADD CONSTRAINT "parentcircle_question_votes_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."parentcircle_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_question_votes" ADD CONSTRAINT "parentcircle_question_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_story_votes" ADD CONSTRAINT "parentcircle_story_votes_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "public"."parentcircle_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_story_votes" ADD CONSTRAINT "parentcircle_story_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_reports" ADD CONSTRAINT "parentcircle_reports_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."parentcircle_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_reports" ADD CONSTRAINT "parentcircle_reports_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "public"."parentcircle_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_reports" ADD CONSTRAINT "parentcircle_reports_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_reports" ADD CONSTRAINT "parentcircle_reports_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_moderation_logs" ADD CONSTRAINT "parentcircle_moderation_logs_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."parentcircle_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_moderation_logs" ADD CONSTRAINT "parentcircle_moderation_logs_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "public"."parentcircle_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parentcircle_moderation_logs" ADD CONSTRAINT "parentcircle_moderation_logs_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
