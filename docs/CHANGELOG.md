# 開発ログ

実装した内容を日付順に記録する。

---

## 2025-03-10

### 追加（フェーズ1 完了）
- **Turso + Better Auth 基盤**
  - `lib/db.ts`: Turso (Kysely + LibsqlDialect) 接続
  - `lib/auth.ts`: Better Auth + Google OAuth + user_credits 初期化フック
  - `lib/auth-client.ts`: クライアント用 auth
- **API・ルート**
  - `app/api/auth/[...all]/route.ts`: Better Auth API
  - `app/login/page.tsx`: ログインページ（Google）
  - `app/dashboard/page.tsx`: ダッシュボード
  - `app/page.tsx`: LP（無料で始める）
- **認証保護**
  - `proxy.ts`: 認証必須ルートの保護（/dashboard, /generate, /history）
  - `components/auth/logout-button.tsx`: ログアウトボタン
- **マイグレーション**
  - `scripts/migrate-auth.ts`: Better Auth + アプリテーブル作成
  - `npm run db:migrate`: マイグレーション実行

### 備考
- `.env.local` に TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET が必要
- Google OAuth のリダイレクトURI: `http://localhost:3000/api/auth/callback/google`

---

## 2025-03-10（フェーズ2 完了）

### 追加
- **LP強化**
  - ヒーローセクション（グラデーション、CTA）
  - 特徴セクション（3カラム：テンプレート、SNS最適化、AI編集）
  - CTAセクション
- **共通レイアウト**
  - `components/layout/header.tsx`: 認証状態に応じたナビ（ログイン/画像生成/ダッシュボード/ログアウト）
  - `components/layout/footer.tsx`: フッター
- **/start ルート**: 「無料で始める」→ 認証済みは /dashboard、未認証は /login へリダイレクト
- **/generate プレースホルダー**: フェーズ3で実装予定の旨を表示

---

## テンプレート（今後の記録用）

```markdown
## YYYY-MM-DD

### 追加
- 

### 変更
- 

### 修正
- 

### 備考
- 
```
