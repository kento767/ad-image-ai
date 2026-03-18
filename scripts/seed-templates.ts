/**
 * template テーブルにカテゴリ別のテンプレートを投入するスクリプト
 * 1カテゴリ1テンプレート
 * 実行: npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { db } from "../lib/db";

const now = new Date().toISOString();

const TEMPLATES = [
  {
    id: "tpl-sale",
    name: "期間限定セール",
    description: "割引・値引きを強調。赤・オレンジで緊急性と躍動感を演出。",
    style: "ポップ",
    aspectRatio: "1:1",
    category: "期間限定セール",
    previewImageUrl: null,
    promptTemplate:
      "【スタイル】期間限定セール・バーゲン告知の広告画像。躍動感・緊急性を最大限に。色合い：赤・オレンジ・ゴールドを基調に、高コントラストで目を引く。ダイナミックな構図、斜めや奥行きのあるアングル、光の反射やキラめきで「今すぐ！」感を演出。セール広告の定番ビジュアル（値札、%オフ、限定期間の表現）を参考にした説得力のあるデザイン。\n\n【内容】{{入力}}",
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "tpl-brand",
    name: "ブランド紹介",
    description: "ブランドの世界観を伝える。落ち着いた色調、余白を活かした上品なデザイン。",
    style: "ミニマル",
    aspectRatio: "1:1",
    category: "ブランド紹介",
    previewImageUrl: null,
    promptTemplate:
      "【スタイル】ブランド・企業紹介の広告画像。落ち着いた躍動感、上品で洗練された雰囲気。色合い：ベージュ・グレー・ネイビー・白など、ミニマルで高級感のあるパレット。余白を大胆に使い、静謐さと信頼感を演出。雑誌のブランド広告やラグジュアリー広告を参考にした、一貫性のあるプロフェッショナルなデザイン。\n\n【内容】{{入力}}",
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "tpl-new",
    name: "新商品紹介",
    description: "新発売・新商品の告知。爽やかでフレッシュな色合い、商品が主役の躍動感。",
    style: "ビジュアル",
    aspectRatio: "1:1",
    category: "新商品紹介",
    previewImageUrl: null,
    promptTemplate:
      "【スタイル】新商品リリース・新発売告知の広告画像。新鮮さ・ワクワク感を表現。色合い：爽やかなブルー・ミント・白・アクセントに鮮やかな色。商品を主役に据え、光や影で立体感と躍動感を。新商品発表の定番ビジュアル（パッケージ、未開封感、NEWマークの雰囲気）を参考にした、購買意欲を高めるデザイン。\n\n【内容】{{入力}}",
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "tpl-event",
    name: "イベント告知",
    description: "イベント・キャンペーン告知。カラフルで楽しい、参加したくなる躍動感。",
    style: "ポップ",
    aspectRatio: "1:1",
    category: "イベント告知",
    previewImageUrl: null,
    promptTemplate:
      "【スタイル】イベント・キャンペーン告知の広告画像。楽しさ・参加したくなるワクワク感を最大限に。色合い：カラフルで明るい（イエロー・ピンク・シアン・オレンジなど）、フェスやポップアップイベントの定番カラー。躍動感のある構図、人物の笑顔や盛り上がりの雰囲気。イベント告知広告を参考にした、クリックしたくなる賑やかで親しみやすいデザイン。\n\n【内容】{{入力}}",
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "tpl-other",
    name: "汎用",
    description: "SNS・広告全般。バランスの取れたプロフェッショナルなデザイン。",
    style: "モダン",
    aspectRatio: "1:1",
    category: "その他",
    previewImageUrl: null,
    promptTemplate:
      "【スタイル】汎用SNS広告画像。プロフェッショナルでバランスの取れたデザイン。色合い：鮮やかすぎず落ち着きすぎず、視認性の高い配色。適度な躍動感と信頼感。Instagram・Facebookの成功している広告を参考にした、汎用性の高いモダンなデザイン。\n\n【内容】{{入力}}",
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  },
];

async function main() {
  console.log("Seeding templates (1 per category)...");
  await db.deleteFrom("template").execute();
  console.log("  Cleared existing templates.");

  for (const t of TEMPLATES) {
    await db.insertInto("template").values(t).execute();
    console.log(`  OK: [${t.category}] ${t.name}`);
  }
  console.log(`Done. ${TEMPLATES.length} templates seeded.`);
}

main().catch(console.error).finally(() => process.exit(0));
