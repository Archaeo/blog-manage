# Phase 4: Blog Content System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GameCodeKR 사이트에 블로그 스타일 컨텐츠를 도입한다. 기존 코드/티어 페이지에 에디토리얼(도입글, 꿀팁)을 추가하고, MDX 기반 독립 블로그 글 인프라를 구축하며, 티어표를 블로거 스타일 등급 행으로 리디자인한다.

**Architecture:** 기존 JSON 데이터에 editorial 선택적 필드를 추가하여 하위 호환성을 유지한다. MDX 블로그 글은 `content/posts/[game]/[slug].mdx` 에 저장하고, `gray-matter` + `next-mdx-remote/rsc`로 빌드 시 파싱/렌더링한다. 티어표는 카드 그리드에서 블로거 스타일 등급 행(좌측 라벨 + 우측 아이템 가로 나열)으로 교체한다. 파이프라인은 `consensus`/`sources` 필드를 티어 JSON에 포함하도록 수정한다.

**Tech Stack:** Next.js 14 (App Router, Static Export), TailwindCSS 4, React 18, gray-matter, next-mdx-remote, Python (파이프라인)

---

## File Structure

### 새로 생성

| 파일 | 역할 |
|---|---|
| `sites/gamecodekr/src/components/EditorialSummary.tsx` | 코드/티어 페이지 도입글 박스 |
| `sites/gamecodekr/src/components/TipsBox.tsx` | 꿀팁 박스 (초록 배경) |
| `sites/gamecodekr/src/components/PostCard.tsx` | 글 목록 카드 |
| `sites/gamecodekr/src/components/PostTypeBadge.tsx` | 유형별 컬러 뱃지 |
| `sites/gamecodekr/src/components/PostContent.tsx` | MDX 렌더링 래퍼 |
| `sites/gamecodekr/src/lib/posts.ts` | 블로그 글 로딩 유틸 |
| `sites/gamecodekr/src/app/[game]/posts/page.tsx` | 게임별 글 목록 페이지 |
| `sites/gamecodekr/src/app/[game]/posts/[slug]/page.tsx` | 글 상세 페이지 |
| `sites/gamecodekr/content/posts/blox-fruits/2026-04-code-analysis.mdx` | 샘플 블로그 글 |

### 수정

| 파일 | 변경 |
|---|---|
| `sites/gamecodekr/src/lib/types.ts` | `BlogPost` 타입, `MonthlyCodeData.editorial`, `MonthlyTierData.editorial`, `TierItem.consensus/sources` 추가 |
| `sites/gamecodekr/src/components/TierList.tsx` | 카드 그리드 -> 블로거 스타일 등급 행 리디자인 |
| `sites/gamecodekr/src/app/[game]/codes/[month]/page.tsx` | EditorialSummary + TipsBox 추가 |
| `sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx` | EditorialSummary + RecommendationBox 추가 |
| `sites/gamecodekr/src/components/Sidebar.tsx` | "글" 서브메뉴 추가 |
| `sites/gamecodekr/package.json` | gray-matter, next-mdx-remote 의존성 추가 |
| `pipelines/gamecodekr/generate_content.py` | editorial 필드, consensus/sources 필드 출력 |

---

## Task 1: 타입 + 파이프라인 업데이트

**Files:**
- Modify: `sites/gamecodekr/src/lib/types.ts`
- Modify: `pipelines/gamecodekr/generate_content.py`

- [ ] **Step 1: types.ts에 BlogPost 타입 및 editorial 필드 추가**

`sites/gamecodekr/src/lib/types.ts` 파일 전체를 다음으로 교체:

```typescript
/** 코드 검증 상태: 3=3소스 확인, 2=2소스, 1=미확인 */
export type VerificationLevel = 1 | 2 | 3;

/** 코드 상태 */
export type CodeStatus = "active" | "expired" | "unverified";

/** 개별 게임 코드 */
export interface GameCode {
  code: string;
  reward: string;
  verified: VerificationLevel;
  status: CodeStatus;
  addedDate: string;
  rewardAnalysis: string;
}

/** 코드 페이지 에디토리얼 */
export interface CodeEditorial {
  summary: string;
  tips: string;
  totalValue: string;
}

/** 월단위 코드 페이지 데이터 */
export interface MonthlyCodeData {
  game: string;
  gameTitle: string;
  month: string;
  lastUpdated: string;
  codes: GameCode[];
  expiredCodes: GameCode[];
  meta: PageMeta;
  editorial?: CodeEditorial;
}

/** 티어 등급 */
export type TierRank = "S+" | "S" | "A" | "B" | "C" | "D";

/** 티어 아이템 */
export interface TierItem {
  name: string;
  nameKo: string;
  rank: TierRank;
  description: string;
  changeFromLast: "up" | "down" | "new" | "same";
  imageUrl?: string;
  consensus?: boolean;
  sources?: number;
}

/** 티어 페이지 에디토리얼 */
export interface TierEditorial {
  summary: string;
  recommendation: string;
}

/** 월단위 티어 페이지 데이터 */
export interface MonthlyTierData {
  game: string;
  gameTitle: string;
  month: string;
  lastUpdated: string;
  category: string;
  tiers: Record<TierRank, TierItem[]>;
  meta: PageMeta;
  editorial?: TierEditorial;
}

/** 페이지 SEO 메타 */
export interface PageMeta {
  title: string;
  description: string;
  keywords: string[];
}

/** 블로그 글 유형 */
export type PostType = "code-analysis" | "tier-analysis" | "patch" | "guide";

/** 블로그 글 */
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  game: string;
  type: PostType;
  tags: string[];
  description: string;
  content: string;
}

/** 게임 설정 */
export interface GameConfig {
  slug: string;
  title: string;
  titleEn: string;
  icon: string;
  imageUrl: string;
  description: string;
  hasCode: boolean;
  hasTier: boolean;
}
```

