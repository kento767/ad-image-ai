import { NextRequest, NextResponse } from "next/server";
import "@/lib/ensure-env";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getR2PublicUrlOrNull } from "@/lib/r2";
import { db } from "@/lib/db";

/**
 * GET /api/download-image?key=xxx
 * 認証済みユーザーが自分の画像をダウンロードする
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "key が必要です" }, { status: 400 });
    }

    // 自分の画像か確認
    const image = await db
      .selectFrom("generated_image")
      .select(["r2Key"])
      .where("userId", "=", session.user.id)
      .where("r2Key", "=", key)
      .executeTakeFirst();

    if (!image) {
      return NextResponse.json({ error: "画像が見つかりません" }, { status: 404 });
    }

    const imageUrl = getR2PublicUrlOrNull(key);
    if (!imageUrl) {
      return NextResponse.json(
        { error: "R2 の公開URLが設定されていません" },
        { status: 500 }
      );
    }

    const res = await fetch(imageUrl);
    if (!res.ok) {
      return NextResponse.json(
        { error: "画像の取得に失敗しました" },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "image/png";
    const buffer = await res.arrayBuffer();
    const filename = key.split("/").pop() ?? "image.png";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("[download-image]", e);
    return NextResponse.json(
      { error: "ダウンロードに失敗しました" },
      { status: 500 }
    );
  }
}
