# Phase 1: 사이트 기반 구축 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모노레포 기반으로 GameCodeKR 사이트를 구축하고 Cloudflare Pages에 배포 가능한 상태로 만든다 (샘플 데이터 포함).

**Architecture:** pnpm workspace 모노레포에서 공유 패키지(shared-seo, shared-ui, shared-adsense)를 만들고, sites/gamecodekr에 Next.js 14 App Router 앱을 구축한다. 컨텐츠는 JSON/MDX 파일에서 읽어 정적 생성(SSG)한다. UI/UX 세부 디자인은 전문 에이전트가 후속 진행하므로, 이 Phase에서는 데이터 흐름과 페이지 구조에 집중하고 최소한의 TailwindCSS 스타일만 적용한다.

**Tech Stack:** Next.js 14 (App Router, Static Export), TailwindCSS 4, TypeScript, pnpm workspace, Vitest

**UI/UX 참고:** 이 Phase에서는 기능적 레이아웃만 구현한다. 시각 디자인, 색상, 타이포그래피 등은 UI/UX 전문 에이전트가 후속으로 진행한다. 컴포넌트는 스타일 교체가 쉽도록 구조적으로 분리한다.

**Phase 전체 구조:**
- Phase 1 (이 문서): 모노레포 + 사이트 + SEO + 배포
- Phase 2: 데이터 수집 파이프라인 마이그레이션 + 스케줄링
- Phase 3: 에이전트 시스템 + 문서/가이드 + 운영 체계

---

## File Structure

### 루트 (모노레포 설정)

| 파일 | 역할 |
|---|---|
| `package.json` | pnpm workspace 루트 |
| `pnpm-workspace.yaml` | 워크스페이스 패키지 경로 정의 |
| `tsconfig.base.json` | 공유 TypeScript 설정 |

### packages/shared-seo

| 파일 | 역할 |
|---|---|
| `packages/shared-seo/package.json` | 패키지 메타데이터 |
| `packages/shared-seo/tsconfig.json` | TS 설정 (base 상속) |
| `packages/shared-seo/src/index.ts` | 엔트리 포인트 |
| `packages/shared-seo/src/config.ts` | baseUrl 등 사이트 설정 |
| `packages/shared-seo/src/metadata.ts` | Next.js Metadata 생성 함수 |
| `packages/shared-seo/src/jsonld.ts` | JSON-LD 구조화 데이터 |
| `packages/shared-seo/src/sitemap.ts` | sitemap 유틸 |
| `packages/shared-seo/src/__tests__/metadata.test.ts` | 메타데이터 테스트 |
| `packages/shared-seo/src/__tests__/jsonld.test.ts` | JSON-LD 테스트 |

### packages/shared-ui

| 파일 | 역할 |
|---|---|
| `packages/shared-ui/package.json` | 패키지 메타데이터 |
| `packages/shared-ui/tsconfig.json` | TS 설정 |
| `packages/shared-ui/src/index.ts` | 엔트리 포인트 |
| `packages/shared-ui/src/components/Layout.tsx` | 기본 레이아웃 (헤더+푸터+본문) |
| `packages/shared-ui/src/components/Header.tsx` | 헤더 |
| `packages/shared-ui/src/components/Footer.tsx` | 푸터 |
| `packages/shared-ui/src/components/ArchiveBanner.tsx` | 이전 달 아카이브 배너 |
| `packages/shared-ui/src/components/VerificationBadge.tsx` | 코드 검증 배지 (✅✅✅) |

### packages/shared-adsense

| 파일 | 역할 |
|---|---|
| `packages/shared-adsense/package.json` | 패키지 메타데이터 |
| `packages/shared-adsense/tsconfig.json` | TS 설정 |
| `packages/shared-adsense/src/index.ts` | 엔트리 포인트 |
| `packages/shared-adsense/src/config.ts` | 애드센스 설정 (활성화 플래그) |
| `packages/shared-adsense/src/components/AdBanner.tsx` | 배너 광고 (비활성 시 빈 div) |
| `packages/shared-adsense/src/components/AdInArticle.tsx` | 본문 중간 광고 |

### sites/gamecodekr

| 파일 | 역할 |
|---|---|
| `sites/gamecodekr/package.json` | Next.js 앱 |
| `sites/gamecodekr/tsconfig.json` | TS 설정 |
| `sites/gamecodekr/next.config.ts` | Next.js 설정 (static export) |
| `sites/gamecodekr/tailwind.config.ts` | TailwindCSS 설정 |
| `sites/gamecodekr/postcss.config.js` | PostCSS 설정 |
| `sites/gamecodekr/src/app/globals.css` | 글로벌 스타일 |
| `sites/gamecodekr/src/app/layout.tsx` | 루트 레이아웃 |
| `sites/gamecodekr/src/app/page.tsx` | 홈 페이지 |
| `sites/gamecodekr/src/app/[game]/page.tsx` | 게임 허브 페이지 |
| `sites/gamecodekr/src/app/[game]/codes/page.tsx` | 코드 리다이렉트 |
| `sites/gamecodekr/src/app/[game]/codes/[month]/page.tsx` | 월단위 코드 페이지 |
| `sites/gamecodekr/src/app/[game]/tier/page.tsx` | 티어 리다이렉트 |
| `sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx` | 월단위 티어 페이지 |
| `sites/gamecodekr/src/app/robots.ts` | robots.txt 생성 |
| `sites/gamecodekr/src/app/sitemap.ts` | sitemap.xml 생성 |
| `sites/gamecodekr/src/lib/content.ts` | 컨텐츠 로딩 유틸 |
| `sites/gamecodekr/src/lib/games.ts` | 게임 목록/설정 |
| `sites/gamecodekr/src/lib/types.ts` | TypeScript 타입 정의 |
| `sites/gamecodekr/src/components/CodeTable.tsx` | 코드 테이블 컴포넌트 |
| `sites/gamecodekr/src/components/TierList.tsx` | 티어 리스트 컴포넌트 |
| `sites/gamecodekr/src/components/GameCard.tsx` | 게임 카드 (홈 목록용) |
| `sites/gamecodekr/src/components/RewardAnalysis.tsx` | 보상 가치 분석 표시 |

### 컨텐츠 (샘플 데이터)

| 파일 | 역할 |
|---|---|
| `sites/gamecodekr/content/codes/blox-fruits/2026-04.json` | 블록스 프루츠 코드 샘플 |
| `sites/gamecodekr/content/codes/king-legacy/2026-04.json` | 킹 레거시 코드 샘플 |
| `sites/gamecodekr/content/tiers/blox-fruits/2026-04.json` | 블록스 프루츠 티어 샘플 |

---

## Task 1: 모노레포 초기화

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`

- [ ] **Step 1: pnpm workspace 루트 package.json 생성**

```json
{
  "name": "blog-manage",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter gamecodekr dev",
    "build": "pnpm --filter gamecodekr build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  },
  "engines": {
    "node": ">=18"
  }
}
```

- [ ] **Step 2: pnpm-workspace.yaml 생성**

```yaml
packages:
  - "packages/*"
  - "sites/*"
