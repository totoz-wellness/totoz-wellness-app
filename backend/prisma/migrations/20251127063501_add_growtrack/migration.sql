-- CreateTable
CREATE TABLE "public"."growtrack_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "moodIntensity" INTEGER NOT NULL,
    "triggers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "growtrack_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "growtrack_entries_userId_idx" ON "public"."growtrack_entries"("userId");

-- CreateIndex
CREATE INDEX "growtrack_entries_recordedAt_idx" ON "public"."growtrack_entries"("recordedAt");

-- CreateIndex
CREATE INDEX "growtrack_entries_userId_recordedAt_idx" ON "public"."growtrack_entries"("userId", "recordedAt");

-- AddForeignKey
ALTER TABLE "public"."growtrack_entries" ADD CONSTRAINT "growtrack_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
