import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t-4 border-[#FF1493] bg-[#1a1a1a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Sparkles size={20} className="text-[#FFD700]" />
              <span className="font-pop text-lg font-bold text-white">
                AdCraft
              </span>
            </Link>
            <p className="mt-2 text-sm text-slate-400">
              AIで作る、SNS広告に最適化された画像
            </p>
          </div>
          <nav className="flex flex-wrap gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              ログイン
            </Link>
            <Link
              href="/generate"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              画像生成
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8">
          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} AdCraft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
