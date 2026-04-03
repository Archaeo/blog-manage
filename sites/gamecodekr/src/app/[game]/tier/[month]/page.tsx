import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import {
  getMonthlyTierData,
  getAvailableMonths,
  getCurrentMonth,
  getAllCategoryTierData,
} from "@/lib/content";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { ArchiveBanner } from "@blog-manage/shared-ui";
import { TierCategoryTabs } from "@/components/TierCategoryTabs";
import { TierLegend } from "@/components/TierLegend";
import { TierAnalysis } from "@/components/TierAnalysis";
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

export function generateMetadata({
  params,
}: {
  params: { game: string; month: string };
}): Metadata {
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

  const currentMonth = getCurrentMonth();
  const isArchive = params.month !== currentMonth;
  const [year, m] = params.month.split("-");
  const monthLabel = `${year}년 ${parseInt(m)}월`;

  // 멀티 카테고리 데이터 로딩
  const categoryDataList = getAllCategoryTierData(params.game, params.month);
  if (categoryDataList.length === 0) notFound();

  // 메타 정보 계산
  const totalItems = categoryDataList.reduce(
    (sum, cat) =>
      sum + Object.values(cat.tiers).reduce((s, items) => s + items.length, 0),
    0
  );
  const totalCategories = categoryDataList.length;
  const sPlusCount = categoryDataList.reduce(
    (sum, cat) => sum + (cat.tiers["S+"]?.length || 0),
    0
  );

  // 첫 번째 카테고리의 editorial을 기본으로 사용
  const primaryEditorial = categoryDataList[0]?.editorial;

  // 카테고리 라벨 (제목용)
  const categoryNames = categoryDataList.map((c) => c.categoryLabel.name);
  const categoryTitle =
    totalCategories === 1 ? categoryNames[0] : categoryNames.join("/");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {isArchive && (
        <ArchiveBanner
          currentMonthUrl={`/${game.slug}/tier/${currentMonth}`}
          archiveMonth={monthLabel}
        />
      )}

      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {game.title} {categoryTitle} 티어표 ({monthLabel})
          </h1>
          <p className="text-xs text-slate-400">
            마지막 업데이트:{" "}
            {new Date().toLocaleDateString("ko-KR")} · 총 {totalItems}개 항목
            {totalCategories > 1 && ` · ${totalCategories}개 카테고리`}
            {sPlusCount > 0 && ` · S+ ${sPlusCount}개`}
          </p>
        </div>
      </div>

      {/* 에디토리얼 요약 */}
      {primaryEditorial?.summary && (
        <EditorialSummary summary={primaryEditorial.summary} />
      )}

      {/* 카테고리 탭 + 티어표 */}
      <div className="mt-6">
        <TierCategoryTabs categories={categoryDataList} />
      </div>

      {/* 읽는 법 */}
      <div className="mt-4">
        <TierLegend />
      </div>

      {/* 종합 분석문 */}
      {primaryEditorial?.analysis && (
        <div className="mt-6">
          <TierAnalysis
            analysis={primaryEditorial.analysis}
            recommendation={primaryEditorial.recommendation}
            analysisSources={primaryEditorial.analysisSources}
            analysisDate={primaryEditorial.analysisDate}
          />
        </div>
      )}
    </div>
  );
}
