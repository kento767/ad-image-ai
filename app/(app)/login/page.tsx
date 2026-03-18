import Link from "next/link";
import { LoginButton } from "./login-button";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/dashboard";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl border-4 border-[#FF1493] bg-white p-8 shadow-[8px_8px_0_0_#C71585] transition-shadow hover:shadow-[10px_10px_0_0_#C71585]">
        <h1 className="mb-6 text-center font-pop text-2xl font-black text-[#FF1493]">
          AdCraft にログイン
        </h1>
        <p className="mb-6 text-center text-sm font-medium text-slate-600">
          Google アカウントでログインします。新規登録で5クレジットをプレゼント！
        </p>
        <div className="space-y-4">
          <LoginButton callbackURL={callbackUrl} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-600">
          <Link href="/" className="font-bold text-[#FF1493] underline hover:no-underline">
            トップに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
