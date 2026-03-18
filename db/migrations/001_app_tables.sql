-- アプリケーション用テーブル（Better Auth の migrate の後に実行）

-- user_credits: ユーザークレジット管理
CREATE TABLE IF NOT EXISTS user_credits (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  planId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id)
);

CREATE INDEX IF NOT EXISTS idx_user_credits_userId ON user_credits(userId);

-- generated_image: 生成画像メタデータ
CREATE TABLE IF NOT EXISTS generated_image (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  r2Key TEXT NOT NULL,
  prompt TEXT NOT NULL,
  templateId TEXT,
  aspectRatio TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  creditsUsed INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id)
);

CREATE INDEX IF NOT EXISTS idx_generated_image_userId ON generated_image(userId);

-- prompt_history: キャッチコピー・プロンプト履歴（再入力時に選択用）
CREATE TABLE IF NOT EXISTS prompt_history (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  catchCopy TEXT,
  prompt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id)
);
CREATE INDEX IF NOT EXISTS idx_prompt_history_userId ON prompt_history(userId);

-- template: テンプレート（用途別カテゴリ）
CREATE TABLE IF NOT EXISTS template (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  style TEXT NOT NULL,
  aspectRatio TEXT NOT NULL DEFAULT '1:1',
  category TEXT NOT NULL DEFAULT 'その他',
  previewImageUrl TEXT,
  promptTemplate TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
