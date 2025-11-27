-- CreateEnum
CREATE TYPE "public"."TrackedPersonType" AS ENUM ('SELF', 'CHILD');

-- AlterTable
ALTER TABLE "public"."growtrack_entries" ADD COLUMN     "behaviors" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "trackedPersonName" TEXT,
ADD COLUMN     "trackedPersonType" "public"."TrackedPersonType" NOT NULL DEFAULT 'SELF';

-- CreateIndex
CREATE INDEX "growtrack_entries_trackedPersonType_idx" ON "public"."growtrack_entries"("trackedPersonType");

-- CreateIndex
CREATE INDEX "growtrack_entries_userId_trackedPersonType_trackedPersonNam_idx" ON "public"."growtrack_entries"("userId", "trackedPersonType", "trackedPersonName");
