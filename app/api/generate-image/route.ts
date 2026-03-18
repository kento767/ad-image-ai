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
import {
  overlayTextOnImage,
  getFontStyleFromTemplate,
} from "@/lib/text-overlay";

// Nano Banana Pro（画像生成）: https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image
const MODEL = "gemini-3-pro-image-preview";

const ASPECT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1440, height: 1440 },
  "4:5": { width: 1440, height: 1800 },
  "9:16": { width: 1440, height: 2560 },
};

const CREDITS_PER_IMAGE = 1;

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
        { error: "IMAGE_AI_API_KEY が設定されていません。.env.local に追加してください。" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      prompt,
      catchCopy,
      aspectRatio = "1:1",
      templateId,
      sourceImageBase64,
      sourceImageMimeType,
      sourceR2Key,
    } = body as {
      prompt?: string;
      catchCopy?: string;
      aspectRatio?: string;
      templateId?: string | null;
      sourceImageBase64?: string;
      sourceImageMimeType?: string;
      sourceR2Key?: string;
    };

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "プロンプトを入力してください" }, { status: 400 });
    }

    // テンプレート選択時はスタイル指示をプロンプトに組み込む
    let finalPrompt = prompt.trim();
    let templateStyle: string | null = null;
    let templateCategory: string | null = null;
    if (templateId) {
      const template = await db
        .selectFrom("template")
        .select(["promptTemplate", "style", "category"])
        .where("id", "=", templateId)
        .where("isActive", "=", 1)
        .executeTakeFirst();
      if (template?.promptTemplate) {
        finalPrompt = template.promptTemplate.replace("{{入力}}", prompt.trim());
      }
      templateStyle = template?.style ?? null;
      templateCategory = template?.category ?? null;
    }

    const hasSourceImage = !!(sourceImageBase64 || sourceR2Key);
    let base64Image: string | null = null;
    let imageMimeType = sourceImageMimeType ?? "image/png";

    if (sourceR2Key) {
      const imageUrl = getR2PublicUrlOrNull(sourceR2Key);
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
      base64Image = Buffer.from(imageBuffer).toString("base64");
      imageMimeType = imageRes.headers.get("content-type") ?? "image/png";
    } else if (sourceImageBase64) {
      base64Image = sourceImageBase64;
    }

    if (hasSourceImage && !base64Image) {
      return NextResponse.json(
        { error: "元画像の取得に失敗しました" },
        { status: 400 }
      );
    }

    // 自分の画像か確認（sourceR2Key の場合）
    if (sourceR2Key) {
      const ownImage = await db
        .selectFrom("generated_image")
        .select(["id"])
        .where("r2Key", "=", sourceR2Key)
        .where("userId", "=", session.user.id)
        .executeTakeFirst();
      if (!ownImage) {
        return NextResponse.json(
          { error: "指定された画像が見つかりません" },
          { status: 404 }
        );
      }
    }

    // 1. クレジット残高チェック
    const creditsRow = await db
      .selectFrom("user_credits")
      .select(["id", "credits"])
      .where("userId", "=", session.user.id)
      .executeTakeFirst();

    const currentCredits = creditsRow?.credits ?? 0;
    if (currentCredits < CREDITS_PER_IMAGE) {
      return NextResponse.json(
        { error: "クレジットが不足しています。プランをご確認ください。" },
        { status: 402 }
      );
    }

    // 2. 画像生成
    // キャッチコピーがある場合はAIに文字を描画させない（文字化け防止）。後でプログラムでオーバーレイする。
    const noTextInstruction = catchCopy?.trim()
      ? "\n\n【重要】画像内にテキストや文字は一切含めないでください。文字は別途オーバーレイされます。"
      : "";
    const textAndContentInstruction = !catchCopy?.trim()
      ? "\n\n【文字・要素について】プロンプトで指定されたテキストや任意の要素は、すべて画像内に含めてください。文字を描画する場合は、指定された文字を正確に一文字ずつ、文字化けや誤字・欠損なく描画してください。"
      : "";
    const baseInstruction = `広告用の画像を生成してください。以下の【スタイル】と【内容】の指示に厳密に従い、カテゴリに合った躍動感・色合い・雰囲気で画像を作成してください。アスペクト比は${aspectRatio}で。${noTextInstruction}${textAndContentInstruction}\n\n${finalPrompt}`;

    const ai = new GoogleGenAI({ apiKey });
    const contents = hasSourceImage && base64Image
      ? [
          {
            inlineData: {
              mimeType: imageMimeType,
              data: base64Image,
            },
          },
          {
            text: `この画像を参考に、以下の指示に従って新しい広告画像を生成してください。元の画像の雰囲気や構図を活かしつつ、指示の【スタイル】と【内容】に厳密に従い、カテゴリに合った躍動感・色合いで画像を作成してください。アスペクト比は${aspectRatio}で。${noTextInstruction}${textAndContentInstruction}\n\n${finalPrompt}`,
          },
        ]
      : baseInstruction;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        ...(aspectRatio && { aspectRatio }),
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    let imageData: string | null = null;
    let mimeType = "image/png";

    for (const part of parts) {
      if ("inlineData" in part && part.inlineData) {
        const { data, mimeType: mt } = part.inlineData;
        if (data) {
          imageData = data;
          mimeType = mt ?? "image/png";
          break;
        }
      }
    }

    if (!imageData) {
      return NextResponse.json(
        { error: "画像の生成に失敗しました。別のプロンプトをお試しください。" },
        { status: 500 }
      );
    }

    const dimensions =
      ASPECT_DIMENSIONS[aspectRatio] ?? ASPECT_DIMENSIONS["1:1"];

    // 2.5 キャッチコピーをオーバーレイ（画像の雰囲気に合わせたフォントで描画）
    if (catchCopy?.trim()) {
      try {
        const textToOverlay = String(catchCopy).trim();
        const fontStyle = getFontStyleFromTemplate(templateStyle, templateCategory);
        const overlaid = await overlayTextOnImage(
          imageData,
          mimeType,
          {
            text: textToOverlay,
            width: dimensions.width,
            height: dimensions.height,
            fontStyle,
            fontSizeRatio: 0.07,
            position: "bottom",
            textColor: "#FFFFFF",
            strokeColor: "#000000",
            strokeWidth: 4,
          }
        );
        imageData = overlaid.base64;
        mimeType = overlaid.mimeType;
      } catch (overlayErr) {
        const errMsg =
          overlayErr instanceof Error ? overlayErr.message : String(overlayErr);
        console.error("[generate-image] Text overlay failed:", overlayErr);
        return NextResponse.json(
          {
            error: `キャッチコピーの描画に失敗しました: ${errMsg}`,
          },
          { status: 500 }
        );
      }
    }

    // 2.6 プロンプト履歴を保存（再入力時に選択できるように）
    try {
      const historyId = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.insertInto("prompt_history").values({
        id: historyId,
        userId: session.user.id,
        catchCopy: catchCopy?.trim() || null,
        prompt: prompt.trim(),
        createdAt: now,
      }).execute();
    } catch (historyErr) {
      console.warn("[generate-image] Prompt history save failed:", historyErr);
    }

    // 3. R2 にアップロード & DB 保存 & クレジット消費
    if (isR2Configured()) {
      try {
        const r2Key = await uploadImageToR2(
          imageData,
          mimeType,
          session.user.id
        );

        const imageId = crypto.randomUUID();
        const now = new Date().toISOString();

        const storedPrompt = catchCopy?.trim()
          ? `[キャッチコピー: ${catchCopy.trim()}]\n${finalPrompt}`
          : finalPrompt;

        await db.insertInto("generated_image").values({
          id: imageId,
          userId: session.user.id,
          r2Key,
          prompt: storedPrompt,
          templateId: templateId ?? null,
          aspectRatio,
          width: dimensions.width,
          height: dimensions.height,
          creditsUsed: CREDITS_PER_IMAGE,
          createdAt: now,
        }).execute();

        await db
          .updateTable("user_credits")
          .set({
            credits: currentCredits - CREDITS_PER_IMAGE,
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
          image: imageData,
          mimeType,
        };
        if (hasR2PublicUrl()) {
          responseData.url = getR2PublicUrl(r2Key);
        }
        responseData.r2Key = r2Key;

        return NextResponse.json(responseData);
      } catch (r2Err) {
        const errMsg = r2Err instanceof Error ? r2Err.message : String(r2Err);
        console.error("[generate-image] R2 upload failed:", errMsg, r2Err);
        return NextResponse.json(
          {
            error: `画像の保存に失敗しました: ${errMsg}。R2 の設定（R2_ACCOUNT_ID, R2_BUCKET_NAME 等）をご確認ください。`,
          },
          { status: 500 }
        );
      }
    }

    // R2 未設定時は従来通り base64 のみ返す（クレジット消費なし・DB保存なし）
    return NextResponse.json({
      image: imageData,
      mimeType: mimeType ?? "image/png",
    });
  } catch (e) {
    console.error("[generate-image]", e);
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
      (e instanceof Error ? e.message : "画像生成中にエラーが発生しました");
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
            "APIの利用制限に達しました。約1分後に再試行するか、Google AI Studio でプラン・利用状況を確認してください。",
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
