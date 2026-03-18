"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Sparkles, Menu, X } from "lucide-react";

function NavLink({
  href,
  children,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1493] focus-visible:ring-offset-2 rounded-lg px-2 py-1 ${
        isActive
          ? "text-[#FF1493] underline decoration-2 underline-offset-4"
          : "text-[#C71585] hover:text-[#FF1493] hover:opacity-90"
      }`}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!session) {
      setCredits(null);
      return;
    }
    fetch("/api/credits")
      .then((r) => r.json())
      .then((data) => setCredits(data.credits))
      .catch(() => setCredits(null));
  }, [session, pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b-4 border-[#FF1493] bg-[#FFD700] shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1493] focus-visible:ring-offset-2 rounded-lg"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF1493] text-white">
            <Sparkles size={18} />
          </div>
          <span className="font-pop text-xl font-bold text-[#FF1493]">
            AdCraft
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 sm:gap-4 md:flex">
          {isPending ? (
            <span className="h-9 w-20 animate-pulse rounded-lg bg-[#FF1493]/20" />
          ) : session ? (
            <>
              {credits !== null && (
                <Link
                  href={credits === 0 ? "/plans" : "/dashboard"}
                  className="flex items-center gap-1.5 rounded-full border-2 border-[#FF1493] bg-white px-3 py-1.5 text-sm font-bold text-[#C71585] transition-all hover:bg-[#FF1493] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1493] focus-visible:ring-offset-2"
                >
                  <Sparkles size={14} />
                  {credits}クレジット
                </Link>
              )}
              <NavLink href="/generate" isActive={pathname === "/generate"}>
                画像生成
              </NavLink>
              <NavLink href="/plans" isActive={pathname?.startsWith("/plans")}>
                プラン
              </NavLink>
              <NavLink
                href="/dashboard"
                isActive={
                  pathname === "/dashboard" || pathname?.startsWith("/dashboard")
                }
              >
                ダッシュボード
              </NavLink>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full border-2 border-[#FF1493] bg-white px-4 py-2 text-sm font-bold text-[#C71585] transition-all hover:bg-[#FF1493] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1493] focus-visible:ring-offset-2"
              >
                <span className="max-w-24 truncate sm:max-w-32">
                  {session.user.name ?? session.user.email}
                </span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await authClient.signOut();
                  router.push("/");
                  router.refresh();
                }}
                className="rounded-full border-2 border-[#FF1493] bg-white px-4 py-2 text-sm font-bold text-[#C71585] transition-all hover:bg-[#FF1493] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1493] focus-visible:ring-offset-2"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#FF1493] px-6 py-2 text-sm font-bold text-white shadow-[0_4px_0_0_#C71585] transition-all hover:scale-105 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1493] focus-visible:ring-offset-2"
            >
              ログイン
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#FF1493] bg-white text-[#FF1493] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1493] focus-visible:ring-offset-2"
          aria-expanded={mobileOpen}
          aria-label="メニューを開く"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          className="border-t-2 border-[#FF1493]/30 bg-[#FFD700] px-4 py-4 md:hidden"
          aria-label="メインメニュー"
        >
          <div className="flex flex-col gap-3">
            {session ? (
              <>
                {credits !== null && (
                  <Link
                    href={credits === 0 ? "/plans" : "/dashboard"}
                    className="flex items-center gap-2 rounded-xl border-2 border-[#FF1493] bg-white px-4 py-3 font-bold text-[#C71585]"
                  >
                    <Sparkles size={18} />
                    {credits}クレジット
                  </Link>
                )}
                <NavLink href="/generate" isActive={pathname === "/generate"}>
                  画像生成
                </NavLink>
                <NavLink
                  href="/plans"
                  isActive={pathname?.startsWith("/plans")}
                >
                  プラン
                </NavLink>
                <NavLink
                  href="/dashboard"
                  isActive={
                    pathname === "/dashboard" ||
                    pathname?.startsWith("/dashboard")
                  }
                >
                  ダッシュボード
                </NavLink>
                <Link
                  href="/dashboard"
                  className="rounded-xl border-2 border-[#FF1493] bg-white px-4 py-3 text-sm font-bold text-[#C71585]"
                >
                  {session.user.name ?? session.user.email}
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await authClient.signOut();
                    router.push("/");
                    router.refresh();
                  }}
                  className="rounded-xl border-2 border-[#FF1493] bg-white px-4 py-3 text-left text-sm font-bold text-[#C71585]"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-[#FF1493] px-6 py-3 text-center font-bold text-white"
              >
                ログイン
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
