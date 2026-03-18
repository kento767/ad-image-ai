# Better Auth - 新規ユーザー作成時のデータスキーマ

Better Auth で新規ユーザーを作成する際に守るべきスキーマと注意点。

---

## 1. user テーブル（コアスキーマ）

Better Auth が要求する `user` テーブルの構造:

| カラム | 型 | 必須 | 説明 |
|-------|-----|:----:|------|
| id | string | ✅ | PK。Better Auth が自動生成（UUID等） |
| name | string | ⚠️ | 表示名。**OAuth ではプロバイダーから取得**。CLI生成スキーマでは `NOT NULL` になることがある |
| email | string | ✅ | メールアドレス |
| emailVerified | boolean | ✅ | メール認証済みフラグ |
| image | string? | - | プロフィール画像URL（OAuth で取得） |
| createdAt | Date | ✅ | 作成日時 |
| updatedAt | Date | ✅ | 更新日時 |

### 1.1 認証方式ごとの違い

| 認証方式 | 必須フィールド | 備考 |
|----------|----------------|------|
| **Google OAuth** | id, email, name, emailVerified, createdAt, updatedAt | `name` と `image` は Google プロフィールから自動マッピング |
| **Email/Password** | id, email, password（account テーブル）, name?, ... | `name` は **オプション** だが、CLI スキーマでは `NOT NULL` の場合あり |

### 1.2 name フィールドの注意点

- ドキュメント上は `name` が必須と書かれている場合があるが、**Email/Password では実際にはオプション**
- CLI で生成したスキーマで `name NOT NULL` の場合、サインアップ時にエラーになることがある
- **対策**: スキーマを手動で `name` を NULL 許可に変更するか、`defaultValue` を設定

---

## 2. account テーブル（OAuth 時）

Google 等の OAuth でサインインすると `account` テーブルにレコードが作成される:

| カラム | 型 | 説明 |
|-------|-----|------|
| id | string | PK |
| userId | string | FK → user |
| accountId | string | プロバイダー側のアカウントID |
| providerId | string | "google" 等 |
| accessToken | string? | アクセストークン |
| refreshToken | string? | リフレッシュトークン |
| ... | ... | その他 |

---

## 3. スキーマ拡張（additionalFields）

ユーザーに独自フィールドを追加する場合:

```typescript
// auth.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false,  // ユーザーが signup 時に設定不可
      },
      credits: {
        type: "number",
        required: false,
        defaultValue: 5,
        input: false,
      },
    },
  },
});
```

### 3.1 additionalFields のオプション

| オプション | 説明 |
|-----------|------|
| type | "string", "number", "boolean" または配列（union） |
| required | 必須かどうか |
| defaultValue | デフォルト値（DB では optional になる） |
| input | `true`: サインアップ時にユーザーが入力可能。`false`: サーバー側でのみ設定 |

### 3.2 OAuth でプロフィールをマッピング

Google から取得したプロフィールを user にマッピング:

```typescript
socialProviders: {
  google: {
    clientId: "...",
    clientSecret: "...",
    mapProfileToUser: (profile) => {
      return {
        name: profile.name ?? profile.email?.split("@")[0] ?? "User",
        image: profile.picture,
        // additionalFields の値もここで設定可能
      };
    },
  },
},
```

---

## 4. 新規ユーザー作成後の処理（user_credits 等）

### 4.1 hooks.after を使う（推奨）

`databaseHooks.user.create.after` はトランザクション内で実行されるため、別テーブル（例: user_credits）への挿入で FK 制約エラーになることがある。**`hooks.after`** を使うと、レスポンス送信後に実行される。

```typescript
// auth.ts
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  // ...
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up") || ctx.path.includes("/callback")) {
        const newSession = ctx.context.newSession;
        if (newSession?.user) {
          const userId = newSession.user.id;
          // user_credits に初期5クレジットを付与
          ctx.context.runInBackground(
            initUserCredits(userId, 5)
          );
        }
      }
    }),
  },
});
```

### 4.2 runInBackground の利点

- レスポンスをブロックしない
- トランザクションコミット後の実行が期待できる
- `advanced.backgroundTasks` でハンドラを設定可能

### 4.3 OAuth コールバック時の注意

- Google OAuth では `/api/auth/callback/google` が呼ばれる
- このパスでも `newSession` が設定されるため、`ctx.path.includes("/callback")` で判定する

---

## 5. 守るべきルールまとめ

| 項目 | ルール |
|------|--------|
| user.id | Better Auth が生成。手動設定しない |
| user.email | 必須。OAuth ではプロバイダーから取得 |
| user.name | OAuth では `mapProfileToUser` で必ず設定。NULL の場合はフォールバック値を返す |
| user.emailVerified | OAuth では true になることが多い |
| 独自テーブル | `user_credits` 等は `hooks.after` + `runInBackground` で作成 |
| スキーマ生成 | `npx auth@latest migrate` または `npx auth@latest generate` |

---

## 6. 本プロジェクトでの適用例

広告画像AI では:

1. **Google 認証のみ** → `mapProfileToUser` で `name`, `image` を確実に設定
2. **新規登録時に user_credits を 5 で初期化** → `hooks.after` で `runInBackground(initUserCredits(userId, 5))`
3. **user テーブルは Better Auth のコアスキーマをそのまま使用**（additionalFields は必要に応じて）

---

## 参照

- [Better Auth - Database](https://better-auth.com/docs/concepts/database)
- [Better Auth - User & Accounts](https://better-auth.com/docs/concepts/users-accounts)
- [Better Auth - Hooks](https://better-auth.com/docs/concepts/hooks)
- [Extending Core Schema](https://better-auth.com/docs/concepts/database#extending-core-schema)
