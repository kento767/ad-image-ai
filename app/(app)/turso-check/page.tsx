"use client";

import { useEffect, useState } from "react";

type Result = {
  ok: boolean;
  message?: string;
  error?: string;
  diagnostics?: Record<string, unknown>;
};

export default function TursoCheckPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/debug/db")
      .then((r) => r.json())
      .then(setResult)
      .catch((e) => setResult({ ok: false, error: String(e) }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-600 dark:text-zinc-400">Turso 接続を確認中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Turso 接続チェック
        </h1>

        {result?.ok ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
            <p className="font-medium text-green-800 dark:text-green-200">
              ✅ {result.message}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <p className="font-medium text-red-800 dark:text-red-200">
              ❌ {result?.error}
            </p>
          </div>
        )}

        {result?.diagnostics && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-zinc-600 dark:text-zinc-400">
              診断情報を表示
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-zinc-100 p-4 text-xs dark:bg-zinc-900">
              {JSON.stringify(result.diagnostics, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
