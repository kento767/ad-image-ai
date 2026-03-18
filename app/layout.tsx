import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AdCraft - AIで作る広告画像",
  description: "テキストから広告用画像をAI生成。SNS広告に最適化されたクリエイティブを簡単に作成。",
  verification: {
    google: "VEKLE9Xvp6uqWCShdqr5TcoMJGrhhjJQ_zvpak3ibKI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
