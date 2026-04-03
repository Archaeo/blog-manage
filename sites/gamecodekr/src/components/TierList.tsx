"use client";

import { useState } from "react";
import type { TierItem, TierRank } from "@/lib/types";

interface TierListProps {
  tiers: Record<TierRank, TierItem[]>;
  gameIcon?: string;
}

const TIER_COLORS: Record<
  TierRank,
  {
    labelGradient: string;
    rowBg: string;
    rowBorder: string;
    fallbackGradient: string;
  }
> = {
  "S+": {
    labelGradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    rowBg: "#fff1f0",
    rowBorder: "#fecaca",
    fallbackGradient: "linear-gradient(135deg, #ef4444, #dc2626)",
  },
  S: {
    labelGradient: "linear-gradient(135deg, #f97316, #ea580c)",
    rowBg: "#fff7e6",
    rowBorder: "#fed7aa",
    fallbackGradient: "linear-gradient(135deg, #f97316, #ea580c)",
  },
  A: {
    labelGradient: "linear-gradient(135deg, #eab308, #ca8a04)",
    rowBg: "#fffbe6",
    rowBorder: "#fde68a",
    fallbackGradient: "linear-gradient(135deg, #eab308, #ca8a04)",
  },
  B: {
    labelGradient: "linear-gradient(135deg, #22c55e, #16a34a)",
    rowBg: "#f0fdf4",
    rowBorder: "#bbf7d0",
    fallbackGradient: "linear-gradient(135deg, #22c55e, #16a34a)",
  },
  C: {
    labelGradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    rowBg: "#e6f4ff",
    rowBorder: "#bfdbfe",
    fallbackGradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
  },
  D: {
    labelGradient: "linear-gradient(135deg, #6b7280, #4b5563)",
    rowBg: "#f5f5f5",
    rowBorder: "#d1d5db",
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

export function TierList({ tiers }: TierListProps) {
  const ranks: TierRank[] = ["S+", "S", "A", "B", "C", "D"];

  return (
    <div className="space-y-1">
      {ranks.map((rank) => {
        const items = tiers[rank];
        if (!items || items.length === 0) return null;

        return <TierRow key={rank} rank={rank} items={items} />;
      })}
    </div>
  );
}

function TierRow({ rank, items }: { rank: TierRank; items: TierItem[] }) {
  const colors = TIER_COLORS[rank];

  return (
    <div
      className="flex min-h-[56px] overflow-hidden rounded-lg border"
      style={{ borderColor: colors.rowBorder }}
    >
      {/* 등급 라벨 */}
      <div
        className="flex w-12 flex-shrink-0 flex-col items-center justify-center text-white"
        style={{ background: colors.labelGradient }}
      >
        <span className="text-base font-black leading-none">{rank}</span>
        <span className="mt-0.5 text-[8px] font-medium opacity-80">
          {TIER_LABELS[rank]}
        </span>
      </div>

      {/* 아이템 영역 */}
      <div
        className="flex flex-1 flex-wrap items-center gap-1 px-2 py-1.5"
        style={{ backgroundColor: colors.rowBg }}
      >
        {items.map((item) => (
          <TierItemBadge key={item.name} item={item} rank={rank} />
        ))}
      </div>
    </div>
  );
}

function TierItemBadge({ item, rank }: { item: TierItem; rank: TierRank }) {
  const [imgError, setImgError] = useState(false);
  const colors = TIER_COLORS[rank];
  const initial = (item.name[0] || "?").toUpperCase();
  const showFallback = !item.imageUrl || imgError;

  return (
    <div className="flex w-14 flex-col items-center gap-0.5 py-0.5">
      {/* 이미지 또는 폴백 */}
      <div className="relative">
        {showFallback ? (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white text-sm font-bold text-white shadow-sm"
            style={{ background: colors.fallbackGradient }}
          >
            {initial}
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt={item.nameKo}
            className="h-10 w-10 rounded-lg border-2 border-white object-cover shadow-sm"
            onError={() => setImgError(true)}
          />
        )}

        {/* 신뢰 뱃지 */}
        <TrustBadge consensus={item.consensus} sources={item.sources} />
      </div>

      {/* 이름 */}
      <span
        className="max-w-[54px] truncate text-center text-[9px] font-medium text-slate-700"
        title={item.nameKo}
      >
        {item.nameKo}
      </span>

      {/* 변동 아이콘 */}
      {CHANGE_ICONS[item.changeFromLast] && (
        <span className="text-[9px] leading-none">
          {CHANGE_ICONS[item.changeFromLast]}
        </span>
      )}
    </div>
  );
}

function TrustBadge({
  consensus,
  sources,
}: {
  consensus?: boolean;
  sources?: number;
}) {
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
