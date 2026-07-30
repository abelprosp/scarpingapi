-- AlterTable users (extra billing fields)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "monthly_credits_reset_at" TIMESTAMP(3);

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "PixPaymentType" AS ENUM ('SUBSCRIPTION', 'CREDIT_PACK', 'OVERAGE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PixPaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "pix_payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "txid" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "credits_granted" INTEGER NOT NULL,
    "type" "PixPaymentType" NOT NULL,
    "status" "PixPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "qr_code" TEXT,
    "copy_paste" TEXT,
    "plan_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "pix_payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "pix_payments_txid_key" ON "pix_payments"("txid");
CREATE INDEX IF NOT EXISTS "pix_payments_user_id_status_idx" ON "pix_payments"("user_id", "status");
CREATE INDEX IF NOT EXISTS "pix_payments_status_idx" ON "pix_payments"("status");

DO $$ BEGIN
  ALTER TABLE "pix_payments" ADD CONSTRAINT "pix_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "pix_payments" ADD CONSTRAINT "pix_payments_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
