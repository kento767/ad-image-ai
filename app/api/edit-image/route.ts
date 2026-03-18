import { NextRequest, NextResponse } from "next/server";
import "@/lib/ensure-env";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/lib/db";
import {
  isR2Configured,
  hasR2PublicUrl,
  uploadImageToR2,
  getR2PublicUrl,
  getR2PublicUrlOrNull,
} from "@/lib/r2";

const MODEL = "gemini-3-pro-image-preview";
const CREDITS_PER_EDIT = 1;

const ASPECT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1440, height: 1440 },
  "4:5": { width: 1440, height: 1800 },
  "9:16": { width: 1440, height: 2560 },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const apiKey = process.env.IMAGE_AI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "IMAGE_AI_API_KEY が設定されていません" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      imageId,
      r2Key,
      editPrompt,
      aspectRatio = "1:1",
    } = body as {
      imageId?: string;
      r2Key?: string;
      editPrompt?: string;
      aspectRatio?: string;
    };

    if (!editPrompt || typeof editPrompt !== "string") {
      return NextResponse.json(
        { error: "編集内容を入力してください" },
        { status: 400 }
      );
    }

    if (!imageId || !r2Key) {
      return NextResponse.json(
        { error: "画像情報が不正です" },
        { status: 400 }
      );
    }

    // 自分の画像か確認
    const originalImage = await db
      .selectFrom("generated_image")
      .select(["id", "prompt"])
      .where("id", "=", imageId)
      .where("userId", "=", session.user.id)
      .executeTakeFirst();

    if (!originalImage) {
      return NextResponse.json(
        { error: "画像が見つかりません" },
        { status: 404 }
      );
    }

    // クレジットチェック
    const creditsRow = await db
      .selectFrom("user_credits")
      .select(["credits"])
      .where("userId", "=", session.user.id)
      .executeTakeFirst();

    const currentCredits = creditsRow?.credits ?? 0;
    if (currentCredits < CREDITS_PER_EDIT) {
      return NextResponse.json(
        { error: "クレジットが不足しています。プランをご確認ください。" },
        { status: 402 }
      );
    }

    // R2 から元画像を取得
    const imageUrl = getR2PublicUrlOrNull(r2Key);
    if (!imageUrl) {
      return NextResponse.json(
        { error: "R2 の公開URLが設定されていません" },
        { status: 500 }
      );
    }

    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "元画像の取得に失敗しました" },
        { status: 502 }
      );
    }

    const imageBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageRes.headers.get("content-type") ?? "image/png";

    // Gemini で画像編集
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
        {
          text: `この広告画像を編集してください。以下の指示に従って、元の画像の雰囲気を保ちながら編集してください。アスペクト比は${aspectRatio}のままにしてください。編集指示で指定されたテキストや任意の要素はすべて画像内に含めてください。文字を描画する場合は、指定された文字を正確に一文字ずつ、文字化けや誤字・欠損なく描画してください。\n\n編集指示：${editPrompt}`,
        },
      ],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        ...(aspectRatio && { aspectRatio }),
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    let editedImageData: string | null = null;
    let editedMimeType = "image/png";

    for (const part of parts) {
      if ("inlineData" in part && part.inlineData) {
        const { data, mimeType: mt } = part.inlineData;
        if (data) {
          editedImageData = data;
          editedMimeType = mt ?? "image/png";
          break;
        }
      }
    }

    if (!editedImageData) {
      return NextResponse.json(
        { error: "画像の編集に失敗しました。別の編集内容をお試しください。" },
        { status: 500 }
      );
    }

    const dimensions =
      ASPECT_DIMENSIONS[aspectRatio] ?? ASPECT_DIMENSIONS["1:1"];
    const combinedPrompt = `[編集] ${originalImage.prompt} → ${editPrompt}`;

    // R2 にアップロード & DB 保存 & クレジット消費
    if (isR2Configured()) {
      try {
        const newR2Key = await uploadImageToR2(
          editedImageData,
          editedMimeType,
          session.user.id
        );

        const newImageId = crypto.randomUUID();
        const now = new Date().toISOString();

        await db.insertInto("generated_image").values({
          id: newImageId,
          userId: session.user.id,
          r2Key: newR2Key,
          prompt: combinedPrompt,
          templateId: null,
          aspectRatio,
          width: dimensions.width,
          height: dimensions.height,
          creditsUsed: CREDITS_PER_EDIT,
          createdAt: now,
        }).execute();

        await db
          .updateTable("user_credits")
          .set({
            credits: currentCredits - CREDITS_PER_EDIT,
            updatedAt: now,
          })
          .where("userId", "=", session.user.id)
          .execute();

        const responseData: {
          image: string;
          mimeType: string;
          url?: string;
          r2Key?: string;
        } = {
          image: editedImageData,
          mimeType: editedMimeType,
        };
        if (hasR2PublicUrl()) {
          responseData.url = getR2PublicUrl(newR2Key);
          responseData.r2Key = newR2Key;
        }

        return NextResponse.json(responseData);
      } catch (r2Err) {
        const errMsg = r2Err instanceof Error ? r2Err.message : String(r2Err);
        console.error("[edit-image] R2 upload failed:", errMsg, r2Err);
        return NextResponse.json(
          {
            error: `画像の保存に失敗しました: ${errMsg}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      image: editedImageData,
      mimeType: editedMimeType,
    });
  } catch (e) {
    console.error("[edit-image]", e);
    const err = e as {
      status?: number;
      statusCode?: number;
      code?: number;
      message?: string;
      error?: { code?: number; status?: string; message?: string };
    };
    const status = err.status ?? err.statusCode ?? err.code ?? err.error?.code ?? 500;
    const msg =
      err.message ??
      err.error?.message ??
      (e instanceof Error ? e.message : "画像の編集中にエラーが発生しました");
    const is429 =
      status === 429 ||
      err.error?.status === "RESOURCE_EXHAUSTED" ||
      msg.includes("429") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("quota");
    if (is429) {
      return NextResponse.json(
        {
          error:
            "APIの利用制限に達しました。約1分後に再試行してください。",
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: msg },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}
