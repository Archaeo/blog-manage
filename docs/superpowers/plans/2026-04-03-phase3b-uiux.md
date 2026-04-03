# Phase 3B: UI/UX 비주얼 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GameCodeKR 사이트를 클린 라이트 테마 + 반응형 사이드바 + 게임/티어 이미지로 전면 비주얼 개선한다.

**Architecture:** 기존 컴포넌트를 라이트 테마로 리스타일링하고, SidebarLayout 래퍼를 추가하여 모든 페이지에 반응형 사이드바를 적용한다. 게임 이미지는 로컬 저장, 티어 아이템 이���지는 파이프라인 수집 시 URL을 포함한다.

**Tech Stack:** Next.js 14 (App Router), TailwindCSS 4, React 18, Python (파이프라인)

---

## File Structure

### 새로 생성

| 파일 | 역할 |
|---|---|
| `sites/gamecodekr/src/components/SidebarLayout.tsx` | 사이드바 + 메인 영역 래퍼 (client) |
| `sites/gamecodekr/src/components/Sidebar.tsx` | 사이드바 컨텐츠 (게임 목록 + 서브메뉴) |
| `sites/gamecodekr/src/components/MobileHeader.tsx` | 모바일 상단 바 (햄버거 + 로고) |
| `scripts/download-game-images.py` | 게임 이미지 다운로드 헬퍼 |
| `sites/gamecodekr/public/images/games/*.png` | 게임 썸네일 10개 |

### 수정

| 파일 | 변경 |
|---|---|
| `sites/gamecodekr/src/lib/types.ts` | `GameConfig.imageUrl`, `TierItem.imageUrl` 추가 |
| `sites/gamecodekr/src/lib/games.ts` | 각 게임에 `imageUrl` 필드 추가 |
| `sites/gamecodekr/src/app/globals.css` | 라이트 테�� 기본 스타일 |
| `sites/gamecodekr/src/app/layout.tsx` | SidebarLayout 래핑 |
| `sites/gamecodekr/src/app/page.tsx` | 게임 카드 그리드 변경 |
| `sites/gamecodekr/src/app/[game]/page.tsx` | 라이트 테마 스타일 |
| `sites/gamecodekr/src/app/[game]/codes/[month]/page.tsx` | 라이트 테마 스타일 |
| `sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx` | 라이트 테마 + 이미지 전달 |
| `sites/gamecodekr/src/components/GameCard.tsx` | 이미지 배너 + 뱃지 카드 |
| `sites/gamecodekr/src/components/CodeTable.tsx` | 카드형 + 라이트 테마 |
| `sites/gamecodekr/src/components/TierList.tsx` | 카드 그리드 + 이미지/폴백 |
| `sites/gamecodekr/src/components/RewardAnalysis.tsx` | 라이트 테마 스타일 |
| `packages/shared-ui/src/components/VerificationBadge.tsx` | 스타일 유지 (변경 없음) |
| `packages/shared-ui/src/components/ArchiveBanner.tsx` | 스타일 유지 (변경 없음) |
| `pipelines/gamecodekr/generate_content.py` | 티어 JSON에 imageUrl 포함 |

---

## Task 1: 타입 & 데이터 레이어 업데이트

**Files:**
- Modify: `sites/gamecodekr/src/lib/types.ts`
- Modify: `sites/gamecodekr/src/lib/games.ts`

- [ ] **Step 1: types.ts에 imageUrl 필드 추가**

`sites/gamecodekr/src/lib/types.ts`에서 `GameConfig`과 `TierItem` 인터페이스에 필드 추가:

