import type { TierItem, TierRank } from "@/lib/types";

interface TierListProps {
  tiers: Record<TierRank, TierItem[]>;
  gameIcon?: string;
}

const TIER_COLORS: Record<TierRank, string> = {
  "S+": "bg-red-100 border-red-300 text-red-800",
  S: "bg-orange-100 border-orange-300 text-orange-800",
  A: "bg-yellow-100 border-yellow-300 text-yellow-800",
  B: "bg-green-100 border-green-300 text-green-800",
  C: "bg-blue-100 border-blue-300 text-blue-800",
  D: "bg-gray-100 border-gray-300 text-gray-800",
};

const CHANGE_ICONS: Record<string, string> = {
  up: "🔺",
  down: "🔻",
  new: "🆕",
  same: "",
};

export function TierList({ tiers }: TierListProps) {
  const ranks: TierRank[] = ["S+", "S", "A", "B", "C", "D"];

  return (
    <div className="space-y-4">
      {ranks.map((rank) => {
        const items = tiers[rank];
        if (!items || items.length === 0) return null;
        return (
          <div key={rank} className={`rounded-lg border p-4 ${TIER_COLORS[rank]}`}>
            <h3 className="mb-3 text-lg font-bold">{rank} 티어</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.name} className="rounded bg-white/50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.nameKo}</span>
                    <span className="text-xs text-gray-500">({item.name})</span>
                    {CHANGE_ICONS[item.changeFromLast] && (
                      <span>{CHANGE_ICONS[item.changeFromLast]}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
