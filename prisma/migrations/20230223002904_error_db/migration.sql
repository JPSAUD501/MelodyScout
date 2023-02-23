-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" TEXT,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ErrorLog_id_key" ON "ErrorLog"("id");
