"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Template } from "@/lib/db-types";

const ASPECT_RATIOS = [
  { value: "1:1", label: "正方形 (1:1)", width: 1440, height: 1440 },
  { value: "4:5", label: "フィード (4:5)", width: 1440, height: 1800 },
  { value: "9:16", label: "ストーリーズ (9:16)", width: 1440, height: 2560 },
] as const;

const PENDING_STORAGE_KEY = "generate_pending";

type PendingData = {
  prompt: string;
  aspectRatio: string;
  templateId: string | null;
};

type HistoryImage = {
  id: string;
  r2Key: string;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
  url: string | null;
};

type PromptHistoryItem = {
  id: string;
  catchCopy: string;
  prompt: string;
  createdAt: string;
};

type Props = {
  templates: Template[];
};

export function GenerateForm({ templates }: Props) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIOS)[number]>(ASPECT_RATIOS[0]);
  const [catchCopy, setCatchCopy] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // 元画像から生成
  const [useSourceImage, setUseSourceImage] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceFilePreview, setSourceFilePreview] = useState<string | null>(null);
  const [historyImages, setHistoryImages] = useState<HistoryImage[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [selectedHistoryR2Key, setSelectedHistoryR2Key] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultMeta, setResultMeta] = useState<{
    mimeType: string;
    r2Key?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);

  // プロンプト履歴を取得
  const fetchPromptHistory = useCallback(() => {
    fetch("/api/prompt-history")
      .then((r) => r.json())
      .then((data) => setPromptHistory(data.history ?? []))
      .catch(() => setPromptHistory([]));
  }, []);

  useEffect(() => {
    fetchPromptHistory();
  }, [fetchPromptHistory]);

  // 履歴画像を取得
  useEffect(() => {
    if (!useSourceImage) return;
    fetch("/api/my-images")
      .then((r) => r.json())
      .then((data) => setHistoryImages(data.images ?? []))
      .catch(() => setHistoryImages([]));
  }, [useSourceImage]);

  const doGenerate = useCallback(
    async (data: {
      prompt: string;
      catchCopy?: string;
      aspectRatio: string;
      templateId: string | null;
      sourceImageBase64?: string;
      sourceImageMimeType?: string;
      sourceR2Key?: string;
    }) => {
      setIsGenerating(true);
      setError(null);
      setResultImage(null);
      setResultMeta(null);
      try {
        const body: Record<string, unknown> = {
          prompt: data.prompt.trim(),
          aspectRatio: data.aspectRatio,
          templateId: data.templateId,
        };
        if (data.catchCopy?.trim()) {
          body.catchCopy = data.catchCopy.trim();
        }
        if (data.sourceImageBase64) {
          body.sourceImageBase64 = data.sourceImageBase64;
          body.sourceImageMimeType = data.sourceImageMimeType ?? "image/png";
        }
        if (data.sourceR2Key) {
          body.sourceR2Key = data.sourceR2Key;
        }

        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const resData = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            sessionStorage.setItem(
              PENDING_STORAGE_KEY,
              JSON.stringify({
                prompt: data.prompt,
                aspectRatio: data.aspectRatio,
                templateId: data.templateId,
              })
            );
            router.push("/login?callbackUrl=/generate");
            return;
          }
          const errMsg = resData.error ?? "画像生成に失敗しました";
          if (res.status === 429) {
            setError(
              "APIの利用制限に達しました。約1分後に再試行するか、Google AI Studio でプラン・利用状況を確認してください。"
            );
          } else if (res.status === 402) {
            router.push("/plans");
            return;
          } else {
            setError(typeof errMsg === "string" ? errMsg : (errMsg as { message?: string })?.message ?? "画像生成に失敗しました");
          }
          return;
        }
        const mimeType = resData.mimeType ?? "image/png";
        setResultMeta({ mimeType, r2Key: resData.r2Key });
        if (resData.url) {
          setResultImage(resData.url);
        } else if (resData.image) {
          setResultImage(`data:${mimeType};base64,${resData.image}`);
        }
        fetchPromptHistory();
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setIsGenerating(false);
      }
    },
    [router, fetchPromptHistory]
  );

  useEffect(() => {
    const stored = sessionStorage.getItem(PENDING_STORAGE_KEY);
    if (!stored) return;
    try {
      const pending: PendingData = JSON.parse(stored);
      sessionStorage.removeItem(PENDING_STORAGE_KEY);
      const template = pending.templateId
        ? templates.find((t) => t.id === pending.templateId) ?? null
        : null;
      const ratio = ASPECT_RATIOS.find((r) => r.value === pending.aspectRatio) ?? ASPECT_RATIOS[0];
      setPrompt(pending.prompt);
      setSelectedTemplate(template);
      setAspectRatio(ratio);
      doGenerate({
        prompt: pending.prompt,
        aspectRatio: pending.aspectRatio,
        templateId: pending.templateId,
      });
    } catch {
      sessionStorage.removeItem(PENDING_STORAGE_KEY);
    }
  }, [templates, doGenerate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    let sourceBase64: string | undefined;
    let sourceMime: string | undefined;
    let sourceR2: string | undefined;

    if (useSourceImage) {
      if (sourceFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const match = result.match(/^data:([^;]+);base64,(.+)$/);
            resolve(match ? match[2] : result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(sourceFile);
        });
        sourceBase64 = base64;
        sourceMime = sourceFile.type || "image/png";
      } else if (selectedHistoryR2Key) {
        sourceR2 = selectedHistoryR2Key;
      }
    }

    await doGenerate({
      prompt: prompt.trim(),
      catchCopy: catchCopy.trim() || undefined,
      aspectRatio: aspectRatio.value,
      templateId: selectedTemplate?.id ?? null,
      sourceImageBase64: sourceBase64,
      sourceImageMimeType: sourceMime,
      sourceR2Key: sourceR2,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSourceFile(file);
      setSelectedHistoryId(null);
      setSelectedHistoryR2Key(null);
      const url = URL.createObjectURL(file);
      setSourceFilePreview(url);
    }
  };

  const handleSelectHistory = (img: HistoryImage) => {
    if (sourceFilePreview) {
      URL.revokeObjectURL(sourceFilePreview);
    }
    setSourceFile(null);
    setSourceFilePreview(null);
    setSelectedHistoryId(img.id);
    setSelectedHistoryR2Key(img.r2Key);
  };

  const clearSourceImage = () => {
    setSourceFile(null);
    setSelectedHistoryId(null);
    setSelectedHistoryR2Key(null);
    if (sourceFilePreview) {
      URL.revokeObjectURL(sourceFilePreview);
      setSourceFilePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const ratioOption =
    ASPECT_RATIOS.find((r) => r.value === aspectRatio.value) ?? ASPECT_RATIOS[0];

  return (
    <div className="space-y-8">
      {/* 1. テンプレート選択（カテゴリ別） */}
      <section>
        <h2 className="mb-4 font-pop text-lg font-bold text-[#FF1493]">
          1. テンプレートを選ぶ（任意）
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          用途に合わせて選べます。選択しなくても生成できます。
        </p>
        {(() => {
          const categoryOrder = [
            "期間限定セール",
            "ブランド紹介",
            "新商品紹介",
            "イベント告知",
            "その他",
          ];
          const byCategory = templates.reduce<Record<string, typeof templates>>(
            (acc, t) => {
              const cat = t.category ?? "その他";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(t);
              return acc;
            },
            {}
          );
          return (
            <div className="space-y-4">
              {categoryOrder.map((cat) => {
                const items = byCategory[cat];
                if (!items?.length) return null;
                return (
                  <div key={cat}>
                    <h3 className="mb-2 text-sm font-bold text-[#C71585]">
                      {cat}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() =>
                            setSelectedTemplate(
                              selectedTemplate?.id === t.id ? null : t
                            )
                          }
                          className={`flex flex-col rounded-2xl border-2 p-4 text-left transition-all ${
                            selectedTemplate?.id === t.id
                              ? "border-[#FF1493] bg-[#FF1493]/10 ring-2 ring-[#FF1493]"
                              : "border-[#FF1493]/50 bg-white hover:border-[#FF1493]"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-bold text-[#C71585]">
                              {t.name}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                              {t.aspectRatio}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {t.description}
                          </p>
                          <span className="mt-2 text-xs text-slate-500">
                            {t.style}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>

      {/* 2. アスペクト比（テンプレートと独立） */}
      <section>
        <h2 className="mb-4 font-pop text-lg font-bold text-[#FF1493]">
          2. アスペクト比
        </h2>
        <div className="flex flex-wrap gap-3">
          {ASPECT_RATIOS.map((r) => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2 transition-colors ${
                ratioOption.value === r.value
                  ? "border-[#FF1493] bg-[#FF1493]/10"
                  : "border-[#FF1493]/50 hover:border-[#FF1493]"
              }`}
            >
              <input
                type="radio"
                name="aspectRatio"
                value={r.value}
                checked={ratioOption.value === r.value}
                onChange={() => setAspectRatio(r)}
                className="sr-only"
              />
              <span className="text-sm font-bold text-[#C71585]">{r.label}</span>
            </label>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 3. キャッチコピー */}
        <section>
          <h2 className="mb-4 font-pop text-lg font-bold text-[#FF1493]">
            3. キャッチコピー（任意）
          </h2>
          <input
            type="text"
            value={catchCopy}
            onChange={(e) => setCatchCopy(e.target.value)}
            placeholder="例：今だけ50%OFF！"
            maxLength={100}
            className="w-full rounded-2xl border-2 border-[#FF1493]/50 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#FF1493] focus:outline-none focus:ring-2 focus:ring-[#FF1493]/30"
          />
          <p className="mt-1 text-xs text-slate-500">
            画像に表示したいテキストを入力。正確に表示されます（文字化けしません）。空欄の場合は画像のみ生成します。
          </p>
        </section>

        {/* 4. プロンプト */}
        <section>
          <h2 className="mb-4 font-pop text-lg font-bold text-[#FF1493]">
            4. 画像の内容・構成
          </h2>
          <p className="mb-2 text-xs text-slate-500">
            画像に表示したい文字は「キャッチコピー」欄に入力すると正確に表示されます。
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              selectedTemplate
                ? `例：${selectedTemplate.category === "期間限定セール" ? "春の大感謝祭、全品20%オフ" : selectedTemplate.category === "ブランド紹介" ? "私たちの想い：自然と共に" : selectedTemplate.category === "新商品紹介" ? "新発売のオーガニックコーヒー" : selectedTemplate.category === "イベント告知" ? "3/20 新宿でポップアップ開催" : "広告の内容を入力"}`
                : "広告画像の内容を日本語で入力してください。例：春の新作コーヒーを爽やかに紹介"
            }
            rows={4}
            className="w-full rounded-2xl border-2 border-[#FF1493]/50 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#FF1493] focus:outline-none focus:ring-2 focus:ring-[#FF1493]/30"
            required
          />

          {promptHistory.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-bold text-[#C71585]">
                履歴から選ぶ
              </p>
              <div className="flex flex-col gap-2">
                {promptHistory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCatchCopy(item.catchCopy);
                      setPrompt(item.prompt);
                    }}
                    className="rounded-xl border-2 border-[#FF1493]/50 bg-white px-4 py-3 text-left transition-all hover:border-[#FF1493] hover:bg-[#FF1493]/5"
                  >
                    {item.catchCopy && (
                      <span className="block text-sm font-bold text-[#FF1493]">
                        {item.catchCopy}
                      </span>
                    )}
                    <span className="block text-sm text-slate-600 line-clamp-2">
                      {item.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 5. 元画像から生成 */}
        <section>
          <h2 className="mb-4 font-pop text-lg font-bold text-[#FF1493]">
            5. 元画像から生成（任意）
          </h2>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={useSourceImage}
              onChange={(e) => {
                setUseSourceImage(e.target.checked);
                if (!e.target.checked) clearSourceImage();
              }}
              className="h-4 w-4 rounded border-[#FF1493] text-[#FF1493] focus:ring-[#FF1493]"
            />
            <span className="text-sm font-bold text-[#C71585]">
              元画像を参考に新しい画像を生成する
            </span>
          </label>

          {useSourceImage && (
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  画像をアップロード
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#FF1493] file:px-4 file:py-2 file:font-bold file:text-white file:hover:bg-[#C71585]"
                />
              </div>

              {historyImages.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    または、過去の生成画像から選択
                  </p>
                  <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
                    {historyImages.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => handleSelectHistory(img)}
                        className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                          selectedHistoryId === img.id
                            ? "border-[#FF1493] ring-2 ring-[#FF1493]"
                            : "border-slate-200 hover:border-[#FF1493]/50"
                        }`}
                      >
                        {img.url ? (
                          <img
                            src={img.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">
                            画像なし
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(sourceFilePreview || selectedHistoryId) && (
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-xl border-2 border-[#FF1493]">
                    {sourceFilePreview ? (
                      <img
                        src={sourceFilePreview}
                        alt="選択中"
                        className="h-full w-full object-cover"
                      />
                    ) : selectedHistoryId ? (
                      (() => {
                        const img = historyImages.find((i) => i.id === selectedHistoryId);
                        return img?.url ? (
                          <img
                            src={img.url}
                            alt="選択中"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#FF1493]/10 text-[#FF1493]">
                            ✓
                          </div>
                        );
                      })()
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUseSourceImage(false);
                      clearSourceImage();
                    }}
                    className="text-sm font-bold text-red-600 hover:underline"
                  >
                    解除
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full rounded-full bg-[#FF1493] px-8 py-3 font-bold text-white shadow-[0_4px_0_0_#C71585] transition-all hover:scale-105 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
        >
          <span className="relative">
            {isGenerating ? "生成中..." : "画像を生成する"}
          </span>
        </button>

        {error && (
          <p className="text-sm font-bold text-red-600">{error}</p>
        )}

        {resultImage && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-bold text-[#C71585]">
              生成結果
            </h3>
            <img
              src={resultImage}
              alt="生成された画像"
              className="max-w-full rounded-2xl border-4 border-[#FF1493] shadow-lg"
            />
            <a
              href={
                resultMeta?.r2Key
                  ? `/api/download-image?key=${encodeURIComponent(resultMeta.r2Key)}`
                  : resultImage
              }
              download={
                resultMeta?.r2Key
                  ? undefined
                  : `generated-image.${resultMeta?.mimeType?.includes("jpeg") || resultMeta?.mimeType?.includes("jpg") ? "jpg" : "png"}`
              }
              {...(resultMeta?.r2Key && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
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
      </form>
    </div>
  );
}
