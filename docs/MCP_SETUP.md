# MCP（Turso）セットアップ

Cursor で Turso データベースに MCP 経由でアクセスするための設定。

---

## 1. 設定ファイルの場所

Cursor は以下の場所で `mcp.json` を読み込みます:

| 種類 | パス |
|------|------|
| **プロジェクト固有** | `.cursor/mcp.json`（本プロジェクト） |
| **グローバル** | `~/.cursor/mcp.json`（全プロジェクト） |

両方ある場合は、同じサーバー名ならプロジェクト側が優先されます。

---

## 2. Turso MCP の設定

### 2.1 使用するパッケージ

- **@prama13/turso-mcp**: 読み取り専用。`TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` を使用（本プロジェクトの .env と同じ）

### 2.2 必要な手順

1. `.cursor/mcp.json` を開く
2. `env` 内の値を `.env.local` の値で埋める:

```json
{
  "mcpServers": {
    "turso": {
      "command": "npx",
      "args": ["-y", "@prama13/turso-mcp"],
      "env": {
        "TURSO_DATABASE_URL": "libsql://your-db-xxx.turso.io",
        "TURSO_AUTH_TOKEN": "your-auth-token"
      }
    }
  }
}
```

3. **Cursor を再起動**
4. **Settings > Tools & MCP** で `turso` が有効か確認

---

## 3. 動作確認

### 3.1 機能しているか確認する方法

1. **Settings > Tools & MCP**（Ctrl+Shift+J）を開く
2. `turso` サーバーが一覧に表示され、トグルが ON になっているか確認
3. チャットで「Turso の user テーブルのスキーマを教えて」などと聞いて、MCP ツールが呼ばれるか確認
4. **Output パネル**（Ctrl+Shift+U）→ **MCP Logs** でエラーがないか確認

### 3.2 よくある問題

| 現象 | 対処 |
|------|------|
| turso が一覧に出ない | `.cursor/mcp.json` のパスと JSON 構文を確認。Cursor を再起動 |
| 認証エラー | `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` が正しいか確認 |
| シェルの環境変数が使えない | `mcp.json` の `env` に直接値を書く（Cursor は .env を自動読み込みしない） |

---

## 4. セキュリティ

- `TURSO_AUTH_TOKEN` は秘密情報のため、`.cursor/mcp.json` を Git にコミットする場合は注意
- チームで共有する場合は、`mcp.json` はプレースホルダーのままコミットし、各自がローカルで値を設定する運用を推奨
- または、グローバル設定 `~/.cursor/mcp.json` に実際の値を入れ、プロジェクトの `mcp.json` はコミットしない

---

## 5. 代替: mcp-turso-cloud（書き込み対応）

読み書きや DB 管理が必要な場合は **mcp-turso-cloud** を使用できます。認証方式が異なります:

```json
{
  "mcpServers": {
    "mcp-turso-cloud": {
      "command": "npx",
      "args": ["-y", "mcp-turso-cloud"],
      "env": {
        "TURSO_API_TOKEN": "Turso ダッシュボードで取得した API トークン",
        "TURSO_ORGANIZATION": "組織名",
        "TURSO_DEFAULT_DATABASE": "ad-image-ai"
      }
    }
  }
}
```

- `TURSO_API_TOKEN`: [Turso Dashboard](https://turso.tech/app) で発行
- `TURSO_ORGANIZATION`: 組織名（ダッシュボードで確認）
