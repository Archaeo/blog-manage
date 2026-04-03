# 티어표 개선 설계 (Tier Enhancement)

## 목표

GameCodeKR 티어표 페이지를 기존 블로거 사이트 수준으로 개선한다. 아이템 이미지, 멀티 카테고리 탭, 등급별 요약, 소스 종합 분석문을 추가하여 콘텐츠 품질과 사용자 경험을 높인다.

## 현재 상태 → 목표

| 항목 | 현재 | 개선 후 |
|------|------|---------|
| 아이템 표시 | 이니셜 fallback (40x40 정사각형) | 칩/뱃지형: 원형 이미지(26px) + 이름 한 줄 |
| 카테고리 | 게임당 1개 | 멀티 카테고리 탭 (blox-fruits: 열매/검/격투) |
| 분석 글 | 별도 블로그 포스트 | 등급별 요약 + 종합 분석문이 티어 페이지 내에 통합 |
| 이미지 | 없음 | 파이프라인이 소스 사이트에서 수집 |
| 아이템 수 | 4~12개 | 소스 사이트 수준 (수십~100개+) |

## 1. JSON 데이터 구조 변경

### 1.1 멀티 카테고리 지원

현재 하나의 `2026-04.json`에 단일 category가 있다. 멀티 카테고리를 지원하기 위해 **카테고리별 별도 JSON 파일**을 둔다.

**파일 구조:**
```
content/tiers/blox-fruits/
  2026-04-fruits.json
  2026-04-swords.json
  2026-04-fighting-styles.json
content/tiers/anime-adventures/
  2026-04-units.json        (카테고리 1개인 게임)
```

**기존 `2026-04.json`은 유지하되, 새 카테고리별 파일이 있으면 우선 사용한다.** 마이그레이션 기간 동안 호환성 유지.

### 1.2 등급별 요약 필드 추가

`TierEditorial`에 등급별 요약을 추가한다:

```typescript
interface TierEditorial {
  summary: string;
  recommendation: string;
  tierSummaries?: Record<TierRank, string>;  // 등급별 1-2문장
  analysis?: string;                          // 종합 분석문 (마크다운)
  analysisSources?: string[];                 // 분석에 사용한 소스 이름
  analysisDate?: string;                      // 분석 생성일
}
```

### 1.3 이미지 URL 필드

`TierItem.imageUrl`은 이미 존재한다. 파이프라인이 이 필드를 채우도록 개선하면 된다.

## 2. 파이프라인 개선

### 2.1 이미지 수집 (`collect_tiers.py`)

현재 `context.route("**/*.{png,jpg,...}", route.abort())`로 이미지를 차단하고 있다. 이를 변경:

- **이미지 route 차단 제거** (또는 선택적 허용)
- `_extract_tiers_from_page()`에서 `<img>` 태그의 `src` 속성을 수집
- 이미지 URL을 `image_url` 필드에 저장

### 2.2 종합 분석 글 생성 (`generate_content.py`)

새 함수 `generate_tier_analysis()`를 추가:

- 입력: 게임 슬러그, 카테고리, 수집된 티어 데이터, 소스별 원본 텍스트
- 처리: 소스 사이트의 원문을 AI(Claude API)로 종합 분석
- 출력: `editorial.analysis` (마크다운 문자열), `editorial.tierSummaries` (등급별 요약)

**분석 글 포함 내용:**
- 이번 달 메타 변화 요약
- 주요 등급 변동 이유 (너프/버프)
- 소스 간 의견 차이가 있는 항목 설명
- 초보자 추천 경로
- 분석 소스 출처 표시

### 2.3 카테고리별 수집

`collect_tiers.py`가 이미 `config.py`의 `categories` 리스트를 순회하고 있다. 현재는 모든 카테고리를 하나의 결과에 합치지만, **카테고리별로 분리하여 저장**하도록 변경한다.

## 3. 프론트엔드 컴포넌트 변경

### 3.1 TierList 컴포넌트 재설계

**현재:** TierRow > TierItemBadge (40x40 정사각형 + 아래 이름)

**변경:** TierRow > TierChip (칩/뱃지형)

```
TierChip 구조:
┌──────────────────────┐
│ (●img) 레오파드 🔺    │
└──────────────────────┘
- 원형 이미지 26px (fallback: 그라데이션 + 이니셜)
- 이름: 11px, font-weight 600
- 변동 아이콘: 선택적
- 배경: white, border-radius: 20px (pill shape)
- border: 등급 색상
```

**등급별 요약:** 각 TierRow 아래에 `TierRankSummary` 컴포넌트를 표시. `tierSummaries[rank]` 값이 있을 때만 렌더링.

### 3.2 카테고리 탭 컴포넌트

