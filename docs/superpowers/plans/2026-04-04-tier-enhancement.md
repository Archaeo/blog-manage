# 티어표 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 티어표 페이지를 칩/뱃지형 아이템, 멀티 카테고리 탭, 등급별 요약, 소스 종합 분석문으로 개선한다.

**Architecture:** 프론트엔드(TierList 재설계 + 새 컴포넌트) + 파이프라인(이미지 수집 + AI 분석 생성) + 데이터 마이그레이션(카테고리별 JSON 분리). 기존 코드를 점진적으로 변경하며, 마이그레이션 기간 동안 양쪽 JSON 형식을 모두 지원.

**Tech Stack:** Next.js 14 (App Router, Static Export), TailwindCSS 4, Python 3 + Playwright, Claude API (anthropic SDK)

---

## File Map

### Modify
- `sites/gamecodekr/src/lib/types.ts` — TierEditorial 필드 확장, 카테고리 관련 타입
- `sites/gamecodekr/src/lib/content.ts` — 멀티 카테고리 JSON 로딩
- `sites/gamecodekr/src/components/TierList.tsx` — 칩/뱃지형 재설계
- `sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx` — 페이지 전체 구조 변경
- `pipelines/gamecodekr/collect_tiers.py` — 이미지 수집 + 소스 텍스트 수집
- `pipelines/gamecodekr/generate_content.py` — 카테고리별 파일 생성
- `pipelines/gamecodekr/config.py` — 카테고리 한국어 매핑
- `pipelines/gamecodekr/run.py` — 카테고리별 파일 경로 대응

### Create
- `sites/gamecodekr/src/components/TierCategoryTabs.tsx` — 카테고리 탭 UI
- `sites/gamecodekr/src/components/TierAnalysis.tsx` — 종합 분석문
- `sites/gamecodekr/src/components/TierLegend.tsx` — 읽는 법 안내
- `pipelines/gamecodekr/generate_analysis.py` — AI 분석 글 생성
- `scripts/migrate-tier-files.sh` — 기존 JSON → 카테고리별 JSON 마이그레이션

---

### Task 1: 타입 확장 + 콘텐츠 라이브러리

**Files:**
- Modify: `sites/gamecodekr/src/lib/types.ts`
- Modify: `sites/gamecodekr/src/lib/content.ts`

- [ ] **Step 1: types.ts에 TierEditorial 필드 확장**

`sites/gamecodekr/src/lib/types.ts`에서 `TierEditorial` 인터페이스를 수정:

```typescript
/** 티어 페이지 에디토리얼 */
export interface TierEditorial {
  summary: string;
  recommendation: string;
  tierSummaries?: Partial<Record<TierRank, string>>;
  analysis?: string;
  analysisSources?: string[];
  analysisDate?: string;
}

/** 카테고리 라벨 */
export interface CategoryLabel {
  name: string;
  icon: string;
}

/** 카테고리별 티어 데이터 (멀티 카테고리 페이지용) */
export interface CategoryTierData {
  category: string;
  categoryLabel: CategoryLabel;
  tiers: Record<TierRank, TierItem[]>;
  editorial?: TierEditorial;
}
```

- [ ] **Step 2: content.ts에 멀티 카테고리 로딩 함수 추가**

`sites/gamecodekr/src/lib/content.ts`를 수정:

```typescript
import fs from "fs";
import path from "path";
import type { MonthlyCodeData, MonthlyTierData, CategoryTierData, CategoryLabel } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

const CATEGORY_LABELS: Record<string, CategoryLabel> = {
  fruits: { name: "열매", icon: "🍎" },
  "fruits-overall": { name: "열매", icon: "🍎" },
  swords: { name: "검", icon: "⚔️" },
  "fighting-styles": { name: "격투 스타일", icon: "🥊" },
  units: { name: "유닛", icon: "⚔️" },
  bloodlines: { name: "혈통", icon: "🩸" },
  pets: { name: "펫", icon: "🐾" },
  towers: { name: "타워", icon: "🗼" },
  bees: { name: "벌", icon: "🐝" },
  weapons: { name: "무기", icon: "🔪" },
};

export function getCategoryLabel(category: string): CategoryLabel {
  return CATEGORY_LABELS[category] || { name: category, icon: "📋" };
}

// 기존 함수들 (getCurrentMonth, getMonthlyCodeData, getAvailableMonths) 유지

export function getMonthlyTierData(
  gameSlug: string,
  month: string
): MonthlyTierData | null {
  // 기존 단일 파일 먼저 시도
  const filePath = path.join(CONTENT_DIR, "tiers", gameSlug, `${month}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as MonthlyTierData;
  } catch {
    return null;
  }
}

