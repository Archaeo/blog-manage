import { GAMES } from "@/lib/games";
import { GameCard } from "@/components/GameCard";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold">GameCodeKR</h1>
        <p className="mt-2 text-gray-600">
          로블록스 게임 코드 & 티어표를 매일 업데이트! 핵심만 쏙쏙 정리했어요 🎮
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">게임 목록</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {GAMES.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
