-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "daysOfWeek" TEXT[],
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false;
