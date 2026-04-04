import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getMonthlyCodeData, getAvailableMonths, getCurrentMonth } from "@/lib/content";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { ArchiveBanner } from "@blog-manage/shared-ui";
import { CodeTable } from "@/components/CodeTable";
import { EditorialSummary } from "@/components/EditorialSummary";
import { TipsBox } from "@/components/TipsBox";
import { PostContent } from "@/components/PostContent";
import { getLatestPostByType } from "@/lib/posts";
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
  return { ...seo, title: { absolute: seo.title } } as Metadata;
}

export default async function MonthlyCodePage({
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
  const codeAnalysis = getLatestPostByType(params.game, "code-analysis");

  const [year, m] = params.month.split("-");
  const monthLabel = `${year}년 ${parseInt(m)}월`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {isArchive && (
        <ArchiveBanner
          currentMonthUrl={`/${game.slug}/codes/${currentMonth}`}
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
            {game.title} 코드 총정리 ({monthLabel})
          </h1>
          <p className="text-xs text-slate-400">
            마지막 업데이트: {new Date(data.lastUpdated).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      {data.editorial?.summary && (
        <EditorialSummary summary={data.editorial.summary} />
      )}

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

      {data.editorial?.tips && (
        <TipsBox
          tips={data.editorial.tips}
          totalValue={data.editorial.totalValue}
        />
      )}

      {codeAnalysis && (
        <>
          <div className="mt-10 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-medium tracking-wide text-slate-400">
              상세 분석
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-t-[3px] border-blue-500 px-5 py-5">
              <h2 className="text-base font-bold text-slate-900">
                📊 코드 보상 가치 분석
              </h2>
              <p className="mb-4 mt-1 text-[11px] text-slate-400">
                코드 보상의 게임 내 가치를 분석합니다
              </p>
              <PostContent source={codeAnalysis.content} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