- [ ] **Step 2: generate_content.py에 consensus/sources 필드 추가**

`pipelines/gamecodekr/generate_content.py`의 `generate_tier_json` 함수에서 티어 아이템에 `consensus`와 `sources` 필드를 포함하도록 수정한다.

`generate_tier_json` 함수의 `tiers[tier_key].append(...)` 부분을 찾아서 교체:

기존:
```python
        tiers[tier_key].append(
            {
                "name": item["name"],
                "nameKo": item["name"],
                "rank": tier_key,
                "description": "",
                "changeFromLast": "same",
                "imageUrl": item.get("image_url", ""),
            }
        )
```

변경:
```python
        tiers[tier_key].append(
            {
                "name": item["name"],
                "nameKo": item["name"],
                "rank": tier_key,
                "description": "",
                "changeFromLast": "same",
                "imageUrl": item.get("image_url", ""),
                "consensus": item.get("consensus", False),
                "sources": item.get("source_count", 1),
            }
        )
```

- [ ] **Step 3: update_tier_content에서 consensus/sources 보존 로직 추가**

`pipelines/gamecodekr/generate_content.py`의 `update_tier_content` 함수에서 기존 아이템 보존 루프에 consensus/sources 보존 코드를 추가한다.

기존 보존 루프 내부에서, `if not item.get("imageUrl") and prev.get("imageUrl"):` 블록 다음에 추가:

기존:
```python
                if not item.get("imageUrl") and prev.get("imageUrl"):
                    item["imageUrl"] = prev["imageUrl"]
                if prev.get("rank") and prev["rank"] != item["rank"]:
```

변경:
```python
                if not item.get("imageUrl") and prev.get("imageUrl"):
                    item["imageUrl"] = prev["imageUrl"]
                if not item.get("consensus") and prev.get("consensus") is not None:
                    item["consensus"] = prev["consensus"]
                if not item.get("sources") and prev.get("sources"):
                    item["sources"] = prev["sources"]
                if prev.get("rank") and prev["rank"] != item["rank"]:
```

- [ ] **Step 4: 타입 변경 검증**

```bash
cd sites/gamecodekr && npx tsc --noEmit 2>&1 | head -20
```

기대 출력: 에러 없음 (editorial 필드는 선택적이므로 기존 코드에 영향 없음).

- [ ] **Step 5: 파이프라인 테스트 실행**

```bash
cd /Users/arkeo/Developer/00.\ Git/00.\ workspace/00.\ Projects/blog-manage && python -m pytest pipelines/gamecodekr/tests/test_generate_content.py -v
```

기대 출력: 기존 테스트 통과. consensus/sources 필드가 출력 JSON에 포함됨.

- [ ] **Step 6: 커밋**

```bash
git add sites/gamecodekr/src/lib/types.ts pipelines/gamecodekr/generate_content.py
git commit -m "$(cat <<'EOF'
타입 및 파이프라인 업데이트: editorial, consensus, sources 필드 추가

- BlogPost, CodeEditorial, TierEditorial, PostType 타입 추가
- TierItem에 consensus/sources 선택적 필드 추가
- MonthlyCodeData/MonthlyTierData에 editorial 선택적 필드 추가
- generate_content.py에서 consensus/sources를 티어 JSON에 포함

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: TierList 블로거 스타일 리디자인

**Files:**
- Modify: `sites/gamecodekr/src/components/TierList.tsx`

- [ ] **Step 1: TierList.tsx 전체 교체**

`sites/gamecodekr/src/components/TierList.tsx`를 다음으로 완전히 교체한다:

```typescript
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
```

- [ ] **Step 2: 빌드 확인**

```bash
cd sites/gamecodekr && npx tsc --noEmit 2>&1 | head -20
```

기대 출력: 타입 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add sites/gamecodekr/src/components/TierList.tsx
git commit -m "$(cat <<'EOF'
티어표 블로거 스타일 리디자인: 등급 행 + 신뢰 뱃지

- 카드 그리드를 블로거 스타일 등급 행 레이아웃으로 교체
- 좌측 등급 라벨(그라디언트) + 우측 아이템 가로 나열
- 이미지 폴백: 등급 컬러 그라디언트 + 이니셜
- 신뢰 뱃지: 초록(3소스), 파랑(2소스), 경고(불일치)
- 등급별 고유 배경색/보더 적용

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: 에디토리얼 컴포넌트 생성

**Files:**
- Create: `sites/gamecodekr/src/components/EditorialSummary.tsx`
- Create: `sites/gamecodekr/src/components/TipsBox.tsx`

- [ ] **Step 1: EditorialSummary.tsx 생성**

`sites/gamecodekr/src/components/EditorialSummary.tsx`:

```typescript
interface EditorialSummaryProps {
  summary: string;
}

