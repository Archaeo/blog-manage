#!/bin/bash
# 코드 수집 파이프라인 실행
cd "$(dirname "$0")/../.."
source pipelines/gamecodekr/.venv/bin/activate 2>/dev/null || true
python -m pipelines.gamecodekr.run codes 2>&1 | tee -a logs/codes-$(date +%Y-%m-%d).log
