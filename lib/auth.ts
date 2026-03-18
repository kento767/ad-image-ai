import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware } from "better-auth/api";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { db } from "./db";

const fallbackBaseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  database: kyselyAdapter(db, { type: "sqlite" }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "localhost:3001",
      "localhost:*",
    ],
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
    fallback: fallbackBaseURL,
  },
  trustedOrigins: [fallbackBaseURL],
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      mapProfileToUser: (profile) => ({
        name: profile.name ?? profile.email?.split("@")[0] ?? "User",
        image: profile.picture,
      }),
    },
  },
  plugins: [
    nextCookies(), // Server Actions でクッキーを正しく設定するため
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // 新規サインアップまたはOAuthコールバック後、user_credits を初期化
      if (
        ctx.path.startsWith("/sign-up") ||
        ctx.path.includes("/callback")
      ) {
        const newSession = ctx.context.newSession;
        if (newSession?.user) {
          ctx.context.runInBackground(
            initUserCredits(newSession.user.id)
          );
        }
      }
    }),
  },
});

async function initUserCredits(userId: string) {
  const { db } = await import("./db");
  try {
    await db
      .insertInto("user_credits")
      .values({
        id: crypto.randomUUID(),
        userId,
        credits: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .execute();
  } catch (e) {
    // 既に存在する場合は無視（重複登録防止）
    console.error("[initUserCredits]", e);
  }
}
