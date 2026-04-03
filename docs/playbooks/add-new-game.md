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
