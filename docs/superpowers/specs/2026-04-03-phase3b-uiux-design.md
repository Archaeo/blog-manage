# Phase 3B: UI/UX 비주얼 개선 설계

**작성일:** 2026-04-03
**상태:** 승인됨

## 개요

GameCodeKR 사이트의 비주얼을 전면 개선한다. 클린 라이트 테마, 반응형 사이드바 내비게이션, 게임 썸네일 이미지, 티어표 아이템 이미지를 도입하여 텍스트 중심의 단조로운 UI를 시각적으로 풍부하게 만든다.

## 1. 디자인 시스템

### 테마: 클린 라이트

| 토큰 | 값 | 용도 |
|---|---|---|
| `bg-base` | `#f8fafc` (slate-50) | 페이지 배경 |
| `bg-surface` | `#ffffff` | 카드, 사이드바 배경 |
| `border-default` | `#e2e8f0` (slate-200) | 기본 보더 |
| `text-primary` | `#0f172a` (slate-900) | 제목 |
| `text-secondary` | `#475569` (slate-600) | 본문 |
| `text-muted` | `#94a3b8` (slate-400) | 부가 텍스트 |
| `accent-primary` | `#2563eb` (blue-600) | 포인트 컬러 |
| `accent-primary-bg` | `#eff6ff` (blue-50) | 포인트 배경 |
| `accent-primary-light` | `#dbeafe` (blue-100) | 포인트 연한 배경 |
| `success` | `#16a34a` (green-600) | 활성/확인 |
| `warning` | `#ca8a04` (yellow-600) | 미확인/주의 |

### 티어 등급 컬러

| 등급 | 그라디언트 | 보더 | 텍스트 |
|---|---|---|---|
| S | `#ef4444 → #dc2626` | `#fecaca` | `#dc2626` |
| A | `#f97316 → #ea580c` | `#fed7aa` | `#ea580c` |
| B | `#eab308 → #ca8a04` | `#fde68a` | `#ca8a04` |
| C | `#22c55e → #16a34a` | `#bbf7d0` | `#16a34a` |
| D | `#3b82f6 → #2563eb` | `#bfdbfe` | `#2563eb` |
| F | `#6b7280 → #4b5563` | `#d1d5db` | `#4b5563` |

### 공통 스타일

- 카드 border-radius: `12px`
- 카드 shadow: `0 1px 3px rgba(0,0,0,0.06)`
- 아이콘/이미지 border-radius: `8px`
- 폰트: 시스템 sans-serif (기존 유지)
- 코드 텍스트: monospace, `#2563eb`, `bg: #eff6ff`

## 2. 반응형 사이드바

### 구조

```
<SidebarLayout>
  <Sidebar>              ← 데스크탑: 고정 230px, 모바일: 오버레이
    <SidebarHeader>      ← 로고 + 사이트명
    <GameList>           ← 게임 목록 (아이콘 + 이름)
      <GameItem>         ← 클릭 시 서브메뉴 토글
        <SubMenu>        ← 코드/티어 링크
  <MainContent>          ← 기존 페이지 컨텐츠
</SidebarLayout>
```

### 반응형 동작

- **데스크탑 (≥ 1024px, `lg:`)**: 사이드바 항상 표시, 메인 컨텐츠 옆에 고정
- **모바일 (< 1024px)**: 사이드바 숨김, 상단에 햄버거 버튼 + 사이트 로고 표시
  - 햄버거 클릭 → 사이드바 오버레이 슬라이드 + 반투명 백드롭
  - 백드롭 클릭 또는 링크 클릭 → 사이드바 닫힘

### 활성 상태

- 현재 게임: 좌측 3px 블루 보더 + `bg: accent-primary-bg` + 볼드
- 서브메뉴: 선택된 게임 아래에 코드/티어 링크 펼침
- 현재 페이지 (코드/티어): 블루 텍스트 + 볼드

### 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|---|---|---|
| `SidebarLayout` | `components/SidebarLayout.tsx` | 전체 레이아웃 래퍼 |
| `Sidebar` | `components/Sidebar.tsx` | 사이드바 컨텐츠 |
| `MobileHeader` | `components/MobileHeader.tsx` | 모바일 상단 바 (햄버거 + 로고) |

