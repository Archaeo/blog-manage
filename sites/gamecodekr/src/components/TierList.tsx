"use client";

import { useState } from "react";
import type { TierItem, TierRank } from "@/lib/types";

interface TierListProps {
  tiers: Record<TierRank, TierItem[]>;
  tierSummaries?: Partial<Record<TierRank, string>>;
}

const TIER_COLORS: Record<
  TierRank,
  {
    labelGradient: string;
    rowBg: string;
    rowBorder: string;
    chipBorder: string;
    summaryBg: string;
    summaryText: string;
    fallbackGradient: string;
  }
> = {
  "S+": {
    labelGradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    rowBg: "#fff1f0",
    rowBorder: "#fecaca",
    chipBorder: "#fecaca",
    summaryBg: "#fff5f5",
    summaryText: "#991b1b",
    fallbackGradient: "linear-gradient(135deg, #ef4444, #dc2626)",
  },
  S: {
    labelGradient: "linear-gradient(135deg, #f97316, #ea580c)",
    rowBg: "#fff7e6",
    rowBorder: "#fed7aa",
    chipBorder: "#fed7aa",
    summaryBg: "#fffbeb",
    summaryText: "#9a3412",
    fallbackGradient: "linear-gradient(135deg, #f97316, #ea580c)",
  },
  A: {
    labelGradient: "linear-gradient(135deg, #eab308, #ca8a04)",
    rowBg: "#fffbe6",
    rowBorder: "#fde68a",
    chipBorder: "#fde68a",
    summaryBg: "#fefce8",
    summaryText: "#854d0e",
    fallbackGradient: "linear-gradient(135deg, #eab308, #ca8a04)",
  },
  B: {
    labelGradient: "linear-gradient(135deg, #22c55e, #16a34a)",
    rowBg: "#f0fdf4",
    rowBorder: "#bbf7d0",
    chipBorder: "#bbf7d0",
    summaryBg: "#f0fdf4",
    summaryText: "#166534",
    fallbackGradient: "linear-gradient(135deg, #22c55e, #16a34a)",
  },
  C: {
    labelGradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    rowBg: "#e6f4ff",
    rowBorder: "#bfdbfe",
    chipBorder: "#bfdbfe",
    summaryBg: "#eff6ff",
    summaryText: "#1e40af",
    fallbackGradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
  },
  D: {
    labelGradient: "linear-gradient(135deg, #6b7280, #4b5563)",
    rowBg: "#f5f5f5",
    rowBorder: "#d1d5db",
    chipBorder: "#d1d5db",
    summaryBg: "#f9fafb",
    summaryText: "#374151",
    fallbackGradient: "linear-gradient(135deg, #6b7280, #4b5563)",
  },
};

const TIER_LABELS: Record<TierRank, string> = {
  "S+": "최강",
  S: "강함",
  A: "우수",
  B: "보통",
  C: "약함",
  D: "최하위",
};

const CHANGE_ICONS: Record<string, string> = {
  up: "🔺",
  down: "🔻",
  new: "🆕",
  same: "",
};

export function TierList({ tiers, tierSummaries }: TierListProps) {
  const ranks: TierRank[] = ["S+", "S", "A", "B", "C", "D"];

  return (
    <div className="space-y-1">
      {ranks.map((rank) => {
        const items = tiers[rank];
        if (!items || items.length === 0) return null;

        return (
          <div key={rank}>
            <TierRow rank={rank} items={items} />
            {tierSummaries?.[rank] && (
              <TierRankSummary rank={rank} summary={tierSummaries[rank]!} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TierRow({ rank, items }: { rank: TierRank; items: TierItem[] }) {
  const colors = TIER_COLORS[rank];

  return (
    <div
      className="flex min-h-[44px] overflow-hidden rounded-lg border"
      style={{ borderColor: colors.rowBorder }}
    >
      <div
        className="flex w-11 flex-shrink-0 flex-col items-center justify-center text-white"
        style={{ background: colors.labelGradient }}
      >
        <span className="text-sm font-black leading-none">{rank}</span>
        <span className="mt-0.5 text-[7px] font-medium opacity-80">
          {TIER_LABELS[rank]}
        </span>
      </div>

      <div
        className="flex flex-1 flex-wrap items-center gap-1 px-1.5 py-1.5"
        style={{ backgroundColor: colors.rowBg }}
      >
        {items.map((item) => (
          <TierChip key={item.name} item={item} rank={rank} />
        ))}
      </div>
    </div>
  );
}

function TierChip({ item, rank }: { item: TierItem; rank: TierRank }) {
  const [imgError, setImgError] = useState(false);
  const colors = TIER_COLORS[rank];
  const initial = (item.name[0] || "?").toUpperCase();
  const showFallback = !item.imageUrl || imgError;
  const changeIcon = CHANGE_ICONS[item.changeFromLast] || "";

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full bg-white py-0.5 pl-0.5 pr-2 shadow-sm"
      style={{ border: `1px solid ${colors.chipBorder}` }}
      title={`${item.nameKo} (${item.name})`}
    >
      <div className="relative flex-shrink-0">
        {showFallback ? (
          <div
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: colors.fallbackGradient }}
          >
            {initial}
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt={item.nameKo}
            className="h-[26px] w-[26px] rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
        <TrustBadge consensus={item.consensus} sources={item.sources} />
      </div>

      <span className="max-w-[80px] truncate text-[11px] font-semibold text-slate-800">
        {item.nameKo}
      </span>

      {changeIcon && (
        <span className="text-[9px] leading-none">{changeIcon}</span>
      )}
    </div>
  );
}

function TierRankSummary({ rank, summary }: { rank: TierRank; summary: string }) {
  const colors = TIER_COLORS[rank];

  return (
    <div
      className="rounded-b-lg border border-t-0 px-3 py-1.5 text-[11px] leading-relaxed"
      style={{
        backgroundColor: colors.summaryBg,
        borderColor: colors.rowBorder,
        color: colors.summaryText,
      }}
    >
      💡 {summary}
    </div>
  );
}

function TrustBadge({ consensus, sources }: { consensus?: boolean; sources?: number }) {
  if (consensus === undefined || sources === undefined) return null;

  if (consensus && sources >= 3) {
    return (
      <span
        className="absolute -right-0.5 -top-0.5 h-[6px] w-[6px] rounded-full border border-white"
        style={{ backgroundColor: "#22c55e" }}
        title={`${sources}개 소스 일치`}
      />
    );
  }

  if (consensus && sources === 2) {
    return (
      <span
        className="absolute -right-0.5 -top-0.5 h-[6px] w-[6px] rounded-full border border-white"
        style={{ backgroundColor: "#3b82f6" }}
        title="2개 소스 일치"
      />
    );
  }

  if (!consensus) {
    return (
      <span
        className="absolute -right-1 -top-1 text-[8px] leading-none"
        title="소스 간 의견 불일치"
      >
        ⚠️
      </span>
    );
  }

  return null;
}
