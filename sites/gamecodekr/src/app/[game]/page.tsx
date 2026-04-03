import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getAvailableMonths } from "@/lib/content";
import { GameImage } from "@/components/GameImage";

export function generateStaticParams() {
  return getAllGameSlugs().map((game) => ({ game }));
}

export function generateMetadata({ params }: { params: { game: string } }) {
  const game = getGameBySlug(params.game);
  if (!game) return {};
  return {
    title: `${game.title} - 코드 & 티어표`,
    description: `${game.title}(${game.titleEn}) 최신 코드, 티어표, 패치 요약을 매일 업데이트합니다.`,
  };
}

export default function GameHubPage({ params }: { params: { game: string } }) {
  const game = getGameBySlug(params.game);
  if (!game) notFound();

  const codeMonths = getAvailableMonths(game.slug, "codes");
  const tierMonths = getAvailableMonths(game.slug, "tiers");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <GameImage
          src={game.imageUrl}
          alt={game.title}
          fallbackIcon={game.icon}
          className="h-12 w-12 rounded-lg object-cover"
          iconClassName="text-4xl"
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{game.title}</h1>
          <p className="text-sm text-slate-500">{game.titleEn}</p>
        </div>
      </div>
      <p className="mb-6 text-sm text-slate-600">{game.description}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {game.hasCode && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-slate-900">📋 게임 코드</h2>
            {codeMonths.length > 0 ? (
              <ul className="space-y-2">
                {codeMonths.map((month) => (
                  <li key={month}>
                    <a
                      href={`/${game.slug}/codes/${month}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {formatMonth(month)} 코드 총정리
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">아직 코드가 없어요</p>
            )}
          </section>
        )}

        {game.hasTier && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-slate-900">🏆 티어표</h2>
            {tierMonths.length > 0 ? (
              <ul className="space-y-2">
                {tierMonths.map((month) => (
                  <li key={month}>
                    <a
                      href={`/${game.slug}/tier/${month}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {formatMonth(month)} 티어표
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">아직 티어표가 없어요</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${year}년 ${parseInt(m)}월`;
}
