import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function PlansPage() {
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

  const plans = await db
    .selectFrom("plan")
    .selectAll()
    .where("isActive", "=", 1)
    .orderBy("sortOrder", "asc")
    .execute();

  const creditsRow = await db
    .selectFrom("user_credits")
    .select(["planId"])
    .where("userId", "=", session.user.id)
    .executeTakeFirst();

  const currentPlanId = creditsRow?.planId ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 font-pop text-2xl font-black text-[#FF1493] sm:text-3xl">
        プラン一覧
      </h1>
      <p className="mb-8 text-slate-600">
        クレジットが足りない場合は、以下のプランからお選びください。
      </p>

      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const isPopular = plan.id === "plan_take";

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border-4 bg-white p-6 shadow-[6px_6px_0_0_#C71585] transition-all hover:shadow-[8px_8px_0_0_#C71585] hover:-translate-y-0.5 ${
                isPopular
                  ? "border-[#FF1493] ring-2 ring-[#FF1493]"
                  : "border-[#FF1493]/70 hover:border-[#FF1493]/90"
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FF1493] px-3 py-0.5 text-xs font-bold text-white">
                  おすすめ
                </span>
              )}
              <div className="mb-4 flex items-baseline gap-1">
                <span className="font-pop text-2xl font-black text-[#C71585]">
                  {plan.name}
                </span>
                <span className="text-lg font-bold text-slate-600">
                  {plan.displayName}
                </span>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                {plan.description ?? ""}
              </p>
              <div className="mb-4">
                <span className="text-3xl font-black text-[#FF1493]">
                  ¥{plan.priceYen.toLocaleString()}
                </span>
                <span className="ml-1 text-slate-600">/月</span>
              </div>
              <p className="mb-6 text-sm font-bold text-[#C71585]">
                {plan.creditsPerMonth}クレジット/月
              </p>
              <div className="mt-auto">
                {isCurrent ? (
                  <span className="block rounded-full border-2 border-[#FF1493] bg-[#FF1493]/10 px-4 py-2 text-center text-sm font-bold text-[#C71585]">
                    現在のプラン
                  </span>
                ) : (
                  <Link
                    href={`/plans/${plan.id}/signup`}
                    className={`block rounded-full px-4 py-2 text-center text-sm font-bold transition-all ${
                      isPopular
                        ? "bg-[#FF1493] text-white shadow-[0_4px_0_0_#C71585] hover:scale-105 active:translate-y-1"
                        : "border-2 border-[#FF1493] text-[#FF1493] hover:bg-[#FF1493]/10"
                    }`}
                  >
                    プランに申し込む
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12">
        <Link
          href="/dashboard"
          className="text-sm font-bold text-[#FF1493] underline hover:no-underline"
        >
          ← ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}
