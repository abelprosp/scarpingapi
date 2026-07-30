-- AlterTable
ALTER TABLE "users" ADD COLUMN "pay_as_you_go_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "monthly_credits_used" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "overage_credits_pending" INTEGER NOT NULL DEFAULT 0;
