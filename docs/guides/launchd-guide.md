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
