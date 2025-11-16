-- CreateEnum
CREATE TYPE "public"."CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "public"."ModerableContent" ADD VALUE 'COMMENT';

-- AlterEnum
ALTER TYPE "public"."ReportableContent" ADD VALUE 'COMMENT';

-- AlterTable
ALTER TABLE "public"."parentcircle_analytics" ADD COLUMN     "commentsApproved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "commentsRejected" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "commentsSubmitted" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."story_comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "storyId" INTEGER NOT NULL,
    "createdBy" TEXT,
    "authorName" TEXT,
    "status" "public"."CommentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "story_comments_storyId_idx" ON "public"."story_comments"("storyId");

-- CreateIndex
CREATE INDEX "story_comments_createdBy_idx" ON "public"."story_comments"("createdBy");

-- CreateIndex
CREATE INDEX "story_comments_status_idx" ON "public"."story_comments"("status");

-- CreateIndex
CREATE INDEX "story_comments_createdAt_idx" ON "public"."story_comments"("createdAt");

-- CreateIndex
CREATE INDEX "story_comments_status_storyId_idx" ON "public"."story_comments"("status", "storyId");

-- AddForeignKey
ALTER TABLE "public"."story_comments" ADD CONSTRAINT "story_comments_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "public"."parentcircle_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."story_comments" ADD CONSTRAINT "story_comments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