export function EditorialSummary({ summary }: EditorialSummaryProps) {
  if (!summary) return null;

  return (
    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
      <p className="text-sm leading-relaxed text-blue-900">{summary}</p>
    </div>
  );
}
```

- [ ] **Step 2: TipsBox.tsx 생성**

`sites/gamecodekr/src/components/TipsBox.tsx`:

```typescript
interface TipsBoxProps {
  tips: string;
  totalValue?: string;
}

export function TipsBox({ tips, totalValue }: TipsBoxProps) {
  if (!tips) return null;

  return (
    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
      <h3 className="mb-1.5 text-xs font-bold text-green-800">
        💡 꿀팁
      </h3>
      <p className="text-sm leading-relaxed text-green-900">{tips}</p>
      {totalValue && (
        <p className="mt-2 text-xs font-semibold text-green-700">
          🎁 총 보상 가치: {totalValue}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 커밋**

```bash
git add sites/gamecodekr/src/components/EditorialSummary.tsx sites/gamecodekr/src/components/TipsBox.tsx
git commit -m "$(cat <<'EOF'
에디토리얼 컴포넌트 생성: EditorialSummary, TipsBox

- EditorialSummary: 도입글 박스 (파란 배경, 코드/티어 페이지 상단)
- TipsBox: 꿀팁 박스 (초록 배경, 총 보상 가치 표시)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: 코드 페이지 에디토리얼 강화

**Files:**
- Modify: `sites/gamecodekr/src/app/[game]/codes/[month]/page.tsx`

- [ ] **Step 1: 코드 페이지에 EditorialSummary + TipsBox 추가**

`sites/gamecodekr/src/app/[game]/codes/[month]/page.tsx` 전체를 다음으로 교체:

```typescript
import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getMonthlyCodeData, getAvailableMonths, getCurrentMonth } from "@/lib/content";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { ArchiveBanner } from "@blog-manage/shared-ui";
import { CodeTable } from "@/components/CodeTable";
import { EditorialSummary } from "@/components/EditorialSummary";
import { TipsBox } from "@/components/TipsBox";
import type { Metadata } from "next";

const siteConfig = createSiteConfig({
  siteName: "GameCodeKR",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev",
});

export function generateStaticParams() {
  const params: { game: string; month: string }[] = [];
  for (const slug of getAllGameSlugs()) {
    for (const month of getAvailableMonths(slug, "codes")) {
      params.push({ game: slug, month });
    }
  }
  return params;
}

export function generateMetadata({ params }: { params: { game: string; month: string } }): Metadata {
  const data = getMonthlyCodeData(params.game, params.month);
  if (!data) return {};
  const seo = genSeoMeta(siteConfig, {
    title: data.meta.title,
    description: data.meta.description,
    keywords: data.meta.keywords,
    path: `/${params.game}/codes/${params.month}`,
  });
  return seo as Metadata;
}

export default function MonthlyCodePage({
  params,
}: {
  params: { game: string; month: string };
}) {
  const game = getGameBySlug(params.game);
  if (!game) notFound();

  const data = getMonthlyCodeData(params.game, params.month);
  if (!data) notFound();

  const currentMonth = getCurrentMonth();
  const isArchive = params.month !== currentMonth;

  const [year, m] = params.month.split("-");
  const monthLabel = `${year}년 ${parseInt(m)}월`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {isArchive && (
        <ArchiveBanner
          currentMonthUrl={`/${game.slug}/codes/${currentMonth}`}
          archiveMonth={monthLabel}
        />
      )}

      <div className="flex items-center gap-3">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {game.title} 코드 총정리 ({monthLabel})
          </h1>
          <p className="text-xs text-slate-400">
            마지막 업데이트: {new Date(data.lastUpdated).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      {data.editorial?.summary && (
        <EditorialSummary summary={data.editorial.summary} />
      )}

      <div className="mt-6">
        <CodeTable
          codes={data.codes.filter((c) => c.status === "active")}
          title="✅ 사용 가능한 코드"
        />

        <CodeTable
          codes={data.codes.filter((c) => c.status === "unverified")}
          title="⚠️ 확인 중인 코드"
        />

        <CodeTable
          codes={data.expiredCodes}
          title="❌ 만료된 코드"
          showExpired
        />
      </div>

      {data.editorial?.tips && (
        <TipsBox
          tips={data.editorial.tips}
          totalValue={data.editorial.totalValue}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd sites/gamecodekr && npx tsc --noEmit 2>&1 | head -20
```

기대 출력: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add sites/gamecodekr/src/app/[game]/codes/[month]/page.tsx
git commit -m "$(cat <<'EOF'
코드 페이지 에디토리얼 강화: 도입글 + 꿀팁 추가

- EditorialSummary로 이번 달 코드 요약 표시
- TipsBox로 코드 사용 추천 순서 및 총 보상 가치 표시
- editorial 필드 없어도 기존대로 동작 (하위 호환)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: 티어 페이지 에디토리얼 강화

**Files:**
- Modify: `sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx`

- [ ] **Step 1: 티어 페이지에 EditorialSummary + 추천 박스 추가**

`sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx` 전체를 다음으로 교체:

```typescript
import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getMonthlyTierData, getAvailableMonths, getCurrentMonth } from "@/lib/content";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { ArchiveBanner } from "@blog-manage/shared-ui";
import { TierList } from "@/components/TierList";
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

export function generateMetadata({ params }: { params: { game: string; month: string } }): Metadata {
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

  const data = getMonthlyTierData(params.game, params.month);
  if (!data) notFound();

  const currentMonth = getCurrentMonth();
  const isArchive = params.month !== currentMonth;

  const [year, m] = params.month.split("-");
  const monthLabel = `${year}년 ${parseInt(m)}월`;

  const totalItems = Object.values(data.tiers).reduce(
    (sum, items) => sum + items.length,
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {isArchive && (
        <ArchiveBanner
          currentMonthUrl={`/${game.slug}/tier/${currentMonth}`}
          archiveMonth={monthLabel}
        />
      )}

      <div className="flex items-center gap-3">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {game.title} {data.category} 티어표 ({monthLabel})
          </h1>
          <p className="text-xs text-slate-400">
            마지막 업데이트: {new Date(data.lastUpdated).toLocaleDateString("ko-KR")} · 총 {totalItems}개 항목
          </p>
        </div>
      </div>

      {data.editorial?.summary && (
        <EditorialSummary summary={data.editorial.summary} />
      )}

      <div className="mt-6">
        <TierList tiers={data.tiers} gameIcon={game.icon} />
      </div>

      {data.editorial?.recommendation && (
        <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
          <h3 className="mb-1.5 text-xs font-bold text-purple-800">
            🎯 초보자 추천
          </h3>
          <p className="text-sm leading-relaxed text-purple-900">
            {data.editorial.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd sites/gamecodekr && npx tsc --noEmit 2>&1 | head -20
```

기대 출력: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx
git commit -m "$(cat <<'EOF'
티어 페이지 에디토리얼 강화: 도입글 + 초보자 추천 추가

- EditorialSummary로 이번 달 메타 변화 요약 표시
- 초보자 추천 박스 (보라색) 하단에 추가
- editorial 필드 없어도 기존대로 동작 (하위 호환)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: MDX 인프라 구축

**Files:**
- Modify: `sites/gamecodekr/package.json`
- Create: `sites/gamecodekr/src/lib/posts.ts`
- Create directory: `sites/gamecodekr/content/posts/`

- [ ] **Step 1: MDX 의존성 설치**

```bash
cd sites/gamecodekr && pnpm add gray-matter next-mdx-remote
```

기대 출력: 패키지가 `dependencies`에 추가됨.

설치 후 `package.json`의 dependencies에 다음이 포함되어야 함:
```json
{
  "dependencies": {
    "gray-matter": "^4.0.3",
    "next-mdx-remote": "^5.0.0",
    ...기존 의존성
  }
}
```

- [ ] **Step 2: posts 디렉토리 생성**

```bash
mkdir -p sites/gamecodekr/content/posts/blox-fruits
```

- [ ] **Step 3: posts.ts 블로그 글 로더 생성**

`sites/gamecodekr/src/lib/posts.ts`:

```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPost, PostType } from "./types";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export function getAllPosts(): Omit<BlogPost, "content">[] {
  const posts: Omit<BlogPost, "content">[] = [];

  if (!fs.existsSync(POSTS_DIR)) return posts;

  const gameDirs = fs.readdirSync(POSTS_DIR).filter((f) => {
    return fs.statSync(path.join(POSTS_DIR, f)).isDirectory();
  });

  for (const gameSlug of gameDirs) {
    const gameDir = path.join(POSTS_DIR, gameSlug);
    const files = fs.readdirSync(gameDir).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      const filePath = path.join(gameDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);

      posts.push({
        slug,
        title: data.title ?? "",
        date: data.date ?? "",
        game: data.game ?? gameSlug,
        type: (data.type as PostType) ?? "guide",
        tags: data.tags ?? [],
        description: data.description ?? "",
      });
    }
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostsByGame(gameSlug: string): Omit<BlogPost, "content">[] {
  return getAllPosts().filter((p) => p.game === gameSlug);
}

export function getPost(gameSlug: string, slug: string): BlogPost | null {
  const filePath = path.join(POSTS_DIR, gameSlug, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? "",
    date: data.date ?? "",
    game: data.game ?? gameSlug,
    type: (data.type as PostType) ?? "guide",
    tags: data.tags ?? [],
    description: data.description ?? "",
    content,
  };
}

export function getAllPostSlugs(): { game: string; slug: string }[] {
  return getAllPosts().map((p) => ({ game: p.game, slug: p.slug }));
}

export function getGamesWithPosts(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => {
      const dir = path.join(POSTS_DIR, f);
      if (!fs.statSync(dir).isDirectory()) return false;
      const files = fs.readdirSync(dir).filter((ff) => ff.endsWith(".mdx"));
      return files.length > 0;
    });
}
```

- [ ] **Step 4: 타입 체크**

```bash
cd sites/gamecodekr && npx tsc --noEmit 2>&1 | head -20
```

기대 출력: 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add sites/gamecodekr/package.json sites/gamecodekr/src/lib/posts.ts pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
MDX 인프라 구축: gray-matter + next-mdx-remote + posts 로더

- gray-matter, next-mdx-remote 의존성 추가
- posts.ts: getAllPosts, getPostsByGame, getPost, getAllPostSlugs, getGamesWithPosts
- content/posts/ 디렉토리 구조 생성
- 빌드 시 MDX frontmatter 파싱, 날짜 역순 정렬

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: 블로그 글 컴포넌트

**Files:**
- Create: `sites/gamecodekr/src/components/PostTypeBadge.tsx`
- Create: `sites/gamecodekr/src/components/PostCard.tsx`
- Create: `sites/gamecodekr/src/components/PostContent.tsx`

- [ ] **Step 1: PostTypeBadge.tsx 생성**

`sites/gamecodekr/src/components/PostTypeBadge.tsx`:

```typescript
import type { PostType } from "@/lib/types";

interface PostTypeBadgeProps {
  type: PostType;
}

const TYPE_CONFIG: Record<PostType, { label: string; bgColor: string; textColor: string }> = {
  "code-analysis": {
    label: "코드 분석",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  "tier-analysis": {
    label: "티어 분석",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  patch: {
    label: "패치 요약",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  guide: {
    label: "가이드",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
};

export function PostTypeBadge({ type }: PostTypeBadgeProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.guide;

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </span>
  );
}
```

- [ ] **Step 2: PostCard.tsx 생성**

`sites/gamecodekr/src/components/PostCard.tsx`:

```typescript
import type { BlogPost } from "@/lib/types";
import { PostTypeBadge } from "./PostTypeBadge";

interface PostCardProps {
  post: Omit<BlogPost, "content">;
}

export function PostCard({ post }: PostCardProps) {
  const dateStr = new Date(post.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <a
      href={`/${post.game}/posts/${post.slug}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-center gap-2">
        <PostTypeBadge type={post.type} />
        <span className="text-[10px] text-slate-400">{dateStr}</span>
      </div>
      <h3 className="mb-1 text-sm font-bold text-slate-900">{post.title}</h3>
      <p className="text-xs leading-relaxed text-slate-500">
        {post.description}
      </p>
      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
```

- [ ] **Step 3: PostContent.tsx 생성**

`sites/gamecodekr/src/components/PostContent.tsx`:

```typescript
import { compileMDX } from "next-mdx-remote/rsc";

interface PostContentProps {
  source: string;
}

export async function PostContent({ source }: PostContentProps) {
  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: false,
    },
  });

  return (
    <article className="prose prose-sm prose-slate max-w-none">
      <style>{`
        .prose h2 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.375rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .prose h3 {
          font-size: 0.975rem;
          font-weight: 600;
          color: #334155;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .prose p {
          font-size: 0.875rem;
          line-height: 1.75;
          color: #475569;
          margin-bottom: 0.75rem;
        }
        .prose ul, .prose ol {
          font-size: 0.875rem;
          color: #475569;
          padding-left: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .prose li {
          margin-bottom: 0.25rem;
        }
        .prose blockquote {
          border-left: 3px solid #3b82f6;
          background-color: #eff6ff;
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1e40af;
        }
        .prose blockquote p {
          color: #1e40af;
          margin: 0;
        }
        .prose code {
          background-color: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.8125rem;
          color: #0f172a;
        }
        .prose strong {
          color: #1e293b;
        }
        .prose hr {
          border-color: #e2e8f0;
          margin: 1.5rem 0;
        }
      `}</style>
      {content}
    </article>
  );
}
```

- [ ] **Step 4: 타입 체크**

```bash
cd sites/gamecodekr && npx tsc --noEmit 2>&1 | head -20
```

기대 출력: 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add sites/gamecodekr/src/components/PostTypeBadge.tsx sites/gamecodekr/src/components/PostCard.tsx sites/gamecodekr/src/components/PostContent.tsx
git commit -m "$(cat <<'EOF'
블로그 글 컴포넌트 생성: PostCard, PostTypeBadge, PostContent

- PostTypeBadge: 유형별 컬러 뱃지 (코드 분석, 티어 분석, 패치, 가이드)
- PostCard: 글 목록 카드 (제목, 날짜, 유형, 설명, 태그)
- PostContent: next-mdx-remote/rsc 기반 MDX 렌더링 + 스타일링

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: 블로그 글 페이지 + 사이드바

**Files:**
- Create: `sites/gamecodekr/src/app/[game]/posts/page.tsx`
- Create: `sites/gamecodekr/src/app/[game]/posts/[slug]/page.tsx`
- Modify: `sites/gamecodekr/src/components/Sidebar.tsx`

- [ ] **Step 1: 글 목록 페이지 생성**

`sites/gamecodekr/src/app/[game]/posts/page.tsx`:

```typescript
import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getPostsByGame } from "@/lib/posts";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { PostCard } from "@/components/PostCard";
import type { Metadata } from "next";

const siteConfig = createSiteConfig({
  siteName: "GameCodeKR",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev",
});

export function generateStaticParams() {
  return getAllGameSlugs().map((game) => ({ game }));
}

export function generateMetadata({
  params,
}: {
  params: { game: string };
}): Metadata {
  const game = getGameBySlug(params.game);
  if (!game) return {};
  const seo = genSeoMeta(siteConfig, {
    title: `${game.title} 블로그 - 분석, 가이드, 패치 요약 | GameCodeKR`,
    description: `${game.title}(${game.titleEn}) 코드 분석, 티어 분석, 패치 요약, 초보자 가이드를 확인하세요.`,
    keywords: [
      `${game.title} 가이드`,
      `${game.title} 분석`,
      `${game.title} 패치`,
    ],
    path: `/${params.game}/posts`,
  });
  return seo as Metadata;
}

export default function PostListPage({
  params,
}: {
  params: { game: string };
}) {
  const game = getGameBySlug(params.game);
  if (!game) notFound();

  const posts = getPostsByGame(params.game);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {game.title} 블로그
          </h1>
          <p className="text-xs text-slate-400">
            분석, 가이드, 패치 요약
          </p>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="mt-6 space-y-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">아직 글이 없어요</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 글 상세 페이지 생성**

`sites/gamecodekr/src/app/[game]/posts/[slug]/page.tsx`:

```typescript
import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getPost, getAllPostSlugs } from "@/lib/posts";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { PostTypeBadge } from "@/components/PostTypeBadge";
import { PostContent } from "@/components/PostContent";
import type { Metadata } from "next";

const siteConfig = createSiteConfig({
  siteName: "GameCodeKR",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev",
});

export function generateStaticParams() {
  return getAllPostSlugs().map(({ game, slug }) => ({ game, slug }));
}

export function generateMetadata({
  params,
}: {
  params: { game: string; slug: string };
}): Metadata {
  const post = getPost(params.game, params.slug);
  if (!post) return {};
  const seo = genSeoMeta(siteConfig, {
    title: `${post.title} | GameCodeKR`,
    description: post.description,
    keywords: post.tags,
    path: `/${params.game}/posts/${params.slug}`,
  });
  return seo as Metadata;
}

export default function PostDetailPage({
  params,
}: {
  params: { game: string; slug: string };
}) {
  const game = getGameBySlug(params.game);
  if (!game) notFound();

  const post = getPost(params.game, params.slug);
  if (!post) notFound();

  const dateStr = new Date(post.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* 뒤로가기 */}
      <a
        href={`/${game.slug}/posts`}
        className="mb-4 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
      >
        ← {game.title} 글 목록
      </a>

      {/* 헤더 */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <PostTypeBadge type={post.type} />
          <span className="text-[10px] text-slate-400">{dateStr}</span>
        </div>
        <h1 className="text-xl font-bold leading-tight text-slate-900">
          {post.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{post.description}</p>
        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 본문 */}
      <PostContent source={post.content} />

      {/* 하단 네비게이션 */}
      <div className="mt-8 border-t border-slate-200 pt-4">
        <a
          href={`/${game.slug}/posts`}
          className="text-xs text-blue-600 hover:underline"
        >
          ← {game.title} 글 목록으로 돌아가기
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Sidebar.tsx에 글 서브메뉴 추가**

`sites/gamecodekr/src/components/Sidebar.tsx` 전체를 다음으로 교체:

```typescript
import { GAMES } from "@/lib/games";
import { getGamesWithPosts } from "@/lib/posts";
import type { GameConfig } from "@/lib/types";

interface SidebarProps {
  currentPath: string;
  onNavigate?: () => void;
}

const gamesWithPosts = getGamesWithPosts();

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
            hasPosts={gamesWithPosts.includes(game.slug)}
          />
        ))}
      </div>
    </nav>
  );
}

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function GameMenuItem({
  game,
  isActive,
  currentPath,
  onNavigate,
  hasPosts,
}: {
  game: GameConfig;
  isActive: boolean;
  currentPath: string;
  onNavigate?: () => void;
  hasPosts: boolean;
}) {
  const currentMonth = getCurrentMonth();

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
              href={`/${game.slug}/codes/${currentMonth}`}
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
              href={`/${game.slug}/tier/${currentMonth}`}
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
          {hasPosts && (
            <a
              href={`/${game.slug}/posts`}
              onClick={onNavigate}
              className={`block py-1.5 pl-[52px] pr-4 text-[11px] ${
                currentPath.includes("/posts")
                  ? "font-medium text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              ✍️ 글
            </a>
          )}
        </div>
      )}
    </div>
  );
}
```

**주의:** Sidebar는 현재 서버 컴포넌트로 사용되지 않는다(SidebarLayout.tsx에서 client 컴포넌트 내부에서 렌더링됨). `getGamesWithPosts()`는 fs를 사용하므로 서버에서만 호출 가능하다. 만약 Sidebar가 클라이언트 컴포넌트 내부에서 렌더링되고 있다면, `gamesWithPosts`를 SidebarLayout에서 prop으로 전달하거나, 빌드 시 정적으로 주입해야 한다.

이를 해결하기 위해, `getGamesWithPosts` 호출을 모듈 최상위에서 제거하고, `hasPosts` prop을 외부에서 받도록 수정한다. 대안으로, 빌드 타임에 게시글이 있는 게임 목록을 생성하는 방식이 가장 간단하다.

**실제 적용 시 확인 사항:** `SidebarLayout.tsx`가 "use client"이므로, Sidebar 내에서 fs 접근이 불가하다. 대안:
1. `getGamesWithPosts()`를 layout.tsx(서버 컴포넌트)에서 호출하고 prop으로 전달
2. 또는 빌드 시 `content/posts/` 내 디렉토리명을 정적 상수로 생성

가장 간단한 방법: Sidebar에서 `getGamesWithPosts`를 직접 호출하지 않고, 모든 게임에 posts 링크를 표시하되, 글이 없으면 목록 페이지에서 "아직 글이 없어요"를 보여주는 방식으로 변경한다.

Sidebar.tsx를 다음으로 다시 수정:

```typescript
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

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
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
  const currentMonth = getCurrentMonth();

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
              href={`/${game.slug}/codes/${currentMonth}`}
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
              href={`/${game.slug}/tier/${currentMonth}`}
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
          <a
            href={`/${game.slug}/posts`}
            onClick={onNavigate}
            className={`block py-1.5 pl-[52px] pr-4 text-[11px] ${
              currentPath.includes("/posts")
                ? "font-medium text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ✍️ 글
          </a>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 타입 체크**

```bash
cd sites/gamecodekr && npx tsc --noEmit 2>&1 | head -20
```

기대 출력: 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add sites/gamecodekr/src/app/[game]/posts/page.tsx sites/gamecodekr/src/app/[game]/posts/[slug]/page.tsx sites/gamecodekr/src/components/Sidebar.tsx
git commit -m "$(cat <<'EOF'
블로그 글 페이지 + 사이드바 글 메뉴 추가

- [game]/posts/page.tsx: 게임별 글 목록 (PostCard 그리드)
- [game]/posts/[slug]/page.tsx: 글 상세 (MDX 렌더링)
- Sidebar에 "글" 서브메뉴 항목 추가
- Static Export용 generateStaticParams 구현

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: 샘플 블로그 글 작성

**Files:**
- Create: `sites/gamecodekr/content/posts/blox-fruits/2026-04-code-analysis.mdx`

- [ ] **Step 1: 샘플 MDX 블로그 글 생성**

`sites/gamecodekr/content/posts/blox-fruits/2026-04-code-analysis.mdx`:

```mdx
---
title: "블록스 프루츠 2026년 4월 코드 보상 가치 분석"
date: "2026-04-03"
game: "blox-fruits"
type: "code-analysis"
tags: ["코드", "보상 분석", "블록스 프루츠", "2026년 4월"]
description: "이번 달 블록스 프루츠 코드 보상의 게임 내 가치를 분석합니다. 어떤 코드를 먼저 써야 할지 알려드려요."
---

## 이번 달 코드 총 가치

2026년 4월 블록스 프루츠에서 사용 가능한 코드들의 보상을 모두 합치면 **약 450 Robux 상당**의 가치가 있어요.

특히 이번 달에는 경험치 부스트 코드가 많아서, 레벨업 중인 유저에게 아주 유용해요.

## 코드별 상세 분석

### SUB2GAMERROBOT — 경험치 2배 부스트 (20분)

- **Robux 환산 가치:** 약 100 Robux
- **사용 추천 타이밍:** 레벨업 퀘스트 직전에 사용하면 효율이 2배!
- **주의사항:** 다른 경험치 부스트와 중복 적용이 안 돼요

경험치 2배 부스트는 게임샵에서 게임패스로 구매하면 비싸지만, 코드로 무료로 받을 수 있어요.

### BLUXXY_ADMIN — 스탯 리셋

- **Robux 환산 가치:** 약 75 Robux
- **사용 추천 타이밍:** 스탯 분배를 잘못했을 때
- **주의사항:** 한 번 리셋하면 되돌릴 수 없어요

스탯 리셋은 게임 내에서 Fragments(조각)로 살 수 있지만, 초보자에게는 조각 모으기가 어려워요. 코드로 받으면 좋아요!

### UPDATE20 — 벨리(돈) 2배 부스트 (20분)

- **Robux 환산 가치:** 약 80 Robux
- **사용 추천 타이밍:** 보스 사냥이나 퀘스트 보상 수령 직전
- **주의사항:** 경험치 부스트와 동시 사용 가능!

## 추천 사용 순서

1. **UPDATE20** (벨리 2배) — 보스 사냥 전에 켜세요
2. **SUB2GAMERROBOT** (경험치 2배) — 퀘스트 보상 받기 직전에
3. **BLUXXY_ADMIN** (스탯 리셋) — 필요할 때만 사용

> 이번 달 코드는 총 450 Robux 상당! 레벨업 중이라면 경험치 부스트 코드를 꼭 쓰세요.
```

- [ ] **Step 2: 글 로딩 확인**

```bash
cd sites/gamecodekr && node -e "
const { getAllPosts, getPost } = require('./src/lib/posts');
const posts = getAllPosts();
console.log('총 글 수:', posts.length);
console.log('첫 번째 글:', JSON.stringify(posts[0], null, 2));
const detail = getPost('blox-fruits', '2026-04-code-analysis');
console.log('본문 길이:', detail?.content.length);
"
```

**참고:** 위 명령은 TypeScript 파일이라 직접 실행이 안 될 수 있다. 대안으로 빌드 테스트를 진행한다.

- [ ] **Step 3: 커밋**

```bash
git add sites/gamecodekr/content/posts/blox-fruits/2026-04-code-analysis.mdx
git commit -m "$(cat <<'EOF'
블록스 프루츠 4월 코드 분석 샘플 블로그 글 추가

- MDX 형식 블로그 글 작성 (코드 분석 유형)
- 코드별 Robux 환산 가치, 사용 타이밍, 주의사항 포함
- 추천 사용 순서 및 한줄 요약 포함

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: 빌드 검증 + 푸시

**Files:**
- None (빌드 + 배포 확인)

- [ ] **Step 1: 전체 타입 체크**

```bash
cd sites/gamecodekr && npx tsc --noEmit
```

기대 출력: 에러 없음.

- [ ] **Step 2: 기존 테스트 실행**

```bash
cd sites/gamecodekr && pnpm test
```

기대 출력: 모든 기존 테스트 통과.

- [ ] **Step 3: 파이프라인 테스트**

```bash
cd /Users/arkeo/Developer/00.\ Git/00.\ workspace/00.\ Projects/blog-manage && python -m pytest pipelines/ -v
```

기대 출력: 모든 파이프라인 테스트 통과.

- [ ] **Step 4: 프로덕션 빌드**

```bash
cd sites/gamecodekr && pnpm build
```

기대 출력:
```
Route (app)                              Size     First Load JS
┌ ○ /                                    ...
├ ○ /[game]                              ...
├ ○ /[game]/codes/[month]                ...
├ ○ /[game]/tier/[month]                 ...
├ ○ /[game]/posts                        ...
├ ○ /[game]/posts/[slug]                 ...
...
✓ Generating static pages
✓ Finalizing page optimization
```

에러 없이 static export 성공해야 한다. `out/` 디렉토리에 `blox-fruits/posts/2026-04-code-analysis.html` 파일이 생성되어야 한다.

- [ ] **Step 5: 빌드 출력 확인**

```bash
ls sites/gamecodekr/out/blox-fruits/posts/
```

기대 출력: `index.html`, `2026-04-code-analysis.html` (또는 `2026-04-code-analysis/index.html`)

- [ ] **Step 6: Git 푸시**

```bash
git push origin main
```

기대 출력: Cloudflare Pages 자동 빌드 트리거됨.

- [ ] **Step 7: Cloudflare Pages 배포 확인**

GitHub push 후 Cloudflare Pages 대시보드에서 빌드 성공을 확인한다.

```bash
# 배포 후 페이지 확인 URL:
# https://gamecodekr.pages.dev/blox-fruits/posts/2026-04-code-analysis
# https://gamecodekr.pages.dev/blox-fruits/posts
```

---

## 주의사항

1. **하위 호환성:** `editorial` 필드는 모두 선택적(`?`)이므로, 기존 JSON 데이터가 editorial 없이도 정상 동작한다.
2. **TierItem.consensus/sources:** 파이프라인 재실행 전까지 기존 티어 데이터에는 이 필드가 없으므로, TrustBadge는 `undefined` 시 아무것도 표시하지 않는다.
3. **Sidebar fs 접근:** Sidebar가 "use client" 컴포넌트 트리 내에 있으므로, fs를 사용하는 `getGamesWithPosts()`를 직접 호출할 수 없다. 모든 게임에 "글" 링크를 표시하고, 글이 없는 게임은 목록 페이지에서 빈 상태를 보여주는 방식으로 해결한다.
4. **MDX + Static Export:** `next-mdx-remote/rsc`의 `compileMDX`는 서버 컴포넌트에서 실행되며, `output: "export"` 모드에서 빌드 시 정적 HTML로 렌더링된다.
5. **editorial 필드 채우기:** 이 Phase에서는 editorial 필드를 JSON에 수동으로 넣거나, 에이전트가 채운다. 자동 생성 스크립트(`scripts/generate-blog-content.py`)는 별도 Phase에서 구현한다.
