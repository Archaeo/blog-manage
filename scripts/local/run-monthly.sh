#!/bin/bash
# 월초 페이지 생성
cd "$(dirname "$0")/../.."
source pipelines/gamecodekr/.venv/bin/activate 2>/dev/null || true
python -m pipelines.gamecodekr.run monthly 2>&1 | tee -a logs/monthly-$(date +%Y-%m-%d).log
