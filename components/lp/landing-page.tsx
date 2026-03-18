"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  displayName: string;
  creditsPerMonth: number;
  priceYen: number;
  description: string | null;
  sortOrder: number;
};

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFD700] border-b-4 border-[#FF1493] py-4">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF1493] text-white">
          <Sparkles size={18} />
        </div>
        <span className="font-pop text-2xl font-bold text-[#FF1493]">
          AdCraft
        </span>
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        <Link
          href="/generate"
          className="text-sm font-bold text-[#C71585] transition-opacity hover:opacity-70"
        >
          機能
        </Link>
        <Link
          href="/start"
          className="rounded-full bg-[#FF1493] px-6 py-2 text-sm font-bold text-white shadow-[0_4px_0_0_#C71585] transition-all hover:scale-105 active:translate-y-1 active:shadow-none"
        >
          無料で始める
        </Link>
      </div>
    </div>
  </nav>
);

const PopTheme = () => (
  <div className="min-h-screen overflow-hidden bg-[#FFD700] pt-24 font-pop text-[#FF1493]">
    <section className="relative mx-auto max-w-7xl px-6 py-20">
      <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-[#00CED1] opacity-30 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#FF69B4] opacity-20 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-6"
        >
          <div className="inline-block rotate-[-2deg] rounded-full bg-[#FF1493] px-6 py-2 text-lg font-bold text-white shadow-[0_4px_0_0_#C71585]">
            AIで、もっと楽しく！ ✨
          </div>
        </motion.div>

        <h1 className="mb-8 text-7xl font-black leading-none tracking-tight drop-shadow-[0_8px_0_#FFFFFF] md:text-9xl">
          POP IT UP!
          <br />
          <span className="drop-shadow-[0_8px_0_#FF1493] text-white">
            AI AD GEN
          </span>
        </h1>

        <p className="mb-12 max-w-2xl text-2xl font-bold text-[#C71585] md:text-3xl">
          ワクワクする広告を、AIと一緒に作っちゃおう！
          <br />
          あなたの言葉が、カラフルな魔法に変わる。
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/start"
            className="rounded-full bg-[#FF1493] px-12 py-6 text-3xl font-black text-white shadow-[0_8px_0_0_#C71585] transition-all hover:translate-y-1 hover:shadow-[0_4px_0_0_#C71585] active:translate-y-2 active:shadow-none"
          >
            今すぐやってみる！
          </Link>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-2 gap-8 md:grid-cols-4">
        {[
          { color: "#00CED1", label: "CUTE!", img: "https://picsum.photos/seed/pop1/400/400" },
          { color: "#FF69B4", label: "COOL!", img: "https://picsum.photos/seed/pop2/400/400" },
          { color: "#ADFF2F", label: "FUN!", img: "https://picsum.photos/seed/pop3/400/400" },
          { color: "#FF4500", label: "WOW!", img: "https://picsum.photos/seed/pop4/400/400" },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1, rotate: i % 2 === 0 ? 5 : -5 }}
            className="group relative cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-3xl border-4 border-[#FF1493] bg-white shadow-xl">
              <img
                src={item.img}
                alt="Pop AI Ad"
                className="aspect-square w-full object-cover"
              />
              <div className="absolute right-2 top-2 rounded-full border-2 border-[#FF1493] bg-white px-3 py-1 text-xs font-black">
                {item.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    <section className="border-y-8 border-[#FF1493] bg-white py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-20 md:flex-row">
          <div className="flex-1">
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-[40px] border-8 border-[#FF1493] bg-[#00CED1] shadow-[20px_20px_0_0_#FF1493]">
              <img
                src="https://picsum.photos/seed/happy-fun/800/450"
                alt="Pop Demo"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 space-y-8">
            <h2 className="text-5xl font-black leading-tight text-[#FF1493]">
              AI編集も、
              <br />
              <span className="text-[#00CED1]">お絵かき気分</span>で。
            </h2>
            <p className="text-xl font-bold text-slate-600">
              「ここをピンクにして！」「もっとキラキラさせて！」
              <br />
              AIに話しかけるだけで、あなたの画像がどんどん可愛くなるよ。
            </p>
            <ul className="space-y-4">
              {[
                "スタンプ感覚で要素を追加",
                "一瞬で背景チェンジ",
                "文字入れもAIにおまかせ",
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-4 text-lg font-black text-[#C71585]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#FF1493] bg-[#FFD700]">
                    <Sparkles size={16} />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* プランセクション */}
    <PlansSection />
  </div>
);

const PlansSection = () => {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => setPlans(data.plans ?? []))
      .catch(() => setPlans([]));
  }, []);

  if (plans.length === 0) return null;

  return (
    <section id="plans" className="border-t-8 border-[#FF1493] bg-[#FFD700] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-4 text-center font-pop text-4xl font-black text-[#FF1493] md:text-5xl">
          プラン
        </h2>
        <p className="mb-12 text-center text-lg font-bold text-[#C71585]">
          用途に合わせて選べる、シンプルな料金プラン
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {plans.map((plan) => {
            const isPopular = plan.id === "plan_take";
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={`relative flex flex-col rounded-3xl border-4 bg-white p-6 shadow-[8px_8px_0_0_#C71585] ${
                  isPopular
                    ? "border-[#FF1493] ring-2 ring-[#FF1493]"
                    : "border-[#FF1493]/70"
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
                  <Link
                    href="/start"
                    className={`block rounded-full px-4 py-2 text-center text-sm font-bold transition-all ${
                      isPopular
                        ? "bg-[#FF1493] text-white shadow-[0_4px_0_0_#C71585] hover:scale-105 active:translate-y-1"
                        : "border-2 border-[#FF1493] text-[#FF1493] hover:bg-[#FF1493]/10"
                    }`}
                  >
                    始める
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-slate-600">
          新規登録で
          <span className="font-bold text-[#FF1493]">5クレジット</span>
          をプレゼント！
        </p>
      </div>
    </section>
  );
};

export function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-[#FF1493]/20 selection:text-[#C71585]">
      <Navbar />
      <main>
        <PopTheme />
      </main>

      <footer className="border-t-4 border-[#FF1493] bg-[#1a1a1a] px-6 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
          <div className="col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <Sparkles size={24} className="text-[#FFD700]" />
              <span className="font-pop text-2xl font-bold text-white">
                AdCraft
              </span>
            </div>
            <p className="mb-8 max-w-sm text-slate-300">
              AIの力で、広告制作の常識を変える。より速く、より美しく、より効果的に。
            </p>
          </div>
          <div>
            <h5 className="mb-6 font-bold text-white">サービス</h5>
            <ul className="space-y-4 text-sm text-slate-300">
              <li>
                <Link href="/generate" className="transition-colors hover:text-white">
                  画像生成
                </Link>
              </li>
              <li>
                <Link href="/generate" className="transition-colors hover:text-white">
                  AI編集
                </Link>
              </li>
              <li>
                <Link href="/generate" className="transition-colors hover:text-white">
                  テンプレート
                </Link>
              </li>
              <li>
                <Link href="/#plans" className="transition-colors hover:text-white">
                  プラン
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-6 font-bold text-white">会社情報</h5>
            <ul className="space-y-4 text-sm text-slate-300">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  私たちについて
                </Link>
              </li>
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  利用規約
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-20 max-w-7xl border-t border-white/10 pt-8 text-center text-xs text-slate-400">
          © 2026 AdCraft. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
