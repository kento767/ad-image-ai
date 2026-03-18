import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getR2PublicUrlOrNull } from "@/lib/r2";
import Link from "next/link";
import { ImageEditForm } from "./image-edit-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ImageDetailPage({ params }: Props) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) { redirect("/login"); }

  const image = await db
    .selectFrom("generated_image")
    .selectAll()
    .where("id", "=", id)
    .where("userId", "=", session.user.id)
    .executeTakeFirst();

  if (!image) {
    notFound();
  }

  const imageUrl = getR2PublicUrlOrNull(image.r2Key);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#C71585] transition-colors hover:text-[#FF1493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1493] focus-visible:ring-offset-2 rounded-lg px-2 py-1"
        >
          ← ダッシュボードに戻る
        </Link>

        <h1 className="mb-6 font-pop text-2xl font-black text-[#FF1493] sm:text-3xl">
          画像編集
        </h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border-4 border-[#FF1493] bg-white p-6 shadow-[6px_6px_0_0_#C71585]">
            <h2 className="mb-4 font-pop text-lg font-bold text-[#C71585]">
              元画像
            </h2>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={image.prompt}
                className="w-full rounded-2xl border-2 border-[#FF1493]/30 object-contain"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#FFD700]/30 text-slate-500">
                画像を表示できません
              </div>
            )}
            <p className="mt-4 text-sm font-medium text-slate-700">
              {image.prompt}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {image.aspectRatio} ·{" "}
              {new Date(image.createdAt).toLocaleDateString("ja-JP")}
            </p>
          </div>

          <div className="rounded-3xl border-4 border-[#FF1493] bg-white p-6 shadow-[6px_6px_0_0_#C71585]">
            <ImageEditForm
              imageId={image.id}
              r2Key={image.r2Key}
              aspectRatio={image.aspectRatio}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
