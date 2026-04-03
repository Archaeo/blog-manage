import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getMonthlyTierData, getAvailableMonths, getCurrentMonth } from "@/lib/content";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { ArchiveBanner } from "@blog-manage/shared-ui";
import { TierList } from "@/components/TierList";
import type { Metadata } from "next";

const siteConfig = createSiteConfig({
  siteName: "GameCodeKR",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev",
});

export function generateStaticParams() {
  const params: { game: string; month: string }[] = [];
  for (const slug of getAllGameSlugs()) {
    for (const month of getAvailableMonths(slug, "tiers")) {
      params.push({ game: slug, month });
    }
  }
  return params;
}

export function generateMetadata({ params }: { params: { game: string; month: string } }): Metadata {
  const data = getMonthlyTierData(params.game, params.month);
  if (!data) return {};
  const seo = genSeoMeta(siteConfig, {
    title: data.meta.title,
    description: data.meta.description,
    keywords: data.meta.keywords,
    path: `/${params.game}/tier/${params.month}`,
  });
  return seo as Metadata;
}

export default function MonthlyTierPage({
  params,
}: {
  params: { game: string; month: string };
}) {
  const game = getGameBySlug(params.game);
  if (!game) notFound();

  const data = getMonthlyTierData(params.game, params.month);
  if (!data) notFound();

  const currentMonth = getCurrentMonth();
  const isArchive = params.month !== currentMonth;

  const [year, m] = params.month.split("-");
  const monthLabel = `${year}년 ${parseInt(m)}월`;

  const totalItems = Object.values(data.tiers).reduce(
    (sum, items) => sum + items.length,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {isArchive && (
        <ArchiveBanner
          currentMonthUrl={`/${game.slug}/tier/${currentMonth}`}
          archiveMonth={monthLabel}
        />
      )}

      <h1 className="text-3xl font-bold">
        {game.icon} {game.title} {data.category} 티어표 ({monthLabel})
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        마지막 업데이트: {new Date(data.lastUpdated).toLocaleDateString("ko-KR")} · 총 {totalItems}개 항목
      </p>

      <div className="mt-6">
        <TierList tiers={data.tiers} />
      </div>
    </div>
  );
}
