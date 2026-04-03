# blog-manage

Cloudflare Pages 기반 멀티사이트 블로그 관리 모노레포 프로젝트.

## 프로젝트 구조

- 모노레포: pnpm workspace
- 사이트: `sites/` 하위 (각각 독립 Next.js 앱 → Cloudflare Pages 프로젝트)
- 파이프라인: `pipelines/` 하위 (사이트별 데이터 수집/변환 스크립트)
- 공유 패키지: `packages/` 하위 (shared-ui, shared-seo, shared-adsense)
- 에이전트: `agents/` 하위 (컨텐츠 작성 페르소나, 마케팅 어드바이저)
- 문서: `docs/` 하위 (guides, templates, playbooks)

## 기술 스택

- Next.js 14+ (App Router, Static Export)
- TailwindCSS 4
- pnpm workspace (모노레포)
- Cloudflare Pages (배포)
- Python + Playwright (데이터 수집)

## 컨텐츠 관리

- 컨텐츠 데이터: JSON (코드, 티어) + MDX (글)
- 컨텐츠 위치: `sites/[site]/content/`
- 월단위 페이지 전략: 코드(매일 업데이트), 티어(매주 업데이트)
- Git push → Cloudflare Pages 자동 빌드/배포

## 컨텐츠 작성 규칙

- 모든 컨텐츠는 `agents/personas/` 의 페르소나 규칙을 따를 것
- 기본 페르소나: 로블록스 전문 블로거 (초등학생도 이해할 수 있는 수준)
- 게임별 전문 에이전트 프롬프트가 있으면 해당 프롬프트 우선 적용
- 컨텐츠 생성 후 content-reviewer 에이전트로 품질 검수
- 한국어 작성 필수, 영어 용어는 한국어 설명 병기
- 어려운 게임 용어는 괄호 안에 쉬운 설명 추가 (예: "너프(약해짐)")
- 핵심만 요약, 불필요한 서론 없이 바로 본론
- 코드 보상의 게임 내 가치 분석 필수 포함
- 확인되지 않은 정보를 확정처럼 쓰지 않기

## SEO

- 모든 페이지에 meta (title, description, keywords) 필수
- sitemap.xml, robots.txt 자동 생성
- 네이버 신디케이션 (syndication.xml) 생성
- JSON-LD 구조화 데이터 포함
- Open Graph / Twitter Card 메타태그 포함

## 도메인 & 애드센스

- 도메인: 환경변수 `NEXT_PUBLIC_SITE_URL`로 관리 (하드코딩 금지)
- 내부 링크: 상대 경로 사용
- 애드센스: `NEXT_PUBLIC_ADSENSE_ENABLED` 환경변수로 활성화 제어

## 스케줄링

- 기본: 로컬 launchd 스케줄러 (`scripts/local/`)
- 백업: GitHub Actions (`scripts/ci/`, `.github/workflows/`)
- 동시 실행 방지: 기본은 로컬만 활성화, 전환 시 한쪽만 사용

## 코딩 컨벤션

- 커밋 메시지: 한글로 작성
- UI/UX 디자인: 전문 에이전트가 담당, 직접 수정하지 않을 것
- 새 게임 추가: `docs/playbooks/add-new-game.md` 참고
- 새 사이트 추가: `docs/playbooks/add-new-site.md` 참고
- sequentialthinking 툴 항상 사용

## 참고

- 기존 GameCodeKR 프로젝트: `/Users/arkeo/Documents/Claude/Projects/GameCodeKR`
- 기존 블로그: https://gamecode-kr.blogspot.com/ (병행 운영)
