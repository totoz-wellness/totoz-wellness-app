-- CreateTable
CREATE TABLE "public"."children" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "avatarEmoji" TEXT NOT NULL DEFAULT '😊',
    "parentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."child_progress" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "stickers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "child_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."child_mood_logs" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "child_mood_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."child_worries" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "encryptedContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "child_worries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."child_buddy_chats" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "sessionId" TEXT,
    "userMessage" TEXT NOT NULL,
    "buddyResponse" TEXT NOT NULL,
    "sentiment" TEXT,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "child_buddy_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."child_activity_logs" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "stickerEarned" TEXT,
    "durationSeconds" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "child_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kids_corner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stickers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "streak" INTEGER NOT NULL DEFAULT 0,
    "worries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastMood" TEXT,
    "lastMoodDate" TIMESTAMP(3),
    "completedActivities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastActiveDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kids_corner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "children_parentId_idx" ON "public"."children"("parentId");

-- CreateIndex
CREATE INDEX "children_parentId_isActive_idx" ON "public"."children"("parentId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "child_progress_childId_key" ON "public"."child_progress"("childId");

-- CreateIndex
CREATE INDEX "child_progress_childId_idx" ON "public"."child_progress"("childId");

-- CreateIndex
CREATE INDEX "child_mood_logs_childId_idx" ON "public"."child_mood_logs"("childId");

-- CreateIndex
CREATE INDEX "child_mood_logs_timestamp_idx" ON "public"."child_mood_logs"("timestamp");

-- CreateIndex
CREATE INDEX "child_mood_logs_childId_timestamp_idx" ON "public"."child_mood_logs"("childId", "timestamp");

-- CreateIndex
CREATE INDEX "child_worries_childId_idx" ON "public"."child_worries"("childId");

-- CreateIndex
CREATE INDEX "child_buddy_chats_childId_idx" ON "public"."child_buddy_chats"("childId");

-- CreateIndex
CREATE INDEX "child_buddy_chats_sessionId_idx" ON "public"."child_buddy_chats"("sessionId");

-- CreateIndex
CREATE INDEX "child_buddy_chats_isFlagged_idx" ON "public"."child_buddy_chats"("isFlagged");

-- CreateIndex
CREATE INDEX "child_activity_logs_childId_idx" ON "public"."child_activity_logs"("childId");

-- CreateIndex
CREATE INDEX "child_activity_logs_completedAt_idx" ON "public"."child_activity_logs"("completedAt");

-- CreateIndex
CREATE INDEX "child_activity_logs_childId_completedAt_idx" ON "public"."child_activity_logs"("childId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "kids_corner_userId_key" ON "public"."kids_corner"("userId");

-- CreateIndex
CREATE INDEX "kids_corner_userId_idx" ON "public"."kids_corner"("userId");

-- CreateIndex
CREATE INDEX "kids_corner_lastActiveDate_idx" ON "public"."kids_corner"("lastActiveDate");

-- AddForeignKey
ALTER TABLE "public"."children" ADD CONSTRAINT "children_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."child_progress" ADD CONSTRAINT "child_progress_childId_fkey" FOREIGN KEY ("childId") REFERENCES "public"."children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."child_mood_logs" ADD CONSTRAINT "child_mood_logs_childId_fkey" FOREIGN KEY ("childId") REFERENCES "public"."children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."child_worries" ADD CONSTRAINT "child_worries_childId_fkey" FOREIGN KEY ("childId") REFERENCES "public"."children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."child_buddy_chats" ADD CONSTRAINT "child_buddy_chats_childId_fkey" FOREIGN KEY ("childId") REFERENCES "public"."children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."child_activity_logs" ADD CONSTRAINT "child_activity_logs_childId_fkey" FOREIGN KEY ("childId") REFERENCES "public"."children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kids_corner" ADD CONSTRAINT "kids_corner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
