import { createAuthClient } from "better-auth/react";

/**
 * クライアント側では現在の origin を使用（ポート不一致を防ぐ）
 * サーバー側（SSR）では環境変数またはフォールバック
 */
function getBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});
