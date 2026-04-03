"use client";

import type { TierItem, TierRank } from "@/lib/types";

interface TierListProps {
  tiers: Record<TierRank, TierItem[]>;
  gameIcon?: string;
}

const TIER_CONFIG: Record<TierRank, { gradient: string; border: string; text: string; label: string; glowRgb: string }> = {
  "S+": { gradient: "from-red-500 to-red-600", border: "border-red-200", text: "text-red-600", label: "최강", glowRgb: "239,68,68" },
  S: { gradient: "from-orange-500 to-orange-600", border: "border-orange-200", text: "text-orange-600", label: "강함", glowRgb: "249,115,22" },
  A: { gradient: "from-amber-500 to-amber-600", border: "border-amber-200", text: "text-amber-600", label: "우수", glowRgb: "245,158,11" },
  B: { gradient: "from-yellow-500 to-yellow-600", border: "border-yellow-200", text: "text-yellow-600", label: "보통", glowRgb: "234,179,8" },
  C: { gradient: "from-green-500 to-green-600", border: "border-green-200", text: "text-green-600", label: "약함", glowRgb: "34,197,94" },
  D: { gradient: "from-gray-400 to-gray-500", border: "border-gray-200", text: "text-gray-500", label: "최하위", glowRgb: "107,114,128" },
};

const CHANGE_ICONS: Record<string, string> = {
  up: "🔺",
  down: "🔻",
  new: "🆕",
  same: "",
};

export function TierList({ tiers, gameIcon = "🎮" }: TierListProps) {
  const ranks: TierRank[] = ["S+", "S", "A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      {ranks.map((rank) => {
        const items = tiers[rank];
        if (!items || items.length === 0) return null;
        const config = TIER_CONFIG[rank];

        return (
          <div key={rank}>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`bg-gradient-to-r ${config.gradient} rounded-md px-3 py-1 text-sm font-bold text-white shadow-sm`}
              >
                {rank}
              </span>
              <span className={`text-xs font-semibold ${config.text}`}>
                {config.label}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <TierItemCard
                  key={item.name}
                  item={item}
                  config={config}
                  gameIcon={gameIcon}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TierItemCard({
  item,
  config,
  gameIcon,
}: {
  item: TierItem;
  config: { border: string; glowRgb: string };
  gameIcon: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border bg-white p-2.5 shadow-sm ${config.border}`}
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.nameKo}
          className="h-11 w-11 flex-shrink-0 rounded-lg object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              target.style.display = "none";
              fallback.style.display = "flex";
            }
          }}
        />
      ) : null}
      <div
        className={`h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-xl ${
          item.imageUrl ? "hidden" : "flex"
        }`}
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(${config.glowRgb}, 0.15), rgba(255,255,255,0.5))`,
          border: `1px solid rgba(${config.glowRgb}, 0.2)`,
        }}
      >
        {gameIcon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className="truncate text-xs font-bold text-slate-900">
            {item.nameKo}
          </span>
          {CHANGE_ICONS[item.changeFromLast] && (
            <span className="flex-shrink-0 text-xs">
              {CHANGE_ICONS[item.changeFromLast]}
            </span>
          )}
        </div>
        <p className="truncate text-[10px] text-slate-400">{item.name}</p>
      </div>
    </div>
  );
}
