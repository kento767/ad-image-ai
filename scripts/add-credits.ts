/**
 * クレジットを一時的に追加するスクリプト
 * 実行: npx tsx scripts/add-credits.ts [追加数] [メールアドレス]
 *
 * 例:
 *   npx tsx scripts/add-credits.ts 20          → 全ユーザーに20追加
 *   npx tsx scripts/add-credits.ts 10 user@example.com  → 指定ユーザーに10追加
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { db } from "../lib/db";

async function main() {
  const amount = parseInt(process.argv[2] ?? "10", 10);
  const email = process.argv[3];

  if (isNaN(amount) || amount < 1) {
    console.error("使い方: npx tsx scripts/add-credits.ts [追加数] [メールアドレス]");
    console.error("例: npx tsx scripts/add-credits.ts 20");
    process.exit(1);
  }

  let userIds: string[];

  if (email) {
    const user = await db
      .selectFrom("user")
      .select("id")
      .where("email", "=", email)
      .executeTakeFirst();
    if (!user) {
      console.error(`ユーザーが見つかりません: ${email}`);
      process.exit(1);
    }
    userIds = [user.id];
    console.log(`${email} に ${amount} クレジットを追加します`);
  } else {
    const users = await db
      .selectFrom("user_credits")
      .select("userId")
      .execute();
    userIds = [...new Set(users.map((u) => u.userId))];
    if (userIds.length === 0) {
      console.error("user_credits にレコードがありません。先にログインしてアカウントを作成してください。");
      process.exit(1);
    }
    console.log(`${userIds.length} ユーザーに ${amount} クレジットを追加します`);
  }

  const now = new Date().toISOString();

  for (const userId of userIds) {
    const row = await db
      .selectFrom("user_credits")
      .select(["id", "credits"])
      .where("userId", "=", userId)
      .executeTakeFirst();

    if (!row) {
      console.warn(`user_credits がありません (userId: ${userId})。スキップします。`);
      continue;
    }

    const newCredits = row.credits + amount;
    await db
      .updateTable("user_credits")
      .set({ credits: newCredits, updatedAt: now })
      .where("userId", "=", userId)
      .execute();

    const userInfo = await db
      .selectFrom("user")
      .select(["email", "name"])
      .where("id", "=", userId)
      .executeTakeFirst();

    console.log(
      `  OK: ${userInfo?.email ?? userId} (${row.credits} → ${newCredits})`
    );
  }

  console.log("完了しました。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => process.exit(0));
