/**
 * Better Auth テーブル + アプリテーブルを Turso に作成するスクリプト
 * 実行: npx dotenv -e .env.local -- npx tsx scripts/migrate-auth.ts
 * または: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/migrate-auth.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL と TURSO_AUTH_TOKEN を .env.local に設定してください");
  process.exit(1);
}

const client = createClient({ url, authToken });

// Turso では FOREIGN KEY を外して確実に作成（リレーションはアプリで保証）
const BETTER_AUTH_SQL = `
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "emailVerified" integer NOT NULL DEFAULT 0,
  "image" text,
  "createdAt" text NOT NULL,
  "updatedAt" text NOT NULL
);
CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "token" text NOT NULL,
  "expiresAt" text NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "createdAt" text NOT NULL,
  "updatedAt" text NOT NULL
);
CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "accessToken" text,
  "refreshToken" text,
  "accessTokenExpiresAt" text,
  "refreshTokenExpiresAt" text,
  "scope" text,
  "idToken" text,
  "password" text,
  "createdAt" text NOT NULL,
  "updatedAt" text NOT NULL
);
CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" text NOT NULL,
  "createdAt" text NOT NULL,
  "updatedAt" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");
`;

const PLAN_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS "plan" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "displayName" text NOT NULL,
  "creditsPerMonth" integer NOT NULL,
  "priceYen" integer NOT NULL,
  "description" text,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "isActive" integer NOT NULL DEFAULT 1,
  "createdAt" text NOT NULL,
  "updatedAt" text NOT NULL
);
`;

const PLAN_SEED_SQL = `
INSERT OR IGNORE INTO "plan" ("id", "name", "displayName", "creditsPerMonth", "priceYen", "description", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
  ('plan_matsu', '松', '松プラン', 30, 980, '個人・お試しに最適。月30枚の広告画像を生成できます。', 1, 1, datetime('now'), datetime('now')),
  ('plan_take', '竹', '竹プラン', 80, 1980, '小規模運用向け。月80枚の広告画像を生成できます。', 2, 1, datetime('now'), datetime('now')),
  ('plan_ume', '梅', '梅プラン', 180, 3980, '本格運用向け。月180枚の広告画像を生成できます。', 3, 1, datetime('now'), datetime('now'));
`;

const APP_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS "user_credits" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "credits" integer NOT NULL DEFAULT 0,
  "planId" text,
  "createdAt" text NOT NULL,
  "updatedAt" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_user_credits_userId" ON "user_credits"("userId");
CREATE TABLE IF NOT EXISTS "generated_image" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "r2Key" text NOT NULL,
  "prompt" text NOT NULL,
  "templateId" text,
  "aspectRatio" text NOT NULL,
  "width" integer NOT NULL,
  "height" integer NOT NULL,
  "creditsUsed" integer NOT NULL DEFAULT 1,
  "createdAt" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_generated_image_userId" ON "generated_image"("userId");
CREATE TABLE IF NOT EXISTS "prompt_history" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "catchCopy" text,
  "prompt" text NOT NULL,
  "createdAt" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_prompt_history_userId" ON "prompt_history"("userId");
CREATE TABLE IF NOT EXISTS "template" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "style" text NOT NULL,
  "aspectRatio" text NOT NULL DEFAULT '1:1',
  "category" text NOT NULL DEFAULT 'その他',
  "previewImageUrl" text,
  "promptTemplate" text,
  "isActive" integer NOT NULL DEFAULT 1,
  "createdAt" text NOT NULL,
  "updatedAt" text NOT NULL
);
`;

const TEMPLATE_CATEGORY_MIGRATION = `
ALTER TABLE "template" ADD COLUMN "category" text NOT NULL DEFAULT 'その他';
`;

async function runSql(sql: string, label: string) {
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    try {
      await client.execute(stmt);
      const preview = stmt.replace(/\s+/g, " ").slice(0, 60);
      console.log(`  OK: ${preview}...`);
    } catch (e) {
      if (
        String(e).includes("already exists") ||
        String(e).includes("duplicate column")
      ) {
        console.log(`  Skip (exists): ${stmt.slice(0, 40)}...`);
      } else {
        console.error("  Error:", e);
      }
    }
  }
  console.log(`[${label}] Done.`);
}

async function main() {
  console.log("Running migrations...");
  await runSql(BETTER_AUTH_SQL, "Better Auth");
  await runSql(PLAN_TABLE_SQL, "Plan table");
  await runSql(PLAN_SEED_SQL, "Plan seed (松竹梅)");
  await runSql(APP_TABLES_SQL, "App tables");
  await runSql(TEMPLATE_CATEGORY_MIGRATION, "Template category column");
  console.log("All migrations complete.");
}

main().catch(console.error).finally(() => process.exit(0));
