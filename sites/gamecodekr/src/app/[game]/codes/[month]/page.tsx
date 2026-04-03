import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getMonthlyCodeData, getAvailableMonths, getCurrentMonth } from "@/lib/content";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { ArchiveBanner } from "@blog-manage/shared-ui";
import { CodeTable } from "@/components/CodeTable";
import type { Metadata } from "next";

const siteConfig = createSiteConfig({
  siteName: "GameCodeKR",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev",
});

export function generateStaticParams() {
  const params: { game: string; month: string }[] = [];
  for (const slug of getAllGameSlugs()) {
    for (const month of getAvailableMonths(slug, "codes")) {
      params.push({ game: slug, month });
    }
  }
  return params;
}

export function generateMetadata({ params }: { params: { game: string; month: string } }): Metadata {
  const data = getMonthlyCodeData(params.game, params.month);
  if (!data) return {};
  const seo = genSeoMeta(siteConfig, {
    title: data.meta.title,
    description: data.meta.description,
    keywords: data.meta.keywords,
    path: `/${params.game}/codes/${params.month}`,
  });
  return seo as Metadata;
}

export default function MonthlyCodePage({
  params,
}: {
  params: { game: string; month: string };
}) {
  const game = getGameBySlug(params.game);
  if (!game) notFound();

  const data = getMonthlyCodeData(params.game, params.month);
  if (!data) notFound();

  const currentMonth = getCurrentMonth();
  const isArchive = params.month !== currentMonth;

  const [year, m] = params.month.split("-");
  const monthLabel = `${year}년 ${parseInt(m)}월`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {isArchive && (
        <ArchiveBanner
          currentMonthUrl={`/${game.slug}/codes/${currentMonth}`}
          archiveMonth={monthLabel}
        />
      )}

      <h1 className="text-3xl font-bold">
        {game.icon} {game.title} 코드 총정리 ({monthLabel})
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        마지막 업데이트: {new Date(data.lastUpdated).toLocaleDateString("ko-KR")}
      </p>

      <div className="mt-6">
        <CodeTable
          codes={data.codes.filter((c) => c.status === "active")}
          title="✅ 사용 가능한 코드"
        />

        <CodeTable
          codes={data.codes.filter((c) => c.status === "unverified")}
          title="⚠️ 확인 중인 코드"
        />

        <CodeTable
          codes={data.expiredCodes}
          title="❌ 만료된 코드"
          showExpired
        />
      </div>
    </div>
  );
}
