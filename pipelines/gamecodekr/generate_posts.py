"""수집된 데이터를 기반으로 분석 MDX 포스트를 생성한다.

Claude Code CLI를 사용하여 코드/티어 JSON 데이터를 읽고 분석 글을 작성.
기존 MDX가 있으면 건너뛴다.
"""
import json
import shutil
import subprocess
from datetime import datetime
from pathlib import Path

from pipelines.gamecodekr.config import (
    CATEGORY_LABELS,
    CODES_DIR,
    CONTENT_DIR,
    TIER_ORDER,
    TIERS_DIR,
)

POSTS_DIR = CONTENT_DIR / "posts"
CLAUDE_BIN = shutil.which("claude") or "/Users/arkeo/.local/bin/claude"

# ── 컨텐츠 작성 규칙 (공통 페르소나) ──────────────────────
PERSONA_RULES = """규칙:
- 한국어 작성 필수
- 초등학생도 이해할 수 있는 쉬운 한국어
- 어려운 게임 용어는 괄호 안에 쉬운 설명 추가 (예: "너프(약해짐)")
- 핵심만 요약, 불필요한 서론 없이 바로 본론
- 확인되지 않은 정보를 확정처럼 쓰지 않기
- 영어 용어는 한국어 설명 병기
- MDX 형식으로 출력 (frontmatter 포함)
- frontmatter와 본문만 출력, 마크다운 코드블록으로 감싸지 않기"""


