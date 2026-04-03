"use client";

import { useState } from "react";
import type { TierRank, TierItem, TierEditorial, CategoryLabel } from "@/lib/types";
import { TierList } from "./TierList";

interface CategoryData {
  category: string;
  categoryLabel: CategoryLabel;
  tiers: Record<TierRank, TierItem[]>;
  editorial?: TierEditorial;
}

interface TierCategoryTabsProps {
  categories: CategoryData[];
}

export function TierCategoryTabs({ categories }: TierCategoryTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (categories.length <= 1) {
    const cat = categories[0];
    if (!cat) return null;
    return (
      <TierList
        tiers={cat.tiers}
        tierSummaries={cat.editorial?.tierSummaries}
      />
    );
  }

  const active = categories[activeIndex];

  return (
    <div>
      <div className="flex gap-0 border-b-2 border-slate-200">
        {categories.map((cat, i) => {
          const itemCount = Object.values(cat.tiers).reduce(
            (sum, items) => sum + items.length,
            0
          );
          const isActive = i === activeIndex;

          return (
            <button
              key={cat.category}
              onClick={() => setActiveIndex(i)}
              className={`px-4 py-2 text-xs font-bold transition-colors ${
                isActive
                  ? "-mb-[2px] border-b-2 border-purple-600 text-purple-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {cat.categoryLabel.icon} {cat.categoryLabel.name} ({itemCount})
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        <TierList
          tiers={active.tiers}
          tierSummaries={active.editorial?.tierSummaries}
        />
      </div>
    </div>
  );
}
