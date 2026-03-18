import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getR2PublicUrlOrNull } from "@/lib/r2";
import { ImageHistory } from "./image-history";

export default async function DashboardPage() {
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    redirect("/login");
  }

  if (!session) {
    redirect("/login");
  }

  const creditsRow = await db
    .selectFrom("user_credits")
    .select(["credits", "planId"])
    .where("userId", "=", session.user.id)
    .executeTakeFirst();

  const credits = creditsRow?.credits ?? 0;
  const planId = creditsRow?.planId ?? null;

  const plan = planId
    ? await db
        .selectFrom("plan")
        .select(["displayName"])
        .where("id", "=", planId)
        .executeTakeFirst()
    : null;
  const planName = plan?.displayName ?? (planId ? "有料プラン" : "無料プラン");

  const images = await db
    .selectFrom("generated_image")
    .selectAll()
    .where("userId", "=", session.user.id)
    .orderBy("createdAt", "desc")
    .limit(24)
    .execute();

  const imagesWithUrl = images.map((img) => ({
    ...img,
    imageUrl: getR2PublicUrlOrNull(img.r2Key),
  }));

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 font-pop text-2xl font-black text-[#FF1493] sm:text-3xl">
          ダッシュボード
        </h1>
        <p className="font-bold text-[#C71585]">
          ようこそ、{session.user.name ?? session.user.email} さん！
        </p>

        {/* クレジット・プラン */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border-4 border-[#FF1493] bg-white p-6 shadow-[6px_6px_0_0_#C71585] transition-shadow hover:shadow-[8px_8px_0_0_#C71585]">
            <h2 className="mb-2 text-sm font-bold text-[#C71585]">
              クレジット残高
            </h2>
            <p className="text-3xl font-black text-[#FF1493]">
              {credits}
              <span className="ml-1 text-lg font-normal text-slate-600">
                クレジット
              </span>
            </p>
          </div>
          <Link
            href="/plans"
            className="rounded-3xl border-4 border-[#FF1493] bg-white p-6 shadow-[6px_6px_0_0_#C71585] transition-all hover:shadow-[8px_8px_0_0_#C71585]"
          >
            <h2 className="mb-2 text-sm font-bold text-[#C71585]">
              プラン
            </h2>
            <p className="text-xl font-bold text-slate-900">
              {planName}
            </p>
            {!planId ? (
              <p className="mt-2 text-sm text-slate-600">
                有料プランにアップグレードでクレジットを追加 →
              </p>
            ) : (
              <p className="mt-2 text-sm text-[#FF1493]">
                プラン変更 →
              </p>
            )}
          </Link>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/generate"
            className="rounded-full bg-[#FF1493] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#C71585] transition-all hover:scale-105 active:translate-y-1 active:shadow-none"
          >
            画像を生成する
          </Link>
        </div>

        {/* 画像履歴 */}
        <section className="mt-12">
          <h2 className="mb-4 font-pop text-xl font-black text-[#FF1493]">
            生成画像履歴
          </h2>
          <ImageHistory images={imagesWithUrl} />
        </section>
      </div>
    </div>
  );
}
