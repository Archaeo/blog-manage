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
