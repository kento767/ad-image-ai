import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PlanSignupPage({ params }: Props) {
  const { id } = await params;

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

  const plan = await db
    .selectFrom("plan")
    .selectAll()
    .where("id", "=", id)
    .where("isActive", "=", 1)
    .executeTakeFirst();

  if (!plan) {
    redirect("/plans");
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-6 font-pop text-2xl font-black text-[#FF1493]">
        {plan.displayName} へのお申し込み
      </h1>
      <div className="rounded-3xl border-4 border-[#FF1493] bg-white p-8 shadow-[6px_6px_0_0_#C71585]">
        <p className="mb-4 text-slate-700">
          <span className="font-bold text-[#C71585]">{plan.displayName}</span>
          は月額 <strong>¥{plan.priceYen.toLocaleString()}</strong>（税別）で、
          <strong>{plan.creditsPerMonth}クレジット</strong>/月をご利用いただけます。
        </p>
        <p className="mb-6 text-sm text-slate-600">
          決済機能は準備中です。プランのお申し込みは
          <a
            href="mailto:support@example.com"
            className="ml-1 font-bold text-[#FF1493] underline hover:no-underline"
          >
            お問い合わせ
          </a>
          よりお願いいたします。
        </p>
        <Link
          href="/plans"
          className="inline-block rounded-full border-2 border-[#FF1493] bg-white px-6 py-2 text-sm font-bold text-[#FF1493] transition-all hover:bg-[#FF1493]/10"
        >
          ← プラン一覧に戻る
        </Link>
      </div>
    </div>
  );
}
