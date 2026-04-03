import { GAMES } from "@/lib/games";
import type { GameConfig } from "@/lib/types";

interface SidebarProps {
  currentPath: string;
  onNavigate?: () => void;
}

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const currentGame = GAMES.find((g) => currentPath.startsWith(`/${g.slug}`));

  return (
    <nav className="flex h-full flex-col bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-4">
        <a href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-base text-white">
            🎮
          </span>
          <span className="text-[15px] font-bold text-slate-900">GameCodeKR</span>
        </a>
      </div>

      {/* Game list */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-4 pb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          게임 목록
        </div>
        {GAMES.map((game) => (
          <GameMenuItem
            key={game.slug}
            game={game}
            isActive={currentGame?.slug === game.slug}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}

function GameMenuItem({
  game,
  isActive,
  currentPath,
  onNavigate,
}: {
  game: GameConfig;
  isActive: boolean;
  currentPath: string;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <a
        href={`/${game.slug}`}
        onClick={onNavigate}
        className={`flex items-center gap-2 px-4 py-2 text-xs transition-colors ${
          isActive
            ? "border-l-[3px] border-blue-600 bg-blue-50 font-semibold text-blue-800"
            : "border-l-[3px] border-transparent text-slate-600 hover:bg-slate-50"
        }`}
      >
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-xs">
          {game.icon}
        </span>
        <span className="truncate">{game.title}</span>
      </a>

      {/* Submenu */}
      {isActive && (
        <div className="bg-blue-50/50">
          {game.hasCode && (
            <a
              href={`/${game.slug}/codes`}
              onClick={onNavigate}
              className={`block py-1.5 pl-[52px] pr-4 text-[11px] ${
                currentPath.includes("/codes")
                  ? "font-medium text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              📋 코드
            </a>
          )}
          {game.hasTier && (
            <a
              href={`/${game.slug}/tier`}
              onClick={onNavigate}
              className={`block py-1.5 pl-[52px] pr-4 text-[11px] ${
                currentPath.includes("/tier")
                  ? "font-medium text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              📊 티어표
            </a>
          )}
        </div>
      )}
    </div>
  );
}
