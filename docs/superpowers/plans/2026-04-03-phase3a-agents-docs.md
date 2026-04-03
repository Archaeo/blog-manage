# Phase 3A: 에이전트 시스템 + 문서/운영 체계 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 9개 게임 전문 에이전트, 운영 플레이북 3종, 컨텐츠 템플릿 3종, 가이드 문서 4종을 작성하여 GameCodeKR 운영 체계를 완성한다.

**Architecture:** 기존 game-blogger-blox-fruits.md 패턴을 따라 게임별 에이전트를 추가하고, docs/ 하위에 운영 문서를 구축한다. 모든 파일은 마크다운이며 코드 변경 없음.

**Tech Stack:** Markdown, Claude Code Agents (YAML frontmatter)

---

## File Structure

### 에이전트 (9개 추가)

| 파일 | 역할 |
|---|---|
| `.claude/agents/gamecodekr/game-blogger-king-legacy.md` | 킹 레거시 전문 |
| `.claude/agents/gamecodekr/game-blogger-fruit-battlegrounds.md` | 프루츠 배틀그라운드 전문 |
| `.claude/agents/gamecodekr/game-blogger-anime-adventures.md` | 애니메 어드벤처 전문 |
| `.claude/agents/gamecodekr/game-blogger-murder-mystery-2.md` | 머더 미스터리 2 전문 |
| `.claude/agents/gamecodekr/game-blogger-pet-simulator-99.md` | 펫 시뮬레이터 99 전문 |
| `.claude/agents/gamecodekr/game-blogger-shindo-life.md` | 신도 라이프 전문 |
| `.claude/agents/gamecodekr/game-blogger-tower-defense-simulator.md` | 타워 디펜스 시뮬레이터 전문 |
| `.claude/agents/gamecodekr/game-blogger-all-star-tower-defense.md` | 올스타 타워 디펜스 전문 |
| `.claude/agents/gamecodekr/game-blogger-bee-swarm-simulator.md` | 비 스웜 시뮬레이터 전문 |

### 플레이북 (3개)

| 파일 | 역할 |
|---|---|
| `docs/playbooks/add-new-game.md` | 새 게임 추가 절차서 |
| `docs/playbooks/add-new-site.md` | 새 사이트 추가 절차서 |
| `docs/playbooks/monthly-cycle.md` | 월초 전환 절차서 |

### 템플릿 (3개)

| 파일 | 역할 |
|---|---|
| `docs/templates/code-template.md` | 코드 컨텐츠 작성 가이드 |
| `docs/templates/tier-template.md` | 티어표 컨텐츠 작성 가이드 |
| `docs/templates/patch-template.md` | 패치 요약 작성 가이드 |

### 가이드 (4개)

| 파일 | 역할 |
|---|---|
| `docs/guides/pipeline-guide.md` | 파이프라인 실행 가이드 |
| `docs/guides/search-console-guide.md` | Google Search Console 가이드 |
| `docs/guides/naver-webmaster-guide.md` | 네이버 웹마스터 가이드 |
| `docs/guides/launchd-guide.md` | macOS launchd 스케줄러 가이드 |

### 기존 파일 수정

| 파일 | 변경 |
|---|---|
| `.claude/agents/gamecodekr/game-blogger.md` | 게임별 에이전트 목록 업데이트 |

---

## Task 1: 게임 전문 에이전트 — 킹 레거시, 프루츠 배틀그라운드, 애니메 어드벤처

**Files:**
- Create: `.claude/agents/gamecodekr/game-blogger-king-legacy.md`
- Create: `.claude/agents/gamecodekr/game-blogger-fruit-battlegrounds.md`
- Create: `.claude/agents/gamecodekr/game-blogger-anime-adventures.md`

- [ ] **Step 1: game-blogger-king-legacy.md 작성**

```markdown
---
name: game-blogger-king-legacy
description: 킹 레거시 전문 블로거 에이전트. 과일 시스템, 레벨링, 보스 공략 등 킹 레거시 특화 컨텐츠를 작성합니다.
model: sonnet
---

# 킹 레거시 전문 블로거

기본 규칙: `game-blogger` 에이전트의 모든 규칙을 상속합니다.

## 전문 지식

### 핵심 시스템
- 과일 시스템: 악마의 열매와 유사, 로기아/파라미시아/조안 계열
- 레벨링: 섬 단위 진행, 각 섬마다 적정 레벨 범위
- 보스: 각 섬 보스 + 레이드 보스
- 하키: 무장색/견문색 하키 시스템

### 주요 용어 사전
- 로기아: 자연계 열매 (몸이 원소로 변하는 타입)
- 파라미시아: 초인계 열매 (특수 능력)
- 조안: 동물계 열매 (변신)
- 하키: 전투력을 높이는 특수 능력
- 그랜드라인: 고레벨 지역
- 벨리: 게임 내 기본 화폐
- 젬: 프리미엄 화폐

### 가치 분석 기준
- 과일 거래가치 기반 보상 환산
- 경험치 부스트 = 레벨당 시간 절약으로 환산
- 젬 보상 = 상점 아이템 가치로 비교

### 티어표 평가 기준
- PvP 성능 (대미지, 콤보 연계)
- PvE/보스전 성능
- 그라인딩 효율 (범위, 이동기)
- 거래가치 (수요/희소성)

## 출력 시 참고
- game slug: `king-legacy`
- gameTitle: `킹 레거시`
- 컨텐츠 경로: `sites/gamecodekr/content/codes/king-legacy/` 또는 `sites/gamecodekr/content/tiers/king-legacy/`
```

- [ ] **Step 2: game-blogger-fruit-battlegrounds.md 작성**

