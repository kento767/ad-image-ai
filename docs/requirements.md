# 広告画像AI - 要件定義書

## 1. プロジェクト概要

**サービス名**: 広告画像AI

**概要**: テキスト入力から広告用画像をAI生成し、生成後のAI編集も可能なウェブサービス。日本向け、日本語対応。

---

## 2. 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16（App Router） |
| データベース | Turso（SQLite / libSQL） |
| 認証 | Better Auth |
| 決済 | Polar（サブスクリプション） |
| 画像ストレージ | Cloudflare R2 |
| 画像生成AI | Nano Banana Pro（Gemini 3 Image Preview モデル） |
| 言語 | 日本語のみ |

---

## 3. 機能要件

### 3.1 コア機能

#### 画像生成
- **テキストから広告画像を生成**: ユーザーが日本語でプロンプトを入力し、AIが広告画像を生成する
- **テンプレート選択**: 複数のテンプレートを用意し、テンプレート選択 → フォームに日本語入力 → 画像生成のフロー
- **AI編集**: 生成した画像を後からAIで編集できる機能

#### 広告の種類・サイズ
- **初期対応**: SNS広告（Meta広告：Facebook / Instagram）
- **拡張性**: 後から他の媒体（X、LINE等）に対応できる設計

**推奨画像サイズ（Meta広告）**:

| フォーマット | アスペクト比 | 解像度 | 用途 |
|-------------|-------------|--------|------|
| 正方形 | 1:1 | 1,440 × 1,440px | 汎用（ほとんどのフォーマットで使用可） |
| フィード | 4:5 | 1,440 × 1,800px | Instagram/Facebook フィード |
| ストーリーズ/リール | 9:16 | 1,440 × 2,560px | 縦型フルスクリーン |

**画像形式**: JPG、PNG

**テンプレート**: 複数種類を用意（スタイル・用途別）。ユーザーが選択してカスタマイズ。

### 3.2 ユーザー管理

#### 認証
- **Better Auth** を使用
- **Google認証のみ**（メール/パスワード、その他OAuthは対象外）

#### クレジット制
- **無料プラン**: 新規登録時に **5クレジット** 付与
- **有料プラン**: サブスクリプションで複数プラン（例：月額〇〇円で〇〇クレジット等）
- 1画像生成 = 1クレジット消費（AI編集時の消費ルールは要検討）

### 3.3 決済

- **Polar** を使用
- **サブスクリプション課金** をメインに実装
- 将来的に買い切りプランの追加を検討

### 3.4 画像履歴・ダウンロード

- 生成した画像の **履歴一覧** を表示
- 各画像の **ダウンロード** が可能

### 3.5 データストレージ

- **画像本体**: Cloudflare R2 に保存
- **メタデータ・履歴**: Turso に保存

---

## 4. UI/UX 要件

### 4.1 ページ構成

1. **ランディングページ（LP）**
   - サービス説明
   - 「無料で始める」ボタン

2. **「無料で始める」からの遷移**
   - ダッシュボード または 画像生成画面 へ遷移

3. **画像生成画面**
   - テンプレート選択
   - フォームに日本語入力
   - 生成ボタン → 画像生成

4. **ダッシュボード**
   - 画像履歴
   - クレジット残高
   - プラン情報

### 4.2 デザイン方針

- **広告画像AIサービス** のテーマに合ったデザイン
- モダンで使いやすいUI

---

## 5. データベース設計

### 5.1 Better Auth 必須テーブル（Turso）

Better Auth が要求するコアスキーマ。`npx auth@latest migrate` または `npx auth@latest generate` で生成可能。

#### user
| カラム | 型 | 説明 |
|-------|-----|------|
| id | string | PK |
| name | string | 表示名 |
| email | string | メールアドレス |
| emailVerified | boolean | メール認証済みフラグ |
| image | string? | プロフィール画像URL |
| createdAt | Date | 作成日時 |
| updatedAt | Date | 更新日時 |

