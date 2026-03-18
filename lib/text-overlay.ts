/**
 * 生成画像にキャッチコピーを正確にオーバーレイする
 * 画像の雰囲気（テンプレートのスタイル・カテゴリ）に合わせてフォントを選択
 */
import path from "path";
import fs from "fs";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

type FontStyle = "pop" | "elegant" | "modern" | "bold";

const FONT_CONFIGS: Record<
  FontStyle,
  { path: string; family: string; weight?: string }
> = {
  pop: {
    path: "node_modules/@fontsource/m-plus-rounded-1c/files/m-plus-rounded-1c-japanese-700-normal.woff",
    family: "MPLUSRounded1c",
  },
  elegant: {
    path: "node_modules/@fontsource/noto-serif-jp/files/noto-serif-jp-japanese-700-normal.woff",
    family: "NotoSerifJP",
  },
  modern: {
    path: "node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-700-normal.woff",
    family: "NotoSansJP",
  },
  bold: {
    path: "node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-900-normal.woff",
    family: "NotoSansJPBold",
  },
};

const registeredFonts = new Set<FontStyle>();

function ensureFont(style: FontStyle) {
  if (registeredFonts.has(style)) return;
  const config = FONT_CONFIGS[style];
  const fontPath = path.join(process.cwd(), config.path);
  if (!fs.existsSync(fontPath)) {
    throw new Error(
      `[text-overlay] Font file not found: ${fontPath}. Run: npm install @fontsource/noto-sans-jp @fontsource/noto-serif-jp @fontsource/m-plus-rounded-1c`
    );
  }
  GlobalFonts.registerFromPath(fontPath, config.family);
  registeredFonts.add(style);
}

/**
 * テンプレートのスタイル・カテゴリからフォントスタイルを決定
 */
export function getFontStyleFromTemplate(
  templateStyle?: string | null,
  templateCategory?: string | null
): FontStyle {
  const style = (templateStyle ?? "").toLowerCase();
  const category = (templateCategory ?? "").toLowerCase();

  // ポップ・セール・イベント → 丸ゴシック
  if (
    style.includes("ポップ") ||
    category.includes("期間限定") ||
    category.includes("セール") ||
    category.includes("イベント")
  ) {
    return "pop";
  }

  // ミニマル・ブランド → セリフ（高級感）
  if (
    style.includes("ミニマル") ||
    category.includes("ブランド")
  ) {
    return "elegant";
  }

  // ダイナミック・ビジュアル → 太めゴシック
  if (style.includes("ダイナミック") || style.includes("ビジュアル")) {
    return "bold";
  }

  // モダン・インフォグラフィック・新商品・その他 → ゴシック
  return "modern";
}

export type OverlayOptions = {
  /** オーバーレイするテキスト */
  text: string;
  /** 画像の幅 */
  width: number;
  /** 画像の高さ */
  height: number;
  /** フォントスタイル（画像の雰囲気に合わせる） */
  fontStyle?: FontStyle;
  /** フォントサイズ（画像幅に対する割合、0.08 = 8%） */
  fontSizeRatio?: number;
  /** テキストの位置: "center" | "bottom" | "top" */
  position?: "center" | "bottom" | "top";
  /** テキスト色（CSS色） */
  textColor?: string;
  /** 縁取り色（視認性向上） */
  strokeColor?: string;
  /** 縁取りの太さ */
  strokeWidth?: number;
};

/**
 * Base64画像にテキストをオーバーレイして、新しいBase64画像を返す
 */
export async function overlayTextOnImage(
  imageBase64: string,
  mimeType: string,
  options: OverlayOptions
): Promise<{ base64: string; mimeType: string }> {
  const fontStyle = options.fontStyle ?? "modern";
  ensureFont(fontStyle);

  const buffer = Buffer.from(imageBase64, "base64");
  const image = await loadImage(buffer);

  const { width, height, text } = options;
  const fontSizeRatio = options.fontSizeRatio ?? 0.08;
  const position = options.position ?? "bottom";
  const textColor = options.textColor ?? "#FFFFFF";
  const strokeColor = options.strokeColor ?? "#000000";
  const strokeWidth = options.strokeWidth ?? 3;

  const config = FONT_CONFIGS[fontStyle];
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0, width, height);

  const fontSize = Math.max(24, Math.min(120, Math.round(width * fontSizeRatio)));
  ctx.font = `bold ${fontSize}px ${config.family}, "Noto Sans JP", sans-serif`;

  const lines = wrapText(ctx, text, width * 0.85);
  const lineHeight = fontSize * 1.3;
  const totalHeight = lines.length * lineHeight;
  const yBase =
    position === "top"
      ? totalHeight + fontSize * 0.5
      : position === "bottom"
        ? height - fontSize * 0.5 - (lines.length - 1) * lineHeight
        : height / 2 - totalHeight / 2 + fontSize * 0.8;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  lines.forEach((line, i) => {
    const x = width / 2;
    const y = yBase + i * lineHeight;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.strokeText(line, x, y);

    ctx.fillStyle = textColor;
    ctx.fillText(line, x, y);
  });

  const pngBuffer = await canvas.encode("png");
  return {
    base64: pngBuffer.toString("base64"),
    mimeType: "image/png",
  };
}

/**
 * テキストを幅に収まるよう改行で分割
 */
function wrapText(
  ctx: { measureText(text: string): { width: number } },
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\n/);

  for (const para of paragraphs) {
    if (!para.trim()) continue;
    const words = para.split("");
    let currentLine = "";

    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}