```

- [ ] **Step 3: tsconfig.base.json 생성**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@blog-manage/shared-seo": ["packages/shared-seo/src"],
      "@blog-manage/shared-ui": ["packages/shared-ui/src"],
      "@blog-manage/shared-adsense": ["packages/shared-adsense/src"]
    }
  }
}
```

- [ ] **Step 4: pnpm install 실행**

Run: `pnpm install`
Expected: `Lockfile is up to date` 또는 빈 워크스페이스 설치 완료

- [ ] **Step 5: 커밋**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json pnpm-lock.yaml
git commit -m "모노레포 초기화: pnpm workspace + TypeScript 기본 설정"
```

---

## Task 2: TypeScript 타입 정의

**Files:**
- Create: `sites/gamecodekr/src/lib/types.ts`

이 타입들은 이후 모든 Task에서 사용된다. 먼저 정의한다.

- [ ] **Step 1: types.ts 생성**

```typescript
// sites/gamecodekr/src/lib/types.ts

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

/** 월단위 코드 페이지 데이터 */
export interface MonthlyCodeData {
  game: string;
  gameTitle: string;
  month: string; // "YYYY-MM"
  lastUpdated: string; // ISO 8601
  codes: GameCode[];
  expiredCodes: GameCode[];
  meta: PageMeta;
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
}

/** 월단위 티어 페이지 데이터 */
export interface MonthlyTierData {
  game: string;
  gameTitle: string;
  month: string;
  lastUpdated: string;
  category: string; // 예: "열매", "캐릭터"
  tiers: Record<TierRank, TierItem[]>;
  meta: PageMeta;
}

/** 페이지 SEO 메타 */
export interface PageMeta {
  title: string;
  description: string;
  keywords: string[];
}

/** 게임 설정 */
export interface GameConfig {
  slug: string;
  title: string;
  titleEn: string;
  icon: string; // emoji
  description: string;
  hasCode: boolean;
  hasTier: boolean;
}
```

- [ ] **Step 2: 커밋**

```bash
git add sites/gamecodekr/src/lib/types.ts
git commit -m "타입 정의: 코드, 티어, 게임 설정 타입 추가"
```

---

## Task 3: 게임 목록 설정

**Files:**
- Create: `sites/gamecodekr/src/lib/games.ts`
- Create: `sites/gamecodekr/src/lib/__tests__/games.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// sites/gamecodekr/src/lib/__tests__/games.test.ts
import { describe, it, expect } from "vitest";
import { GAMES, getGameBySlug, getAllGameSlugs } from "../games";

