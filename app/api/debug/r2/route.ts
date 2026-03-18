/**
 * R2 設定の診断 API
 * GET /api/debug/r2 で R2 の設定状況を確認
 */
import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { config } from "dotenv";
import "@/lib/ensure-env"; // アプリと同じ方法で .env.local を読み込む

const REQUIRED_KEYS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
] as const;

export async function GET() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envExists = fs.existsSync(envPath);

  // .env.local のキーと値の長さを確認（値そのものは表示しない）
  let keysInFile: string[] = [];
  const valueLengths: Record<string, number> = {};
  if (envExists) {
    const content = fs.readFileSync(envPath, "utf-8");
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex < 0) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const rawValue = trimmed.slice(eqIndex + 1).trim();
      // 引用符を除去した値の長さ
      const value = rawValue.replace(/^["']|["']$/g, "");
      if (key.startsWith("R2_")) {
        keysInFile.push(key);
        valueLengths[key] = value.length;
      }
    }
  }

  // override: true で確実に .env.local を読み込む（Next.js の事前読み込みと競合する場合対策）
  const result = config({ path: envPath, override: true });
  config({ path: path.resolve(process.cwd(), ".env"), override: true });

  const accountId = process.env.R2_ACCOUNT_ID ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";
  const bucketName = process.env.R2_BUCKET_NAME ?? "";
  const publicUrl = process.env.R2_PUBLIC_URL ?? "";

  const canUpload = !!(accountId && accessKeyId && secretAccessKey && bucketName);
  const hasPublicUrl = !!publicUrl?.trim();

  const diagnostics: Record<string, string> = {
    envFileExists: envExists ? "はい" : "いいえ (.env.local がありません)",
    envFileLoaded: result.parsed ? "はい" : "いいえ",
    cwd: process.cwd(),
    envFilePath: envPath,
    R2_ACCOUNT_ID: accountId ? `設定済み (${accountId.length}文字)` : "未設定",
    R2_ACCESS_KEY_ID: accessKeyId ? "設定済み" : "未設定",
    R2_SECRET_ACCESS_KEY: secretAccessKey ? "設定済み" : "未設定",
    R2_BUCKET_NAME: bucketName ? `設定済み (${bucketName})` : "未設定",
    R2_PUBLIC_URL: publicUrl ? `設定済み (${publicUrl})` : "未設定",
  };

  // 各キーが .env.local に記載されているか、ファイル上の値の長さ
  for (const key of REQUIRED_KEYS) {
    diagnostics[`${key}_in_file`] = keysInFile.includes(key) ? "記載あり" : "記載なし";
    diagnostics[`${key}_value_length_in_file`] = String(valueLengths[key] ?? 0);
  }
  diagnostics.R2_PUBLIC_URL_value_length_in_file = String(valueLengths.R2_PUBLIC_URL ?? 0);

  // dotenv がパースした結果と process.env を比較（値の長さのみ表示、秘密は出さない）
  if (result.parsed) {
    for (const key of [...REQUIRED_KEYS, "R2_PUBLIC_URL"]) {
      const parsedVal = result.parsed[key];
      const envVal = process.env[key];
      diagnostics[`${key}_parsed`] = parsedVal ? `${parsedVal.length}文字` : "空";
      diagnostics[`${key}_in_process_env`] = envVal ? `${envVal.length}文字` : "空";
    }
  }

  if (!canUpload) {
    const missingInFile = REQUIRED_KEYS.filter((k) => !keysInFile.includes(k));
    return NextResponse.json({
      ok: false,
      error:
        "R2 アップロードに必要な設定が不足しています。.env.local に以下を追加してください。",
      diagnostics,
      hint: missingInFile.length
        ? `.env.local に ${missingInFile.join(", ")} の行がありません。変数名を正確にコピーしてください。`
        : "変数名は正しいですが値が空の可能性があります。= の後に値が入っているか確認してください。.env.local を変更したら、開発サーバー（npm run dev）を再起動してください。",
      example: `
# .env.local に追加する例（値は実際の値に置き換えてください）:
R2_ACCOUNT_ID=あなたのCloudflareアカウントID
R2_ACCESS_KEY_ID=作成したAPIトークンのAccess Key ID
R2_SECRET_ACCESS_KEY=作成したAPIトークンのSecret Access Key
R2_BUCKET_NAME=作成したバケット名
R2_PUBLIC_URL=https://xxx.r2.dev
`.trim(),
    });
  }

  return NextResponse.json({
    ok: true,
    message: hasPublicUrl
      ? "R2 は設定済みです。画像はR2にアップロードされ、公開URLで表示されます。"
      : "R2 アップロードは有効です。R2_PUBLIC_URL を設定すると、生成画像を公開URLで表示できます（未設定時は base64 で表示）。",
    diagnostics: { ...diagnostics, canUpload: true, hasPublicUrl },
  });
}
