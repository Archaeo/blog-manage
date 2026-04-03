# Phase 4: 블로그 컨텐츠 시스템 설계

**작성일:** 2026-04-03
**상태:** 승인 대기

## 개요

GameCodeKR 사이트에 블로그 스타일 컨텐츠를 도입한다. 현재 코드 목록과 티어표만 있는 단조로운 구조에서, 분석·인사이트·가이드가 포함된 전문 블로그로 전환한다.

**3가지 축:**
1. **기존 페이지 강화** — 코드/티어 페이지에 도입글, 가치 분석, 꿀팁 삽입
2. **블로그 글 인프라** — MDX 기반 독립 블로그 글 (패치 요약, 초보자 가이드 등)
3. **티어표 리디자인** — 블로거 스타일 등급 행 + 이미지 가로 나열

**신뢰성 원칙:** 파이프라인에서 검증된 데이터만 사용. 확인되지 않은 정보 작성 금지. 추측성 문구("~일 것 같다", "아마") 배제.

## 1. 기존 페이지 컨텐츠 강화

### 코드 페이지 강화

MonthlyCodeData JSON에 에디토리얼 필드 추가:

```typescript
export interface MonthlyCodeData {
  // ... 기존 필드 유지
  editorial?: {
    summary: string;       // 도입글: 이번 달 요약, 새 코드 개수, 총 보상 가치
    tips: string;          // 꿀팁: 코드 사용 추천 순서, 조합 팁
    totalValue: string;    // 총 보상 가치 (예: "약 450 Robux 상당")
  };
}
```

각 GameCode의 `rewardAnalysis` 필드는 이미 존재하며, 에이전트가 코드별 가치 분석을 채운다.

**코드 페이지 렌더링 구조:**
```
<PageHeader>              ← 게임 이미지 + 제목
<EditorialSummary>        ← 도입글 (editorial.summary)
<CodeSection title="✅ 사용 가능한 코드">
  <CodeCard>              ← 코드 + 보상 + rewardAnalysis(가치 분석)
  ...
</CodeSection>
<CodeSection title="⚠️ 확인 중인 코드">
<CodeSection title="❌ 만료된 코드">
<TipsBox>                 ← 꿀팁 (editorial.tips)
```

### 티어 페이지 강화

MonthlyTierData JSON에 에디토리얼 필드 추가:

```typescript
export interface MonthlyTierData {
  // ... 기존 필드 유지
  editorial?: {
    summary: string;       // 도입글: 이번 달 메타 변화, 주요 순위 변동
    recommendation: string; // 초보자 추천 + 이유
  };
}
```

**티어 페이지 렌더링 구조:**
```
<PageHeader>              ← 게임 이미지 + 제목
<EditorialSummary>        ← 도입글 (editorial.summary)
<TierTable>               ← 블로거 스타일 티어표 (섹션 3 참조)
<RecommendationBox>       ← 초보자 추천 (editorial.recommendation)
```

## 2. 블로그 글 인프라

### 글 유형

| 유형 | type 값 | 설명 | 생성 방식 |
|---|---|---|---|
| 코드 분석 | `code-analysis` | 코드 보상 심층 분석, 가치 비교 | 데이터 기반 자동 |
| 티어 분석 | `tier-analysis` | 티어 변동 분석, 메타 가이드 | 데이터 기반 자동 |
| 패치 요약 | `patch` | 업데이트 변경사항 쉬운 설명 | 수동 요청 |
| 초보자 가이드 | `guide` | 게임 입문 가이드, 뉴비 팁 | 수동 요청 |

### MDX 포맷

파일 위치: `sites/gamecodekr/content/posts/[game-slug]/[slug].mdx`

```mdx
---
title: "블록스 프루츠 2026년 4월 코드 보상 가치 분석"
date: "2026-04-03"
game: "blox-fruits"
type: "code-analysis"
tags: ["코드", "보상 분석", "블록스 프루츠"]
description: "이번 달 블록스 프루츠 코드 보상의 게임 내 가치를 분석합니다."
---

## 이번 달 코드 총 가치

이번 달 블록스 프루츠에서 새로 나온 코드 3개의 보상을 합치면 ...

## 코드별 상세 분석

### SUB2GAMERROBOT — 경험치 2배 부스트

...

## 한줄 요약

> 이번 달 코드는 총 450 Robux 상당! 레벨업 중이라면 경험치 부스트 코드를 꼭 쓰세요.
```

### 의존성

