/**
 * GET /api/prompt-history
 * 認証ユーザーのプロンプト履歴（直近）を返す
 */
import { NextResponse } from "next/server";
import "@/lib/ensure-env";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const rows = await db
      .selectFrom("prompt_history")
      .select(["id", "catchCopy", "prompt", "createdAt"])
      .where("userId", "=", session.user.id)
      .orderBy("createdAt", "desc")
      .limit(10)
      .execute();

    // 重複を除いて直近3件（同じ catchCopy+prompt の組み合わせは1つに）
    const seen = new Set<string>();
    const unique: typeof rows = [];
    for (const row of rows) {
      const key = `${row.catchCopy ?? ""}\n${row.prompt}`;
      if (!seen.has(key) && unique.length < 3) {
        seen.add(key);
        unique.push(row);
      }
    }

    return NextResponse.json({
      history: unique.map((r) => ({
        id: r.id,
        catchCopy: r.catchCopy ?? "",
        prompt: r.prompt,
        createdAt: r.createdAt,
      })),
    });
  } catch (e) {
    console.error("[prompt-history]", e);
    return NextResponse.json(
      { error: "履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}
