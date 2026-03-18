# 開発ガイド

## 1. 前提環境

- Node.js 18+
- npm / pnpm / yarn
- Turso CLI（`turso`）※DB作成時
- Cloudflare アカウント（R2用）
- Google Cloud Console（OAuth用）
- Polar アカウント（決済用）

---

## 2. セットアップ手順

### 2.1 リポジトリクローン・依存関係

```bash
cd ad-image-ai
npm install
```

### 2.2 環境変数

`.env.example` をコピーして `.env.local` を作成し、値を設定する。

```bash
cp .env.example .env.local
# .env.local を編集
```

### 2.3 Turso データベース

```bash
# Turso CLI でDB作成
turso db create ad-image-ai

# URL とトークン取得
turso db show ad-image-ai --url
turso db tokens create ad-image-ai
```

### 2.4 データベースマイグレーション

`.env.local` に `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` を設定した上で:

```bash
npm run db:migrate
```

Better Auth 用テーブル（user, session, account, verification）とアプリ用テーブル（user_credits, generated_image, template）を作成します。

### 2.5 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス。

---

## 3. コマンド一覧

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動（Turbopack） |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run db:migrate` | DBマイグレーション実行 |
| `npm run lint` | ESLint 実行 |

---

## 4. 開発時の注意点

### 4.1 認証のローカルテスト

- Google OAuth のリダイレクトURIに `http://localhost:3000/api/auth/callback/google` を登録
- Better Auth の `BETTER_AUTH_URL` を `http://localhost:3000` に設定

### 4.2 Turso ローカル開発

- `turso db shell ad-image-ai` でSQL実行可能
- ローカル用に `libsql` でファイルベースSQLiteも利用可（要設定）

### 4.3 R2 ローカル

- MinIO 等で S3 互換ローカルストレージを立てる方法もある
- 開発初期は R2 の開発用バケットを別途用意するのが簡単

---

## 5. ブランチ戦略（推奨）

- `main` : 本番
- `develop` : 開発統合
- `feature/*` : 機能開発
- `fix/*` : バグ修正

---

## 6. ドキュメント一覧

| ファイル | 内容 |
|----------|------|
| [requirements.md](./requirements.md) | 要件定義 |
| [TASKS.md](./TASKS.md) | タスク進捗 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | アーキテクチャ |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 本ファイル（開発ガイド） |
| [CHANGELOG.md](./CHANGELOG.md) | 開発ログ |