### 상태 관리

- `"use client"` 컴포넌트로 사이드바 open/close 상태 관리
- URL pathname으로 현재 게임/페이지 하이라이트 (`usePathname()`)
- Static Export 호환: 클라이언트 사이드 상태만 사용

## 3. 게임 이미지

### 소스 및 저장

- 원본: `pipelines/gamecodekr/config.py`의 각 게임 `image_url` (로블록스 CDN 512px)
- 저장 위치: `sites/gamecodekr/public/images/games/{slug}.png`
- 헬퍼 스크립트: `scripts/download-game-images.py`
  - `config.py`의 GAMES에서 image_url 읽기
  - 각 URL을 다운로드하여 `public/images/games/{slug}.png`로 저장
  - 이미 존재하면 스킵 (`--force`로 강제 재다운로드)

### 사용 위치

| 위치 | 크기 | 형태 |
|---|---|---|
| 홈페이지 게임 카드 상단 | 카드 너비 × 72px | 배경 파스텔 + 중앙 썸네일 56px |
| 코드/티어 페이지 헤더 | 48px × 48px | 둥근 사각형 |
| 사이드바 게임 아이콘 | 24px × 24px | 둥근 사각형, 이모지 대체 |

### games.ts 업데이트

`GameConfig` 인터페이스에 `imageUrl` 필드 추가 (로컬 경로):

```typescript
interface GameConfig {
  slug: string;
  title: string;
  titleEn: string;
  icon: string;          // 이모지 (폴백용 유지)
  imageUrl: string;      // "/images/games/{slug}.png"
  description: string;
  hasCode: boolean;
  hasTier: boolean;
}
```

## 4. 게임 카드 (홈페이지)

### 기존 → 변경

- 기존: 이모지 아이콘 + 텍스트 + 보더 카드
- 변경: 썸네일 이미지 배너 + 파스텔 배경 + 코드 수/티어 뱃지

### 구조

```
<GameCard>
  <CardBanner>           ← 파스텔 그라디언트 배경 + 게임 이미지 (56px, 중앙)
  <CardBody>
    <Title>              ← 한글 이름
    <Subtitle>           ← 영문 이름
    <Badges>             ← "코드 N개" (초록) + "티어표" (파랑)
```

### 그리드

- 데스크탑: 3~4열 그리드
- 태블릿: 2열
- 모바일: 1열

## 5. 코드 페이지

### 기존 → 변경

- 기존: 테이블 형태, 흰 배경, 단순 텍스트
- 변경: 카드형 목록, 코드 텍스트 강조(블루 모노스페이스), 보상 분석 박스 개선

### 코드 카드 구조

```
<CodeCard>
  <Header>
    <CodeText>           ← monospace, 블루, 배경 하이라이트
    <VerificationBadge>  ← ✅✅✅ (기존 컴포넌트 스타일 업데이트)
  <Reward>               ← 보상 텍스트
  <RewardAnalysis>       ← 앰버 배경 박스 (기존 컴포넌트 스타일 업데이트)
```

### 섹션 구분

- ✅ 활성 코드 — 그린 헤더
- ⚠️ 미확인 코드 — 옐로우 헤더
- ❌ 만료 코드 — 그레이 헤더, opacity 낮춤

## 6. 티어표 페이지

### 기존 → 변경

- 기존: 등급별 리스트, 컬러 배경
- 변경: 등급별 카드 그리드, 아이템 이미지, 폴백 플레이스홀더

### 아이템 이미지 소스

- 파이프라인 `collect_tiers.py`에서 수집 시 `image_url` 포함
- `validate_tiers.py`에서 교차검증 시 첫 번째 사용 가능한 image_url 선택
- `generate_content.py`에서 JSON에 `imageUrl` 필드 포함
- 렌더링 시 외부 URL 직접 참조 (`<img src={item.imageUrl}>`)

### 폴백 플레이스홀더

