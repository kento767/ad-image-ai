# 認証トラブルシューティング

認証ページに到達できない、または Google ログインが失敗する場合の確認手順です。

## 診断 API

開発サーバー起動中に `http://localhost:3000/api/debug/db` にアクセスすると、Next.js 内での DB 接続状態を確認できます。

---

## 1. 認証ページ（/login）にアクセスできない

### 確認事項

1. **開発サーバーが起動しているか**
   ```bash
   npm run dev
   ```

2. **正しい URL でアクセスしているか**
   - デフォルト: `http://localhost:3000/login`
   - ポートが 3001 のとき: `http://localhost:3001/login`

3. **ブラウザのコンソールエラー**
   - F12 で開発者ツールを開き、Console タブでエラーを確認

4. **ネットワークエラー**
   - 開発者ツールの Network タブで、/login や /api/auth へのリクエストが失敗していないか確認

---

## 2. Google ログインをクリックしても動かない

### 確認事項

1. **環境変数が設定されているか**（`.env.local`）
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `BETTER_AUTH_SECRET`（32文字以上）
   - `BETTER_AUTH_URL`（例: `http://localhost:3000`）
   - `NEXT_PUBLIC_APP_URL`（オプション、未設定時は現在の origin を使用）

2. **BETTER_AUTH_URL と実際のポートが一致しているか**
   - アプリが `http://localhost:3001` で起動している場合、`BETTER_AUTH_URL=http://localhost:3001` にすること
   - または `http://localhost:3000` で起動する（`npm run dev` のデフォルト）

3. **GCP のコールバック URI が正しいか**
   - [Google Cloud Console](https://console.cloud.google.com/) → 認証情報 → OAuth 2.0 クライアント ID
   - **承認済みのリダイレクト URI** に以下を追加:
     - ローカル: `http://localhost:3000/api/auth/callback/google`
     - ポート 3001 の場合: `http://localhost:3001/api/auth/callback/google`

---

## 3. Google 認証後にエラーになる

### 確認事項

1. **Turso の接続**
   - `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` が正しく設定されているか
   - `npm run db:migrate` でマイグレーションが完了しているか

2. **trustedOrigins**
   - `lib/auth.ts` の `allowedHosts` に使用中の localhost ポートが含まれているか
   - 動的 baseURL により `localhost:*` で任意のポートを許可済み

---

## 4. よくある原因まとめ

| 症状 | 原因 | 対処 |
|------|------|------|
| /login が 404 | ルートが存在しない | `app/login/page.tsx` の存在を確認 |
| ログインボタンが反応しない | baseURL の不一致 | ブラウザの origin と BETTER_AUTH_URL を一致させる |
| OAuth 後にエラー | GCP のコールバック URI 未登録 | GCP に正しい URI を追加 |
| セッションが維持されない | クッキーの問題 | 同一オリジンでアクセスしているか確認 |

---

## 5. デバッグ用コマンド

```bash
# マイグレーション実行
npm run db:migrate

# 開発サーバー起動（ポート指定）
npm run dev -- -p 3000
```
