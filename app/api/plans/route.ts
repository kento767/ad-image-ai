import { NextResponse } from "next/server";
import "@/lib/ensure-env";
import { db } from "@/lib/db";

/**
 * GET /api/plans
 * プラン一覧を返す（認証不要・LP用）
 */
export async function GET() {
  try {
    const plans = await db
      .selectFrom("plan")
      .select(["id", "name", "displayName", "creditsPerMonth", "priceYen", "description", "sortOrder"])
      .where("isActive", "=", 1)
      .orderBy("sortOrder", "asc")
      .execute();

    return NextResponse.json({ plans });
  } catch (e) {
    console.error("[api/plans]", e);
    return NextResponse.json({ plans: [] });
  }
}
