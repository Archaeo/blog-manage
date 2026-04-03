import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getMonthlyTierData, getAvailableMonths, getCurrentMonth } from "@/lib/content";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { ArchiveBanner } from "@blog-manage/shared-ui";
import { TierList } from "@/components/TierList";
import { EditorialSummary } from "@/components/EditorialSummary";
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {isArchive && (
        <ArchiveBanner
          currentMonthUrl={`/${game.slug}/tier/${currentMonth}`}
          archiveMonth={monthLabel}
        />
      )}

      <div className="flex items-center gap-3">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {game.title} {data.category} 티어표 ({monthLabel})
          </h1>
          <p className="text-xs text-slate-400">
            마지막 업데이트: {new Date(data.lastUpdated).toLocaleDateString("ko-KR")} · 총 {totalItems}개 항목
          </p>
        </div>
      </div>

      {data.editorial?.summary && (
        <EditorialSummary summary={data.editorial.summary} />
      )}

      <div className="mt-6">
        <TierList tiers={data.tiers} gameIcon={game.icon} />
      </div>

      {data.editorial?.recommendation && (
        <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
          <h3 className="mb-1.5 text-xs font-bold text-purple-800">
            🎯 초보자 추천
          </h3>
          <p className="text-sm leading-relaxed text-purple-900">
            {data.editorial.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
