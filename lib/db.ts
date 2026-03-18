import "@/lib/ensure-env"; // db 使用前に env を確実に読み込む
import { createClient } from "@libsql/client";
import { Kysely } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import type { Database } from "./db-types";

const url = process.env.TURSO_DATABASE_URL ?? "";
const authToken = process.env.TURSO_AUTH_TOKEN ?? "";

const turso = createClient({
  url: url || "libsql://ad-image-ai-dummy.turso.io",
  authToken: authToken || "dummy-token-for-build",
});

// @libsql/kysely-libsql と @libsql/client の型不一致を回避（sync() の戻り値型の差）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = new Kysely<Database>({
  dialect: new LibsqlDialect({ client: turso as any }),
});
