import { GAMES } from "@/lib/games";
import { GameCard } from "@/components/GameCard";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">로블록스 게임 코드 & 티어표</h1>
        <p className="mt-1 text-sm text-slate-500">
          매일 업데이트되는 최신 코드와 티어표를 확인하세요
        </p>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
