import { db } from "@/lib/db";
import { GenerateForm } from "./generate-form";

export default async function GeneratePage() {
  const templates = await db
    .selectFrom("template")
    .selectAll()
    .where("isActive", "=", 1)
    .orderBy("createdAt", "asc")
    .execute();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 font-pop text-2xl font-black text-[#FF1493] sm:text-3xl">
        画像生成
      </h1>
      <div className="rounded-3xl border-4 border-[#FF1493] bg-white p-6 shadow-[8px_8px_0_0_#C71585] sm:p-8">
        <GenerateForm templates={templates} />
      </div>
    </div>
  );
}
