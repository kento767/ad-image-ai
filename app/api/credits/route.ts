import { NextResponse } from "next/server";
import "@/lib/ensure-env";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

/**
 * GET /api/credits
 * 認証済みユーザーのクレジット残高を返す
 */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ credits: null }, { status: 200 });
  }

  const row = await db
    .selectFrom("user_credits")
    .select("credits")
    .where("userId", "=", session.user.id)
    .executeTakeFirst();

  return NextResponse.json({ credits: row?.credits ?? 0 });
}
