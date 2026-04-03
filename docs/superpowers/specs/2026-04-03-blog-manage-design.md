# blog-manage 프로젝트 설계 문서

**작성일:** 2026-04-03
**상태:** 승인됨

## 개요

Cloudflare Pages + Next.js + TailwindCSS 기반 멀티사이트 블로그 관리 프로젝트.
여러 테마의 사이트를 하나의 모노레포에서 통합 관리하며, 첫 번째 사이트로 GameCodeKR (로블록스 게임 코드/티어표) 를 운영한다.

## 배경

- 기존에 https://gamecode-kr.blogspot.com/ 에서 Blogger 기반으로 운영 중
- Blogger API 제한 (Playwright로 우회해야 하는 복잡한 구조)으로 Cloudflare Pages로 이전 결정
- 기존 블로그는 병행 유지 (SEO 자산 보존)

## 확정 사항

| 항목 | 결정 |
|---|---|
| 멀티사이트 구조 | 모노레포 + 서브도메인 (각 사이트 = Cloudflare Pages 프로젝트) |
| 컨텐츠 관리 | MDX + JSON 파일 기반 (Git 관리) |
| 페이지 전략 | 월단위 페이지 (코드: 매일 업데이트, 티어: 매주 업데이트) |
| 기존 블로그 | 유지 + 새 사이트 병행 |
| 도메인 | *.pages.dev로 시작, 커스텀 도메인 추후 대응 |
| 자동화 | 로컬 launchd(기본) + GitHub Actions(백업) |
| 프레임워크 | Next.js 14+ App Router, TailwindCSS 4 |
| 모노레포 | pnpm workspace |
| 수익화 | 구글 애드센스 (추후 활성화) |
| UI/UX | 전문 에이전트 별도 진행 |

## 1. 모노레포 구조

```
blog-manage/
├── packages/                         ← 공유 패키지
│   ├── shared-ui/                    ← 공통 UI (레이아웃, 네비, 푸터)
│   ├── shared-seo/                   ← SEO (메타, sitemap, robots.txt)
│   └── shared-adsense/              ← 애드센스 (추후 활성화)
│
├── sites/                            ← 개별 사이트
│   └── gamecodekr/                   ← Next.js 앱
│       ├── content/
│       │   ├── codes/               ← 게임별 월단위 코드 JSON
│       │   ├── tiers/               ← 게임별 월단위 티어 JSON
│       │   └── posts/               ← 패치 요약 등 MDX
│       └── src/
│
├── pipelines/                        ← 데이터 수집 파이프라인
│   ├── gamecodekr/                  ← GameCodeKR 전용 수집
│   │   ├── run.py                   ← 단일 진입점
│   │   ├── collect_codes.py
│   │   ├── collect_tiers.py
│   │   ├── generate_content.py
│   │   └── config.py
│   └── shared/                      ← 공통 유틸 (Git 커밋 등)
│
├── agents/                           ← 에이전트 프롬프트
│   ├── personas/
│   │   ├── game-blogger.md          ← 기본 게임 블로거 페르소나
│   │   ├── game-blogger.blox-fruits.md
│   │   └── ...
│   ├── marketing-advisor.md
│   └── content-reviewer.md
│
├── scripts/                          ← 스케줄러
│   ├── local/                       ← launchd plist
│   └── ci/
│
├── docs/
│   ├── guides/                      ← Cloudflare Pages 등 가이드
│   ├── templates/                   ← 컨텐츠 템플릿
│   ├── playbooks/                   ← 운영 절차서
│   └── superpowers/specs/
│
├── .github/workflows/               ← GitHub Actions
├── CLAUDE.md
└── package.json                     ← pnpm workspace
```

## 2. URL 구조 (GameCodeKR)

```
gamecodekr.pages.dev/
├── /                                ← 홈 (전체 게임 목록 + 최신)
├── /[game]/                         ← 게임 허브
├── /[game]/codes/                   ← → 이번 달 코드 리다이렉트
├── /[game]/codes/[yyyy-mm]/         ← 월단위 코드 페이지
├── /[game]/tier/                    ← → 이번 달 티어 리다이렉트
├── /[game]/tier/[yyyy-mm]/          ← 월단위 티어 페이지
├── /[game]/patch/[slug]/            ← 패치 요약
└── /sitemap.xml
```

## 3. 컨텐츠 데이터 구조

