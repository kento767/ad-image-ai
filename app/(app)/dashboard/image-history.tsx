"use client";

import Link from "next/link";

type ImageWithUrl = {
  id: string;
  r2Key: string;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
  imageUrl: string | null;
};

type Props = {
  images: ImageWithUrl[];
};

export function ImageHistory({ images }: Props) {
  if (images.length === 0) {
    return (
      <div className="rounded-3xl border-4 border-[#FF1493] bg-white p-12 text-center shadow-[6px_6px_0_0_#C71585]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF1493]/10">
          <svg
            className="h-8 w-8 text-[#FF1493]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="font-bold text-[#C71585]">
          まだ生成した画像はありません
        </p>
        <p className="mt-2 text-sm text-slate-600">
          「画像を生成する」から始めましょう
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((img) => (
        <div
          key={img.id}
          className="overflow-hidden rounded-2xl border-4 border-[#FF1493] bg-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          <div className="aspect-square bg-[#FFD700]/30">
            {img.imageUrl ? (
              <img
                src={img.imageUrl}
                alt={img.prompt.slice(0, 50)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                画像なし
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="line-clamp-2 text-sm font-medium text-slate-700">
              {img.prompt}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                {img.aspectRatio} ·{" "}
                {new Date(img.createdAt).toLocaleDateString("ja-JP")}
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/images/${img.id}`}
                  className="rounded-full bg-[#00CED1] px-3 py-1.5 text-xs font-bold text-white transition-all hover:scale-105"
                >
                  編集
                </Link>
                {img.imageUrl && (
                  <a
                    href={`/api/download-image?key=${encodeURIComponent(img.r2Key)}`}
                    download
                    className="rounded-full bg-[#FF1493] px-3 py-1.5 text-xs font-bold text-white transition-all hover:scale-105"
                  >
                    ダウンロード
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