describe("games", () => {
  it("10개 게임이 정의되어 있어야 한다", () => {
    expect(GAMES).toHaveLength(10);
  });

  it("slug로 게임을 찾을 수 있어야 한다", () => {
    const game = getGameBySlug("blox-fruits");
    expect(game).toBeDefined();
    expect(game!.title).toBe("블록스 프루츠");
  });

  it("존재하지 않는 slug는 undefined를 반환해야 한다", () => {
    expect(getGameBySlug("nonexistent")).toBeUndefined();
  });

  it("모든 slug 목록을 반환해야 한다", () => {
    const slugs = getAllGameSlugs();
    expect(slugs).toContain("blox-fruits");
    expect(slugs).toContain("king-legacy");
    expect(slugs).toHaveLength(10);
  });

  it("모든 게임에 필수 필드가 있어야 한다", () => {
    for (const game of GAMES) {
      expect(game.slug).toBeTruthy();
      expect(game.title).toBeTruthy();
      expect(game.titleEn).toBeTruthy();
      expect(typeof game.hasCode).toBe("boolean");
      expect(typeof game.hasTier).toBe("boolean");
    }
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd sites/gamecodekr && pnpm vitest run src/lib/__tests__/games.test.ts`
Expected: FAIL - `../games` 모듈을 찾을 수 없음

- [ ] **Step 3: games.ts 구현**

```typescript
// sites/gamecodekr/src/lib/games.ts
import type { GameConfig } from "./types";

export const GAMES: GameConfig[] = [
  {
    slug: "blox-fruits",
    title: "블록스 프루츠",
    titleEn: "Blox Fruits",
    icon: "🍎",
    description: "열매 능력으로 싸우는 원피스 스타일 RPG",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "king-legacy",
    title: "킹 레거시",
    titleEn: "King Legacy",
    icon: "👑",
    description: "바다를 탐험하며 열매 능력을 모으는 RPG",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "fruit-battlegrounds",
    title: "프루츠 배틀그라운드",
    titleEn: "Fruit Battlegrounds",
    icon: "⚔️",
    description: "열매 능력으로 PvP 대전하는 격투 게임",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "anime-adventures",
    title: "애니메 어드벤처",
    titleEn: "Anime Adventures",
    icon: "⭐",
    description: "애니메 캐릭터를 배치하는 타워 디펜스",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "murder-mystery-2",
    title: "머더 미스터리 2",
    titleEn: "Murder Mystery 2",
    icon: "🔪",
    description: "범인을 찾아내는 추리 게임",
    hasCode: true,
    hasTier: false,
  },
  {
    slug: "pet-simulator-99",
    title: "펫 시뮬레이터 99",
    titleEn: "Pet Simulator 99",
    icon: "🐾",
    description: "귀여운 펫을 수집하고 키우는 시뮬레이터",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "shindo-life",
    title: "신도 라이프",
    titleEn: "Shindo Life",
    icon: "🍥",
    description: "나루토 스타일 닌자 RPG",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "tower-defense-simulator",
    title: "타워 디펜스 시뮬레이터",
    titleEn: "Tower Defense Simulator",
    icon: "🏰",
    description: "타워를 세워 적을 막는 전략 게임",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "all-star-tower-defense",
    title: "올스타 타워 디펜스",
    titleEn: "All Star Tower Defense",
    icon: "🌟",
    description: "애니메 캐릭터로 타워 디펜스",
    hasCode: true,
    hasTier: true,
  },
  {
    slug: "bee-swarm-simulator",
    title: "비 스웜 시뮬레이터",
    titleEn: "Bee Swarm Simulator",
    icon: "🐝",
    description: "벌떼를 모아 꿀을 수집하는 시뮬레이터",
    hasCode: true,
    hasTier: false,
  },
];

export function getGameBySlug(slug: string): GameConfig | undefined {
  return GAMES.find((g) => g.slug === slug);
}

export function getAllGameSlugs(): string[] {
  return GAMES.map((g) => g.slug);
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd sites/gamecodekr && pnpm vitest run src/lib/__tests__/games.test.ts`
Expected: 5 tests PASS

- [ ] **Step 5: 커밋**

```bash
git add sites/gamecodekr/src/lib/games.ts sites/gamecodekr/src/lib/__tests__/games.test.ts
git commit -m "게임 목록 설정: 10개 로블록스 게임 정의 및 테스트"
```

---

## Task 4: 샘플 컨텐츠 데이터 생성

**Files:**
- Create: `sites/gamecodekr/content/codes/blox-fruits/2026-04.json`
- Create: `sites/gamecodekr/content/codes/king-legacy/2026-04.json`
- Create: `sites/gamecodekr/content/tiers/blox-fruits/2026-04.json`

- [ ] **Step 1: 블록스 프루츠 코드 샘플 생성**

```json
{
  "game": "blox-fruits",
  "gameTitle": "블록스 프루츠",
  "month": "2026-04",
  "lastUpdated": "2026-04-03T10:00:00Z",
  "codes": [
    {
      "code": "SUB2GAMERROBOT_RESET",
      "reward": "스탯 리셋",
      "verified": 3,
      "status": "active",
      "addedDate": "2026-04-01",
      "rewardAnalysis": "스탯 리셋은 보통 로북스 300개 가치. 빌드 변경할 때 꼭 필요한 아이템이에요!"
    },
    {
      "code": "BLUXXY_FRUIT",
      "reward": "이중 경험치 20분",
      "verified": 2,
      "status": "active",
      "addedDate": "2026-04-02",
      "rewardAnalysis": "이중 경험치는 레벨업 속도가 2배! 사용 전에 긴 그라인딩(반복 사냥) 구간을 준비하면 효율 최고."
    },
    {
      "code": "DEVSCOOKING",
      "reward": "경험치 부스트 15분",
      "verified": 1,
      "status": "unverified",
      "addedDate": "2026-04-03",
      "rewardAnalysis": "아직 확인 중인 코드예요. 작동하면 경험치 부스트를 받을 수 있어요."
    }
  ],
  "expiredCodes": [
    {
      "code": "UPDATE_25",
      "reward": "이중 경험치 30분",
      "verified": 3,
      "status": "expired",
      "addedDate": "2026-03-15",
      "rewardAnalysis": "만료된 코드입니다."
    }
  ],
  "meta": {
    "title": "블록스 프루츠 코드 총정리 (2026년 4월) - 매일 업데이트 | GameCodeKR",
    "description": "2026년 4월 블록스 프루츠 최신 코드 모음! 스탯 리셋, 이중 경험치 등 모든 코드를 매일 확인하고 업데이트합니다. 코드 보상 가치 분석 포함.",
    "keywords": ["블록스 프루츠 코드", "블록스 프루츠 코드 2026년 4월", "Blox Fruits codes", "로블록스 코드"]
  }
}
```

- [ ] **Step 2: 킹 레거시 코드 샘플 생성**

```json
{
  "game": "king-legacy",
  "gameTitle": "킹 레거시",
  "month": "2026-04",
  "lastUpdated": "2026-04-03T10:00:00Z",
  "codes": [
    {
      "code": "UPDATE6.5",
      "reward": "젬 100개",
      "verified": 3,
      "status": "active",
      "addedDate": "2026-04-01",
      "rewardAnalysis": "젬 100개는 가챠 1회 분량! 운이 좋으면 레전더리 열매를 뽑을 수 있어요."
    },
    {
      "code": "1MVISITS",
      "reward": "돈 50,000 벨리",
      "verified": 2,
      "status": "active",
      "addedDate": "2026-04-02",
      "rewardAnalysis": "50,000 벨리는 초반 장비 1~2개 살 수 있는 금액. 초보자에게 유용해요."
    }
  ],
  "expiredCodes": [],
  "meta": {
    "title": "킹 레거시 코드 총정리 (2026년 4월) - 매일 업데이트 | GameCodeKR",
    "description": "2026년 4월 킹 레거시 최신 코드 모음! 젬, 벨리 등 모든 보상 코드를 매일 업데이트합니다.",
    "keywords": ["킹 레거시 코드", "킹 레거시 코드 2026년 4월", "King Legacy codes"]
  }
}
```

- [ ] **Step 3: 블록스 프루츠 티어 샘플 생성**

```json
{
  "game": "blox-fruits",
  "gameTitle": "블록스 프루츠",
  "month": "2026-04",
  "lastUpdated": "2026-04-03T10:00:00Z",
  "category": "열매",
  "tiers": {
    "S+": [
      {
        "name": "Leopard",
        "nameKo": "레오파드",
        "rank": "S+",
        "description": "현재 최강 열매! 변신하면 이동속도와 공격력이 미쳤어요. PvP 최고 픽.",
        "changeFromLast": "same"
      },
      {
        "name": "T-Rex",
        "nameKo": "티렉스",
        "rank": "S+",
        "description": "거대한 공룡으로 변신! 넓은 범위 공격이 장점. 보스전에서도 최고.",
        "changeFromLast": "up"
      }
    ],
    "S": [
      {
        "name": "Dragon",
        "nameKo": "드래곤",
        "rank": "S",
        "description": "하늘을 날 수 있는 강력한 열매. 이동이 편하고 공격도 강해요.",
        "changeFromLast": "same"
      }
    ],
    "A": [
      {
        "name": "Buddha",
        "nameKo": "부다",
        "rank": "A",
        "description": "거대해지면서 범위가 넓어져요. 그라인딩(반복 사냥)에 최고!",
        "changeFromLast": "down"
      }
    ],
    "B": [],
    "C": [],
    "D": []
  },
  "meta": {
    "title": "블록스 프루츠 열매 티어표 (2026년 4월) | GameCodeKR",
    "description": "2026년 4월 블록스 프루츠 열매 티어표! 레오파드, 티렉스, 드래곤 등 최강 열매 순위를 매주 업데이트합니다.",
    "keywords": ["블록스 프루츠 티어표", "블록스 프루츠 열매 순위", "블록스 프루츠 최강 열매 2026"]
  }
}
```

- [ ] **Step 4: 커밋**

```bash
git add sites/gamecodekr/content/
git commit -m "샘플 컨텐츠 데이터: 블록스 프루츠/킹 레거시 코드, 티어 샘플"
```

---

## Task 5: 컨텐츠 로딩 유틸

**Files:**
- Create: `sites/gamecodekr/src/lib/content.ts`
- Create: `sites/gamecodekr/src/lib/__tests__/content.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// sites/gamecodekr/src/lib/__tests__/content.test.ts
import { describe, it, expect } from "vitest";
import {
  getMonthlyCodeData,
  getMonthlyTierData,
  getAvailableMonths,
  getCurrentMonth,
} from "../content";

describe("content", () => {
  it("getCurrentMonth는 YYYY-MM 형식을 반환해야 한다", () => {
    const month = getCurrentMonth();
    expect(month).toMatch(/^\d{4}-\d{2}$/);
  });

  it("블록스 프루츠 2026-04 코드 데이터를 로드할 수 있어야 한다", () => {
    const data = getMonthlyCodeData("blox-fruits", "2026-04");
    expect(data).toBeDefined();
    expect(data!.game).toBe("blox-fruits");
    expect(data!.codes.length).toBeGreaterThan(0);
    expect(data!.meta.title).toContain("블록스 프루츠");
  });

  it("존재하지 않는 데이터는 null을 반환해야 한다", () => {
    const data = getMonthlyCodeData("nonexistent", "2026-04");
    expect(data).toBeNull();
  });

  it("블록스 프루츠 2026-04 티어 데이터를 로드할 수 있어야 한다", () => {
    const data = getMonthlyTierData("blox-fruits", "2026-04");
    expect(data).toBeDefined();
    expect(data!.tiers["S+"]).toBeDefined();
  });

  it("사용 가능한 월 목록을 반환해야 한다", () => {
    const months = getAvailableMonths("blox-fruits", "codes");
    expect(months).toContain("2026-04");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd sites/gamecodekr && pnpm vitest run src/lib/__tests__/content.test.ts`
Expected: FAIL

- [ ] **Step 3: content.ts 구현**

```typescript
// sites/gamecodekr/src/lib/content.ts
import fs from "fs";
import path from "path";
import type { MonthlyCodeData, MonthlyTierData } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getMonthlyCodeData(
  gameSlug: string,
  month: string
): MonthlyCodeData | null {
  const filePath = path.join(CONTENT_DIR, "codes", gameSlug, `${month}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as MonthlyCodeData;
  } catch {
    return null;
  }
}

export function getMonthlyTierData(
  gameSlug: string,
  month: string
): MonthlyTierData | null {
  const filePath = path.join(CONTENT_DIR, "tiers", gameSlug, `${month}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as MonthlyTierData;
  } catch {
    return null;
  }
}

export function getAvailableMonths(
  gameSlug: string,
  type: "codes" | "tiers"
): string[] {
  const dirPath = path.join(CONTENT_DIR, type, gameSlug);
  try {
    return fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd sites/gamecodekr && pnpm vitest run src/lib/__tests__/content.test.ts`
Expected: 5 tests PASS

- [ ] **Step 5: 커밋**

```bash
git add sites/gamecodekr/src/lib/content.ts sites/gamecodekr/src/lib/__tests__/content.test.ts
git commit -m "컨텐츠 로딩 유틸: JSON 파일 읽기 및 월 목록 조회"
```

---

## Task 6: shared-seo 패키지

**Files:**
- Create: `packages/shared-seo/package.json`
- Create: `packages/shared-seo/tsconfig.json`
- Create: `packages/shared-seo/src/index.ts`
- Create: `packages/shared-seo/src/config.ts`
- Create: `packages/shared-seo/src/metadata.ts`
- Create: `packages/shared-seo/src/jsonld.ts`
- Create: `packages/shared-seo/src/__tests__/metadata.test.ts`
- Create: `packages/shared-seo/src/__tests__/jsonld.test.ts`

- [ ] **Step 1: 패키지 설정 파일 생성**

`packages/shared-seo/package.json`:
```json
{
  "name": "@blog-manage/shared-seo",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^14.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

`packages/shared-seo/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: config.ts 작성**

```typescript
// packages/shared-seo/src/config.ts
export interface SiteConfig {
  siteName: string;
  baseUrl: string;
  defaultLocale: string;
  naverVerification?: string;
  googleVerification?: string;
}

export function createSiteConfig(overrides: Partial<SiteConfig> = {}): SiteConfig {
  return {
    siteName: overrides.siteName ?? "Blog",
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? overrides.baseUrl ?? "http://localhost:3000",
    defaultLocale: overrides.defaultLocale ?? "ko",
    naverVerification: overrides.naverVerification,
    googleVerification: overrides.googleVerification,
    ...overrides,
  };
}
```

- [ ] **Step 3: 메타데이터 테스트 작성**

```typescript
// packages/shared-seo/src/__tests__/metadata.test.ts
import { describe, it, expect } from "vitest";
import { generateMetadata } from "../metadata";
import type { SiteConfig } from "../config";

const testConfig: SiteConfig = {
  siteName: "TestSite",
  baseUrl: "https://test.pages.dev",
  defaultLocale: "ko",
};

describe("generateMetadata", () => {
  it("기본 메타데이터를 생성해야 한다", () => {
    const meta = generateMetadata(testConfig, {
      title: "테스트 페이지",
      description: "테스트 설명",
    });
    expect(meta.title).toBe("테스트 페이지 | TestSite");
    expect(meta.description).toBe("테스트 설명");
  });

  it("keywords를 포함해야 한다", () => {
    const meta = generateMetadata(testConfig, {
      title: "테스트",
      description: "설명",
      keywords: ["키워드1", "키워드2"],
    });
    expect(meta.keywords).toEqual(["키워드1", "키워드2"]);
  });

  it("Open Graph 데이터를 포함해야 한다", () => {
    const meta = generateMetadata(testConfig, {
      title: "테스트",
      description: "설명",
      path: "/blox-fruits/codes/2026-04",
    });
    expect(meta.openGraph?.title).toBe("테스트 | TestSite");
    expect(meta.openGraph?.url).toBe("https://test.pages.dev/blox-fruits/codes/2026-04");
  });

  it("canonical URL을 설정해야 한다", () => {
    const meta = generateMetadata(testConfig, {
      title: "테스트",
      description: "설명",
      path: "/some/path",
    });
    expect(meta.alternates?.canonical).toBe("https://test.pages.dev/some/path");
  });
});
```

- [ ] **Step 4: metadata.ts 구현**

```typescript
// packages/shared-seo/src/metadata.ts
import type { Metadata } from "next";
import type { SiteConfig } from "./config";

export interface MetadataInput {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  noIndex?: boolean;
}

export function generateMetadata(
  config: SiteConfig,
  input: MetadataInput
): Metadata {
  const fullTitle = `${input.title} | ${config.siteName}`;
  const canonicalUrl = input.path
    ? `${config.baseUrl}${input.path}`
    : config.baseUrl;

  return {
    title: fullTitle,
    description: input.description,
    keywords: input.keywords,
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: canonicalUrl,
      siteName: config.siteName,
      locale: config.defaultLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
    },
    other: {
      ...(config.naverVerification
        ? { "naver-site-verification": config.naverVerification }
        : {}),
    },
  };
}
```

- [ ] **Step 5: JSON-LD 테스트 작성**

```typescript
// packages/shared-seo/src/__tests__/jsonld.test.ts
import { describe, it, expect } from "vitest";
import { generateCodePageJsonLd, generateTierPageJsonLd } from "../jsonld";

describe("JSON-LD", () => {
  it("코드 페이지 JSON-LD를 생성해야 한다", () => {
    const jsonld = generateCodePageJsonLd({
      title: "블록스 프루츠 코드",
      description: "최신 코드 모음",
      url: "https://test.pages.dev/blox-fruits/codes/2026-04",
      dateModified: "2026-04-03T10:00:00Z",
      gameName: "블록스 프루츠",
    });
    expect(jsonld["@type"]).toBe("Article");
    expect(jsonld.headline).toBe("블록스 프루츠 코드");
    expect(jsonld.about.name).toBe("블록스 프루츠");
  });

  it("티어 페이지 JSON-LD를 생성해야 한다", () => {
    const jsonld = generateTierPageJsonLd({
      title: "블록스 프루츠 티어표",
      description: "열매 순위",
      url: "https://test.pages.dev/blox-fruits/tier/2026-04",
      dateModified: "2026-04-03T10:00:00Z",
      gameName: "블록스 프루츠",
      itemCount: 10,
    });
    expect(jsonld["@type"]).toBe("ItemList");
    expect(jsonld.numberOfItems).toBe(10);
  });
});
```

- [ ] **Step 6: jsonld.ts 구현**

```typescript
// packages/shared-seo/src/jsonld.ts

interface CodePageJsonLdInput {
  title: string;
  description: string;
  url: string;
  dateModified: string;
  gameName: string;
}

interface TierPageJsonLdInput {
  title: string;
  description: string;
  url: string;
  dateModified: string;
  gameName: string;
  itemCount: number;
}

export function generateCodePageJsonLd(input: CodePageJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article" as const,
    headline: input.title,
    description: input.description,
    url: input.url,
    dateModified: input.dateModified,
    inLanguage: "ko",
    about: {
      "@type": "VideoGame" as const,
      name: input.gameName,
    },
    publisher: {
      "@type": "Organization" as const,
      name: "GameCodeKR",
    },
  };
}

export function generateTierPageJsonLd(input: TierPageJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList" as const,
    name: input.title,
    description: input.description,
    url: input.url,
    numberOfItems: input.itemCount,
    dateModified: input.dateModified,
    inLanguage: "ko",
    about: {
      "@type": "VideoGame" as const,
      name: input.gameName,
    },
  };
}
```

- [ ] **Step 7: index.ts 엔트리 포인트**

```typescript
// packages/shared-seo/src/index.ts
export { createSiteConfig, type SiteConfig } from "./config";
export { generateMetadata, type MetadataInput } from "./metadata";
export { generateCodePageJsonLd, generateTierPageJsonLd } from "./jsonld";
```

- [ ] **Step 8: 테스트 통과 확인**

Run: `cd packages/shared-seo && pnpm install && pnpm test`
Expected: 6 tests PASS

- [ ] **Step 9: 커밋**

```bash
git add packages/shared-seo/
git commit -m "shared-seo 패키지: 메타데이터 생성, JSON-LD, 사이트 설정"
```

---

## Task 7: shared-ui 패키지

**Files:**
- Create: `packages/shared-ui/package.json`
- Create: `packages/shared-ui/tsconfig.json`
- Create: `packages/shared-ui/src/index.ts`
- Create: `packages/shared-ui/src/components/Layout.tsx`
- Create: `packages/shared-ui/src/components/Header.tsx`
- Create: `packages/shared-ui/src/components/Footer.tsx`
- Create: `packages/shared-ui/src/components/ArchiveBanner.tsx`
- Create: `packages/shared-ui/src/components/VerificationBadge.tsx`

UI/UX 세부 디자인은 전문 에이전트가 후속 진행. 여기서는 구조만 잡는다.

- [ ] **Step 1: 패키지 설정 파일 생성**

`packages/shared-ui/package.json`:
```json
{
  "name": "@blog-manage/shared-ui",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0"
  }
}
```

`packages/shared-ui/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Header 컴포넌트 (구조 스켈레톤)**

```tsx
// packages/shared-ui/src/components/Header.tsx
import React from "react";

interface HeaderProps {
  siteName: string;
  navigation?: { label: string; href: string }[];
}

export function Header({ siteName, navigation = [] }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold">
          {siteName}
        </a>
        {navigation.length > 0 && (
          <nav className="flex gap-4">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} className="text-gray-600 hover:text-gray-900">
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Footer 컴포넌트**

```tsx
// packages/shared-ui/src/components/Footer.tsx
import React from "react";

interface FooterProps {
  siteName: string;
}

export function Footer({ siteName }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        <p className="mt-1">이 사이트는 로블록스(Roblox)와 공식적인 관련이 없습니다.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Layout 컴포넌트**

```tsx
// packages/shared-ui/src/components/Layout.tsx
import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  siteName: string;
  navigation?: { label: string; href: string }[];
  children: React.ReactNode;
}

export function Layout({ siteName, navigation, children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={siteName} navigation={navigation} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
      <Footer siteName={siteName} />
    </div>
  );
}
```

- [ ] **Step 5: ArchiveBanner 컴포넌트**

```tsx
// packages/shared-ui/src/components/ArchiveBanner.tsx
import React from "react";

interface ArchiveBannerProps {
  currentMonthUrl: string;
  archiveMonth: string; // "2026년 3월" 형태
}

export function ArchiveBanner({ currentMonthUrl, archiveMonth }: ArchiveBannerProps) {
  return (
    <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm">
      <p>
        📢 이 페이지는 <strong>{archiveMonth}</strong> 아카이브입니다.{" "}
        <a href={currentMonthUrl} className="text-blue-600 underline font-medium">
          최신 페이지 보기 →
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 6: VerificationBadge 컴포넌트**

```tsx
// packages/shared-ui/src/components/VerificationBadge.tsx
import React from "react";

interface VerificationBadgeProps {
  level: 1 | 2 | 3;
}

export function VerificationBadge({ level }: VerificationBadgeProps) {
  if (level === 3) {
    return <span title="3개 소스에서 확인됨">✅✅✅</span>;
  }
  if (level === 2) {
    return <span title="2개 소스에서 확인됨">✅✅</span>;
  }
  return <span title="미확인 - 1개 소스만 확인">⚠️</span>;
}
```

- [ ] **Step 7: index.ts 엔트리 포인트**

```typescript
// packages/shared-ui/src/index.ts
export { Layout } from "./components/Layout";
export { Header } from "./components/Header";
export { Footer } from "./components/Footer";
export { ArchiveBanner } from "./components/ArchiveBanner";
export { VerificationBadge } from "./components/VerificationBadge";
```

- [ ] **Step 8: 커밋**

```bash
git add packages/shared-ui/
git commit -m "shared-ui 패키지: Layout, Header, Footer, ArchiveBanner, VerificationBadge"
```

---

## Task 8: shared-adsense 패키지

**Files:**
- Create: `packages/shared-adsense/package.json`
- Create: `packages/shared-adsense/tsconfig.json`
- Create: `packages/shared-adsense/src/index.ts`
- Create: `packages/shared-adsense/src/config.ts`
- Create: `packages/shared-adsense/src/components/AdBanner.tsx`
- Create: `packages/shared-adsense/src/components/AdInArticle.tsx`

- [ ] **Step 1: 패키지 설정 파일 생성**

`packages/shared-adsense/package.json`:
```json
{
  "name": "@blog-manage/shared-adsense",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0"
  }
}
```

`packages/shared-adsense/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: config.ts**

```typescript
// packages/shared-adsense/src/config.ts
export interface AdsenseConfig {
  enabled: boolean;
  publisherId: string;
}

export function getAdsenseConfig(): AdsenseConfig {
  return {
    enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true",
    publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ?? "",
  };
}
```

- [ ] **Step 3: AdBanner 컴포넌트**

```tsx
// packages/shared-adsense/src/components/AdBanner.tsx
"use client";
import React from "react";
import { getAdsenseConfig } from "../config";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical";
  className?: string;
}

export function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  const config = getAdsenseConfig();

  if (!config.enabled) {
    return <div className={`ad-placeholder ${className}`} />;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={config.publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
```

- [ ] **Step 4: AdInArticle 컴포넌트**

```tsx
// packages/shared-adsense/src/components/AdInArticle.tsx
"use client";
import React from "react";
import { getAdsenseConfig } from "../config";

interface AdInArticleProps {
  slot: string;
  className?: string;
}

export function AdInArticle({ slot, className = "" }: AdInArticleProps) {
  const config = getAdsenseConfig();

  if (!config.enabled) {
    return <div className={`ad-placeholder-inline ${className}`} />;
  }

  return (
    <div className={`my-6 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client={config.publisherId}
        data-ad-slot={slot}
        data-ad-layout="in-article"
        data-ad-format="fluid"
      />
    </div>
  );
}
```

- [ ] **Step 5: index.ts**

```typescript
// packages/shared-adsense/src/index.ts
export { getAdsenseConfig, type AdsenseConfig } from "./config";
export { AdBanner } from "./components/AdBanner";
export { AdInArticle } from "./components/AdInArticle";
```

- [ ] **Step 6: 커밋**

```bash
git add packages/shared-adsense/
git commit -m "shared-adsense 패키지: AdBanner, AdInArticle (비활성 상태)"
```

---

## Task 9: GameCodeKR Next.js 앱 초기화

**Files:**
- Create: `sites/gamecodekr/package.json`
- Create: `sites/gamecodekr/tsconfig.json`
- Create: `sites/gamecodekr/next.config.ts`
- Create: `sites/gamecodekr/tailwind.config.ts`
- Create: `sites/gamecodekr/postcss.config.js`
- Create: `sites/gamecodekr/src/app/globals.css`
- Create: `sites/gamecodekr/src/app/layout.tsx`

- [ ] **Step 1: package.json**

```json
{
  "name": "gamecodekr",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@blog-manage/shared-seo": "workspace:*",
    "@blog-manage/shared-ui": "workspace:*",
    "@blog-manage/shared-adsense": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "vitest": "^1.0.0"
  }
}
```

- [ ] **Step 2: tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@blog-manage/shared-seo": ["../../packages/shared-seo/src"],
      "@blog-manage/shared-ui": ["../../packages/shared-ui/src"],
      "@blog-manage/shared-adsense": ["../../packages/shared-adsense/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: next.config.ts (Static Export for Cloudflare Pages)**

```typescript
// sites/gamecodekr/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Cloudflare Pages에서는 Next.js Image Optimization 미지원
  },
  transpilePackages: [
    "@blog-manage/shared-seo",
    "@blog-manage/shared-ui",
    "@blog-manage/shared-adsense",
  ],
};

export default nextConfig;
```

- [ ] **Step 4: TailwindCSS 설정**

`sites/gamecodekr/tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/shared-ui/src/**/*.{ts,tsx}",
    "../../packages/shared-adsense/src/**/*.{ts,tsx}",
  ],
};

export default config;
```

`sites/gamecodekr/postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

`sites/gamecodekr/src/app/globals.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 5: 루트 레이아웃**

```tsx
// sites/gamecodekr/src/app/layout.tsx
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
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: pnpm install 실행**

Run: `cd /project-root && pnpm install`
Expected: 모든 워크스페이스 패키지 설치 완료

- [ ] **Step 7: 커밋**

```bash
git add sites/gamecodekr/package.json sites/gamecodekr/tsconfig.json sites/gamecodekr/next.config.ts sites/gamecodekr/tailwind.config.ts sites/gamecodekr/postcss.config.js sites/gamecodekr/src/app/globals.css sites/gamecodekr/src/app/layout.tsx pnpm-lock.yaml
git commit -m "GameCodeKR Next.js 앱 초기화: Static Export + TailwindCSS 설정"
```

---

## Task 10: 홈 페이지 + GameCard 컴포넌트

**Files:**
- Create: `sites/gamecodekr/src/components/GameCard.tsx`
- Create: `sites/gamecodekr/src/app/page.tsx`

- [ ] **Step 1: GameCard 컴포넌트**

```tsx
// sites/gamecodekr/src/components/GameCard.tsx
import type { GameConfig } from "@/lib/types";

interface GameCardProps {
  game: GameConfig;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <a
      href={`/${game.slug}`}
      className="block rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{game.icon}</span>
        <div>
          <h2 className="font-bold text-lg">{game.title}</h2>
          <p className="text-sm text-gray-500">{game.titleEn}</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{game.description}</p>
      <div className="mt-3 flex gap-2">
        {game.hasCode && (
          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">코드</span>
        )}
        {game.hasTier && (
          <span className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">티어표</span>
        )}
      </div>
    </a>
  );
}
```

- [ ] **Step 2: 홈 페이지**

```tsx
// sites/gamecodekr/src/app/page.tsx
import { GAMES } from "@/lib/games";
import { GameCard } from "@/components/GameCard";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold">GameCodeKR</h1>
        <p className="mt-2 text-gray-600">
          로블록스 게임 코드 & 티어표를 매일 업데이트! 핵심만 쏙쏙 정리했어요 🎮
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">게임 목록</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {GAMES.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: 빌드 테스트**

Run: `cd sites/gamecodekr && pnpm build`
Expected: Static export 성공, `out/` 디렉토리 생성

- [ ] **Step 4: 커밋**

```bash
git add sites/gamecodekr/src/components/GameCard.tsx sites/gamecodekr/src/app/page.tsx
git commit -m "홈 페이지: 게임 목록 카드 그리드"
```

---

## Task 11: 게임 허브 페이지

**Files:**
- Create: `sites/gamecodekr/src/app/[game]/page.tsx`

- [ ] **Step 1: 게임 허브 페이지**

```tsx
// sites/gamecodekr/src/app/[game]/page.tsx
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
    description: `${game.title}(${game.titleEn}) 최신 코드, 티어표, 패치 요약을 매일 업데이트합니다.`,
  };
}