새 컴포넌트 `TierCategoryTabs`:

- 카테고리가 2개 이상이면 탭 UI 표시
- 카테고리 1개면 탭 없이 바로 표시
- 각 탭에 카테고리 이름 + 아이템 수 표시
- 탭 전환 시 해당 카테고리의 티어 데이터를 보여줌
- `"use client"` (상태 관리 필요)

### 3.3 종합 분석문 컴포넌트

새 컴포넌트 `TierAnalysis`:

- `editorial.analysis` 마크다운을 렌더링
- 소스 출처 표시 (`analysisSources`)
- 분석 날짜 표시
- 초보자 추천 박스 (기존 `recommendation` 통합)

### 3.4 읽는 법 안내 컴포넌트

새 컴포넌트 `TierLegend`:

- 신뢰도 표시 (🟢 3소스, 🔵 2소스, ⚠️ 불일치)
- 변동 아이콘 (🔺 상승, 🔻 하락, 🆕 신규)
- 티어표 아래, 종합 분석문 위에 배치

### 3.5 티어 페이지 구조

```
MonthlyTierPage 레이아웃 (위→아래):
1. ArchiveBanner (아카이브인 경우)
2. 헤더 (게임 아이콘 + 제목 + 메타: 항목수, 카테고리수, S+수)
3. EditorialSummary (이번 달 요약)
4. TierCategoryTabs (멀티 카테고리 탭)
5. TierList + TierRankSummary (등급별 요약 포함)
6. TierLegend (읽는 법)
7. TierAnalysis (종합 분석문 + 초보자 추천)
```

## 4. 콘텐츠 라이브러리 변경

### 4.1 `lib/content.ts` 수정

- `getMonthlyTierData()`: 카테고리별 JSON 로딩 지원
- 새 함수 `getTierCategories(gameSlug, month)`: 해당 게임/월의 카테고리 목록 반환
- 새 함수 `getCategoryTierData(gameSlug, month, category)`: 카테고리별 데이터 로딩

### 4.2 `lib/types.ts` 수정

- `TierEditorial`: `tierSummaries`, `analysis`, `analysisSources`, `analysisDate` 추가
- 새 타입 `MultiCategoryTierData`: 여러 카테고리를 합친 페이지 데이터

## 5. 카테고리 한국어 매핑

```typescript
const CATEGORY_LABELS: Record<string, { name: string; icon: string }> = {
  "fruits": { name: "열매", icon: "🍎" },
  "swords": { name: "검", icon: "⚔️" },
  "fighting-styles": { name: "격투 스타일", icon: "🥊" },
  "units": { name: "유닛", icon: "⚔️" },
  "bloodlines": { name: "혈통", icon: "🩸" },
  "pets": { name: "펫", icon: "🐾" },
  "towers": { name: "타워", icon: "🗼" },
  "bees": { name: "벌", icon: "🐝" },
  "weapons": { name: "무기", icon: "🔪" },
};
```

이 매핑은 `config.py`의 카테고리 슬러그와 일치한다.

## 6. 마이그레이션 전략

1. 새 카테고리별 JSON 파일 형식을 먼저 구현
2. 기존 `2026-04.json` → `2026-04-{category}.json`으로 마이그레이션 스크립트 작성
3. `getMonthlyTierData()`가 양쪽 형식 모두 읽을 수 있도록 호환 유지
4. 마이그레이션 완료 후 구형 파일 삭제

## 7. 이미지 참조 방식

아이템 이미지는 **소스 사이트의 외부 URL을 직접 참조**한다 (핫링크). 로컬 다운로드/저장하지 않는다.

- 장점: 저장소 용량 절약, 항상 최신 이미지
- 단점: 소스 사이트가 URL을 변경하면 깨짐
- 대비: fallback(그라데이션 + 이니셜)은 항상 유지하여 이미지 로드 실패 시 표시

## 8. AI 분석 글 생성 환경

종합 분석문 자동 생성에는 Claude API를 사용한다.

- 환경 변수: `ANTHROPIC_API_KEY`
- 파이프라인 실행 시 API 키가 없으면 분석 글 생성을 건너뛰고, 기존 editorial 데이터를 보존
- 소스 원문 수집: `collect_tiers.py`가 티어 데이터 외에 **페이지의 분석/설명 텍스트도 함께 수집**하여 `collected_tiers.json`에 `source_text` 필드로 저장
- 이 원문 텍스트를 Claude API에 전달하여 종합 분석 생성

## 9. 범위 외 (나중에)

- 아이템 클릭 시 상세 팝업/페이지
- 이전 월 대비 자동 변동 감지
- 소스 사이트 원문 캐싱
- 사용자 투표/의견 기능
