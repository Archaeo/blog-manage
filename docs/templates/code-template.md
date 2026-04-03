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
