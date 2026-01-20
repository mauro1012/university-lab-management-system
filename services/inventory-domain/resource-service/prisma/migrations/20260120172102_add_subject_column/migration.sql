/*
  Warnings:

  - Added the required column `teacher_name` to the `assignments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "subject" TEXT,
ADD COLUMN     "teacher_name" TEXT NOT NULL;
