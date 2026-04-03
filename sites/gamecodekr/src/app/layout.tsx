import type { Metadata } from "next";
import { createSiteConfig } from "@blog-manage/shared-seo";
import "./globals.css";

const siteConfig = createSiteConfig({
  siteName: "GameCodeKR",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev",
});

export const metadata: Metadata = {
  title: {
    default: "GameCodeKR - 로블록스 게임 코드 & 티어표",
    template: "%s | GameCodeKR",
  },
  description:
    "로블록스 게임 코드, 티어표, 패치 요약을 매일 업데이트! 초등학생도 이해하기 쉽게 핵심만 정리합니다.",
  metadataBase: new URL(siteConfig.baseUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