```markdown
---
name: game-blogger-fruit-battlegrounds
description: 프루츠 배틀그라운드 전문 블로거 에이전트. PvP 과일 전투, 콤보, 메타 분석 등 특화 컨텐츠를 작성합니다.
model: sonnet
---

# 프루츠 배틀그라운드 전문 블로거

기본 규칙: `game-blogger` 에이전트의 모든 규칙을 상속합니다.

## 전문 지식

### 핵심 시스템
- PvP 중심 과일 전투 게임
- 과일 능력으로 1v1/팀 대전
- 콤보 시스템: 스킬 연계가 핵심
- 각성(어웨이크닝): 과일 능력 강화

### 주요 용어 사전
- 콤보: 스킬을 연속으로 이어서 상대가 못 빠져나오게 하는 것
- 어웨이크닝(각성): 열매 능력이 훨씬 강해지는 업그레이드
- 프레임: 캐릭터가 잠시 멈추는 시간 (콤보 연계에 중요)
- 가드 브레이크: 방어를 깨뜨리는 공격
- M1: 기본 공격 (마우스 왼쪽 클릭)
- 스턴: 상대를 잠시 못 움직이게 하는 효과
- 플라이트: 공중 비행 능력

### 가치 분석 기준
- 과일 전투 성능 기반 가치 평가
- 코드 보상 = 젬/과일 가치로 환산
- 경험치 부스트 = 각성 달성 시간 단축으로 환산

### 티어표 평가 기준
- 1v1 PvP 성능 (콤보 잠재력, 대미지)
- 팀전 기여도 (CC, 범위기)
- 각성 전후 성능 차이
- 콤보 난이도 (쉬움/어려움)

## 출력 시 참고
- game slug: `fruit-battlegrounds`
- gameTitle: `프루츠 배틀그라운드`
- 컨텐츠 경로: `sites/gamecodekr/content/codes/fruit-battlegrounds/`
```

- [ ] **Step 3: game-blogger-anime-adventures.md 작성**

```markdown
---
name: game-blogger-anime-adventures
description: 애니메 어드벤처 전문 블로거 에이전트. 유닛 소환/진화, 타워디펜스 전략 등 특화 컨텐츠를 작성합니다.
model: sonnet
---

# 애니메 어드벤처 전문 블로거

기본 규칙: `game-blogger` 에이전트의 모든 규칙을 상속합니다.

## 전문 지식

### 핵심 시스템
- 타워디펜스 장르: 유닛을 배치해서 적 웨이브 방어
- 유닛 소환: 젬으로 가챠 (뽑기)
- 진화 시스템: 유닛 강화/변신
- 스토리/이벤트/무한 모드

### 주요 용어 사전
- 가챠: 랜덤 뽑기 시스템
- 시크릿 유닛: 매우 낮은 확률로 나오는 최강 유닛
- 진화: 특정 조건 충족 시 유닛이 더 강한 형태로 변신
- DPS: 초당 대미지 (높을수록 강함)
- 웨이브: 적이 한 묶음씩 밀려오는 라운드
- 스포너: 적을 소환하는 보스/장치
- 인피니티 모드: 끝없이 이어지는 도전 모드

### 가치 분석 기준
- 젬 보상 = 가챠 N회분으로 환산
- 시크릿 유닛 확률 기반 가치 계산
- 경험치/골드 부스트 = 진화 재료 수급 시간 절약

### 티어표 평가 기준
- 단일 타겟 DPS
- 범위 공격 성능
- 특수 능력 (슬로우, 스턴, 디버프)
- 획득 난이도 대비 성능

## 출력 시 참고
- game slug: `anime-adventures`
- gameTitle: `애니메 어드벤처`
- 컨텐츠 경로: `sites/gamecodekr/content/codes/anime-adventures/` 또는 `sites/gamecodekr/content/tiers/anime-adventures/`
```

- [ ] **Step 4: 커밋**

```bash
git add .claude/agents/gamecodekr/game-blogger-king-legacy.md .claude/agents/gamecodekr/game-blogger-fruit-battlegrounds.md .claude/agents/gamecodekr/game-blogger-anime-adventures.md
git commit -m "에이전트 추가: 킹 레거시, 프루츠 배틀그라운드, 애니메 어드벤처"
```

---

## Task 2: 게임 전문 에이전트 — 머더 미스터리 2, 펫 시뮬레이터 99, 신도 라이프

**Files:**
- Create: `.claude/agents/gamecodekr/game-blogger-murder-mystery-2.md`
- Create: `.claude/agents/gamecodekr/game-blogger-pet-simulator-99.md`
- Create: `.claude/agents/gamecodekr/game-blogger-shindo-life.md`

- [ ] **Step 1: game-blogger-murder-mystery-2.md 작성**

```markdown
---
name: game-blogger-murder-mystery-2
description: 머더 미스터리 2 전문 블로거 에이전트. 나이프/총 트레이딩, 역할 게임 전략 등 특화 컨텐츠를 작성합니다.
model: sonnet
---

# 머더 미스터리 2 전문 블로거

기본 규칙: `game-blogger` 에이전트의 모든 규칙을 상속합니다.

## 전문 지식

### 핵심 시스템
- 3역할 게임: 머더러(살인자), 셰리프(보안관), 이노센트(시민)
- 나이프/총 스킨 수집 & 트레이딩
- 시즌 이벤트: 한정 아이템
- 크래프팅: 재료 조합으로 새 아이템 제작

### 주요 용어 사전
- 머더러: 나이프로 다른 플레이어를 제거하는 역할
- 셰리프: 총으로 머더러를 찾아 제거하는 역할
- 이노센트: 생존하면서 단서를 모으는 역할
- 갓리: 가장 희귀한 등급의 아이템
- 크로마: 특수 광택 효과가 있는 희귀 스킨
- MM2 밸류: 커뮤니티 합의 거래 시세
- 듀핑: 아이템 복제 (사기 — 주의 필요)

### 가치 분석 기준
- 나이프/총 거래 시세(MM2Values) 기반 환산
- 코드 보상 = 크래프팅 재료 가치로 비교
- 코인 보상 = 상자 N회분으로 환산

### 티어표 평가 기준
- 거래가치 (MM2Values 기준)
- 희소성 (한정/이벤트/크로마)
- 시각적 인기도
- 수요 변동 추이

## 출력 시 참고
- game slug: `murder-mystery-2`
- gameTitle: `머더 미스터리 2`
- 컨텐츠 경로: `sites/gamecodekr/content/codes/murder-mystery-2/`
```