export function getTierCategories(gameSlug: string, month: string): string[] {
  const dirPath = path.join(CONTENT_DIR, "tiers", gameSlug);
  try {
    const files = fs.readdirSync(dirPath);
    // 카테고리별 파일: 2026-04-fruits.json, 2026-04-swords.json 등
    const catFiles = files.filter(
      (f) => f.startsWith(`${month}-`) && f.endsWith(".json") && f !== `${month}.json`
    );
    if (catFiles.length > 0) {
      return catFiles.map((f) => f.replace(`${month}-`, "").replace(".json", ""));
    }
    // 카테고리별 파일이 없으면 기존 단일 파일의 category 반환
    const data = getMonthlyTierData(gameSlug, month);
    return data ? [data.category] : [];
  } catch {
    return [];
  }
}

export function getCategoryTierData(
  gameSlug: string,
  month: string,
  category: string
): MonthlyTierData | null {
  // 카테고리별 파일 먼저 시도
  const catPath = path.join(CONTENT_DIR, "tiers", gameSlug, `${month}-${category}.json`);
  try {
    const raw = fs.readFileSync(catPath, "utf-8");
    return JSON.parse(raw) as MonthlyTierData;
  } catch {
    // 기존 단일 파일 fallback
    const data = getMonthlyTierData(gameSlug, month);
    if (data && data.category === category) return data;
    return null;
  }
}

export function getAllCategoryTierData(
  gameSlug: string,
  month: string
): CategoryTierData[] {
  const categories = getTierCategories(gameSlug, month);
  const results: CategoryTierData[] = [];

  for (const cat of categories) {
    const data = getCategoryTierData(gameSlug, month, cat);
    if (data) {
      results.push({
        category: cat,
        categoryLabel: getCategoryLabel(cat),
        tiers: data.tiers,
        editorial: data.editorial,
      });
    }
  }

  return results;
}

export function getAvailableMonths(
  gameSlug: string,
  type: "codes" | "tiers"
): string[] {
  const dirPath = path.join(CONTENT_DIR, type, gameSlug);
  try {
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
    // YYYY-MM 부분만 추출 (카테고리별 파일도 포함)
    const months = new Set(
      files.map((f) => {
        const match = f.match(/^(\d{4}-\d{2})/);
        return match ? match[1] : "";
      }).filter(Boolean)
    );
    return [...months].sort().reverse();
  } catch {
    return [];
  }
}
```

- [ ] **Step 3: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm build`
Expected: 빌드 성공. 기존 단일 파일 형식이 그대로 동작.

- [ ] **Step 4: 커밋**

```bash
git add sites/gamecodekr/src/lib/types.ts sites/gamecodekr/src/lib/content.ts
git commit -m "feat: 티어 타입 확장 및 멀티 카테고리 콘텐츠 로딩"
```

---

### Task 2: TierList 칩/뱃지형 재설계

**Files:**
- Modify: `sites/gamecodekr/src/components/TierList.tsx`

- [ ] **Step 1: TierList.tsx를 칩/뱃지형으로 재작성**

전체 파일을 다음으로 교체:

```tsx
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
      {/* 등급 라벨 */}
      <div
        className="flex w-11 flex-shrink-0 flex-col items-center justify-center text-white"
        style={{ background: colors.labelGradient }}
      >
        <span className="text-sm font-black leading-none">{rank}</span>
        <span className="mt-0.5 text-[7px] font-medium opacity-80">
          {TIER_LABELS[rank]}
        </span>
      </div>

      {/* 아이템 영역 */}
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
      {/* 원형 이미지 */}
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

      {/* 이름 */}
      <span className="max-w-[80px] truncate text-[11px] font-semibold text-slate-800">
        {item.nameKo}
      </span>

      {/* 변동 아이콘 */}
      {changeIcon && (
        <span className="text-[9px] leading-none">{changeIcon}</span>
      )}
    </div>
  );
}

function TierRankSummary({
  rank,
  summary,
}: {
  rank: TierRank;
  summary: string;
}) {
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
```