#### session
| カラム | 型 | 説明 |
|-------|-----|------|
| id | string | PK |
| userId | string | FK → user |
| token | string | セッショントークン |
| expiresAt | Date | 有効期限 |
| ipAddress | string? | IPアドレス |
| userAgent | string? | ユーザーエージェント |
| createdAt | Date | 作成日時 |
| updatedAt | Date | 更新日時 |

#### account
| カラム | 型 | 説明 |
|-------|-----|------|
| id | string | PK |
| userId | string | FK → user |
| accountId | string | プロバイダー側のアカウントID |
| providerId | string | プロバイダーID（google等） |
| accessToken | string? | アクセストークン |
| refreshToken | string? | リフレッシュトークン |
| accessTokenExpiresAt | Date? | アクセストークン有効期限 |
| refreshTokenExpiresAt | Date? | リフレッシュトークン有効期限 |
| scope | string? | スコープ |
| idToken | string? | IDトークン |
| password | string? | パスワード（Google認証では未使用） |
| createdAt | Date | 作成日時 |
| updatedAt | Date | 更新日時 |

#### verification
| カラム | 型 | 説明 |
|-------|-----|------|
| id | string | PK |
| identifier | string | 検証対象の識別子 |
| value | string | 検証値 |
| expiresAt | Date | 有効期限 |
| createdAt | Date | 作成日時 |
| updatedAt | Date | 更新日時 |

### 5.2 アプリケーション用テーブル（案）

#### user_credits（ユーザークレジット）
| カラム | 型 | 説明 |
|-------|-----|------|
| id | string | PK |
| userId | string | FK → user |
| credits | integer | 残りクレジット数 |
| planId | string? | 現在のプランID（Polar連携） |
| createdAt | Date | 作成日時 |
| updatedAt | Date | 更新日時 |

#### generated_image（生成画像メタデータ）
| カラム | 型 | 説明 |
|-------|-----|------|
| id | string | PK |
| userId | string | FK → user |
| r2Key | string | R2のオブジェクトキー（URL） |
| prompt | string | 生成時のプロンプト |
| templateId | string? | 使用したテンプレートID |
| aspectRatio | string | アスペクト比（1:1, 4:5, 9:16） |
| width | integer | 画像幅 |
| height | integer | 画像高さ |
| creditsUsed | integer | 消費クレジット数 |
| createdAt | Date | 作成日時 |

#### template（テンプレート）
| カラム | 型 | 説明 |
|-------|-----|------|
| id | string | PK |
| name | string | テンプレート名 |
| description | string | 説明 |
| style | string | スタイル種別 |
| aspectRatio | string | デフォルトアスペクト比 |
| previewImageUrl | string? | プレビュー画像URL |
| promptTemplate | string? | プロンプトの雛形 |
| isActive | boolean | 有効フラグ |
| createdAt | Date | 作成日時 |
| updatedAt | Date | 更新日時 |

---

## 6. 環境変数（想定）

```env
# Turso
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Google OAuth（Better Auth用）
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Polar
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=

# Nano Banana Pro（画像生成AI）
NANO_BANANA_API_KEY=
# または該当APIの認証情報
```

---

## 7. 非機能要件・その他

- **言語**: 日本語のみ
- **レスポンシブ**: モバイル対応を推奨
- **拡張性**: 広告媒体・テンプレート・決済プランは後から追加しやすい設計

---

## 8. 実装優先度（MVP）

1. ランディングページ + 認証（Better Auth + Google）
2. 画像生成（テンプレート選択 → プロンプト入力 → 生成）
3. クレジット管理（無料5クレジット）
4. 画像履歴・ダウンロード
5. R2への画像保存
6. サブスクリプション（Polar連携）
7. AI編集機能

---

## 9. 参照・備考

- [Better Auth - Database](https://better-auth.com/docs/concepts/database)
- [Better Auth - SQLite / Turso](https://better-auth.com/docs/adapters/sqlite)
- [Polar - Subscriptions](https://polar.sh/docs/api-reference/subscriptions/create)
- [Meta広告 画像サイズガイド](https://www.facebook.com/business/ads-guide/image)
