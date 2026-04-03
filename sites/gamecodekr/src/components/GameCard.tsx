import type { GameConfig } from "@/lib/types";

interface GameCardProps {
  game: GameConfig;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <a
      href={`/${game.slug}`}
      className="block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300"
    >
      <div className="flex h-[72px] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="h-14 w-14 rounded-lg border-2 border-white object-cover shadow-sm"
        />
      </div>
      <div className="p-3">
        <h2 className="text-sm font-bold text-slate-900">{game.title}</h2>
        <p className="text-xs text-slate-400">{game.titleEn}</p>
        <div className="mt-2 flex gap-1.5">
          {game.hasCode && (
            <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
              코드
            </span>
          )}
          {game.hasTier && (
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
              티어표
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
