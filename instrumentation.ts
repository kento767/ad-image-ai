/**
 * Next.js 起動時に実行。.env.local を確実に読み込む（Turbopack worker で env が渡らない場合のフォールバック）
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const path = await import("node:path");
    const { config } = await import("dotenv");
    config({ path: path.resolve(process.cwd(), ".env.local") });
    config({ path: path.resolve(process.cwd(), ".env") });
  }
}