- [ ] **Step 2: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm build`
Expected: 빌드 성공. 기존 티어 페이지가 칩/뱃지형으로 표시됨.

- [ ] **Step 3: 커밋**

```bash
git add sites/gamecodekr/src/components/TierList.tsx
git commit -m "feat: TierList 칩/뱃지형으로 재설계"
```

---

### Task 3: TierCategoryTabs 컴포넌트

**Files:**
- Create: `sites/gamecodekr/src/components/TierCategoryTabs.tsx`

- [ ] **Step 1: TierCategoryTabs 컴포넌트 생성**

`sites/gamecodekr/src/components/TierCategoryTabs.tsx`:

```tsx
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

  // 카테고리 1개면 탭 없이 바로 표시
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
      {/* 탭 바 */}
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

      {/* 활성 카테고리 티어표 */}
      <div className="mt-3">
        <TierList
          tiers={active.tiers}
          tierSummaries={active.editorial?.tierSummaries}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm build`
Expected: 빌드 성공 (아직 사용하지 않으므로 treeshake됨).

- [ ] **Step 3: 커밋**

```bash
git add sites/gamecodekr/src/components/TierCategoryTabs.tsx
git commit -m "feat: TierCategoryTabs 멀티 카테고리 탭 컴포넌트"
```

---

### Task 4: TierLegend + TierAnalysis 컴포넌트

**Files:**
- Create: `sites/gamecodekr/src/components/TierLegend.tsx`
- Create: `sites/gamecodekr/src/components/TierAnalysis.tsx`

- [ ] **Step 1: TierLegend 컴포넌트 생성**

`sites/gamecodekr/src/components/TierLegend.tsx`:

```tsx
export function TierLegend() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <h3 className="mb-2 text-xs font-bold text-slate-600">
        📖 티어표 보는 법
      </h3>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
        <span>🟢 3개 소스 일치</span>
        <span>🔵 2개 소스 일치</span>
        <span>⚠️ 의견 불일치</span>
        <span>🔺 상승</span>
        <span>🔻 하락</span>
        <span>🆕 신규</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TierAnalysis 컴포넌트 생성**

`sites/gamecodekr/src/components/TierAnalysis.tsx`:

```tsx
interface TierAnalysisProps {
  analysis: string;
  recommendation?: string;
  analysisSources?: string[];
  analysisDate?: string;
}

export function TierAnalysis({
  analysis,
  recommendation,
  analysisSources,
  analysisDate,
}: TierAnalysisProps) {
  if (!analysis) return null;

  // analysis는 줄바꿈으로 구분된 단락
  const paragraphs = analysis.split("\n\n").filter(Boolean);

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
      <h3 className="mb-3 text-sm font-bold text-slate-900">
        📝 종합 분석
      </h3>

      <div className="space-y-3 text-sm leading-relaxed text-slate-700">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {recommendation && (
        <div className="mt-4 rounded-lg border-l-[3px] border-green-500 bg-green-50 px-3 py-2">
          <p className="text-sm text-green-900">
            <span className="font-bold">🎯 초보자 추천:</span> {recommendation}
          </p>
        </div>
      )}

      {(analysisSources || analysisDate) && (
        <div className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
          {analysisSources && (
            <span>분석 소스: {analysisSources.join(", ")}</span>
          )}
          {analysisSources && analysisDate && <span> · </span>}
          {analysisDate && <span>마지막 종합: {analysisDate}</span>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm build`
Expected: 빌드 성공.

- [ ] **Step 4: 커밋**

```bash
git add sites/gamecodekr/src/components/TierLegend.tsx sites/gamecodekr/src/components/TierAnalysis.tsx
git commit -m "feat: TierLegend, TierAnalysis 컴포넌트 추가"
```

---

### Task 5: 티어 페이지 전체 구조 변경

**Files:**
- Modify: `sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx`

- [ ] **Step 1: 페이지를 새 구조로 재작성**

`sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx` 전체 교체:

```tsx
import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import {
  getMonthlyTierData,
  getAvailableMonths,
  getCurrentMonth,
  getAllCategoryTierData,
  getCategoryLabel,
  getTierCategories,
} from "@/lib/content";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { ArchiveBanner } from "@blog-manage/shared-ui";
import { TierCategoryTabs } from "@/components/TierCategoryTabs";
import { TierLegend } from "@/components/TierLegend";
import { TierAnalysis } from "@/components/TierAnalysis";
import { EditorialSummary } from "@/components/EditorialSummary";
import type { Metadata } from "next";

const siteConfig = createSiteConfig({
  siteName: "GameCodeKR",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev",
});

export function generateStaticParams() {
  const params: { game: string; month: string }[] = [];
  for (const slug of getAllGameSlugs()) {
    for (const month of getAvailableMonths(slug, "tiers")) {
      params.push({ game: slug, month });
    }
  }
  return params;
}

export function generateMetadata({
  params,
}: {
  params: { game: string; month: string };
}): Metadata {
  const data = getMonthlyTierData(params.game, params.month);
  if (!data) return {};
  const seo = genSeoMeta(siteConfig, {
    title: data.meta.title,
    description: data.meta.description,
    keywords: data.meta.keywords,
    path: `/${params.game}/tier/${params.month}`,
  });
  return seo as Metadata;
}

export default function MonthlyTierPage({
  params,
}: {
  params: { game: string; month: string };
}) {
  const game = getGameBySlug(params.game);
  if (!game) notFound();

  const currentMonth = getCurrentMonth();
  const isArchive = params.month !== currentMonth;
  const [year, m] = params.month.split("-");
  const monthLabel = `${year}년 ${parseInt(m)}월`;

  // 멀티 카테고리 데이터 로딩
  const categoryDataList = getAllCategoryTierData(params.game, params.month);
  if (categoryDataList.length === 0) notFound();

  // 메타 정보 계산
  const totalItems = categoryDataList.reduce(
    (sum, cat) =>
      sum + Object.values(cat.tiers).reduce((s, items) => s + items.length, 0),
    0
  );
  const totalCategories = categoryDataList.length;
  const sPlusCount = categoryDataList.reduce(
    (sum, cat) => sum + (cat.tiers["S+"]?.length || 0),
    0
  );

  // 첫 번째 카테고리의 editorial을 기본으로 사용
  const primaryEditorial = categoryDataList[0]?.editorial;

  // 카테고리 라벨 (제목용)
  const categoryNames = categoryDataList.map((c) => c.categoryLabel.name);
  const categoryTitle =
    totalCategories === 1 ? categoryNames[0] : categoryNames.join("/");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {isArchive && (
        <ArchiveBanner
          currentMonthUrl={`/${game.slug}/tier/${currentMonth}`}
          archiveMonth={monthLabel}
        />
      )}

      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {game.title} {categoryTitle} 티어표 ({monthLabel})
          </h1>
          <p className="text-xs text-slate-400">
            마지막 업데이트:{" "}
            {new Date().toLocaleDateString("ko-KR")} · 총 {totalItems}개 항목
            {totalCategories > 1 && ` · ${totalCategories}개 카테고리`}
            {sPlusCount > 0 && ` · S+ ${sPlusCount}개`}
          </p>
        </div>
      </div>

      {/* 에디토리얼 요약 */}
      {primaryEditorial?.summary && (
        <EditorialSummary summary={primaryEditorial.summary} />
      )}

      {/* 카테고리 탭 + 티어표 */}
      <div className="mt-6">
        <TierCategoryTabs categories={categoryDataList} />
      </div>

      {/* 읽는 법 */}
      <div className="mt-4">
        <TierLegend />
      </div>

      {/* 종합 분석문 */}
      {primaryEditorial?.analysis && (
        <div className="mt-6">
          <TierAnalysis
            analysis={primaryEditorial.analysis}
            recommendation={primaryEditorial.recommendation}
            analysisSources={primaryEditorial.analysisSources}
            analysisDate={primaryEditorial.analysisDate}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm build`
Expected: 빌드 성공. 기존 단일 카테고리 데이터로 페이지가 정상 렌더링 (탭 없이).

- [ ] **Step 3: 커밋**

```bash
git add sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx
git commit -m "feat: 티어 페이지 전체 구조 개선 (탭+레전드+분석문)"
```

---

### Task 6: 파이프라인 — collect_tiers 이미지 수집 개선

**Files:**
- Modify: `pipelines/gamecodekr/collect_tiers.py`

- [ ] **Step 1: 이미지 route 차단 수정 + 소스 텍스트 수집**

`pipelines/gamecodekr/collect_tiers.py`에서 다음을 변경:

1. 이미지 차단 라인 수정: `png,jpg,jpeg,gif,webp,svg` 를 허용하도록 변경

기존:
```python
context.route("**/*.{png,jpg,jpeg,gif,webp,svg,ico,woff,woff2}", lambda route: route.abort())
```

변경:
```python
# 폰트만 차단 (이미지는 수집을 위해 허용)
context.route("**/*.{ico,woff,woff2}", lambda route: route.abort())
```

2. `_extract_tiers_from_page` 반환값에 `source_text` 추가:

기존 함수 끝에 소스 텍스트 추출 추가. `collect_all_tiers()` 안의 `category_results[category] = items` 를 확장:

```python
def _extract_source_text(page: Page) -> str:
    """페이지에서 티어 관련 분석/설명 텍스트를 추출한다."""
    try:
        text = page.evaluate("""
            () => {
                const selectors = [
                    'article p',
                    '.entry-content p',
                    '.post-content p',
                    'main p',
                    '[class*="content"] p',
                ];
                const paragraphs = [];
                for (const sel of selectors) {
                    const els = document.querySelectorAll(sel);
                    if (els.length > 0) {
                        for (const el of els) {
                            const t = el.textContent.trim();
                            if (t.length > 30 && t.length < 500) {
                                paragraphs.push(t);
                            }
                        }
                        break;
                    }
                }
                return paragraphs.slice(0, 20).join('\\n\\n');
            }
        """)
        return text[:3000]  # 최대 3000자
    except Exception:
        return ""
```

3. `collect_all_tiers()`에서 결과 구조 변경. 기존 `category_results[category] = items` 를:

```python
source_text = _extract_source_text(page)
category_results[category] = {
    "items": items,
    "source_text": source_text,
}
```

- [ ] **Step 2: validate_tiers.py 호환성 수정**

`pipelines/gamecodekr/validate_tiers.py`의 `cross_verify_tiers()`가 새 구조를 처리하도록 수정.

`cross_verify_tiers` 함수에서 items 루프 부분을 수정:

기존:
```python
for category, items in categories.items():
```

변경:
```python
for category, cat_data in categories.items():
    # 새 형식 (items + source_text) 또는 기존 형식 (list) 호환
    if isinstance(cat_data, dict):
        items = cat_data.get("items", [])
    else:
        items = cat_data
```

또한 source_text를 수집하여 반환에 포함:

함수 시작 부분에 추가:
```python
source_texts: dict[str, dict[str, str]] = {}  # {category: {source_name: text}}
```

items 루프 안에 추가:
```python
if isinstance(cat_data, dict) and cat_data.get("source_text"):
    if category not in source_texts:
        source_texts[category] = {}
    source_texts[category][source_name] = cat_data["source_text"]
```

반환 타입을 변경하여 source_texts도 반환:

```python
def cross_verify_tiers(sources: dict) -> tuple[dict[str, list[dict]], dict[str, dict[str, str]]]:
```

함수 끝:
```python
return result, source_texts
```

- [ ] **Step 3: run.py에서 반환값 대응**

`pipelines/gamecodekr/run.py`의 `run_tiers()`에서:

기존:
```python
verified = cross_verify_tiers(sources)

for category, items in verified.items():
```

변경:
```python
verified, source_texts = cross_verify_tiers(sources)

for category, items in verified.items():
```

- [ ] **Step 4: 기존 테스트 확인**

Run: `cd "/Users/arkeo/Developer/00. Git/00. workspace/00. Projects/blog-manage" && python3 -m pytest pipelines/gamecodekr/tests/test_validate_tiers.py -v`
Expected: 기존 테스트가 통과하도록 테스트도 업데이트 필요. 테스트에서 `cross_verify_tiers` 반환값이 tuple로 변경되었으므로 `result, _` 형태로 언패킹.

`pipelines/gamecodekr/tests/test_validate_tiers.py`에서 모든 `cross_verify_tiers(...)` 호출을:
```python
result, _ = cross_verify_tiers(...)
```
로 변경.

- [ ] **Step 5: 커밋**

```bash
git add pipelines/gamecodekr/collect_tiers.py pipelines/gamecodekr/validate_tiers.py pipelines/gamecodekr/run.py pipelines/gamecodekr/tests/test_validate_tiers.py
git commit -m "feat: 파이프라인 이미지 수집 허용 + 소스 텍스트 수집"
```

---

### Task 7: 파이프라인 — 카테고리별 JSON 생성 + AI 분석

**Files:**
- Modify: `pipelines/gamecodekr/generate_content.py`
- Create: `pipelines/gamecodekr/generate_analysis.py`
- Modify: `pipelines/gamecodekr/config.py`
- Modify: `pipelines/gamecodekr/run.py`

- [ ] **Step 1: config.py에 카테고리 한국어 매핑 추가**

`pipelines/gamecodekr/config.py` 끝에 추가:

```python
# ── 카테고리 한국어 매핑 ──────────────────────────────────
CATEGORY_LABELS = {
    "fruits": "열매",
    "fruits-overall": "열매",
    "swords": "검",
    "fighting-styles": "격투 스타일",
    "units": "유닛",
    "bloodlines": "혈계",
    "pets": "펫",
    "towers": "타워",
    "bees": "벌",
    "weapons": "무기",
}
```

