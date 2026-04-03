#!/usr/bin/env python3
# pipelines/gamecodekr/run.py
"""GameCodeKR 파이프라인 실행 스크립트.

사용법:
    python -m pipelines.gamecodekr.run codes     # 코드 수집 → 검증 → 생성 → push
    python -m pipelines.gamecodekr.run tiers     # 티어 수집 → 검증 → 생성 → push
    python -m pipelines.gamecodekr.run monthly   # 월초 새 페이지 생성
    python -m pipelines.gamecodekr.run generate  # 수집 없이 기존 데이터로 생성만
"""
import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

from pipelines.gamecodekr.config import (
    COLLECTED_CODES_FILE,
    COLLECTED_TIERS_FILE,
    DATA_DIR,
    GAMES,
    PROJECT_ROOT,
    TIER_GAMES,
    get_game_by_en_name,
)
from pipelines.gamecodekr.generate_content import (
    update_code_content,
    update_tier_content,
)
from pipelines.gamecodekr.validate_codes import cross_verify_codes
from pipelines.gamecodekr.validate_tiers import cross_verify_tiers
from pipelines.shared.git_utils import git_add_and_commit, git_has_changes, git_push


def get_current_month() -> str:
    """현재 월을 YYYY-MM 형식으로 반환."""
    now = datetime.now()
    return f"{now.year}-{now.strftime('%m')}"


def run_codes(month: str, skip_collect: bool = False, skip_push: bool = False) -> None:
    """코드 파이프라인: 수집 → 검증 → JSON 생성 → Git push."""
    print(f"[codes] 시작: {month}")

    if not skip_collect:
        print("[codes] 수집 중...")
        from pipelines.gamecodekr.collect_codes import collect_all_codes
        collect_all_codes()

    if not COLLECTED_CODES_FILE.exists():
        print(f"[codes] 수집 데이터 없음: {COLLECTED_CODES_FILE}")
        return

    with open(COLLECTED_CODES_FILE, encoding="utf-8") as f:
        collected = json.load(f)

    changed_files: list[Path] = []

    for game_data in collected.get("games", {}).values():
        kr_name = game_data.get("kr_name", "")
        sources = game_data.get("sources", {})

        game_config = None
        for g in GAMES:
            if g["kr_name"] == kr_name:
                game_config = g
                break

        if not game_config:
            print(f"[codes] 게임 설정 없음: {kr_name}")
            continue

        verified = cross_verify_codes(sources)
        print(f"[codes] {game_config['kr_name']}: {len(verified)}개 코드 (검증됨: {sum(1 for v in verified if v['verified'])})")

        filepath = update_code_content(
            game_slug=game_config["slug"],
            game_title=game_config["kr_name"],
            month=month,
            verified_codes=verified,
        )
        changed_files.append(filepath)

    if changed_files and git_has_changes(PROJECT_ROOT):
        today = datetime.now().strftime("%Y-%m-%d")
        message = f"[자동] 코드 업데이트 ({today}): {len(changed_files)}개 게임"
        committed = git_add_and_commit(PROJECT_ROOT, changed_files, message)
        if committed and not skip_push:
            git_push(PROJECT_ROOT)
            print(f"[codes] push 완료")
        elif committed:
            print(f"[codes] 커밋 완료 (push 생략)")
    else:
        print("[codes] 변경 없음")


def run_tiers(month: str, skip_collect: bool = False, skip_push: bool = False) -> None:
    """티어 파이프라인: 수집 → 검증 → JSON 생성 → Git push."""
    print(f"[tiers] 시작: {month}")

    if not skip_collect:
        print("[tiers] 수집 중...")
        from pipelines.gamecodekr.collect_tiers import collect_all_tiers
        collect_all_tiers()

    if not COLLECTED_TIERS_FILE.exists():
        print(f"[tiers] 수집 데이터 없음: {COLLECTED_TIERS_FILE}")
        return

    with open(COLLECTED_TIERS_FILE, encoding="utf-8") as f:
        collected = json.load(f)

    changed_files: list[Path] = []

    for game_slug, sources in collected.items():
        game_config = next((g for g in GAMES if g["slug"] == game_slug), None)
        if not game_config:
            continue

        tier_config = TIER_GAMES.get(game_slug)
        if not tier_config:
            continue

        verified, source_texts = cross_verify_tiers(sources)

        for category, items in verified.items():
            print(f"[tiers] {game_config['kr_name']} {category}: {len(items)}개 항목")
            filepath = update_tier_content(
                game_slug=game_slug,
                game_title=game_config["kr_name"],
                month=month,
                category=category,
                verified_tiers=items,
            )
            changed_files.append(filepath)

    if changed_files and git_has_changes(PROJECT_ROOT):
        today = datetime.now().strftime("%Y-%m-%d")
        message = f"[자동] 티어 업데이트 ({today}): {len(changed_files)}개 파일"
        committed = git_add_and_commit(PROJECT_ROOT, changed_files, message)
        if committed and not skip_push:
            git_push(PROJECT_ROOT)
            print(f"[tiers] push 완료")
    else:
        print("[tiers] 변경 없음")


def run_monthly(skip_push: bool = False) -> None:
    """월초 작업: 새 달 빈 JSON 파일 생성."""
    month = get_current_month()
    print(f"[monthly] 새 달 설정: {month}")

    changed_files: list[Path] = []

    for game in GAMES:
        code_file = update_code_content(
            game_slug=game["slug"],
            game_title=game["kr_name"],
            month=month,
            verified_codes=[],
        )
        changed_files.append(code_file)

    if changed_files and git_has_changes(PROJECT_ROOT):
        message = f"[자동] {month} 월초 페이지 생성"
        committed = git_add_and_commit(PROJECT_ROOT, changed_files, message)
        if committed and not skip_push:
            git_push(PROJECT_ROOT)
    print(f"[monthly] 완료: {len(changed_files)}개 파일")


def main():
    parser = argparse.ArgumentParser(description="GameCodeKR 파이프라인")
    parser.add_argument(
        "command",
        choices=["codes", "tiers", "monthly", "generate"],
        help="실행할 명령",
    )
    parser.add_argument("--month", default=get_current_month(), help="대상 월 (YYYY-MM)")
    parser.add_argument("--skip-collect", action="store_true", help="수집 단계 생략")
    parser.add_argument("--skip-push", action="store_true", help="Git push 생략")

    args = parser.parse_args()
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if args.command == "codes":
        run_codes(args.month, skip_collect=args.skip_collect, skip_push=args.skip_push)
    elif args.command == "tiers":
        run_tiers(args.month, skip_collect=args.skip_collect, skip_push=args.skip_push)
    elif args.command == "monthly":
        run_monthly(skip_push=args.skip_push)
    elif args.command == "generate":
        run_codes(args.month, skip_collect=True, skip_push=args.skip_push)
        run_tiers(args.month, skip_collect=True, skip_push=args.skip_push)


if __name__ == "__main__":
    main()
