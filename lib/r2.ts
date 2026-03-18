import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getR2Env() {
  return {
    accountId: process.env.R2_ACCOUNT_ID ?? "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    bucketName: process.env.R2_BUCKET_NAME ?? "",
    publicUrl: process.env.R2_PUBLIC_URL ?? "",
  };
}

function getR2Client(): S3Client {
  const { accountId, accessKeyId, secretAccessKey } = getR2Env();
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY が設定されていません"
    );
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/** アップロードに必要な最小限の設定（R2_PUBLIC_URL は不要） */
export function isR2Configured(): boolean {
  const { accountId, accessKeyId, secretAccessKey, bucketName } = getR2Env();
  return !!(accountId && accessKeyId && secretAccessKey && bucketName);
}

/** 公開 URL を返せるか（R2_PUBLIC_URL が設定されているか） */
export function hasR2PublicUrl(): boolean {
  const { publicUrl } = getR2Env();
  return !!publicUrl?.trim();
}

/**
 * Base64 画像データを R2 にアップロードする
 * @returns R2 に保存したオブジェクトのキー
 */
export async function uploadImageToR2(
  base64Data: string,
  mimeType: string,
  userId: string
): Promise<string> {
  const client = getR2Client();
  const { bucketName } = getR2Env();
  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME が設定されていません");
  }

  const buffer = Buffer.from(base64Data, "base64");
  const ext = mimeType === "image/png" ? "png" : "webp";
  const key = `generated/${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return key;
}

/**
 * R2 キーから公開 URL を構築する（R2_PUBLIC_URL 未設定時は throw）
 */
export function getR2PublicUrl(r2Key: string): string {
  const { publicUrl } = getR2Env();
  const baseUrl = publicUrl.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("R2_PUBLIC_URL が設定されていません");
  }
  return `${baseUrl}/${r2Key}`;
}

/**
 * R2 キーから公開 URL を構築する（未設定時は null）
 */
export function getR2PublicUrlOrNull(r2Key: string): string | null {
  const { publicUrl } = getR2Env();
  const baseUrl = publicUrl?.replace(/\/$/, "") ?? "";
  if (!baseUrl) return null;
  return `${baseUrl}/${r2Key}`;
}
