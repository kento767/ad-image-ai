/**
 * GET /api/my-images
 * 認証ユーザーの直近の生成画像一覧を返す（元画像選択用）
 */
import { NextResponse } from "next/server";
import "@/lib/ensure-env";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getR2PublicUrlOrNull } from "@/lib/r2";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const images = await db
      .selectFrom("generated_image")
      .select(["id", "r2Key", "prompt", "aspectRatio", "createdAt"])
      .where("userId", "=", session.user.id)
      .orderBy("createdAt", "desc")
      .limit(24)
      .execute();

    const items = images.map((img) => ({
      id: img.id,
      r2Key: img.r2Key,
      prompt: img.prompt,
      aspectRatio: img.aspectRatio,
      createdAt: img.createdAt,
      url: getR2PublicUrlOrNull(img.r2Key),
    }));

    return NextResponse.json({ images: items });
  } catch (e) {
    console.error("[my-images]", e);
    return NextResponse.json(
      { error: "画像一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}
