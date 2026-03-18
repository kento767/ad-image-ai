"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  imageId: string;
  r2Key: string;
  aspectRatio: string;
};

export function ImageEditForm({ imageId, r2Key, aspectRatio }: Props) {
  const router = useRouter();
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultR2Key, setResultR2Key] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim()) return;
    setIsEditing(true);
    setError(null);
    setResultImage(null);
    try {
      const res = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId,
          r2Key,
          editPrompt: editPrompt.trim(),
          aspectRatio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error ?? "画像の編集に失敗しました";
        if (res.status === 429) {
          setError(
            "APIの利用制限に達しました。約1分後に再試行してください。"
          );
        } else if (res.status === 402) {
          router.push("/plans");
          return;
        } else {
          setError(typeof errMsg === "string" ? errMsg : errMsg.message ?? "画像の編集に失敗しました");
        }
        return;
      }
      if (data.url) {
        setResultImage(data.url);
        setResultR2Key(data.r2Key ?? null);
      } else if (data.image) {
        setResultImage(`data:${data.mimeType ?? "image/png"};base64,${data.image}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 font-pop text-lg font-bold text-[#FF1493]">
        AI編集
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        編集したい内容を日本語で入力してください。例：「背景を夏らしく変更して」「色を鮮やかにして」
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          placeholder="編集内容を入力..."
          rows={4}
          className="w-full rounded-2xl border-2 border-[#FF1493]/50 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#FF1493] focus:outline-none focus:ring-2 focus:ring-[#FF1493]/30"
          required
        />
        <button
          type="submit"
          disabled={isEditing || !editPrompt.trim()}
          className="w-full rounded-full bg-[#FF1493] px-6 py-3 font-bold text-white shadow-[0_4px_0_0_#C71585] transition-all hover:scale-[1.02] active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {isEditing ? "編集中..." : "編集する（1クレジット消費）"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm font-bold text-red-600">{error}</p>
      )}

      {resultImage && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-bold text-[#C71585]">
            編集結果
          </h3>
          <img
            src={resultImage}
            alt="編集された画像"
            className="max-w-full rounded-2xl border-4 border-[#FF1493] shadow-lg"
          />
          <a
            href={
              resultR2Key
                ? `/api/download-image?key=${encodeURIComponent(resultR2Key)}`
                : resultImage
            }
            download={!resultR2Key ? "edited-image.png" : undefined}
            target={resultR2Key ? "_blank" : undefined}
            rel={resultR2Key ? "noopener noreferrer" : undefined}
            className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-[#FF1493] bg-white px-4 py-2 text-sm font-bold text-[#FF1493] transition-all hover:bg-[#FF1493]/10"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            ダウンロード
          </a>
        </div>
      )}
    </div>
  );
}
