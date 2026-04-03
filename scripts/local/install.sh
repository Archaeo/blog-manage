#!/bin/bash
# launchd 스케줄러 설치
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"

echo "프로젝트 경로: $PROJECT_DIR"

# logs 디렉토리 생성
mkdir -p "$PROJECT_DIR/logs"

# plist 복사 및 경로 치환
for plist in com.blogmanage.codes.plist com.blogmanage.tiers.plist com.blogmanage.monthly.plist; do
    sed "s|INSTALL_DIR|$PROJECT_DIR|g" "$SCRIPT_DIR/$plist" > "$LAUNCH_AGENTS_DIR/$plist"
    echo "등록: $plist"
    launchctl load "$LAUNCH_AGENTS_DIR/$plist"
done

# 실행 권한 부여
chmod +x "$SCRIPT_DIR"/run-*.sh

echo "설치 완료! 스케줄:"
echo "  코드 수집: 매일 09:00"
echo "  티어 수집: 매주 월요일 09:00"
echo "  월초 생성: 매월 1일 00:00"
