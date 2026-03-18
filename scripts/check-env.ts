/**
 * .env.local の環境変数が正しく読み込まれているか確認するスクリプト
 * 実行: npm run env:check
 */
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log("=== 環境変数チェック ===\n");

console.log("TURSO_DATABASE_URL:", url ? `設定済み (${url.length}文字)` : "❌ 未設定");
console.log("TURSO_AUTH_TOKEN:", authToken ? `設定済み (${authToken.length}文字)` : "❌ 未設定");
console.log("BETTER_AUTH_SECRET:", process.env.BETTER_AUTH_SECRET ? "設定済み" : "❌ 未設定");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "設定済み" : "❌ 未設定");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "設定済み" : "❌ 未設定");

async function testConnection() {
  if (url && authToken) {
    console.log("\n--- Turso 接続テスト ---");
    try {
      const { createClient } = await import("@libsql/client");
      const client = createClient({ url, authToken });
      await client.execute("SELECT 1");
      console.log("✅ Turso への接続に成功しました");
    } catch (e) {
      console.log("❌ Turso への接続に失敗:", (e as Error).message);
    }
  } else {
    console.log("\n⚠️ TURSO_DATABASE_URL と TURSO_AUTH_TOKEN を設定してください");
  }
}

testConnection()
  .catch(console.error)
  .finally(() => process.exit(0));
