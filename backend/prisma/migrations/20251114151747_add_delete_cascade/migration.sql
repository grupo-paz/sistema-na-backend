-- DropForeignKey
ALTER TABLE "public"."events" DROP CONSTRAINT "events_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."meetings" DROP CONSTRAINT "meetings_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."secretariat_records" DROP CONSTRAINT "secretariat_records_authorId_fkey";

-- AddForeignKey
ALTER TABLE "secretariat_records" ADD CONSTRAINT "secretariat_records_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