def _call_claude(prompt: str, timeout: int = 300) -> str | None:
    """Claude Code CLI를 비대화형으로 호출한다."""
    try:
        result = subprocess.run(
            [CLAUDE_BIN, "-p", prompt, "--system-prompt",
             "당신은 로블록스 게임 전문 블로거입니다. 요청된 MDX 형식으로만 출력하세요. frontmatter와 본문만 출력하고, 부가 설명이나 코드블록 래핑 없이 순수 MDX 콘텐츠만 반환하세요."],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        if result.returncode != 0:
            print(f"[posts] claude CLI 오류: {result.stderr[:200]}")
            return None
        return result.stdout.strip()
    except FileNotFoundError:
        print("[posts] claude CLI 없음, 포스트 생성 건너뜀")
        return None
    except subprocess.TimeoutExpired:
        print("[posts] claude CLI 타임아웃")
        return None


def _strip_codeblock(text: str) -> str:
    """마크다운 코드블록 래핑 제거."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
    return text.strip()


def generate_code_post(
    game_slug: str,
    game_title: str,
    month: str,
) -> Path | None:
    """코드 분석 MDX 포스트를 생성한다.

    이미 파일이 존재하면 건너뛴다.
    """
    post_dir = POSTS_DIR / game_slug
    filepath = post_dir / f"{month}-code-analysis.mdx"

    if filepath.exists():
        print(f"[posts] 이미 존재, 건너뜀: {filepath.name}")
        return filepath

    # 코드 JSON 로드
    code_file = CODES_DIR / game_slug / f"{month}.json"
    if not code_file.exists():
        print(f"[posts] 코드 데이터 없음: {code_file}")
        return None

    with open(code_file, encoding="utf-8") as f:
        code_data = json.load(f)

    codes = code_data.get("codes", [])
    if not codes:
        print(f"[posts] {game_title}: 코드 없음, 포스트 생성 건너뜀")
        return None

    # 코드 정보 정리
    code_lines = []
    for c in codes:
        status = "✅ 사용 가능" if c["status"] == "active" else "⚠️ 확인 중"
        reward = c.get("reward", "") or "보상 확인 중"
        code_lines.append(f"- {c['code']}: {reward} ({status})")
    code_info = "\n".join(code_lines)

    year, m = month.split("-")
    month_label = f"{year}년 {int(m)}월"
    today = datetime.now().strftime("%Y-%m-%d")

    prompt = f"""당신은 로블록스 게임 전문 블로거입니다.

{game_title}의 {month_label} 코드 보상 가치 분석 MDX 포스트를 작성해주세요.

현재 코드 목록:
{code_info}

다음 frontmatter로 시작해주세요:
---
title: "{game_title} {month_label} 코드 보상 가치 분석"
date: "{today}"
game: "{game_slug}"
type: "code-analysis"
tags: ["코드", "보상 분석", "{game_title}", "{month_label}"]
description: "이번 달 {game_title} 코드 보상의 게임 내 가치를 분석합니다."
---

포함할 내용:
- 이번 달 코드 총 가치 요약
- 코드별 상세 분석 (보상 가치, 사용 추천 타이밍)
- 추천 사용 순서
- 확인된 코드와 미확인 코드 구분

{PERSONA_RULES}"""

    response = _call_claude(prompt)
    if not response:
        return None

    content = _strip_codeblock(response)

    post_dir.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content + "\n")

    print(f"[posts] 생성 완료: {filepath.name}")
    return filepath


def generate_tier_post(
    game_slug: str,
    game_title: str,
    month: str,
) -> Path | None:
    """티어 분석 MDX 포스트를 생성한다.

    이미 파일이 존재하면 건너뛴다.
    카테고리별 티어 JSON을 통합하여 하나의 포스트 생성.
    """
    post_dir = POSTS_DIR / game_slug
    filepath = post_dir / f"{month}-tier-analysis.mdx"

    if filepath.exists():
        print(f"[posts] 이미 존재, 건너뜀: {filepath.name}")
        return filepath

    # 티어 JSON 로드 (카테고리별)
    tier_dir = TIERS_DIR / game_slug
    if not tier_dir.exists():
        print(f"[posts] 티어 데이터 없음: {tier_dir}")
        return None

    tier_files = sorted(tier_dir.glob(f"{month}-*.json"))
    if not tier_files:
        print(f"[posts] {game_title}: 티어 파일 없음")
        return None

    # 모든 카테고리 데이터 합침
    all_tier_info = []
    category_names = []
    for tf in tier_files:
        with open(tf, encoding="utf-8") as f:
            data = json.load(f)

        category = data.get("category", "")
        category_kr = CATEGORY_LABELS.get(category, category)
        category_names.append(category_kr)

        tier_lines = []
        for tier_key in TIER_ORDER:
            items = data.get("tiers", {}).get(tier_key, [])
            if items:
                names = ", ".join(i["name"] for i in items[:10])
                tier_lines.append(f"  {tier_key}: {names}")

        if tier_lines:
            all_tier_info.append(f"[{category_kr}]\n" + "\n".join(tier_lines))

    tier_info = "\n\n".join(all_tier_info)
    category_title = "/".join(category_names) if len(category_names) > 1 else category_names[0]

    year, m = month.split("-")
    month_label = f"{year}년 {int(m)}월"
    today = datetime.now().strftime("%Y-%m-%d")

    prompt = f"""당신은 로블록스 게임 전문 블로거입니다.

{game_title}의 {month_label} {category_title} 티어표 분석 MDX 포스트를 작성해주세요.

현재 티어 배치:
{tier_info}

다음 frontmatter로 시작해주세요:
---
title: "{game_title} {category_title} 티어 리스트 {month_label}"
date: "{today}"
game: "{game_slug}"
type: "tier-analysis"
tags: ["{game_title}", "{category_title}티어", "로블록스"]
description: "{month_label} {game_title} 최신 {category_title} 티어표 분석. 어떤 것이 강한지 완벽 정리."
---

포함할 내용:
- 티어별 대표 항목과 왜 강한지/가치 있는지 분석
- 이번 달 주요 변화 (있다면)
- 초보자 추천 가이드
- 각 티어별 가치 비교

{PERSONA_RULES}"""

    response = _call_claude(prompt)
    if not response:
        return None

    content = _strip_codeblock(response)

    post_dir.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content + "\n")

    print(f"[posts] 생성 완료: {filepath.name}")
    return filepath


def generate_all_posts(month: str, games: list[dict]) -> list[Path]:
    """모든 게임의 코드/티어 분석 포스트를 생성한다."""
    changed_files: list[Path] = []

    for game in games:
        slug = game["slug"]
        title = game["kr_name"]

        # 코드 분석 포스트
        code_post = generate_code_post(slug, title, month)
        if code_post:
            changed_files.append(code_post)

        # 티어 분석 포스트
        tier_post = generate_tier_post(slug, title, month)
        if tier_post:
            changed_files.append(tier_post)

    return changed_files