- [ ] **Step 2: generate_content.py에 카테고리별 파일 경로 지원**

`pipelines/gamecodekr/generate_content.py`의 `update_tier_content()` 함수에서 파일 경로를 변경:

기존:
```python
filepath = TIERS_DIR / game_slug / f"{month}.json"
```

변경:
```python
filepath = TIERS_DIR / game_slug / f"{month}-{category}.json"
# 기존 단일 파일도 유지 (호환성)
legacy_filepath = TIERS_DIR / game_slug / f"{month}.json"
```

기존 데이터 보존 로직에서 legacy 파일도 체크:
```python
existing_items: dict[str, dict] = {}
for fp in [filepath, legacy_filepath]:
    if fp.exists():
        with open(fp, encoding="utf-8") as f:
            existing = json.load(f)
            for tier_items in existing.get("tiers", {}).values():
                for item in tier_items:
                    if item["name"] not in existing_items:
                        existing_items[item["name"]] = item
```

- [ ] **Step 3: generate_analysis.py 생성**

`pipelines/gamecodekr/generate_analysis.py`:

```python
"""소스 텍스트를 종합하여 분석 글을 생성한다.

Claude API를 사용하여 여러 소스의 텍스트를 종합 분석.
ANTHROPIC_API_KEY가 없으면 건너뛴다.
"""
import os
import json

from pipelines.gamecodekr.config import CATEGORY_LABELS, TIER_ORDER


def generate_tier_analysis(
    game_title: str,
    category: str,
    verified_items: list[dict],
    source_texts: dict[str, str],
    month: str,
) -> dict | None:
    """티어 분석 글을 생성한다.

    Returns:
        {
            "tierSummaries": {"S+": "...", "S": "...", ...},
            "analysis": "...",
            "analysisSources": ["source1", "source2"],
            "analysisDate": "2026-04-04",
        }
        또는 API 키 없으면 None
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("[analysis] ANTHROPIC_API_KEY 없음, 분석 생성 건너뜀")
        return None

    try:
        import anthropic
    except ImportError:
        print("[analysis] anthropic SDK 없음, pip install anthropic 필요")
        return None

    category_kr = CATEGORY_LABELS.get(category, category)
    year, m = month.split("-")
    month_label = f"{year}년 {int(m)}월"

    # 티어별 아이템 정리
    tier_summary_lines = []
    for tier in TIER_ORDER:
        items_in_tier = [i for i in verified_items if i["tier"] == tier]
        if items_in_tier:
            names = ", ".join(i["name"] for i in items_in_tier[:10])
            tier_summary_lines.append(f"{tier}: {names}")

    tier_info = "\n".join(tier_summary_lines)

    # 소스 텍스트 정리
    source_info = ""
    for src_name, text in source_texts.items():
        if text.strip():
            source_info += f"\n--- {src_name} ---\n{text[:1500]}\n"

    prompt = f"""당신은 로블록스 게임 전문 블로거입니다. 초등학생도 이해할 수 있는 쉬운 한국어로 작성해주세요.

{game_title}의 {month_label} {category_kr} 티어표 분석을 작성해주세요.

현재 티어 배치:
{tier_info}

참고 소스 분석글:
{source_info if source_info else "(소스 텍스트 없음)"}

다음 형식으로 JSON을 반환해주세요:
{{
  "tierSummaries": {{
    "S+": "S+급 아이템들에 대한 1-2문장 요약",
    "S": "S급 아이템들에 대한 1-2문장 요약",
    ... (비어있는 티어는 제외)
  }},
  "analysis": "3-5 단락의 종합 분석문. 각 단락은 \\n\\n으로 구분. 메타 변화, 주요 변동 이유, 소스 간 의견 차이, 초보자 조언 포함."
}}

규칙:
- 어려운 용어는 괄호 안에 쉬운 설명 추가 (예: "너프(약해짐)")
- 확인되지 않은 정보를 확정처럼 쓰지 않기
- JSON만 반환 (마크다운 코드블록 없이)"""

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )

    try:
        result = json.loads(message.content[0].text)
        from datetime import datetime
        return {
            "tierSummaries": result.get("tierSummaries", {}),
            "analysis": result.get("analysis", ""),
            "analysisSources": list(source_texts.keys()),
            "analysisDate": datetime.now().strftime("%Y-%m-%d"),
        }
    except (json.JSONDecodeError, IndexError, KeyError) as e:
        print(f"[analysis] 파싱 실패: {e}")
        return None
```