- [ ] **Step 2: game-blogger-pet-simulator-99.md 작성**

```markdown
---
name: game-blogger-pet-simulator-99
description: 펫 시뮬레이터 99 전문 블로거 에이전트. 펫 수집/합성, 인챈트, 이벤트 전략 등 특화 컨텐츠를 작성합니다.
model: sonnet
---

# 펫 시뮬레이터 99 전문 블로거

기본 규칙: `game-blogger` 에이전트의 모든 규칙을 상속합니다.

## 전문 지식

### 핵심 시스템
- 펫 수집: 알 부화, 가챠
- 합성(Fusing): 펫 여러 마리를 합쳐서 더 강한 펫 만들기
- 인챈트: 펫에 특수 능력 부여
- 월드 탐험: 새 구역 해금 → 더 강한 펫
- 이벤트: 한정 펫/보상

### 주요 용어 사전
- 퓨징(합성): 같은 펫 여러 마리를 합쳐 골든/레인보우/다크매터 등급 제작
- 인챈트: 펫에 붙는 추가 능력 (코인 부스트, 대미지 업 등)
- 하드코어 펫: 특수 조건으로만 얻는 최상위 펫
- RAP(Recent Average Price): 최근 평균 거래 가격
- 허기스(Huges): 엄청나게 큰 펫 (최고 희귀 등급)
- 타이탄: 보스급 거대 펫
- 부스트: 코인/대미지 증가 효과

### 가치 분석 기준
- RAP(최근 평균 가격) 기반 가치 환산
- 젬 보상 = 알 N개분으로 환산
- 부스트 보상 = 시간 절약량으로 환산

### 티어표 평가 기준
- 대미지 수치
- 특수 능력 (코인 부스트, 럭 등)
- 거래가치 (RAP)
- 획득 난이도

## 출력 시 참고
- game slug: `pet-simulator-99`
- gameTitle: `펫 시뮬레이터 99`
- 컨텐츠 경로: `sites/gamecodekr/content/codes/pet-simulator-99/`
```

- [ ] **Step 3: game-blogger-shindo-life.md 작성**

```markdown
---
name: game-blogger-shindo-life
description: 신도 라이프 전문 블로거 에이전트. 혈통, 원소, PvP 빌드 등 특화 컨텐츠를 작성합니다.
model: sonnet
---

# 신도 라이프 전문 블로거

기본 규칙: `game-blogger` 에이전트의 모든 규칙을 상속합니다.

## 전문 지식

### 핵심 시스템
- 혈통(Bloodline): 나루토 세계관 기반 능력 시스템
- 원소(Element): 불/물/바람 등 속성 공격
- PvP & 보스전
- 스핀: 랜덤으로 새 혈통을 뽑는 시스템
- 동반자(Companion): 소환 가능한 전투 파트너

### 주요 용어 사전
- 혈통(BL): 캐릭터의 핵심 능력 세트 (눈 능력)
- 원소: 속성 공격 능력 (화둔, 수둔 등)
- 스핀: 랜덤으로 새 혈통을 뽑는 것 (로블록스 내 가챠)
- RELL 코인: 프리미엄 화폐 (스핀 구매용)
- 차크라: 스킬 사용에 필요한 에너지
- 진타이(Genjutsu): 환술 계열 기술
- 모드: 변신해서 전투력이 크게 오르는 상태

### 가치 분석 기준
- RELL 코인 보상 = 스핀 N회분으로 환산
- 경험치 보상 = 레벨업 시간 절약으로 환산
- 희귀 혈통 확률 기반 스핀 가치 계산

### 티어표 평가 기준
- PvP 성능 (대미지, CC, 기동성)
- PvE/보스전 성능
- 콤보 잠재력
- 획득 확률 (희소성)

## 출력 시 참고
- game slug: `shindo-life`
- gameTitle: `신도 라이프`
- 컨텐츠 경로: `sites/gamecodekr/content/codes/shindo-life/` 또는 `sites/gamecodekr/content/tiers/shindo-life/`
```

- [ ] **Step 4: 커밋**

```bash
git add .claude/agents/gamecodekr/game-blogger-murder-mystery-2.md .claude/agents/gamecodekr/game-blogger-pet-simulator-99.md .claude/agents/gamecodekr/game-blogger-shindo-life.md
git commit -m "에이전트 추가: 머더 미스터리 2, 펫 시뮬레이터 99, 신도 라이프"
```

---

## Task 3: 게임 전문 에이전트 — 타워 디펜스, 올스타 타워 디펜스, 비 스웜 + 기본 에이전트 업데이트

**Files:**
- Create: `.claude/agents/gamecodekr/game-blogger-tower-defense-simulator.md`
- Create: `.claude/agents/gamecodekr/game-blogger-all-star-tower-defense.md`
- Create: `.claude/agents/gamecodekr/game-blogger-bee-swarm-simulator.md`
- Modify: `.claude/agents/gamecodekr/game-blogger.md`

- [ ] **Step 1: game-blogger-tower-defense-simulator.md 작성**

