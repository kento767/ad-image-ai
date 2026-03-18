# アーキテクチャ・設計

## 1. システム構成図

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   ブラウザ   │────▶│   Next.js App    │────▶│   Turso     │
│   (React)   │     │   (App Router)   │     │  (SQLite)   │
└─────────────┘     └────────┬─────────┘     └─────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │ Better Auth│ │ Cloudflare │ │   Polar    │
       │  (Google)  │ │    R2      │ │ (決済)     │
       └────────────┘ └────────────┘ └────────────┘
              │
              ▼
       ┌────────────┐
       │ Nano Banana│
       │ Pro (AI)   │
       └────────────┘
```

---

## 2. ディレクトリ構成（想定）

```
ad-image-ai/
├── app/
│   ├── (auth)/              # 認証関連レイアウト
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/         # 認証必須エリア
│   │   ├── dashboard/
│   │   ├── generate/
│   │   └── history/
│   ├── api/
│   │   ├── auth/[...all]/    # Better Auth API ルート
│   │   ├── generate/         # 画像生成 API
│   │   ├── webhooks/
│   │   │   └── polar/        # Polar Webhook
│   │   └── ...
│   ├── layout.tsx
│   ├── page.tsx              # LP
│   └── globals.css
├── components/
│   ├── ui/                   # 共通UIコンポーネント
│   ├── auth/                 # 認証関連
│   ├── generate/             # 画像生成関連
│   └── layout/               # ヘッダー、フッター等
├── lib/
│   ├── auth.ts               # Better Auth 設定
│   ├── db.ts                 # Turso 接続
│   ├── r2.ts                 # R2 クライアント
│   ├── polar.ts              # Polar API
│   └── ai.ts                 # Nano Banana Pro 連携
├── db/
│   ├── schema.ts             # スキーマ定義（Kysely/Drizzle等）
│   └── migrations/           # マイグレーション
├── docs/
│   ├── requirements.md
│   ├── TASKS.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   └── CHANGELOG.md
├── public/
└── ...
```

---

## 3. ルーティング設計

| パス | 説明 | 認証 |
|------|------|------|
| `/` | ランディングページ | 不要 |
| `/login` | ログイン（Google） | 不要 |
| `/dashboard` | ダッシュボード | 必須 |
| `/generate` | 画像生成画面 | 必須 |
| `/history` | 画像履歴 | 必須 |
| `/api/auth/*` | Better Auth API | - |
| `/api/generate` | 画像生成 API | 必須 |
| `/api/webhooks/polar` | Polar Webhook | 署名検証 |

---

## 4. データフロー

### 4.1 画像生成フロー

1. ユーザーがテンプレート選択・プロンプト入力
2. クレジット残高チェック（不足ならエラー）
3. Server Action / API で Nano Banana Pro 呼び出し
4. 生成画像を R2 にアップロード
5. `generated_image` にメタデータ保存
6. `user_credits.credits` を 1 減算
7. 画像URLを返却

### 4.2 認証フロー

1. 「無料で始める」→ Better Auth の Google ログイン
2. コールバック後、`user` テーブルにユーザー作成
3. `user_credits` に新規レコード作成（credits: 5）
4. ダッシュボード or 生成画面へリダイレクト

---

## 5. 外部サービス連携

| サービス | 用途 | 主な設定 |
|----------|------|----------|
| Turso | メタデータ・ユーザー・認証 | TURSO_DATABASE_URL, TURSO_AUTH_TOKEN |
| Better Auth | 認証（Google） | BETTER_AUTH_SECRET, GOOGLE_CLIENT_* |
| Cloudflare R2 | 画像ストレージ | R2_* |
| Polar | サブスク決済 | POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET |
| Nano Banana Pro | 画像生成 | API Key |

---

## 6. セキュリティ考慮

- 認証必須ルートはミドルウェアで保護
- API ルートはセッション検証
- Polar Webhook は署名検証必須
- R2 は署名付きURL or パブリックバケット設定に応じて適切に