```typescript
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

```typescript
/** 티어 아이템 */
export interface TierItem {
  name: string;
  nameKo: string;
  rank: TierRank;
  description: string;
  changeFromLast: "up" | "down" | "new" | "same";
  imageUrl?: string;
}
```

- [ ] **Step 2: games.ts에 각 게임 imageUrl 추가**

`sites/gamecodekr/src/lib/games.ts`의 각 게임 객체에 `imageUrl` 필드 추가:

```typescript
export const GAMES: GameConfig[] = [
  {
    slug: "blox-fruits",
    title: "블록스 프루츠",
    titleEn: "Blox Fruits",
    icon: "🍎",
    imageUrl: "/images/games/blox-fruits.png",
    description: "열매 능력으로 싸우는 원피스 스타일 RPG",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "king-legacy",
    title: "킹 레거시",
    titleEn: "King Legacy",
    icon: "👑",
    imageUrl: "/images/games/king-legacy.png",
    description: "바다를 탐험하며 열매 능력을 모으는 RPG",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "fruit-battlegrounds",
    title: "프루츠 배틀그라운드",
    titleEn: "Fruit Battlegrounds",
    icon: "⚔️",
    imageUrl: "/images/games/fruit-battlegrounds.png",
    description: "열매 능력으로 PvP 대전하는 격투 게임",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "anime-adventures",
    title: "애니메 어드벤처",
    titleEn: "Anime Adventures",
    icon: "⭐",
    imageUrl: "/images/games/anime-adventures.png",
    description: "애니메 캐릭터를 배치하는 타워 디펜스",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "murder-mystery-2",
    title: "머더 미스터리 2",
    titleEn: "Murder Mystery 2",
    icon: "🔪",
    imageUrl: "/images/games/murder-mystery-2.png",
    description: "범인을 찾아내는 추리 게임",
    hasCode: true,
    hasTier: false,
  },
  {
    slug: "pet-simulator-99",
    title: "펫 시뮬레이터 99",
    titleEn: "Pet Simulator 99",
    icon: "🐾",
    imageUrl: "/images/games/pet-simulator-99.png",
    description: "귀여운 펫을 수집하고 키우는 시뮬레이터",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "shindo-life",
    title: "신도 라이프",
    titleEn: "Shindo Life",
    icon: "🍥",
    imageUrl: "/images/games/shindo-life.png",
    description: "나루토 스타일 닌자 RPG",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "tower-defense-simulator",
    title: "타워 디펜스 시뮬레이터",
    titleEn: "Tower Defense Simulator",
    icon: "🏰",
    imageUrl: "/images/games/tower-defense-simulator.png",
    description: "타워를 세워 적을 막는 전략 게임",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "all-star-tower-defense",
    title: "올스타 타워 디펜스",
    titleEn: "All Star Tower Defense",
    icon: "🌟",
    imageUrl: "/images/games/all-star-tower-defense.png",
    description: "애니메 캐릭터로 타워 디펜스",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "bee-swarm-simulator",
    title: "비 스웜 시뮬레이터",
    titleEn: "Bee Swarm Simulator",
    icon: "🐝",
    imageUrl: "/images/games/bee-swarm-simulator.png",
    description: "벌떼를 모아 꿀을 수집하는 시뮬레이터",
    hasCode: true,
    hasTier: false,
  },
];
```

- [ ] **Step 3: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm run build`
Expected: 빌드 성공 (이미지 파일은 아직 없지만 참조만 추가한 것이라 빌드에 영향 없음)

- [ ] **Step 4: 커밋**

```bash
git add sites/gamecodekr/src/lib/types.ts sites/gamecodekr/src/lib/games.ts
git commit -m "타입 업데이트: GameConfig.imageUrl, TierItem.imageUrl 추가"
```

---

## Task 2: 게임 이미지 다운로드 스크립트 + 이미지 저장

**Files:**
- Create: `scripts/download-game-images.py`
- Create: `sites/gamecodekr/public/images/games/*.png` (10개)

- [ ] **Step 1: download-game-images.py 작성**

```python
#!/usr/bin/env python3
"""게임 이미지를 config.py의 URL에서 다운로드하여 public/images/games/에 저장한다."""
import sys
import urllib.request
from pathlib import Path

# 프로젝트 루트 기준 경로
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

from pipelines.gamecodekr.config import GAMES

OUTPUT_DIR = PROJECT_ROOT / "sites" / "gamecodekr" / "public" / "images" / "games"


def download_images(force: bool = False) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for game in GAMES:
        slug = game["slug"]
        url = game["image_url"]
        output_path = OUTPUT_DIR / f"{slug}.png"

        if output_path.exists() and not force:
            print(f"  스킵 (이미 존재): {slug}")
            continue

        print(f"  다운로드: {slug} ← {url[:60]}...")
        try:
            urllib.request.urlretrieve(url, output_path)
            print(f"  ✓ ��장: {output_path.relative_to(PROJECT_ROOT)}")
        except Exception as e:
            print(f"  ✗ 실패: {e}")


if __name__ == "__main__":
    force = "--force" in sys.argv
    print("게임 이미지 다운로드 시작...")
    download_images(force=force)
    print("완료!")
```

- [ ] **Step 2: 스크립트 실행하여 이미지 다운로드**

Run: `python3 scripts/download-game-images.py`
Expected: 10개 게임 이미지가 `sites/gamecodekr/public/images/games/`��� 저장됨

