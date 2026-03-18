# GCP で Google OAuth を設定する

Better Auth の Google 認証で使う OAuth クライアントの設定手順です。

---

## 1. GCP で OAuth クライアントを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にログイン
2. プロジェクトを選択（または新規作成）
3. **APIとサービス** → **認証情報** → **認証情報を作成** → **OAuth クライアント ID**
4. アプリケーションの種類: **ウェブアプリケーション**
5. 名前: 例）`広告画像AI`

---

## 2. コールバック URI の指定

**承認済みのリダイレクト URI** に以下を追加してください。

### ローカル開発

```
http://localhost:3000/api/auth/callback/google
```

### 本番環境（デプロイ後）

```
https://あなたのドメイン/api/auth/callback/google
```

例: `https://ad-image-ai.example.com/api/auth/callback/google`

---

## 3. 取得した値を .env.local に設定

- **クライアント ID** → `GOOGLE_CLIENT_ID`
- **クライアント シークレット** → `GOOGLE_CLIENT_SECRET`

---

## 4. 補足

- Better Auth のデフォルトパスは `/api/auth/*`
- Google のコールバックは `/api/auth/callback/google`
- `BETTER_AUTH_URL` が `http://localhost:3000` のとき、上記のコールバック URI が使われます
