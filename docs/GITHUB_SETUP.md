# GitHub リポジトリ作成手順

## 1. GitHub でリポジトリを作成

1. [GitHub](https://github.com) にログイン
2. 右上の **+** → **New repository**
3. 設定:
   - **Repository name**: `ad-image-ai`（任意）
   - **Description**: AIで作る広告画像
   - **Public** を選択
   - **Add a README file** はチェックしない（既にローカルにあるため）
4. **Create repository** をクリック

## 2. リモートを追加してプッシュ

リポジトリ作成後、表示されるコマンドを実行:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ad-image-ai.git
git branch -M main
git push -u origin main
```

または SSH の場合:

```bash
git remote add origin git@github.com:YOUR_USERNAME/ad-image-ai.git
git branch -M main
git push -u origin main
```

`YOUR_USERNAME` をあなたの GitHub ユーザー名に置き換えてください。
