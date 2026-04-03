import type { GameConfig } from "@/lib/types";

interface GameCardProps {
  game: GameConfig;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <a
      href={`/${game.slug}`}
      className="block rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{game.icon}</span>
        <div>
          <h2 className="font-bold text-lg">{game.title}</h2>
          <p className="text-sm text-gray-500">{game.titleEn}</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{game.description}</p>
      <div className="mt-3 flex gap-2">
        {game.hasCode && (
          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">코드</span>
        )}
        {game.hasTier && (
          <span className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">티어표</span>
        )}
      </div>
    </a>
  );
}
