-- CreateEnum
CREATE TYPE "public"."DirectoryType" AS ENUM ('NGO', 'COUNSELOR', 'HELPLINE', 'SUPPORT_GROUP', 'HOSPITAL', 'CLINIC', 'THERAPIST', 'PSYCHIATRIST', 'COMMUNITY_CENTER', 'ONLINE_SERVICE');

-- CreateTable
CREATE TABLE "public"."directories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."DirectoryType" NOT NULL,
    "description" TEXT NOT NULL,
    "excerpt" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "county" TEXT,
    "region" TEXT,
    "coordinates" TEXT,
    "operatingHours" TEXT,
    "languages" TEXT[],
    "specializations" TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "tags" TEXT[],
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "directories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "directories_slug_key" ON "public"."directories"("slug");

-- AddForeignKey
ALTER TABLE "public"."directories" ADD CONSTRAINT "directories_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
