-- DropIndex
DROP INDEX "public"."talkeasy_messages_userId_timestamp_idx";

-- AlterTable
ALTER TABLE "public"."talkeasy_messages" ADD COLUMN     "conversationTurn" INTEGER,
ADD COLUMN     "detectedKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "detectedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "emotionalIntensity" TEXT,
ADD COLUMN     "messageLength" INTEGER,
ADD COLUMN     "modelVersion" TEXT,
ADD COLUMN     "primaryCategory" TEXT,
ADD COLUMN     "processingTimeMs" INTEGER,
ADD COLUMN     "promptVersion" TEXT NOT NULL DEFAULT '1.0',
ADD COLUMN     "recommendedArticles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "recommendedDirectories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "resourcesRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "responseLength" INTEGER,
ADD COLUMN     "secondaryCategory" TEXT;

-- CreateTable
CREATE TABLE "public"."talkeasy_analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "crisisCount" INTEGER NOT NULL DEFAULT 0,
    "positiveCount" INTEGER NOT NULL DEFAULT 0,
    "negativeCount" INTEGER NOT NULL DEFAULT 0,
    "neutralCount" INTEGER NOT NULL DEFAULT 0,
    "categoryBreakdown" JSONB NOT NULL,
    "topicTrends" JSONB NOT NULL,
    "articlesRecommended" INTEGER NOT NULL DEFAULT 0,
    "directoriesRecommended" INTEGER NOT NULL DEFAULT 0,
    "avgProcessingTime" DOUBLE PRECISION,
    "avgMessageLength" DOUBLE PRECISION,
    "avgResponseLength" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talkeasy_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."talkeasy_training_data" (
    "id" TEXT NOT NULL,
    "anonymizedMessage" TEXT NOT NULL,
    "anonymizedResponse" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "primaryCategory" TEXT NOT NULL,
    "emotionalIntensity" TEXT NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "qualityScore" DOUBLE PRECISION,
    "humanReviewed" BOOLEAN NOT NULL DEFAULT false,
    "includeInTraining" BOOLEAN NOT NULL DEFAULT true,
    "originalTimestamp" TIMESTAMP(3) NOT NULL,
    "conversationTurn" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talkeasy_training_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."talkeasy_feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "helpful" BOOLEAN,
    "feedback" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talkeasy_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "talkeasy_analytics_date_key" ON "public"."talkeasy_analytics"("date");

-- CreateIndex
CREATE INDEX "talkeasy_analytics_date_idx" ON "public"."talkeasy_analytics"("date");

-- CreateIndex
CREATE INDEX "talkeasy_training_data_primaryCategory_idx" ON "public"."talkeasy_training_data"("primaryCategory");

-- CreateIndex
CREATE INDEX "talkeasy_training_data_sentiment_idx" ON "public"."talkeasy_training_data"("sentiment");

-- CreateIndex
CREATE INDEX "talkeasy_training_data_includeInTraining_idx" ON "public"."talkeasy_training_data"("includeInTraining");

-- CreateIndex
CREATE INDEX "talkeasy_training_data_qualityScore_idx" ON "public"."talkeasy_training_data"("qualityScore");

-- CreateIndex
CREATE INDEX "talkeasy_feedback_userId_idx" ON "public"."talkeasy_feedback"("userId");

-- CreateIndex
CREATE INDEX "talkeasy_feedback_messageId_idx" ON "public"."talkeasy_feedback"("messageId");

-- CreateIndex
CREATE INDEX "talkeasy_feedback_rating_idx" ON "public"."talkeasy_feedback"("rating");

-- CreateIndex
CREATE INDEX "talkeasy_messages_userId_idx" ON "public"."talkeasy_messages"("userId");

-- CreateIndex
CREATE INDEX "talkeasy_messages_timestamp_idx" ON "public"."talkeasy_messages"("timestamp");

-- CreateIndex
CREATE INDEX "talkeasy_messages_sentiment_idx" ON "public"."talkeasy_messages"("sentiment");

-- CreateIndex
CREATE INDEX "talkeasy_messages_primaryCategory_idx" ON "public"."talkeasy_messages"("primaryCategory");

-- CreateIndex
CREATE INDEX "talkeasy_messages_emotionalIntensity_idx" ON "public"."talkeasy_messages"("emotionalIntensity");

-- CreateIndex
CREATE INDEX "talkeasy_messages_userId_sessionId_idx" ON "public"."talkeasy_messages"("userId", "sessionId");

-- CreateIndex
CREATE INDEX "talkeasy_messages_timestamp_primaryCategory_idx" ON "public"."talkeasy_messages"("timestamp", "primaryCategory");

-- AddForeignKey
ALTER TABLE "public"."talkeasy_feedback" ADD CONSTRAINT "talkeasy_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
