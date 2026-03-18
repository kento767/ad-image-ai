/**
 * Turso 接続専用の診断 API
 * GET /api/debug/db で env と接続を確認
 * lib/db や auth は一切使わない（Turso のみ検証）
 */
import { NextResponse } from "next/server";
import path from "node:path";
import { config } from "dotenv";
import { createClient } from "@libsql/client";

export async function GET() {
  // この API 内で明示的に .env.local を読み込み
  const envPath = path.resolve(process.cwd(), ".env.local");
  const result = config({ path: envPath });
  config({ path: path.resolve(process.cwd(), ".env") });

  const url = process.env.TURSO_DATABASE_URL ?? "";
  const authToken = process.env.TURSO_AUTH_TOKEN ?? "";

  const diagnostics: Record<string, unknown> = {
    cwd: process.env.NODE_ENV === "development" ? process.cwd() : "(hidden)",
    envFileLoaded: !!result.parsed,
    envVarsCount: result.parsed ? Object.keys(result.parsed).length : 0,
    TURSO_DATABASE_URL: url ? `設定済み (${url.length}文字)` : "未設定",
    TURSO_AUTH_TOKEN: authToken ? `設定済み (${authToken.length}文字)` : "未設定",
  };

  if (!url || !authToken) {
    return NextResponse.json({
      ok: false,
      error: "TURSO_DATABASE_URL または TURSO_AUTH_TOKEN が未設定です",
      diagnostics,
    });
  }

  try {
    const client = createClient({ url, authToken });
    await client.execute("SELECT 1");
    return NextResponse.json({
      ok: true,
      message: "Turso への接続に成功しました",
      diagnostics,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: (e as Error).message,
      diagnostics,
    });
  }
}
