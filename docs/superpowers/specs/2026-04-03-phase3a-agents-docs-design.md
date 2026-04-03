# Phase 3A: 에이전트 시스템 + 문서/운영 체계 설계

**작성일:** 2026-04-03
**상태:** 승인됨

## 개요

GameCodeKR 운영에 필요한 게임별 전문 에이전트, 운영 플레이북, 컨텐츠 템플릿, 가이드 문서를 구축한다.

## 1. 게임별 전문 블로거 에이전트 (9개 추가)

기존 `game-blogger-blox-fruits.md` 패턴 상속. 각 에이전트는:
- 기본 페르소나 (`game-blogger.md`) 상속 명시
- 게임 개요 (장르, 핵심 시스템)
- 전문 용어 사전 (영문 → 한글, 약어/은어)
- 주요 시스템 설명 (코드 보상 맥락, 티어 기준)
- 커뮤니티 트렌드 키워드

### 대상 게임

| slug | 게임명 | 핵심 시스템 |
|---|---|---|
| king-legacy | 킹 레거시 | 과일 시스템, 레벨링, 보스 |
| fruit-battlegrounds | 프루츠 배틀그라운드 | PvP 과일 전투, 콤보 |
| anime-adventures | 애니메 어드벤처 | 타워디펜스, 유닛 소환/진화 |
| murder-mystery-2 | 머더 미스터리 2 | 나이프/총 트레이딩, 역할 게임 |
| pet-simulator-99 | 펫 시뮬레이터 99 | 펫 수집/합성, 인챈트 |
| shindo-life | 신도 라이프 | 혈통(Bloodline), 원소, PvP |
| tower-defense-simulator | 타워 디펜스 시뮬레이터 | 타워 배치, 웨이브, 이벤트 |
| all-star-tower-defense | 올스타 타워 디펜스 | 애니메 유닛, 소환, 진화 |
| bee-swarm-simulator | 비 스웜 시뮬레이터 | 벌 수집, 꿀 생산, 이벤트 벌 |

파일 위치: `.claude/agents/gamecodekr/game-blogger-{slug}.md`

## 2. 운영 플레이북 3종

위치: `docs/playbooks/`

### add-new-game.md
새 로블록스 게임을 GameCodeKR에 추가할 때의 체크리스트:
- `pipelines/gamecodekr/config.py` GAMES 배열에 추가
- `sites/gamecodekr/src/lib/games.ts` GAMES 배열에 추가
- `content/codes/{slug}/`, `content/tiers/{slug}/` 디렉토리 생성
- 에이전트 프롬프트 작성 (`.claude/agents/gamecodekr/game-blogger-{slug}.md`)
- 티어 게임이면 `config.py` TIER_GAMES에 추가
- 빌드 테스트 → 커밋 → 배포 확인

### add-new-site.md
새 사이트(예: TechBlogKR)를 모노레포에 추가할 때:
- `sites/{site-name}/` Next.js 앱 생성
- `pnpm-workspace.yaml` 확인
- 공유 패키지 의존성 추가 (shared-ui, shared-seo, shared-adsense)
- Cloudflare Pages 프로젝트 생성 + Git 연결
- `pipelines/{site-name}/` 파이프라인 생성 (필요 시)
- 에이전트 폴더 생성 (`.claude/agents/{site-name}/`)

### monthly-cycle.md
매월 1일 콘텐츠 전환 절차:
- 자동: `run.py monthly` 실행 → 새 월 빈 JSON 생성
- 확인: `/[game]/codes/` 리다이렉트가 새 월을 가리키는지
- 확인: 이전 달 페이지에 아카이브 배너 표시되는지
- SEO: sitemap.xml에 새 페이지 포함 확인
- 수동 (필요 시): 이전 달 expiredCodes 정리

## 3. 컨텐츠 템플릿 3종

위치: `docs/templates/`

### code-template.md
- JSON 필드별 설명 (code, reward, verified, status, rewardAnalysis)
- rewardAnalysis 작성 가이드: 게임 내 가치 환산, 비교 기준
- 예시: "스탯 리셋은 보통 로북스 300개 가치. 빌드 변경 시 필수."
- 상태값 규칙: active (2+ 소스), unverified (1 소스), expired

### tier-template.md
- 티어 등급 기준 (S/A/B/C/D/F)
- nameKo 번역 규칙: 공식 한글명 우선, 없으면 음역
- description 작성 가이드: 한 줄 요약 + 강점/약점
- changeFromLast 기준: 이전 달 대비 등급 변동

### patch-template.md
- MDX 구조: 제목, 날짜, 변경점 요약, 영향도, 전략 변화
- 작성 톤: 기본 페르소나 (초등학생도 이해)
- 필수 섹션: "이게 뭐가 바뀐 거야?", "어떻게 달라져?", "꿀팁"

## 4. 가이드 문서 4종

위치: `docs/guides/`

### pipeline-guide.md
- 로컬 실행: `python -m pipelines.gamecodekr.run codes --skip-push`
- 각 명령어 설명 (codes, tiers, monthly, generate)
- 플래그: --month, --skip-collect, --skip-push
- 트러블슈팅: Playwright 설치, 수집 실패, JSON 파싱 오류
- 로그 위치: `logs/`

### search-console-guide.md
- Google Search Console 사이트 등록
- sitemap.xml 제출
- 색인 요청 방법
- 실적 모니터링 포인트

### naver-webmaster-guide.md
- 네이버 웹마스터 도구 사이트 등록
- naver-site-verification 메타태그 추가 방법
- 신디케이션(syndication.xml) 설정
- 네이버 검색 노출 확인

### launchd-guide.md
- install.sh / uninstall.sh 사용법
- plist 스케줄 확인: `launchctl list | grep blogmanage`
- 수동 실행: `launchctl start com.blogmanage.codes`
- 로그 확인: `logs/launchd-*.log`
- 디버깅: 권한 문제, Python 경로, venv 활성화
