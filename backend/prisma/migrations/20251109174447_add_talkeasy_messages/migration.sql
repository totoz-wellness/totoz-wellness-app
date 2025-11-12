-- CreateTable
CREATE TABLE "public"."talkeasy_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "sentiment" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,

    CONSTRAINT "talkeasy_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "talkeasy_messages_userId_timestamp_idx" ON "public"."talkeasy_messages"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "talkeasy_messages_sessionId_idx" ON "public"."talkeasy_messages"("sessionId");

-- AddForeignKey
ALTER TABLE "public"."talkeasy_messages" ADD CONSTRAINT "talkeasy_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