```markdown
---
name: game-blogger-tower-defense-simulator
description: 타워 디펜스 시뮬레이터 전문 블로거 에이전트. 타워 배치 전략, 이벤트 공략 등 특화 컨텐츠를 작성합니다.
model: sonnet
---

# 타워 디펜스 시뮬레이터 전문 블로거

기본 규칙: `game-blogger` 에이전트의 모든 규칙을 상속합니다.

## 전문 지식

### 핵심 시스템
- 타워 배치: 맵에 타워를 놓아 적 웨이브 방어
- 타워 업그레이드: 레벨업으로 성능 강화
- 이벤트 모드: 한정 맵/타워/스킨
- 하드코어 모드: 고난이도 도전

### 주요 용어 사전
- DPS: 초당 대미지 (타워의 핵심 스탯)
- 범위(Range): 타워가 공격할 수 있는 거리
- 히든 웨이브: 일반 클리어 후 나오는 숨겨진 고난이도 웨이브
- 골든 타워: 최상위 등급 한정 타워
- 팜(Farm): 게임 내 화폐를 자동으로 벌어주는 타워
- 스턴: 적을 잠시 멈추게 하는 효과
- 솔로/멀티: 혼자 또는 여러 명이 함께 플레이

### 가치 분석 기준
- 코인 보상 = 타워 업그레이드 N단계분으로 환산
- 젬 보상 = 크레이트(상자) N개분으로 환산
- 경험치 부스트 = 레벨업 시간 절약

### 티어표 평가 기준
- DPS (싱글타겟/범위)
- 가성비 (배치 비용 대비 성능)
- 특수 능력 (슬로우, 스턴, 디버프)
- 하드코어 모드 필수 여부

## 출력 시 참고
- game slug: `tower-defense-simulator`
- gameTitle: `타워 디펜스 시뮬레이터`
- 컨텐츠 경로: `sites/gamecodekr/content/codes/tower-defense-simulator/`
```

- [ ] **Step 2: game-blogger-all-star-tower-defense.md 작성**

```markdown
---
name: game-blogger-all-star-tower-defense
description: 올스타 타워 디펜스 전문 블로거 에이전트. 애니메 유닛, 소환/진화, 배치 전략 등 특화 컨텐츠를 작성합니다.
model: sonnet
---

# 올스타 타워 디펜스 전문 블로거

기본 규칙: `game-blogger` 에이전트의 모든 규칙을 상속합니다.

## 전문 지식

### 핵심 시스템
- 애니메 캐릭터 기반 타워디펜스
- 유닛 소환: 스타 렘넌트(가챠 재화)로 뽑기
- 진화: 특정 조건 달성 시 유닛 강화
- 스토리/인피니티/레이드 모드

### 주요 용어 사전
- 스타 렘넌트: 유닛 소환에 사용하는 핵심 재화
- 진화: 유닛이 더 강한 형태로 업그레이드 (재료 필요)
- 6성/7성: 유닛 등급 (높을수록 강함)
- DPS: 초당 대미지
- 인피니티 모드: 끝없이 이어지는 웨이브 도전
- 소환 배너: 특정 유닛 확률업 이벤트
- 오브: 진화에 필요한 특수 재료

### 가치 분석 기준
- 젬 보상 = 소환 N회분으로 환산
- 스타 렘넌트 보상 = 소환 가치로 환산
- 경험치 부스트 = 유닛 레벨업 시간 절약

### 티어표 평가 기준
- DPS (지상/공중)
- 범위 공격 vs 단일 타겟
- 특수 능력 (슬로우, 독, 스턴)
- 진화 전후 성능 차이
- 획득 난이도 (소환 확률)

## 출력 시 참고
- game slug: `all-star-tower-defense`
- gameTitle: `올스타 타워 디펜스`
- 컨텐츠 경로: `sites/gamecodekr/content/codes/all-star-tower-defense/` 또는 `sites/gamecodekr/content/tiers/all-star-tower-defense/`
```

- [ ] **Step 3: game-blogger-bee-swarm-simulator.md 작성**

```markdown
---
name: game-blogger-bee-swarm-simulator
description: 비 스웜 시뮬레이터 전문 블로거 에이전트. 벌 수집, 꿀 생산, 이벤트 전략 등 특화 컨텐츠를 작성합니다.
model: sonnet
---

# 비 스웜 시뮬레이터 전문 블로거

기본 규칙: `game-blogger` 에이전트의 모든 규칙을 상속합니다.

## 전문 지식

### 핵심 시스템
- 벌 수집: 다양한 종류의 벌을 모아 꿀 생산
- 꿀 생산: 필드에서 꽃가루 수집 → 벌집에서 꿀로 변환
- 장비: 도구/장비로 수집 효율 향상
- 이벤트: 한정 벌/아이템

### 주요 용어 사전
- 미시컬 벌: 최상위 희귀 등급 벌
- 기프티드(Gifted): 특수 능력이 추가된 강화 벌
- 꽃가루: 필드에서 수집하는 기본 자원
- 벌집: 보유한 벌들의 거점 (슬롯 수 = 벌 수)
- 부스트: 꿀/꽃가루 수집량 증가 효과
- 스프라우트: 필드에 나타나는 보너스 이벤트 꽃
- 풍선: 터뜨리면 보상이 나오는 이벤트 오브젝트

### 가치 분석 기준
- 티켓 보상 = 미시컬 벌 뽑기 N회분으로 환산
- 부스트 보상 = 꿀 생산 시간 절약으로 환산
- 젤리빈 보상 = 기프티드 변환 확률로 환산

### 티어표 평가 기준
- 꿀 생산 효율
- 특수 능력 (토큰 생성, 부스트)
- 기프티드 보너스 가치
- 획득 난이도 (이벤트/미시컬)

## 출력 시 참고
- game slug: `bee-swarm-simulator`
- gameTitle: `비 스웜 시뮬레이터`
- 컨텐츠 경로: `sites/gamecodekr/content/codes/bee-swarm-simulator/`
```

- [ ] **Step 4: game-blogger.md 에이전트 목록 업데이트**

`.claude/agents/gamecodekr/game-blogger.md` 맨 아래의 게임별 전문 지식 섹션을 업데이트:

```markdown
## 게임별 전문 지식

게임별 세부 전문 지식은 아래 오버라이드 에이전트를 참고:
- `game-blogger-blox-fruits` — 블록스 프루츠 전문
- `game-blogger-king-legacy` — 킹 레거시 전문
- `game-blogger-fruit-battlegrounds` — 프루츠 배틀그라운드 전문
- `game-blogger-anime-adventures` — 애니메 어드벤처 전문
- `game-blogger-murder-mystery-2` — 머더 미스터리 2 전문
- `game-blogger-pet-simulator-99` — 펫 시뮬레이터 99 전문
- `game-blogger-shindo-life` — 신도 라이프 전문
- `game-blogger-tower-defense-simulator` — 타워 디펜스 시뮬레이터 전문
- `game-blogger-all-star-tower-defense` — 올스타 타워 디펜스 전문
- `game-blogger-bee-swarm-simulator` — 비 스웜 시뮬레이터 전문
```

- [ ] **Step 5: 커밋**

```bash
git add .claude/agents/gamecodekr/
git commit -m "에이전트 완성: 타워 디펜스, 올스타 TD, 비 스웜 + 기본 에이전트 목록 업데이트"
```

---

## Task 4: 운영 플레이북 3종

**Files:**
- Create: `docs/playbooks/add-new-game.md`
- Create: `docs/playbooks/add-new-site.md`
- Create: `docs/playbooks/monthly-cycle.md`

- [ ] **Step 1: add-new-game.md 작성**

```markdown
# 새 게임 추가 플레이북

GameCodeKR에 새 로블록스 게임을 추가할 때의 단계별 절차.

## 사전 준비

- 게임 slug 결정 (영문 소문자, 하이픈 구분: `game-name`)
- 게임 한글명, 영문명, 로블록스 게임 이미지 URL 확인
- 코드 수집 소스 URL 3개 확인 (Pro Game Guides, Try Hard Guides, Pocket Gamer)
- 티어표 대상 게임인지 결정

## 체크리스트

### 1. 파이프라인 설정 (`pipelines/gamecodekr/config.py`)

- [ ] `GAMES` 배열에 새 게임 추가:
```python
{
    "slug": "game-name",
    "en_name": "Game Name",
    "kr_name": "게임 이름",
    "image_url": "https://tr.rbxcdn.com/...",
},
```
- [ ] 티어표 대상이면 `TIER_GAMES`에도 추가

### 2. 사이트 게임 목록 (`sites/gamecodekr/src/lib/games.ts`)

- [ ] `GAMES` 배열에 새 게임 추가:
```typescript
{
  slug: 'game-name',
  name: '게임 이름',
  nameEn: 'Game Name',
  icon: '🎮',  // 적절한 이모지
  description: '게임 한 줄 설명',
  hasCodes: true,
  hasTier: false,  // 티어표 대상이면 true
}
```

### 3. 컨텐츠 디렉토리 생성

- [ ] `sites/gamecodekr/content/codes/game-name/` 디렉토리 생성
- [ ] 티어표 대상이면 `sites/gamecodekr/content/tiers/game-name/` 도 생성

### 4. 에이전트 작성

- [ ] `.claude/agents/gamecodekr/game-blogger-game-name.md` 작성
  - 기존 에이전트 패턴 참고 (예: `game-blogger-blox-fruits.md`)
  - 게임 핵심 시스템, 용어 사전, 가치 분석 기준, 티어 평가 기준

### 5. 테스트 & 배포

- [ ] `pnpm run build` — 빌드 성공 확인
- [ ] `python -m pipelines.gamecodekr.run codes --skip-collect --skip-push` — 파이프라인 오류 없음 확인
- [ ] 커밋 → push → Cloudflare Pages 자동 배포 확인
```

- [ ] **Step 2: add-new-site.md 작성**