이미지가 없는 아이템: 티어 등급 컬러 글로우 + 게임 이모지

```
radial-gradient(circle at 30% 30%, rgba(티어컬러, 0.15), rgba(255,255,255,0.5))
border: 1px solid rgba(티어컬러, 0.2)
중앙: 게임 이모지 (20px)
```

이미지 로드 실패 시에도 동일한 폴백 적용 (`onError` 핸들러).

### 아이템 카드 구조

```
<TierItemCard>
  <ItemImage>            ← 44px, 이미지 or 폴백
  <ItemInfo>
    <NameKo>             ← 한글 이름 (볼드)
    <NameEn>             ← 영문 이름 + 변동 표시 (🔺🔻🆕)
```

### 티어 섹션 구조

```
<TierSection>
  <TierBadge>            ← 등급 그라디언트 뱃지 + 설명 (최강/강함/...)
  <ItemGrid>             ← 2열 그리드 (데스크탑), 1열 (모바일)
```

## 7. 데이터 파이프라인 변경

### collect_tiers.py

- 기존: 아이템 `name`, `tier`만 수집
- 변경: `image_url`도 함께 수집 (소스 페이지의 `<img>` 태그에서 추출)
- Playwright 이미지 차단은 유지 (DOM에서 URL만 추출, 실제 다운로드 안 함)

### validate_tiers.py

- `cross_verify_tiers` 결과에 `image_url` 포함
- 여러 소스에서 image_url이 있으면 첫 번째 유효한 URL 사용

### generate_content.py

- 티어 JSON에 `imageUrl` 필드 추가
- 기존 JSON에 `imageUrl`이 있으면 보존 (수동 추가분)

### TierItem 타입 업데이트

`sites/gamecodekr/src/lib/types.ts`:

```typescript
interface TierItem {
  name: string;
  nameKo: string;
  rank: TierRank;
  description: string;
  changeFromLast: 'up' | 'down' | 'new' | 'same';
  imageUrl?: string;    // 추가: 아이템 이미지 URL (외부)
}
```

## 8. 파일 변경 요약

### 새로 생성

| 파�� | 역할 |
|---|---|
| `components/SidebarLayout.tsx` | 사이드바 포함 전체 레이아웃 |
| `components/Sidebar.tsx` | 사이드바 컨텐츠 |
| `components/MobileHeader.tsx` | 모바일 상단 바 |
| `scripts/download-game-images.py` | 게임 이미지 다운로드 헬퍼 |
| `public/images/games/*.png` | 게임 썸네일 이미지 10개 |

### 수정

| 파일 | 변경 |
|---|---|
| `src/app/layout.tsx` | SidebarLayout으로 래핑, 다크→라이트 테마 |
| `src/app/globals.css` | 라이트 테마 기본 스타일 |
| `src/app/page.tsx` | 게임 카드 그리드 레이아웃 변경 |
| `src/components/GameCard.tsx` | 이미지 배너 + 뱃지 디자인 |
| `src/components/CodeTable.tsx` | 카드형 코드 목록 + 라이트 스타일 |
| `src/components/TierList.tsx` | 카드 그리드 + 아이템 이미지/폴백 |
| `src/components/RewardAnalysis.tsx` | 라이트 테마 스타일 업데이트 |
| `src/lib/games.ts` | `imageUrl` 필드 추가 |
| `src/lib/types.ts` | `TierItem.imageUrl` 추가 |
| `pipelines/gamecodekr/collect_tiers.py` | image_url 수집 추가 |
| `pipelines/gamecodekr/validate_tiers.py` | image_url 교차검증 추가 |
| `pipelines/gamecodekr/generate_content.py` | imageUrl 필드 출력 |
| `packages/shared-ui/src/VerificationBadge.tsx` | 라이트 테마 스타일 |
| `packages/shared-ui/src/ArchiveBanner.tsx` | 라이트 테마 스타일 |

## 9. 범위 외

- 다크 모드 토글 (추후 Phase)
- 검색 기능
- 댓글 시스템
- 애니메이션/트랜지션 (기본적인 호버 효과만)