### 코드 JSON (content/codes/blox-fruits/2026-04.json)

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
      "rewardAnalysis": "스탯 리셋은 보통 로북스 300개 가치. 빌드 변경 시 필수."
    }
  ],
  "expiredCodes": [],
  "meta": {
    "title": "블록스 프루츠 코드 총정리 (2026년 4월) | GameCodeKR",
    "description": "2026년 4월 블록스 프루츠 최신 코드 모음...",
    "keywords": ["블록스 프루츠 코드", "블록스 프루츠 코드 2026년 4월"]
  }
}
```

### 핵심 필드

- `verified`: 교차검증 소스 수 (3 = ✅✅✅, 2 = ✅✅, 1 = ⚠️)
- `rewardAnalysis`: 보상 가치 분석 (차별화 요소)
- `meta`: SEO 데이터 (빌드 시 `<head>`에 반영)

## 4. 월단위 페이지 라이프사이클

```
월초 (자동)          월중 (반복)              월말
─────────────────────────────────────────────────
새 월 JSON 생성  →  수집 → JSON 업데이트  →  아카이브 배너 추가
이전 달 아카이브      Git push → 자동 배포      다음 달 준비
리다이렉트 갱신       코드: 매일 / 티어: 매주
```

- `/[game]/codes/` → 현재 월 페이지로 redirect
- 이전 달: "최신 코드는 여기서 확인하세요" 배너 표시
- 모든 이전 페이지는 SEO 자산으로 유지

## 5. 파이프라인

### 실행 흐름

```
pipelines/gamecodekr/run.py (단일 진입점)
├── 1. collect()          ← Playwright 3소스 × 10게임 수집
├── 2. validate()         ← 교차검증
├── 3. generate()         ← content/ JSON/MDX 생성/업데이트
├── 4. commit_and_push()  ← Git push (변경 시에만)
└── Cloudflare Pages 자동 빌드/배포
```

### 스케줄

| 작업 | 주기 | 로컬 | GitHub Actions |
|---|---|---|---|
| 코드 수집 | 매일 09:00 | launchd plist | workflow cron |
| 티어 수집 | 매주 월 09:00 | launchd plist | workflow cron |
| 월초 생성 | 매월 1일 00:00 | launchd plist | workflow cron |

### 이중 트리거

- 기본: 로컬 launchd만 활성화
- GitHub Actions: `workflow_dispatch` (수동) + cron (전환 시 활성화)
- 충돌 방지: 한쪽만 사용

## 6. SEO 전략

### 구글

- sitemap.xml 자동 생성
- robots.txt
- JSON-LD 구조화 데이터
- Open Graph / Twitter Card
- Google Search Console 연동

### 네이버

- 네이버 웹마스터 도구 등록
- naver-site-verification 메타태그
- 네이버 신디케이션 (syndication.xml)
- lang="ko"

## 7. 애드센스

- `packages/shared-adsense/`: AdBanner, AdInArticle, AdSidebar 컴포넌트
- `NEXT_PUBLIC_ADSENSE_ENABLED=false` → 비활성 상태로 배치
- 커스텀 도메인 + 승인 후 `true`로 전환

## 8. 도메인 대응

- 환경변수 `NEXT_PUBLIC_SITE_URL`로 baseUrl 관리
- 모든 내부 링크: 상대 경로
- sitemap, canonical URL만 baseUrl 참조
- 전환: Cloudflare Pages 대시보드에서 도메인 추가 + 환경변수 변경

## 9. 에이전트 시스템

### 게임 블로거 페르소나 (기본)

- 대상: 초등학생 ~ 중학생
- 어려운 용어 → 괄호 안 쉬운 설명
- 핵심 요약, 서론 없이 본론
- 코드 보상 가치 분석 필수
- 신뢰도 표시 (✅✅✅ / ⚠️)

### 게임별 전문 오버라이드

- 기본 페르소나 상속 + 게임별 전문 지식/용어 사전 추가
- `agents/personas/game-blogger.[game-slug].md`

### 마케팅 어드바이저

- 월초 키워드 트렌드 분석 → 컨텐츠 전략 제안
- 제목/메타 설명 최적화
- 경쟁 블로그 대비 차별화 자문

### 컨텐츠 리뷰어

- 컨텐츠 작성 후 품질 검수
- 페르소나 규칙 준수 여부 확인

## 10. 대상 게임 (초기 10개)

기존 GameCodeKR 프로젝트와 동일:
1. Blox Fruits (블록스 프루츠)
2. King Legacy (킹 레거시)
3. Fruit Battlegrounds (프루츠 배틀그라운드)
4. Anime Adventures (애니메 어드벤처)
5. Murder Mystery 2 (머더 미스터리 2)
6. Pet Simulator 99 (펫 시뮬레이터 99)
7. Shindo Life (신도 라이프)
8. Tower Defense Simulator (타워 디펜스 시뮬레이터)
9. All Star Tower Defense (올스타 타워 디펜스)
10. Bee Swarm Simulator (비 스웜 시뮬레이터)

## 11. 문서 관리

```
docs/
├── guides/                          ← CF Pages, Search Console 등 가이드
├── templates/                       ← 컨텐츠 템플릿 (코드, 티어, 패치)
├── playbooks/                       ← 운영 절차서 (게임 추가, 사이트 추가 등)
└── superpowers/specs/               ← 설계 문서
```
