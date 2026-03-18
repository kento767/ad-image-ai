import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * 「無料で始める」の遷移先
 * 認証済み → ダッシュボード
 * 未認証 → 画像生成ページ（ログインは生成ボタン押下時に要求）
 */
export default async function StartPage() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session) {
      redirect("/dashboard");
    }
  } catch {
    // DB未設定等でgetSessionが失敗した場合は generate へ
  }
  redirect("/generate");
}