- `gray-matter`: frontmatter 파싱
- `next-mdx-remote`: MDX 렌더링 (Static Export 호환)

### 라우트 구조

| 경로 | 페이지 | 설명 |
|---|---|---|
| `/[game]/posts` | PostListPage | 게임별 글 목록 |
| `/[game]/posts/[slug]` | PostDetailPage | 개별 글 페이지 |

### 타입 정의

```typescript
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  game: string;
  type: "code-analysis" | "tier-analysis" | "patch" | "guide";
  tags: string[];
  description: string;
  content: string;  // MDX 문자열
}
```

### 데이터 로딩

`sites/gamecodekr/src/lib/posts.ts`:

- `getAllPosts()`: 모든 글 목록 (frontmatter만)
- `getPostsByGame(gameSlug)`: 게임별 글 목록
- `getPost(gameSlug, slug)`: 개별 글 (frontmatter + content)
- `getAllPostSlugs()`: Static Export용 경로 생성

빌드 시 `content/posts/` 디렉토리를 스캔하여 MDX 파일을 파싱한다. `gray-matter`로 frontmatter를 추출하고, `next-mdx-remote/rsc`의 `compileMDX`로 렌더링한다.

### 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|---|---|---|
| `PostCard` | `components/PostCard.tsx` | 글 목록의 카드 (제목, 날짜, 유형 뱃지, 설명) |
| `PostContent` | `components/PostContent.tsx` | MDX 렌더링 래퍼 (스타일링) |
| `PostTypeBadge` | `components/PostTypeBadge.tsx` | 유형별 컬러 뱃지 |
| `EditorialSummary` | `components/EditorialSummary.tsx` | 코드/티어 페이지 도입글 박스 |
| `TipsBox` | `components/TipsBox.tsx` | 꿀팁 박스 (초록 배경) |

### 사이드바 변경

게임 서브메뉴에 "✍️ 글" 항목 추가 → `/[game]/posts` 링크.
해당 게임에 글이 없으면 표시하지 않음 (GameConfig에 `hasPost` 필드 추가 또는 빌드 시 동적 체크).

## 3. 티어표 리디자인

### 현재 → 변경

- 현재: 카드 그리드 (`grid-cols-2`, 아이템별 카드)
- 변경: 블로거 스타일 등급 행 (좌측 등급 라벨 + 우측 아이템 이미지 가로 나열)

### 등급 행 구조

```
<TierRow>
  <TierLabel>              ← 48px 너비, 등급 그라디언트 배경, 큰 글자
  <ItemGrid>               ← flex-wrap, 등급별 파스텔 배경
    <TierItemBadge>        ← 56px 너비, 이미지(40×40) + 이름 + 신뢰뱃지
    <TierItemBadge>
    ...
</TierRow>
```

### 아이템 뱃지 구조

```
<TierItemBadge>
  <ItemImage>              ← 40×40px, border-radius: 8px, 흰색 보더 + 그림자
                              이미지 없으면: 등급 컬러 그라디언트 + 이름 이니셜
  <ItemName>               ← 9px, 중앙 정렬, max-width: 54px, ellipsis
  <TrustBadge>             ← 🟢 3소스, 🔵 2소스, ⚠️ 미확인
  <ChangeIcon>             ← 🔺 상승, 🔻 하락, 🆕 신규 (해당 시에만)
```

### 등급별 색상

| 등급 | 라벨 그라디언트 | 행 배경 | 보더 |
|---|---|---|---|
| S+ | `#ef4444 → #dc2626` | `#fff1f0` | `#fecaca` |
| S | `#f97316 → #ea580c` | `#fff7e6` | `#fed7aa` |
| A | `#eab308 → #ca8a04` | `#fffbe6` | `#fde68a` |
| B | `#22c55e → #16a34a` | `#f0fdf4` | `#bbf7d0` |
| C | `#3b82f6 → #2563eb` | `#e6f4ff` | `#bfdbfe` |
| D | `#6b7280 → #4b5563` | `#f5f5f5` | `#d1d5db` |

### 이미지 폴백

이미지가 없는 아이템: 등급 컬러 그라디언트 배경 + 이름 첫 글자 (영문 대문자).
onError 시에도 동일한 폴백 적용.

### 신뢰 뱃지

