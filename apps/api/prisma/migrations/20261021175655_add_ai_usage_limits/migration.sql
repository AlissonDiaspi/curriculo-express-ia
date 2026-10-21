-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "aiExperienceReservedUntil" TIMESTAMP(3),
ADD COLUMN     "aiExperienceUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiSummaryReservedUntil" TIMESTAMP(3),
ADD COLUMN     "aiSummaryUsed" BOOLEAN NOT NULL DEFAULT false;