- [ ] **Step 4: run.py에 분석 글 생성 통합**

`pipelines/gamecodekr/run.py`의 `run_tiers()` 함수에서, `update_tier_content` 호출 전에 분석 생성 추가:

```python
from pipelines.gamecodekr.generate_analysis import generate_tier_analysis
```

`for category, items in verified.items():` 루프 안:

```python
# 분석 글 생성
cat_source_texts = source_texts.get(category, {})
analysis_result = generate_tier_analysis(
    game_title=game_config["kr_name"],
    category=category,
    verified_items=items,
    source_texts=cat_source_texts,
    month=month,
)

filepath = update_tier_content(
    game_slug=game_slug,
    game_title=game_config["kr_name"],
    month=month,
    category=category,
    verified_tiers=items,
    analysis=analysis_result,  # 새 파라미터
)
```

- [ ] **Step 5: generate_content.py의 update_tier_content에 analysis 파라미터 추가**

`update_tier_content` 시그니처에 `analysis: dict | None = None` 추가:

```python
def update_tier_content(
    game_slug: str,
    game_title: str,
    month: str,
    category: str,
    verified_tiers: list[dict],
    analysis: dict | None = None,
) -> Path:
```

함수 끝에서 editorial에 analysis 병합:

```python
if analysis:
    if "editorial" not in data:
        data["editorial"] = {"summary": "", "recommendation": ""}
    data["editorial"]["tierSummaries"] = analysis.get("tierSummaries", {})
    data["editorial"]["analysis"] = analysis.get("analysis", "")
    data["editorial"]["analysisSources"] = analysis.get("analysisSources", [])
    data["editorial"]["analysisDate"] = analysis.get("analysisDate", "")
```

- [ ] **Step 6: 커밋**

```bash
git add pipelines/gamecodekr/config.py pipelines/gamecodekr/generate_content.py pipelines/gamecodekr/generate_analysis.py pipelines/gamecodekr/run.py
git commit -m "feat: 카테고리별 JSON 생성 + AI 분석 글 생성 파이프라인"
```

---

### Task 8: 데이터 마이그레이션

**Files:**
- Create: `scripts/migrate-tier-files.sh`
- Modify: 기존 JSON 파일들

- [ ] **Step 1: 마이그레이션 스크립트 작성**

`scripts/migrate-tier-files.sh`:

```bash
#!/bin/bash
# 기존 2026-04.json → 2026-04-{category}.json 마이그레이션
set -e

TIERS_DIR="sites/gamecodekr/content/tiers"

migrate_game() {
    local game=$1
    local category=$2
    local src="$TIERS_DIR/$game/2026-04.json"
    local dst="$TIERS_DIR/$game/2026-04-$category.json"

    if [ -f "$src" ] && [ ! -f "$dst" ]; then
        cp "$src" "$dst"
        echo "✅ $game: $src → $dst"
    else
        echo "⏭️ $game: 이미 존재하거나 소스 없음"
    fi
}

# 단일 카테고리 게임들
migrate_game "anime-adventures" "units"
migrate_game "all-star-tower-defense" "units"
migrate_game "shindo-life" "bloodlines"
migrate_game "pet-simulator-99" "pets"
migrate_game "tower-defense-simulator" "towers"
migrate_game "bee-swarm-simulator" "bees"
migrate_game "murder-mystery-2" "weapons"
migrate_game "king-legacy" "fruits"
migrate_game "fruit-battlegrounds" "fruits"

# blox-fruits는 현재 단일 파일 → fruits로 복사 (swords, fighting-styles는 별도 수집 필요)
migrate_game "blox-fruits" "fruits"

echo ""
echo "마이그레이션 완료. 기존 2026-04.json 파일은 호환성을 위해 유지됩니다."
```

- [ ] **Step 2: 마이그레이션 실행**

```bash
chmod +x scripts/migrate-tier-files.sh
cd "/Users/arkeo/Developer/00. Git/00. workspace/00. Projects/blog-manage"
./scripts/migrate-tier-files.sh
```