| 아이콘 | 조건 | 의미 |
|---|---|---|
| 🟢 (6px 초록 원) | consensus && sources ≥ 3 | 3개 이상 소스 일치 |
| 🔵 (6px 파란 원) | consensus && sources == 2 | 2개 소스 일치 |
| ⚠️ (작은 경고) | !consensus | 소스 간 의견 불일치 |

현재 티어 데이터에 신뢰 정보가 없으므로, TierItem 타입에 선택적 필드를 추가한다:

```typescript
export interface TierItem {
  // ... 기존 필드
  imageUrl?: string;
  consensus?: boolean;   // 추가: 소스 간 일치 여부
  sources?: number;      // 추가: 검증 소스 수
}
```

파이프라인에서 이 필드를 채운다.

## 4. 에이전트 컨텐츠 생성

### 생성 스크립트

`scripts/generate-blog-content.py`:

1. 코드 JSON 읽기 → 코드 분석 MDX 생성 + editorial 필드 채우기
2. 티어 JSON 읽기 → 티어 분석 MDX 생성 + editorial 필드 채우기
3. `content-reviewer` 에이전트로 품질 검수

### 에이전트 프롬프트 업데이트

기존 `game-blogger.md`와 게임별 에이전트에 블로그 글 생성 지침 추가:

- 코드 분석: 각 보상의 Robux 환산 가치, 사용 순서 추천
- 티어 분석: 순위 변동 이유, 초보자 추천, 조합 팁
- 패치 요약: 변경사항의 실전 영향, 메타 변화
- 가이드: 단계별 설명, 초보자 실수, 효율적 루트

### 신뢰성 규칙

1. 파이프라인에서 `verified >= 2` (2소스 이상 확인)된 코드만 "확인된 코드"로 표기
2. `consensus == true`인 티어 아이템만 순위 확정으로 표기
3. 미확인 정보는 "아직 확인 중이에요" 문구 사용
4. "~일 것 같다", "아마", "추정" 등 추측성 문구 금지
5. 커뮤니티 의견 인용 시 "~라는 의견이 많아요" 형태로만

## 5. 파일 변경 요약

### 새로 생성

| 파일 | 역할 |
|---|---|
| `sites/gamecodekr/src/lib/posts.ts` | 블로그 글 로딩 유틸 |
| `sites/gamecodekr/src/components/PostCard.tsx` | 글 목록 카드 |
| `sites/gamecodekr/src/components/PostContent.tsx` | MDX 렌더링 래퍼 |
| `sites/gamecodekr/src/components/PostTypeBadge.tsx` | 유형 뱃지 |
| `sites/gamecodekr/src/components/EditorialSummary.tsx` | 도입글 박스 |
| `sites/gamecodekr/src/components/TipsBox.tsx` | 꿀팁 박스 |
| `sites/gamecodekr/src/app/[game]/posts/page.tsx` | 글 목록 페이지 |
| `sites/gamecodekr/src/app/[game]/posts/[slug]/page.tsx` | 글 상세 페이지 |
| `sites/gamecodekr/content/posts/` | MDX 글 저장 디렉토리 |
| `scripts/generate-blog-content.py` | 블로그 컨텐츠 생성 스크립트 |

### 수정

| 파일 | 변경 |
|---|---|
| `sites/gamecodekr/src/lib/types.ts` | `BlogPost` 타입, `MonthlyCodeData.editorial`, `MonthlyTierData.editorial`, `TierItem.consensus/sources` 추가 |
| `sites/gamecodekr/src/components/TierList.tsx` | 카드 그리드 → 블로거 스타일 등급 행 |
| `sites/gamecodekr/src/components/CodeTable.tsx` | rewardAnalysis 스타일 강화 |
| `sites/gamecodekr/src/app/[game]/codes/[month]/page.tsx` | EditorialSummary + TipsBox 추가 |
| `sites/gamecodekr/src/app/[game]/tier/[month]/page.tsx` | EditorialSummary + RecommendationBox 추가 |
| `sites/gamecodekr/src/components/Sidebar.tsx` | "✍️ 글" 서브메뉴 추가 |
| `sites/gamecodekr/package.json` | gray-matter, next-mdx-remote 의존성 추가 |
| `pipelines/gamecodekr/generate_content.py` | editorial 필드, consensus/sources 필드 출력 |
| `pipelines/gamecodekr/validate_tiers.py` | consensus/sources 정보 포함 |

## 6. 범위 외

- 댓글 시스템
- 글 검색
- RSS 피드
- 태그별 필터링 (추후)
- 글 에디터 UI (에이전트가 MDX 직접 생성)