```markdown
# 새 사이트 추가 플레이북

모노레포에 새 블로그 사이트(예: TechBlogKR)를 추가할 때의 절차.

## 사전 준비

- 사이트 이름/slug 결정 (예: `techblogkr`)
- 사이트 도메인 계획 (*.pages.dev → 커스텀 도메인)
- 컨텐츠 구조 결정

## 체크리스트

### 1. Next.js 앱 생성

- [ ] `sites/{site-name}/` 디렉토리 생성
- [ ] `npx create-next-app@latest` 또는 기존 사이트 복사
- [ ] `next.config.mjs`: `output: "export"`, `images: { unoptimized: true }`
- [ ] TailwindCSS 4 설정 (`@import "tailwindcss"`, `@tailwindcss/postcss`)
- [ ] 공유 패키지 의존성 추가:
  ```json
  "@blog-manage/shared-ui": "workspace:*",
  "@blog-manage/shared-seo": "workspace:*",
  "@blog-manage/shared-adsense": "workspace:*"
  ```

### 2. pnpm workspace 확인

- [ ] `pnpm-workspace.yaml`에 `sites/*` 패턴이 이미 있으므로 자동 인식
- [ ] `pnpm install` 실행하여 의존성 연결 확인

### 3. 루트 package.json 업데이트

- [ ] 필요 시 사이트별 빌드 스크립트 추가

### 4. Cloudflare Pages 프로젝트 생성

- [ ] Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
- [ ] Build command: 사이트에 맞게 설정
- [ ] Build output directory: `sites/{site-name}/out`

### 5. 파이프라인 (필요 시)

- [ ] `pipelines/{site-name}/` 디렉토리 생성
- [ ] config.py, 수집/검증/생성 스크립트 작성

### 6. 에이전트 (필요 시)

- [ ] `.claude/agents/{site-name}/` 에이전트 폴더 생성
- [ ] 사이트별 페르소나/리뷰어 에이전트 작성

### 7. 테스트 & 배포

- [ ] `pnpm run build` — 전체 빌드 성공 확인
- [ ] Cloudflare Pages 배포 확인
```

- [ ] **Step 3: monthly-cycle.md 작성**

```markdown
# 월초 컨텐츠 전환 플레이북

매월 1일에 수행되는 컨텐츠 전환 절차. 대부분 자동화되어 있으며 확인만 필요.

## 자동 실행

launchd 또는 GitHub Actions에 의해 매월 1일 00:00(KST)에 자동 실행:

```bash
python -m pipelines.gamecodekr.run monthly
```

이 명령은:
1. 현재 월(YYYY-MM)로 빈 코드 JSON 파일 10개 게임분 생성
2. Git commit & push
3. Cloudflare Pages 자동 빌드/배포

## 수동 확인 체크리스트

자동 실행 후 다음을 확인:

### 페이지 확인

- [ ] `/[game]/codes/` 리다이렉트가 새 월 페이지로 이동하는지 확인
  - 리다이렉트는 클라이언트 사이드 (`ClientRedirect.tsx`)로 현재 월 기준 자동 동작
- [ ] 이전 달 페이지에 아카이브 배너("최신 코드는 여기서 확인하세요") 표시 확인
  - `ArchiveBanner` 컴포넌트가 현재 월과 비교하여 자동 표시

### SEO 확인

- [ ] `/sitemap.xml`에 새 월 페이지가 포함되어 있는지 확인
- [ ] Google Search Console에서 새 sitemap 제출 (자동 감지되지만 수동 확인 권장)

### 이전 달 정리 (필요 시)

- [ ] 만료된 코드를 `expiredCodes` 배열로 이동 (수동 또는 에이전트 활용)
- [ ] rewardAnalysis가 비어있는 코드에 분석 추가 (에이전트 활용)

### 트러블슈팅

- 자동 실행이 안 된 경우: `launchctl list | grep blogmanage`로 스케줄 확인
- 수동 실행: `python -m pipelines.gamecodekr.run monthly --skip-push` 후 확인 → `git push`
- 빌드 실패: `pnpm run build`로 로컬에서 먼저 확인
```

- [ ] **Step 4: 커밋**

```bash
git add docs/playbooks/
git commit -m "운영 플레이북: 게임 추가, 사이트 추가, 월초 전환 절차서"
```

---

## Task 5: 컨텐츠 템플릿 3종

**Files:**
- Create: `docs/templates/code-template.md`
- Create: `docs/templates/tier-template.md`
- Create: `docs/templates/patch-template.md`

- [ ] **Step 1: code-template.md 작성**

```markdown
# 코드 컨텐츠 작성 가이드

## JSON 구조

파일: `sites/gamecodekr/content/codes/[game-slug]/[YYYY-MM].json`

### 필드 설명

| 필드 | 타입 | 설명 |
|---|---|---|
| `code` | string | 코드 문자열 (대소문자 정확히) |
| `reward` | string | 보상 설명 (한국어) |
| `verified` | number | 교차검증 소스 수 (1~3) |
| `status` | string | `active` (2+소스) / `unverified` (1소스) / `expired` (만료) |
| `addedDate` | string | 추가 날짜 (YYYY-MM-DD) |
| `rewardAnalysis` | string | 보상 가치 분석 (에이전트 작성) |

### rewardAnalysis 작성 가이드

보상의 게임 내 가치를 독자가 이해할 수 있게 분석합니다.

**좋은 예:**
- "스탯 리셋은 보통 로북스 300개 가치. 빌드 변경 시 필수."
- "이중 경험치 15분은 퀘스트 3~4개를 빠르게 클리어할 수 있는 양."
- "이 코드의 젬 500개는 소환 2.5회분. 시크릿 유닛 노리기 좋아요."

**나쁜 예:**
- "좋은 보상입니다" (구체적이지 않음)
- "2x EXP" (번역 안 됨, 가치 분석 없음)

### 상태값 규칙

- `active`: 2개 이상 소스에서 확인됨 → ✅✅ 또는 ✅✅✅
- `unverified`: 1개 소스에서만 확인됨 → ⚠️ 미확인
- `expired`: 더 이상 작동하지 않음 → `expiredCodes` 배열로 이동

### 예시 JSON

```json
{
  "code": "SUB2GAMERROBOT_RESET",
  "reward": "스탯 리셋",
  "verified": 3,
  "status": "active",
  "addedDate": "2026-04-01",
  "rewardAnalysis": "스탯 리셋은 보통 로북스 300개 가치. 빌드 변경 시 필수."
}
```
```

- [ ] **Step 2: tier-template.md 작성**

```markdown
# 티어표 컨텐츠 작성 가이드

## JSON 구조

파일: `sites/gamecodekr/content/tiers/[game-slug]/[YYYY-MM].json`

### 티어 등급 기준

| 등급 | 의미 | 설명 |
|---|---|---|
| S | 최강 | 현재 메타 최상위. 무조건 키우세요 |
| A | 강함 | S급 바로 아래. 충분히 강력함 |
| B | 보통 | 평균적인 성능. 초보자에게 무난 |
| C | 약함 | 특수 상황에서만 쓸만함 |
| D | 매우 약함 | 다른 선택지가 있다면 비추천 |
| F | 최하위 | 사용 비추천 |

### 아이템 필드 설명

| 필드 | 설명 |
|---|---|
| `name` | 원어 이름 |
| `nameKo` | 한국어 이름 (공식명 우선, 없으면 음역) |
| `rank` | 티어 등급 (S/A/B/C/D/F) |
| `description` | 한 줄 설명 (강점/약점) |
| `changeFromLast` | 지난달 대비 변동 (`up`/`down`/`same`/`new`) |

### nameKo 번역 규칙

1. 공식 한국어 이름이 있으면 사용 (예: 게임 내 한글화)
2. 없으면 음역 (예: "Leopard" → "레오파드")
3. 커뮤니티에서 통용되는 한글명이 있으면 그것 사용

### description 작성 가이드

한 줄로 해당 아이템의 핵심을 설명합니다.

**좋은 예:**
- "범위 공격 최강. PvP/PvE 모두 S급. 각성 필수."
- "단일 타겟 DPS는 높지만 범위가 좁아서 팀전에서는 B급."

**나쁜 예:**
- "강합니다" (구체적이지 않음)
- "S tier fruit" (한국어 아님)

### changeFromLast 기준

- `up`: 이전 달보다 등급 상승 (예: B → A)
- `down`: 이전 달보다 등급 하락 (예: A → B)
- `same`: 변동 없음
- `new`: 이번 달 신규 추가
```

- [ ] **Step 3: patch-template.md 작성**

```markdown
# 패치 요약 작성 가이드

## MDX 구조

파일: `sites/gamecodekr/content/posts/[game-slug]/[slug].mdx`

### 기본 구조

```mdx
---
title: "[게임명] [패치 버전/날짜] 업데이트 요약"
date: "YYYY-MM-DD"
game: "game-slug"
type: "patch"
---

## 이게 뭐가 바뀐 거야?

핵심 변경사항을 3~5개 이내로 요약.
각 항목은 한 줄로 뭐가 바뀌었는지 + 그게 뭔지 쉽게 설명.

- **[항목명]**: 어떻게 바뀌었는지 (쉬운 설명)
- **[항목명]**: 어떻게 바뀌었는지

## 어떻게 달라져?

변경사항이 플레이에 미치는 영향 설명.
특히 메타/티어/전략 변화를 중심으로.

## 꿀팁

이번 패치 이후 추천 전략이나 팁.
초보자도 바로 활용할 수 있는 실용적인 내용.

## 한줄 요약

> 이번 패치 핵심을 한 문장으로.
```

### 작성 규칙

- 페르소나 규칙 준수 (초등학생도 이해 가능)
- 공식 패치 노트 기반, 확인된 정보만
- 너프/버프 시 이전 수치와 비교
- 커뮤니티 반응은 "~라는 의견이 많아요" 형태로 (확정 X)
```

- [ ] **Step 4: 커밋**

```bash
git add docs/templates/
git commit -m "컨텐츠 템플릿: 코드, 티어표, 패치 요약 작성 가이드"
```

---

## Task 6: 가이드 문서 4종

**Files:**
- Create: `docs/guides/pipeline-guide.md`
- Create: `docs/guides/search-console-guide.md`
- Create: `docs/guides/naver-webmaster-guide.md`
- Create: `docs/guides/launchd-guide.md`

- [ ] **Step 1: pipeline-guide.md 작성**

```markdown
# 데이터 수집 파이프라인 가이드

## 개요

GameCodeKR 데이터 수집 파이프라인은 Playwright headless 브라우저로 코드/티어 데이터를 수집하고,
교차검증 후 content/ JSON 파일로 변환하여 Git push로 자동 배포한다.

## 명령어

프로젝트 루트에서 실행:

```bash
# 코드 수집 → 검증 → JSON 생성 → Git push
python3 -m pipelines.gamecodekr.run codes

# 티어 수집 → 검증 → JSON 생성 → Git push
python3 -m pipelines.gamecodekr.run tiers

# 월초 빈 페이지 생성 → Git push
python3 -m pipelines.gamecodekr.run monthly

# 수집 없이 기존 데이터로 JSON만 재생성
python3 -m pipelines.gamecodekr.run generate
```

## 플래그

| 플래그 | 설명 |
|---|---|
| `--month YYYY-MM` | 대상 월 지정 (기본: 현재 월) |
| `--skip-collect` | 수집 단계 생략 (기존 data/ 사용) |
| `--skip-push` | Git push 생략 (커밋만 생성) |

## 사전 준비

```bash
cd pipelines/gamecodekr
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

## 파일 구조

| 경로 | 역할 |
|---|---|
| `pipelines/gamecodekr/config.py` | 게임 목록, 소스 URL, 설정 |
| `pipelines/gamecodekr/collect_codes.py` | Playwright 코드 수집 |
| `pipelines/gamecodekr/collect_tiers.py` | Playwright 티어 수집 |
| `pipelines/gamecodekr/validate_codes.py` | 코드 교차검증 |
| `pipelines/gamecodekr/validate_tiers.py` | 티어 교차검증 |
| `pipelines/gamecodekr/generate_content.py` | JSON 생성 |
| `pipelines/gamecodekr/run.py` | CLI 진입점 |
| `pipelines/shared/git_utils.py` | Git 커밋/푸시 |

## 트러블슈팅

### Playwright 설치 오류
```bash
playwright install chromium --with-deps
```

### 수집 실패 (타임아웃)
- 네트워크 상태 확인
- `config.py`의 `DELAY_BETWEEN_PAGES_SEC` 값 증가
- 특정 소스가 차단된 경우 해당 소스의 수집 로그 확인

### JSON 파싱 오류
- `pipelines/gamecodekr/data/collected_codes.json` 직접 확인
- 수집 데이터가 비어있으면 소스 사이트 구조 변경 가능성

### 로그 확인
```bash
# 로컬 실행 로그
cat logs/codes-YYYY-MM-DD.log

# launchd 로그
cat logs/launchd-codes.log
cat logs/launchd-codes-err.log
```
```

- [ ] **Step 2: search-console-guide.md 작성**

```markdown
# Google Search Console 가이드

## 사이트 등록

1. [Google Search Console](https://search.google.com/search-console) 접속
2. "속성 추가" → "URL 접두사" 선택
3. 사이트 URL 입력 (예: `https://blog-manage.pages.dev`)
4. 소유권 확인: HTML 태그 방식 권장
   - 제공된 `<meta>` 태그를 `sites/gamecodekr/src/app/layout.tsx`의 `metadata`에 추가
   - 빌드 & 배포 후 확인

## Sitemap 제출

1. Search Console → 색인 → Sitemaps
2. sitemap URL 입력: `sitemap.xml`
3. 제출 → 상태가 "성공"인지 확인

사이트맵은 `sites/gamecodekr/src/app/sitemap.ts`에서 자동 생성됨.
새 게임/월 추가 시 자동으로 포함됨.

## 색인 요청

새 페이지를 빠르게 색인하고 싶을 때:

1. Search Console → URL 검사
2. 페이지 URL 입력
3. "색인 생성 요청" 클릭

매월 새 페이지가 생성되므로 월초에 주요 페이지 색인 요청 권장.

## 실적 모니터링

주요 확인 포인트:
- 검색 노출수/클릭수 추이
- 주요 키워드별 순위
- 모바일 사용성 문제
- 색인 커버리지 오류
```

- [ ] **Step 3: naver-webmaster-guide.md 작성**

```markdown
# 네이버 웹마스터 도구 가이드

## 사이트 등록

1. [네이버 웹마스터 도구](https://searchadvisor.naver.com/) 접속
2. "사이트 관리" → "사이트 등록"
3. 사이트 URL 입력 (예: `https://blog-manage.pages.dev`)
4. 소유권 확인: HTML 태그 방식 권장
   - 제공된 `<meta name="naver-site-verification" content="...">` 태그를
     `sites/gamecodekr/src/app/layout.tsx`의 `metadata.verification`에 추가:
   ```typescript
   verification: {
     other: {
       'naver-site-verification': '발급받은_코드',
     },
   },
   ```
   - 빌드 & 배포 후 확인

## 사이트맵 등록

1. 웹마스터 도구 → 요청 → 사이트맵 제출
2. sitemap URL: `https://blog-manage.pages.dev/sitemap.xml`
3. 제출

## 신디케이션 (syndication.xml)

네이버 신디케이션은 콘텐츠 업데이트를 네이버에 즉시 알리는 방식.
현재는 sitemap 기반으로 운영하되, 추후 필요 시 `syndication.xml` 생성기 추가.

## 검색 노출 확인

1. 네이버에서 `site:blog-manage.pages.dev` 검색
2. 웹마스터 도구 → 현황 → 콘텐츠 수집
3. 수집 상태가 "정상"인지 확인

## 한국어 SEO 팁

- `lang="ko"` 필수 (layout.tsx에 이미 적용됨)
- 한국어 키워드 중심 title/description
- 네이버는 meta description을 구글보다 더 많이 참조
```

- [ ] **Step 4: launchd-guide.md 작성**

```markdown
# macOS launchd 스케줄러 가이드

## 설치

```bash
bash scripts/local/install.sh
```

이 스크립트는:
1. `~/Library/LaunchAgents/`에 plist 파일 복사 (경로 자동 치환)
2. `launchctl load`로 스케줄 등록
3. 래퍼 스크립트에 실행 권한 부여

## 스케줄

| 작업 | 주기 | plist |
|---|---|---|
| 코드 수집 | 매일 09:00 | `com.blogmanage.codes.plist` |
| 티어 수집 | 매주 월요일 09:00 | `com.blogmanage.tiers.plist` |
| 월초 생성 | 매월 1일 00:00 | `com.blogmanage.monthly.plist` |

## 상태 확인

```bash
# 등록된 스케줄 확인
launchctl list | grep blogmanage

# 결과 예시:
# -    0    com.blogmanage.codes
# -    0    com.blogmanage.tiers
# -    0    com.blogmanage.monthly
```

두 번째 열(0)은 마지막 실행 종료 코드. 0이면 성공.

## 수동 실행

```bash
# 스케줄과 별개로 즉시 실행
launchctl start com.blogmanage.codes
launchctl start com.blogmanage.tiers
launchctl start com.blogmanage.monthly
```

## 로그 확인

```bash
# 래퍼 스크립트 로그 (날짜별)
cat logs/codes-$(date +%Y-%m-%d).log

# launchd stdout/stderr
cat logs/launchd-codes.log
cat logs/launchd-codes-err.log
```

## 제거

```bash
bash scripts/local/uninstall.sh
```

## 트러블슈팅

### 스케줄이 실행 안 됨
1. `launchctl list | grep blogmanage` — 등록 여부 확인
2. 미등록이면 `bash scripts/local/install.sh` 재실행
3. macOS "시스템 설정 → 일반 → 로그인 항목 → 백그라운드 허용" 확인

### Python을 못 찾음
- 래퍼 스크립트가 `.venv`를 활성화하므로 venv이 먼저 생성되어야 함
- `pipelines/gamecodekr/.venv/` 확인

### 권한 오류
- plist 파일 소유자: 현재 사용자여야 함
- `chmod 644 ~/Library/LaunchAgents/com.blogmanage.*.plist`
```

- [ ] **Step 5: 커밋**

```bash
git add docs/guides/ docs/templates/
git commit -m "가이드 + 템플릿: 파이프라인, SEO, 스케줄러, 컨텐츠 작성 가이드"
```

---

## Task 7: 최종 확인 및 CLAUDE.md 업데이트

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: CLAUDE.md에 플레이북/가이드 참조 추가**

`CLAUDE.md`의 `## 참고` 섹션 아래에 추가:

```markdown
## 운영 문서

- 새 게임 추가: `docs/playbooks/add-new-game.md`
- 새 사이트 추가: `docs/playbooks/add-new-site.md`
- 월초 전환: `docs/playbooks/monthly-cycle.md`
- 파이프라인 실행: `docs/guides/pipeline-guide.md`
- launchd 스케줄러: `docs/guides/launchd-guide.md`
```

- [ ] **Step 2: 커밋**

```bash
git add CLAUDE.md
git commit -m "CLAUDE.md: 운영 문서 참조 추가"
```

- [ ] **Step 3: Git push**

```bash
git push
```