- [ ] **Step 3: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm build`
Expected: 빌드 성공. 카테고리별 파일에서 데이터를 로딩하여 기존과 동일하게 렌더링.

- [ ] **Step 4: 커밋**

```bash
git add scripts/migrate-tier-files.sh sites/gamecodekr/content/tiers/
git commit -m "feat: 티어 JSON 카테고리별 파일 마이그레이션"
```

---

### Task 9: 샘플 데이터 보강 (블록스 프루츠)

**Files:**
- Modify: `sites/gamecodekr/content/tiers/blox-fruits/2026-04-fruits.json`

- [ ] **Step 1: 블록스 프루츠 열매 데이터에 tierSummaries + analysis 추가**

`sites/gamecodekr/content/tiers/blox-fruits/2026-04-fruits.json`의 `editorial` 필드를 확장:

```json
{
  "editorial": {
    "summary": "이번 달 레오파드가 S+ 1위를 유지하고 있고, 티렉스가 새로 S+에 올라왔어요! 부다는 S에서 A로 내려갔는데, 최근 너프(약해짐) 때문이에요.",
    "recommendation": "처음 시작하는 초보자라면 부다(A티어)를 추천해요! 구하기 쉽고, 그라인딩(반복 사냥)할 때 범위가 넓어서 효율이 좋아요. S+티어 열매는 거래가가 너무 높아서 초보자에게는 비효율적이에요.",
    "tierSummaries": {
      "S+": "레오파드와 티렉스가 현재 메타를 지배하고 있어요. 변신 후 이동속도와 공격력이 압도적이라 PvP(플레이어 대결)와 보스전 모두에서 최강이에요.",
      "S": "드래곤은 하늘을 날 수 있어서 이동이 편하고 공격도 강해요. 안정적인 S티어 열매예요.",
      "A": "부다는 최근 너프(약해짐)로 S에서 내려왔지만, 그라인딩(반복 사냥)에는 여전히 최고 효율이에요."
    },
    "analysis": "2026년 4월 블록스 프루츠 열매 메타는 레오파드의 독주가 계속되고 있어요. Pro Game Guides, Try Hard Guides, Pocket Gamer 모두 레오파드를 S+급 1위로 평가하고 있으며, 변신 후 이동속도와 콤보 연계력이 압도적이라는 의견이 일치해요.\n\n가장 큰 변화는 티렉스의 S+ 진입이에요. 업데이트 10에서 범위 공격 배율이 상향되면서 3개 소스 모두 S+ 평가를 내렸어요. 특히 보스전에서 티렉스의 광역 공격(여러 적을 동시에 때리는 공격)이 빛을 발하고 있어요.\n\n부다는 S에서 A로 하락했어요. 최근 패치에서 변신 지속시간이 줄어들면서 그라인딩 효율이 떨어졌다는 평가예요. 다만 변신 범위가 넓어서 초보자가 레벨업할 때는 여전히 최고의 선택이에요.\n\n드래곤은 변함없이 S티어를 유지하고 있어요. 비행 능력 덕분에 이동이 편하고, 공격력도 준수해서 어떤 상황에서도 활약할 수 있는 안정적인 열매예요.",
    "analysisSources": ["Pro Game Guides", "Try Hard Guides", "Pocket Gamer"],
    "analysisDate": "2026-04-04"
  }
}
```

나머지 필드(game, gameTitle, month, lastUpdated, category, tiers, meta)는 기존 값 유지.

- [ ] **Step 2: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm build`
Expected: 빌드 성공. 블록스 프루츠 티어 페이지에 등급별 요약 + 종합 분석문이 표시됨.

- [ ] **Step 3: 커밋**

```bash
git add sites/gamecodekr/content/tiers/blox-fruits/2026-04-fruits.json
git commit -m "feat: 블록스 프루츠 티어 샘플 데이터에 분석 글 추가"
```

---

### Task 10: games.ts hasTier 수정 + 최종 검증

**Files:**
- Modify: `sites/gamecodekr/src/lib/games.ts`

- [ ] **Step 1: hasTier 값 수정**

현재 `murder-mystery-2`와 `bee-swarm-simulator`가 `hasTier: false`인데, 실제로는 티어 데이터가 있으므로 `true`로 변경:

`sites/gamecodekr/src/lib/games.ts`에서:

```typescript
// murder-mystery-2
hasTier: true,  // 기존: false

// bee-swarm-simulator
hasTier: true,  // 기존: false
```

- [ ] **Step 2: 전체 빌드 + 페이지 수 확인**

Run: `cd sites/gamecodekr && pnpm build`
Expected: 빌드 성공. 10개 게임 모두 티어 페이지 생성 확인. 블록스 프루츠 티어 페이지에 칩/뱃지형 + 등급별 요약 + 종합 분석문 표시.

- [ ] **Step 3: 커밋**

```bash
git add sites/gamecodekr/src/lib/games.ts
git commit -m "fix: murder-mystery-2, bee-swarm-simulator hasTier 활성화"
```
