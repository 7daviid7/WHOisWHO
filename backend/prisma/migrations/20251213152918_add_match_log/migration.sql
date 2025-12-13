-- CreateTable
CREATE TABLE "MatchLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "opponentName" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "turns" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchLog_userId_idx" ON "MatchLog"("userId");

-- CreateIndex
CREATE INDEX "MatchLog_createdAt_idx" ON "MatchLog"("createdAt");

-- AddForeignKey
ALTER TABLE "MatchLog" ADD CONSTRAINT "MatchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