export default function GameHubPage({ params }: { params: { game: string } }) {
  const game = getGameBySlug(params.game);
  if (!game) notFound();

  const codeMonths = getAvailableMonths(game.slug, "codes");
  const tierMonths = getAvailableMonths(game.slug, "tiers");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <span className="text-4xl">{game.icon}</span>
        <h1 className="mt-2 text-3xl font-bold">{game.title}</h1>
        <p className="text-gray-500">{game.titleEn}</p>
        <p className="mt-2 text-gray-600">{game.description}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {game.hasCode && (
          <section className="rounded-lg border border-gray-200 p-4">
            <h2 className="mb-3 text-lg font-bold">📋 게임 코드</h2>
            {codeMonths.length > 0 ? (
              <ul className="space-y-2">
                {codeMonths.map((month) => (
                  <li key={month}>
                    <a
                      href={`/${game.slug}/codes/${month}`}
                      className="text-blue-600 hover:underline"
                    >
                      {formatMonth(month)} 코드 총정리
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">아직 코드가 없어요</p>
            )}
          </section>
        )}

        {game.hasTier && (
          <section className="rounded-lg border border-gray-200 p-4">
            <h2 className="mb-3 text-lg font-bold">🏆 티어표</h2>
            {tierMonths.length > 0 ? (
              <ul className="space-y-2">
                {tierMonths.map((month) => (
                  <li key={month}>
                    <a
                      href={`/${game.slug}/tier/${month}`}
                      className="text-blue-600 hover:underline"
                    >
                      {formatMonth(month)} 티어표
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">아직 티어표가 없어요</p>
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

- [ ] **Step 2: 커밋**

```bash
git add sites/gamecodekr/src/app/\\[game\\]/page.tsx
git commit -m "게임 허브 페이지: 코드/티어 월별 목록"
```

---

## Task 12: 월단위 코드 페이지 + CodeTable + RewardAnalysis

**Files:**
- Create: `sites/gamecodekr/src/components/CodeTable.tsx`
- Create: `sites/gamecodekr/src/components/RewardAnalysis.tsx`
- Create: `sites/gamecodekr/src/app/[game]/codes/[month]/page.tsx`
- Create: `sites/gamecodekr/src/app/[game]/codes/page.tsx`

- [ ] **Step 1: RewardAnalysis 컴포넌트**

```tsx
// sites/gamecodekr/src/components/RewardAnalysis.tsx
interface RewardAnalysisProps {
  analysis: string;
}

export function RewardAnalysis({ analysis }: RewardAnalysisProps) {
  return (
    <div className="mt-1 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
      💡 <strong>가치 분석:</strong> {analysis}
    </div>
  );
}
```

- [ ] **Step 2: CodeTable 컴포넌트**

```tsx
// sites/gamecodekr/src/components/CodeTable.tsx
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
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="space-y-4">
        {codes.map((code) => (
          <div
            key={code.code}
            className={`rounded-lg border p-4 ${
              showExpired
                ? "border-gray-200 bg-gray-50 opacity-60"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <code className="rounded bg-gray-100 px-3 py-1 font-mono text-lg font-bold">
                {code.code}
              </code>
              <VerificationBadge level={code.verified} />
            </div>
            <p className="mt-2 text-gray-700">
              🎁 <strong>보상:</strong> {code.reward}
            </p>
            {code.rewardAnalysis && !showExpired && (
              <RewardAnalysis analysis={code.rewardAnalysis} />
            )}
            <p className="mt-2 text-xs text-gray-400">
              추가일: {code.addedDate}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: 코드 리다이렉트 페이지**

```tsx
// sites/gamecodekr/src/app/[game]/codes/page.tsx
import { redirect } from "next/navigation";
import { getAllGameSlugs } from "@/lib/games";
import { getCurrentMonth } from "@/lib/content";

export function generateStaticParams() {
  return getAllGameSlugs().map((game) => ({ game }));
}

export default function CodesRedirect({ params }: { params: { game: string } }) {
  redirect(`/${params.game}/codes/${getCurrentMonth()}`);
}
```

- [ ] **Step 4: 월단위 코드 페이지**

```tsx
// sites/gamecodekr/src/app/[game]/codes/[month]/page.tsx
import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getMonthlyCodeData, getAvailableMonths, getCurrentMonth } from "@/lib/content";
import { generateMetadata as genMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { ArchiveBanner } from "@blog-manage/shared-ui";
import { CodeTable } from "@/components/CodeTable";

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

export function generateMetadata({ params }: { params: { game: string; month: string } }) {
  const data = getMonthlyCodeData(params.game, params.month);
  if (!data) return {};
  return genMeta(siteConfig, {
    title: data.meta.title,
    description: data.meta.description,
    keywords: data.meta.keywords,
    path: `/${params.game}/codes/${params.month}`,
  });
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      {isArchive && (
        <ArchiveBanner
          currentMonthUrl={`/${game.slug}/codes/${currentMonth}`}
          archiveMonth={monthLabel}
        />
      )}

      <h1 className="text-3xl font-bold">
        {game.icon} {game.title} 코드 총정리 ({monthLabel})
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        마지막 업데이트: {new Date(data.lastUpdated).toLocaleDateString("ko-KR")}
      </p>

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
  );
}
```

- [ ] **Step 5: 빌드 테스트**

Run: `cd sites/gamecodekr && pnpm build`
Expected: 코드 페이지들이 정적 생성됨

- [ ] **Step 6: 커밋**

```bash
git add sites/gamecodekr/src/components/CodeTable.tsx sites/gamecodekr/src/components/RewardAnalysis.tsx sites/gamecodekr/src/app/\\[game\\]/codes/
git commit -m "월단위 코드 페이지: CodeTable, RewardAnalysis, 리다이렉트"
```

---

## Task 13: 월단위 티어 페이지 + TierList

**Files:**
- Create: `sites/gamecodekr/src/components/TierList.tsx`
- Create: `sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx`
- Create: `sites/gamecodekr/src/app/[game]/tier/page.tsx`

- [ ] **Step 1: TierList 컴포넌트**

```tsx
// sites/gamecodekr/src/components/TierList.tsx
import type { TierItem, TierRank } from "@/lib/types";

interface TierListProps {
  tiers: Record<TierRank, TierItem[]>;
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
```

- [ ] **Step 2: 티어 리다이렉트 페이지**

```tsx
// sites/gamecodekr/src/app/[game]/tier/page.tsx
import { redirect } from "next/navigation";
import { getAllGameSlugs } from "@/lib/games";
import { getCurrentMonth } from "@/lib/content";

export function generateStaticParams() {
  return getAllGameSlugs()
    .filter((slug) => {
      // hasTier가 true인 게임만
      const { GAMES } = require("@/lib/games");
      return GAMES.find((g: any) => g.slug === slug)?.hasTier;
    })
    .map((game) => ({ game }));
}

export default function TierRedirect({ params }: { params: { game: string } }) {
  redirect(`/${params.game}/tier/${getCurrentMonth()}`);
}
```

- [ ] **Step 3: 월단위 티어 페이지**

```tsx
// sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx
import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getMonthlyTierData, getAvailableMonths, getCurrentMonth } from "@/lib/content";
import { generateMetadata as genMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { ArchiveBanner } from "@blog-manage/shared-ui";
import { TierList } from "@/components/TierList";

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

export function generateMetadata({ params }: { params: { game: string; month: string } }) {
  const data = getMonthlyTierData(params.game, params.month);
  if (!data) return {};
  return genMeta(siteConfig, {
    title: data.meta.title,
    description: data.meta.description,
    keywords: data.meta.keywords,
    path: `/${params.game}/tier/${params.month}`,
  });
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      {isArchive && (
        <ArchiveBanner
          currentMonthUrl={`/${game.slug}/tier/${currentMonth}`}
          archiveMonth={monthLabel}
        />
      )}

      <h1 className="text-3xl font-bold">
        {game.icon} {game.title} {data.category} 티어표 ({monthLabel})
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        마지막 업데이트: {new Date(data.lastUpdated).toLocaleDateString("ko-KR")} · 총 {totalItems}개 항목
      </p>

      <div className="mt-6">
        <TierList tiers={data.tiers} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 빌드 테스트**

Run: `cd sites/gamecodekr && pnpm build`
Expected: 티어 페이지들이 정적 생성됨

- [ ] **Step 5: 커밋**

```bash
git add sites/gamecodekr/src/components/TierList.tsx sites/gamecodekr/src/app/\\[game\\]/tier/
git commit -m "월단위 티어 페이지: TierList 컴포넌트, 리다이렉트"
```

---

## Task 14: SEO - sitemap.xml, robots.txt

**Files:**
- Create: `sites/gamecodekr/src/app/sitemap.ts`
- Create: `sites/gamecodekr/src/app/robots.ts`

- [ ] **Step 1: sitemap.ts**

```typescript
// sites/gamecodekr/src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllGameSlugs, getGameBySlug } from "@/lib/games";
import { getAvailableMonths } from "@/lib/content";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  for (const slug of getAllGameSlugs()) {
    const game = getGameBySlug(slug)!;

    // 게임 허브
    entries.push({
      url: `${BASE_URL}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    // 코드 페이지
    if (game.hasCode) {
      for (const month of getAvailableMonths(slug, "codes")) {
        entries.push({
          url: `${BASE_URL}/${slug}/codes/${month}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.9,
        });
      }
    }

    // 티어 페이지
    if (game.hasTier) {
      for (const month of getAvailableMonths(slug, "tiers")) {
        entries.push({
          url: `${BASE_URL}/${slug}/tier/${month}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
```

- [ ] **Step 2: robots.ts**

```typescript
// sites/gamecodekr/src/app/robots.ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: 빌드 테스트**

Run: `cd sites/gamecodekr && pnpm build`
Expected: `out/sitemap.xml`과 `out/robots.txt`가 생성됨

- [ ] **Step 4: 커밋**

```bash
git add sites/gamecodekr/src/app/sitemap.ts sites/gamecodekr/src/app/robots.ts
git commit -m "SEO: sitemap.xml, robots.txt 자동 생성"
```

---

## Task 15: Cloudflare Pages 배포 설정

**Files:**
- Create: `sites/gamecodekr/wrangler.toml` (선택사항 - CF Pages는 대시보드 설정으로도 가능)
- Modify: `.gitignore`

- [ ] **Step 1: .gitignore에 빌드 결과물 추가 확인**

`.gitignore`에 이미 `out/`, `.next/` 가 포함되어 있는지 확인. 없으면 추가:

```
# 기존 내용에 추가
.wrangler/
.dev.vars
```

- [ ] **Step 2: Cloudflare Pages 배포 가이드 문서 작성**

`docs/guides/cloudflare-pages-setup.md`:
```markdown
# Cloudflare Pages 배포 가이드

## 사전 준비
1. Cloudflare 계정 생성 (https://dash.cloudflare.com)
2. GitHub 저장소에 코드 push

## Cloudflare Pages 프로젝트 생성

1. Cloudflare 대시보드 → Workers & Pages → Create
2. Pages 탭 → Connect to Git
3. GitHub 저장소 선택: `blog-manage`

## 빌드 설정

| 항목 | 값 |
|---|---|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `cd sites/gamecodekr && pnpm install && pnpm build` |
| Build output directory | `sites/gamecodekr/out` |
| Root directory | `/` |
| Node.js version | 18 |

## 환경 변수

| 변수 | 값 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://gamecodekr.pages.dev` | 사이트 기본 URL |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | `false` | 애드센스 비활성화 |

## 커스텀 도메인 추가 (추후)

1. Pages 프로젝트 → Custom Domains
2. 도메인 입력 → DNS 설정 자동 추가
3. 환경변수 `NEXT_PUBLIC_SITE_URL`을 새 도메인으로 변경
4. 재배포

## 배포 확인

- 배포 URL: `https://gamecodekr.pages.dev`
- 빌드 로그: Cloudflare 대시보드 → Deployments
```

- [ ] **Step 3: 커밋**

```bash
git add .gitignore docs/guides/cloudflare-pages-setup.md
git commit -m "Cloudflare Pages 배포 가이드 문서 추가"
```

---

## Task 16: 전체 빌드 검증 및 최종 커밋

- [ ] **Step 1: pnpm install (전체)**

Run: `pnpm install`
Expected: 모든 워크스페이스 패키지 설치 완료

- [ ] **Step 2: 테스트 실행**

Run: `pnpm test`
Expected: shared-seo 테스트 + gamecodekr 테스트 모두 PASS

- [ ] **Step 3: 빌드 실행**

Run: `pnpm build`
Expected: `sites/gamecodekr/out/` 에 정적 파일 생성
- `out/index.html` (홈)
- `out/blox-fruits/index.html` (게임 허브)
- `out/blox-fruits/codes/2026-04/index.html` (코드 페이지)
- `out/blox-fruits/tier/2026-04/index.html` (티어 페이지)
- `out/sitemap.xml`
- `out/robots.txt`

- [ ] **Step 4: 로컬 미리보기**

Run: `cd sites/gamecodekr && npx serve out`
Expected: http://localhost:3000 에서 사이트 확인 가능

- [ ] **Step 5: 최종 상태 확인 및 커밋 (필요시)**

```bash
git status
# 누락된 파일이 있으면 추가
git add -A
git commit -m "Phase 1 완료: GameCodeKR 사이트 기반 구축"
```

---

## 다음 단계

Phase 1 완료 후:

- **Phase 2**: 데이터 수집 파이프라인 마이그레이션
  - 기존 `GameCodeKR/` 프로젝트의 수집 스크립트를 `pipelines/gamecodekr/`로 이전
  - Blogger 게시 → Git push 변환
  - 로컬 launchd 스케줄러 설정
  - GitHub Actions 워크플로우 작성

- **Phase 3**: 에이전트 시스템 + 문서 + 운영 체계
  - 게임별 전문 블로거 페르소나 작성
  - 마케팅 어드바이저 에이전트
  - 컨텐츠 리뷰어 에이전트
  - 운영 플레이북 (게임 추가, 사이트 추가, 월초 전환)
  - 컨텐츠 템플릿 양식
