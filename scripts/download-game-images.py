#!/usr/bin/env python3
"""게임 이미지를 config.py의 URL에서 다운로드하여 public/images/games/에 저장한다."""
import sys
import urllib.request
from pathlib import Path

# 프로젝트 루트 기준 경로
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

from pipelines.gamecodekr.config import GAMES

OUTPUT_DIR = PROJECT_ROOT / "sites" / "gamecodekr" / "public" / "images" / "games"


def download_images(force: bool = False) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for game in GAMES:
        slug = game["slug"]
        url = game["image_url"]
        output_path = OUTPUT_DIR / f"{slug}.png"

        if output_path.exists() and not force:
            print(f"  스킵 (이미 존재): {slug}")
            continue

        print(f"  다운로드: {slug} ← {url[:60]}...")
        try:
            urllib.request.urlretrieve(url, output_path)
            print(f"  ✓ 저장: {output_path.relative_to(PROJECT_ROOT)}")
        except Exception as e:
            print(f"  ✗ 실패: {e}")


if __name__ == "__main__":
    force = "--force" in sys.argv
    print("게임 이미지 다운로드 시작...")
    download_images(force=force)
    print("완료!")
