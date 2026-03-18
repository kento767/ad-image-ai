# Next.js App Router ベストプラクティス

開発時に守るべき Next.js App Router の指針。Next.js 15/16 を前提とする。

---

## 1. Server Components と Client Components

### 1.1 基本方針

- **デフォルトは Server Component**（`'use client'` を付けない）
- Server Component のメリット: クライアントにJSを送らない、DB/API直接アクセス、バンドル軽量化、SEO、秘密情報の安全な扱い

### 1.2 Client Component を使う場面

`'use client'` が必要なのは以下の場合のみ:

| 用途 | 例 |
|------|-----|
| 状態・イベント | `useState`, `onClick`, `onChange` |
| ブラウザAPI | `localStorage`, `window`, `navigator.geolocation` |
| ライフサイクル | `useEffect` |
| カスタムフック | `useSession` など |

### 1.3 推奨パターン

- **Server Component** でデータ取得 → **Client Component** に props で渡してインタラクティブ部分を担当させる
- `'use client'` の境界はできるだけツリーの下に置き、不要なクライアントJSを増やさない

```tsx
// ✅ 推奨: Server で取得、Client で表示・操作
export default async function Page() {
  const data = await fetchData();
  return <InteractiveList items={data} />;
}

// InteractiveList.tsx
'use client';
export function InteractiveList({ items }) {
  const [selected, setSelected] = useState(null);
  // ...
}
```

---

## 2. ルーティング・ファイル構成

### 2.1 ファイル規約

| ファイル | 役割 |
|----------|------|
| `page.tsx` | ルートのUI（必須） |
| `layout.tsx` | 共通レイアウト（`children` 必須） |
| `loading.tsx` | ローディングUI |
| `error.tsx` | エラーUI |
| `not-found.tsx` | 404 |
| `route.ts` | API Route Handler |

### 2.2 動的ルート

- フォルダ名を `[slug]` のように角括弧で囲む
- `params` は **Promise** なので `await` する（Next.js 15+）

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  // ...
}
```

### 2.3 searchParams

- `searchParams` も **Promise**
- 使用するとそのルートは **Dynamic Rendering** になる

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const filters = (await searchParams).filters;
  // ...
}
```

### 2.4 ルートグループ

- `(auth)`, `(dashboard)` のように `()` で囲むとURLに影響しない
- レイアウトや認証の切り替えに利用

```
app/
├── (auth)/
│   ├── login/
│   └── signup/
├── (dashboard)/
│   ├── dashboard/
│   └── generate/
```

---

## 3. データ取得・キャッシュ

### 3.1 キャッシュの変更（Next.js 15+）

- `fetch` と `GET` Route Handler は **デフォルトでキャッシュされない**
- キャッシュしたい場合は `next: { revalidate: 3600 }` などを明示

### 3.2 並列取得

- ウォーターフォールを避けるため `Promise.all()` で並列取得

```tsx
const [user, posts] = await Promise.all([
  getUser(id),
  getPosts(id),
]);
```

### 3.3 ストリーミング・Suspense

- `loading.tsx` と `<Suspense>` で段階的に表示
- 遅い部分だけ `Suspense` で囲む

### 3.4 Server Component からのデータ取得

- Route Handler は Server Component から直接呼ばない（余計なHTTP往復になる）
- DB や API クライアントを直接 import して取得

---

## 4. Dynamic APIs とレンダリング

### 4.1 Dynamic APIs

以下の使用でルート全体が **Dynamic Rendering** になる:

- `cookies()`
- `headers()`
- `searchParams`（page の props）
- `draftMode()`

**注意**: Root Layout で使うとアプリ全体が Dynamic になる。必要最小限のルートで使う。

### 4.2 意図的な使用

- 認証チェックなどで `cookies()` を使う場合は、該当ルートのみ Dynamic になるよう設計
- 可能なら `Suspense` で囲んで部分的な Dynamic に

---

## 5. ナビゲーション・リンク

- ページ遷移は **`<Link>`** を使用（クライアントナビゲーション・プリフェッチ）
- プログラム的な遷移は `useRouter()` の `router.push()`

```tsx
import Link from 'next/link';

<Link href="/dashboard">ダッシュボード</Link>
```

---

## 6. フォーム・Server Actions

- フォーム送信は **Server Actions** を推奨
- サーバー側でバリデーション・認可チェックを行う
- `"use server"` を付けた関数を `action` に渡す

```tsx
// actions.ts
'use server';

export async function createPost(formData: FormData) {
  // 認可チェック
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  // ...
}
```

---

## 7. セキュリティ

- Server Actions は必ず認可チェックを行う
- 環境変数は `.env.local` に格納し、`NEXT_PUBLIC_` は公開される値のみ
- 機密データは Server Component 内で扱い、クライアントに渡さない

---

## 8. エラー・404

- `error.tsx` でエラーハンドリング
- `not-found.tsx` で 404
- `app/global-error.tsx` でアプリ全体のエラー（`<html>` と `<body>` を含める）

---

## 9. 本番前チェックリスト

- [ ] `next build` でビルドエラーがない
- [ ] Dynamic API の使用箇所を把握している
- [ ] `'use client'` の境界が適切
- [ ] 画像は `next/image` を使用
- [ ] フォントは `next/font` を使用
- [ ] メタデータ（title, description）を設定

---

## 参照

- [Next.js App Router - Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- [Production Checklist](https://nextjs.org/docs/app/guides/production-checklist)
