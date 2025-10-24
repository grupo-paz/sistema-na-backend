-- CreateTable
CREATE TABLE "secretariat_records" (
    "id" TEXT NOT NULL,
    "cashValue" DOUBLE PRECISION NOT NULL,
    "pixValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "secretariat_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "secretariat_records" ADD CONSTRAINT "secretariat_records_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
