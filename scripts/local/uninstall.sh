#!/bin/bash
# launchd 스케줄러 제거
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"

for plist in com.blogmanage.codes.plist com.blogmanage.tiers.plist com.blogmanage.monthly.plist; do
    if [ -f "$LAUNCH_AGENTS_DIR/$plist" ]; then
        launchctl unload "$LAUNCH_AGENTS_DIR/$plist" 2>/dev/null
        rm "$LAUNCH_AGENTS_DIR/$plist"
        echo "제거: $plist"
    fi
done

echo "제거 완료"