- [ ] **Step 3: 이미지 파일 확인**

Run: `ls -la sites/gamecodekr/public/images/games/`
Expected: 10개의 .png 파일이 존재

- [ ] **Step 4: 커밋**

```bash
git add scripts/download-game-images.py sites/gamecodekr/public/images/games/
git commit -m "게임 이미지: 다운로드 스크립트 + 10개 게임 썸네일"
```

---

## Task 3: 글로벌 스타일 + 라이트 테마

**Files:**
- Modify: `sites/gamecodekr/src/app/globals.css`
- Modify: `sites/gamecodekr/src/app/layout.tsx`

- [ ] **Step 1: globals.css 라이트 테마 스타일 추가**

`sites/gamecodekr/src/app/globals.css`를 다음으로 교체:

```css
@import "tailwindcss";

body {
  background-color: #f8fafc;
  color: #1e293b;
}
```

- [ ] **Step 2: layout.tsx body 클래스 업데이트**

`sites/gamecodekr/src/app/layout.tsx`에서 body 클래스 변경:

```typescript
import type { Metadata } from "next";
import { createSiteConfig } from "@blog-manage/shared-seo";
import "./globals.css";

const siteConfig = createSiteConfig({
  siteName: "GameCodeKR",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev",
});

export const metadata: Metadata = {
  title: {
    default: "GameCodeKR - 로블록스 게임 코드 & 티어표",
    template: "%s | GameCodeKR",
  },
  description:
    "로블록스 게임 코드, 티어표, 패치 요약을 매일 업데이트! 초등학생도 이해하기 쉽게 핵심만 정리합니다.",
  metadataBase: new URL(siteConfig.baseUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm run build`
Expected: 빌드 성공

- [ ] **Step 4: 커밋**

```bash
git add sites/gamecodekr/src/app/globals.css sites/gamecodekr/src/app/layout.tsx
git commit -m "라이트 테마: 글로벌 스타일 + layout 배경색 변경"
```

---

## Task 4: 사이드바 컴포넌트

**Files:**
- Create: `sites/gamecodekr/src/components/Sidebar.tsx`
- Create: `sites/gamecodekr/src/components/MobileHeader.tsx`
- Create: `sites/gamecodekr/src/components/SidebarLayout.tsx`

- [ ] **Step 1: Sidebar.tsx 작성**

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
```

- [ ] **Step 2: MobileHeader.tsx 작성**

```typescript
interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
          aria-label="메뉴 열기"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-xs text-white">
            🎮
          </span>
          <span className="text-sm font-bold text-slate-900">GameCodeKR</span>
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: SidebarLayout.tsx 작성**

```typescript
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // 경로 변경 시 모바일 사이드바 닫기
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      {/* 데스크탑 사이드바 */}
      <aside className="hidden w-[230px] flex-shrink-0 lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <Sidebar currentPath={pathname} />
        </div>
      </aside>

      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 h-full w-[260px] shadow-lg">
            <Sidebar
              currentPath={pathname}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* 메인 영역 */}
      <div className="flex flex-1 flex-col">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 커밋**

```bash
git add sites/gamecodekr/src/components/Sidebar.tsx sites/gamecodekr/src/components/MobileHeader.tsx sites/gamecodekr/src/components/SidebarLayout.tsx
git commit -m "사이드바: 반응형 레이아웃 + 게임 목록 + 서브메뉴"
```

---

## Task 5: 레이아웃 통합 + 페이지 스타일 업데이트

**Files:**
- Modify: `sites/gamecodekr/src/app/layout.tsx`
- Modify: `sites/gamecodekr/src/app/page.tsx`
- Modify: `sites/gamecodekr/src/app/[game]/page.tsx`
- Modify: `sites/gamecodekr/src/app/[game]/codes/[month]/page.tsx`
- Modify: `sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx`

- [ ] **Step 1: layout.tsx에 SidebarLayout 래핑**

```typescript
import type { Metadata } from "next";
import { createSiteConfig } from "@blog-manage/shared-seo";
import { SidebarLayout } from "@/components/SidebarLayout";
import "./globals.css";

const siteConfig = createSiteConfig({
  siteName: "GameCodeKR",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev",
});

