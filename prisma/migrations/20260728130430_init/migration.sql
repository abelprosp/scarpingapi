-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SearchType" AS ENUM ('WEB', 'IMAGES', 'NEWS', 'SHOPPING', 'VIDEOS', 'MAPS', 'PLACES', 'AUTOCOMPLETE', 'RELATED_SEARCHES', 'KNOWLEDGE_GRAPH', 'REVERSE_IMAGE');

-- CreateEnum
CREATE TYPE "ProxyType" AS ENUM ('RESIDENTIAL', 'DATACENTER', 'MOBILE');

-- CreateEnum
CREATE TYPE "ProxyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'API_KEY_CREATED', 'API_KEY_REVOKED', 'SEARCH_PERFORMED', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_CANCELED', 'CREDITS_PURCHASED', 'SETTINGS_UPDATED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "credits" INTEGER NOT NULL DEFAULT 2500,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "rate_limit" INTEGER NOT NULL DEFAULT 100,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "description" TEXT,
    "price_monthly" INTEGER NOT NULL,
    "price_yearly" INTEGER NOT NULL,
    "credits_monthly" INTEGER NOT NULL,
    "rate_limit" INTEGER NOT NULL,
    "max_api_keys" INTEGER NOT NULL DEFAULT 5,
    "features" JSONB NOT NULL DEFAULT '[]',
    "stripe_price_id" TEXT,
    "stripe_product_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "canceled_at" TIMESTAMP(3),
    "trial_ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "api_key_id" TEXT,
    "search_type" "SearchType" NOT NULL,
    "query" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'br',
    "language" TEXT NOT NULL DEFAULT 'pt',
    "device" TEXT NOT NULL DEFAULT 'desktop',
    "credits_used" INTEGER NOT NULL DEFAULT 1,
    "response_time" INTEGER NOT NULL,
    "cached" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stripe_invoice_id" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'brl',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "invoice_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount_pct" INTEGER NOT NULL,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "stripe_coupon_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proxies" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "type" "ProxyType" NOT NULL DEFAULT 'DATACENTER',
    "status" "ProxyStatus" NOT NULL DEFAULT 'ACTIVE',
    "country" TEXT,
    "city" TEXT,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "last_check_at" TIMESTAMP(3),
    "avg_latency" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proxies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "resource" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_user_id_idx" ON "api_keys"("user_id");

-- CreateIndex
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys"("key_hash");

-- CreateIndex
CREATE UNIQUE INDEX "plans_tier_key" ON "plans"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_stripe_customer_id_idx" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "usage_logs_user_id_created_at_idx" ON "usage_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "usage_logs_search_type_created_at_idx" ON "usage_logs"("search_type", "created_at");

-- CreateIndex
CREATE INDEX "usage_logs_api_key_id_idx" ON "usage_logs"("api_key_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripe_invoice_id_key" ON "invoices"("stripe_invoice_id");

-- CreateIndex
CREATE INDEX "invoices_user_id_idx" ON "invoices"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "proxies_status_type_idx" ON "proxies"("status", "type");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
