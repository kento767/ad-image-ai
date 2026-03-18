/**
 * このファイルを import すると .env.local を読み込む
 * auth を import する前に必ず import すること
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// ファイル位置からプロジェクトルートを算出（worker の cwd に依存しない）
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// 複数パスを試す（worker の cwd が異なる場合のフォールバック）
[path.join(projectRoot, ".env.local"), path.join(process.cwd(), ".env.local")].forEach(
  (p) => config({ path: p, override: true })
);
config({ path: path.join(projectRoot, ".env"), override: true });
config({ path: path.join(process.cwd(), ".env"), override: true });