export const metadata: Metadata = {
  title: {
    default: "GameCodeKR - 로블록스 게임 코드 & 티어표",
    template: "%s | GameCodeKR",
  },
  description:
    "로블록스 게임 코드, 티어표, 패치 요약을 매일 업데이트! 초등학생도 이해하기 쉽게 핵심만 정리합니다.",
  metadataBase: new URL(siteConfig.baseUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-800 antialiased">
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: page.tsx (홈페이지) 업데이트**

```typescript
import { GAMES } from "@/lib/games";
import { GameCard } from "@/components/GameCard";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">로블록스 게임 코드 & 티어표</h1>
        <p className="mt-1 text-sm text-slate-500">
          매일 업데이트되는 최신 코드와 티어표를 확인하세요
        </p>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: [game]/page.tsx 업데이트**

```typescript
import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getAvailableMonths } from "@/lib/content";

export function generateStaticParams() {
  return getAllGameSlugs().map((game) => ({ game }));
}

export function generateMetadata({ params }: { params: { game: string } }) {
  const game = getGameBySlug(params.game);
  if (!game) return {};
  return {
    title: `${game.title} - 코드 & 티어표`,
    description: `${game.title}(${game.titleEn}) 최신 코드, 티어표, 패치 요약을 매일 업데이��합니다.`,
  };
}

export default function GameHubPage({ params }: { params: { game: string } }) {
  const game = getGameBySlug(params.game);
  if (!game) notFound();

  const codeMonths = getAvailableMonths(game.slug, "codes");
  const tierMonths = getAvailableMonths(game.slug, "tiers");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="h-12 w-12 rounded-lg object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
          }}
        />
        <span className="hidden text-4xl">{game.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{game.title}</h1>
          <p className="text-sm text-slate-500">{game.titleEn}</p>
        </div>
      </div>
      <p className="mb-6 text-sm text-slate-600">{game.description}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {game.hasCode && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-slate-900">📋 게임 코드</h2>
            {codeMonths.length > 0 ? (
              <ul className="space-y-2">
                {codeMonths.map((month) => (
                  <li key={month}>
                    <a
                      href={`/${game.slug}/codes/${month}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {formatMonth(month)} 코드 총정리
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">아직 코드가 없어요</p>
            )}
          </section>
        )}

        {game.hasTier && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-slate-900">🏆 티어표</h2>
            {tierMonths.length > 0 ? (
              <ul className="space-y-2">
                {tierMonths.map((month) => (
                  <li key={month}>
                    <a
                      href={`/${game.slug}/tier/${month}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {formatMonth(month)} 티어표
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">아직 티어표가 없어요</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${year}년 ${parseInt(m)}월`;
}
```

- [ ] **Step 4: codes/[month]/page.tsx 라이트 테마 업데이트**

`sites/gamecodekr/src/app/[game]/codes/[month]/page.tsx` — 컨테이너 max-w와 padding 수정:

기존 `<div className="mx-auto max-w-5xl px-4 py-8">` 를
`<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">` 로 변경.

기존 `<h1 className="text-3xl font-bold">` 에서 게임 이미지 추가:

```typescript
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
```

- [ ] **Step 5: tier/[month]/page.tsx 라이트 테마 업데이트**

동일한 패턴으로 게임 이미지 + 컨테이너 업데이트. `TierList`에 `gameIcon` prop 추가:

```typescript
<TierList tiers={data.tiers} gameIcon={game.icon} />
```

- [ ] **Step 6: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm run build`
Expected: 빌드 성공

- [ ] **Step 7: 커밋**

```bash
git add sites/gamecodekr/src/app/
git commit -m "레이아웃 통합: SidebarLayout 래핑 + 라이트 테마 페이지 업데이트"
```

---

## Task 6: 컴포넌트 리스타일링 — GameCard, CodeTable, RewardAnalysis

**Files:**
- Modify: `sites/gamecodekr/src/components/GameCard.tsx`
- Modify: `sites/gamecodekr/src/components/CodeTable.tsx`
- Modify: `sites/gamecodekr/src/components/RewardAnalysis.tsx`

- [ ] **Step 1: GameCard.tsx 이미지 배너 카드로 변경**

```typescript
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
```

- [ ] **Step 2: RewardAnalysis.tsx 라이트 테마 업데이트**

```typescript
interface RewardAnalysisProps {
  analysis: string;
}

export function RewardAnalysis({ analysis }: RewardAnalysisProps) {
  return (
    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      💡 {analysis}
    </div>
  );
}
```

- [ ] **Step 3: CodeTable.tsx 카드형 + 라이트 테마**

```typescript
import { VerificationBadge } from "@blog-manage/shared-ui";
import { RewardAnalysis } from "./RewardAnalysis";
import type { GameCode } from "@/lib/types";

interface CodeTableProps {
  codes: GameCode[];
  title: string;
  showExpired?: boolean;
}

export function CodeTable({ codes, title, showExpired = false }: CodeTableProps) {
  if (codes.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-sm font-bold text-slate-700">{title}</h2>
      <div className="space-y-2">
        {codes.map((code) => (
          <div
            key={code.code}
            className={`rounded-xl border bg-white p-3.5 shadow-sm ${
              showExpired
                ? "border-slate-100 opacity-60"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <code className="rounded bg-blue-50 px-2 py-0.5 font-mono text-sm font-bold text-blue-600">
                {code.code}
              </code>
              <VerificationBadge level={code.verified} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{code.reward}</p>
            {code.rewardAnalysis && !showExpired && (
              <RewardAnalysis analysis={code.rewardAnalysis} />
            )}
            <p className="mt-2 text-[10px] text-slate-300">
              추가일: {code.addedDate}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm run build`
Expected: 빌드 성공

- [ ] **Step 5: 커밋**

```bash
git add sites/gamecodekr/src/components/GameCard.tsx sites/gamecodekr/src/components/CodeTable.tsx sites/gamecodekr/src/components/RewardAnalysis.tsx
git commit -m "컴포넌트 리스타일링: GameCard 이미지 배너 + CodeTable 카드형 + 라이트 테마"
```

---

## Task 7: TierList 이미지 지원 + 카드 그리드

**Files:**
- Modify: `sites/gamecodekr/src/components/TierList.tsx`

- [ ] **Step 1: TierList.tsx 카드 그리드 + 이���지/폴백 지원**

```typescript
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
```

- [ ] **Step 2: 빌드 확인**

Run: `cd sites/gamecodekr && pnpm run build`
Expected: 빌드 성공

- [ ] **Step 3: 커밋**

```bash
git add sites/gamecodekr/src/components/TierList.tsx
git commit -m "TierList: 카드 그리드 + 아이템 이미지/폴백 + 티어 컬러 시스템"
```

---

## Task 8: 파이프라인 — 티어 JSON에 imageUrl 포함

**Files:**
- Modify: `pipelines/gamecodekr/generate_content.py`

- [ ] **Step 1: generate_tier_json에 imageUrl 포함**

`pipelines/gamecodekr/generate_content.py`의 `generate_tier_json` 함수에서 티어 아이템 생성 부분 수정:

��존:
```python
tiers[tier_key].append(
    {
        "name": item["name"],
        "nameKo": item["name"],
        "rank": tier_key,
        "description": "",
        "changeFromLast": "same",
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
    }
)
```

- [ ] **Step 2: update_tier_content에서 imageUrl 보존**

`update_tier_content` 함수에서 기존 JSON의 imageUrl도 보존하도록 수정.

기존 보존 로직 뒤에 추가:
```python
item["nameKo"] = prev.get("nameKo", item["name"])
item["description"] = prev.get("description", "")
# imageUrl 보존: 기존 값이 있고 새 값이 비어있으면 기존 값 유지
if not item.get("imageUrl") and prev.get("imageUrl"):
    item["imageUrl"] = prev["imageUrl"]
```

- [ ] **Step 3: 테스트 실행**

Run: `cd "/Users/arkeo/Developer/00. Git/00. workspace/00. Projects/blog-manage" && python3 -m pytest tests/ -v`
Expected: 모든 테스트 통과

- [ ] **Step 4: 커밋**

```bash
git add pipelines/gamecodekr/generate_content.py
git commit -m "파이프라인: 티어 JSON에 imageUrl 포함 + 기존 값 보존"
```

---

## Task 9: 최종 빌드 확인 + push

**Files:**
- No new files

- [ ] **Step 1: 전체 빌드 테스���**

Run: `cd sites/gamecodekr && pnpm run build`
Expected: 빌드 성공, 에러 없음

- [ ] **Step 2: 파이프라인 테스트**

Run: `cd "/Users/arkeo/Developer/00. Git/00. workspace/00. Projects/blog-manage" && python3 -m pytest tests/ -v`
Expected: 모든 테스트 통과

- [ ] **Step 3: .gitignore에 .superpowers 추가**

`.gitignore`에 `.superpowers/` 추가 (브레인스토밍 목업 파일 제외).

```bash
echo ".superpowers/" >> .gitignore
git add .gitignore
git commit -m ".gitignore: .superpowers/ 추가"
```

- [ ] **Step 4: Git push**

```bash
git push
```
