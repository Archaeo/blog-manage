"""수집 데이터를 sites/gamecodekr/content/ JSON 파일로 변환한다."""
import json
from datetime import datetime, timezone
from pathlib import Path

from pipelines.gamecodekr.config import CODES_DIR, TIERS_DIR


def generate_code_json(
    game_slug: str,
    game_title: str,
    month: str,
    verified_codes: list[dict],
) -> dict:
    """교차검증된 코드 목록으로 월단위 코드 JSON을 생성한다."""
    now = datetime.now(timezone.utc).isoformat()
    today = datetime.now().strftime("%Y-%m-%d")
    year, m = month.split("-")
    month_label = f"{year}년 {int(m)}월"

    codes = []
    for vc in verified_codes:
        codes.append(
            {
                "code": vc["code"],
                "reward": vc["reward"],
                "verified": vc["sources"],
                "status": "active" if vc["verified"] else "unverified",
                "addedDate": today,
                "rewardAnalysis": "",
            }
        )

    return {
        "game": game_slug,
        "gameTitle": game_title,
        "month": month,
        "lastUpdated": now,
        "codes": codes,
        "expiredCodes": [],
        "meta": {
            "title": f"{game_title} 코드 총정리 ({month_label}) - 매일 업데이트",
            "description": f"{month_label} {game_title} 최신 코드 모음! 모든 코드를 매일 확인하고 업데이트합니다.",
            "keywords": [
                f"{game_title} 코드",
                f"{game_title} 코드 {month_label}",
                f"{game_slug} codes",
                "로블록스 코드",
            ],
        },
    }


def generate_tier_json(
    game_slug: str,
    game_title: str,
    month: str,
    category: str,
    verified_tiers: list[dict],
) -> dict:
    """교차검증된 티어 데이터로 월단위 티어 JSON을 생성한다."""
    now = datetime.now(timezone.utc).isoformat()
    year, m = month.split("-")
    month_label = f"{year}년 {int(m)}월"

    tiers: dict[str, list] = {"S+": [], "S": [], "A": [], "B": [], "C": [], "D": []}
    for item in verified_tiers:
        tier_key = item["tier"]
        if tier_key not in tiers:
            tier_key = "D"
        tiers[tier_key].append(
            {
                "name": item["name"],
                "nameKo": item["name"],
                "rank": tier_key,
                "description": "",
                "changeFromLast": "same",
                "imageUrl": item.get("image_url", ""),
                "consensus": item.get("consensus", False),
                "sources": item.get("source_count", 1),
            }
        )

    return {
        "game": game_slug,
        "gameTitle": game_title,
        "month": month,
        "lastUpdated": now,
        "category": category,
        "tiers": tiers,
        "meta": {
            "title": f"{game_title} {category} 티어표 ({month_label})",
            "description": f"{month_label} {game_title} {category} 티어표! 최강 순위를 매주 업데이트합니다.",
            "keywords": [
                f"{game_title} 티어표",
                f"{game_title} {category} 순위",
                f"{game_slug} tier list",
            ],
        },
    }


def write_content_file(filepath: Path, data: dict) -> None:
    """JSON 데이터를 파일에 쓴다. 디렉토리가 없으면 생성."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def update_code_content(
    game_slug: str,
    game_title: str,
    month: str,
    verified_codes: list[dict],
) -> Path:
    """코드 JSON을 생성하고 content/에 저장한다.

    기존 파일이 있으면 expiredCodes와 rewardAnalysis를 보존한다.
    """
    filepath = CODES_DIR / game_slug / f"{month}.json"

    existing_expired = []
    existing_analyses = {}
    if filepath.exists():
        with open(filepath, encoding="utf-8") as f:
            existing = json.load(f)
            existing_expired = existing.get("expiredCodes", [])
            for code in existing.get("codes", []):
                if code.get("rewardAnalysis"):
                    existing_analyses[code["code"]] = code["rewardAnalysis"]

    data = generate_code_json(game_slug, game_title, month, verified_codes)
    data["expiredCodes"] = existing_expired

    for code in data["codes"]:
        if code["code"] in existing_analyses:
            code["rewardAnalysis"] = existing_analyses[code["code"]]

    write_content_file(filepath, data)
    return filepath


def update_tier_content(
    game_slug: str,
    game_title: str,
    month: str,
    category: str,
    verified_tiers: list[dict],
    analysis: dict | None = None,
) -> Path:
    """티어 JSON을 생성하고 content/에 저장한다.

    기존 파일이 있으면 description, nameKo, changeFromLast를 보존한다.
    """
    filepath = TIERS_DIR / game_slug / f"{month}-{category}.json"
    # 기존 단일 파일도 체크 (호환성)
    legacy_filepath = TIERS_DIR / game_slug / f"{month}.json"

    existing_items: dict[str, dict] = {}
    for fp in [filepath, legacy_filepath]:
        if fp.exists():
            with open(fp, encoding="utf-8") as f:
                existing = json.load(f)
                for tier_items in existing.get("tiers", {}).values():
                    for item in tier_items:
                        if item["name"] not in existing_items:
                            existing_items[item["name"]] = item

    data = generate_tier_json(game_slug, game_title, month, category, verified_tiers)

    for tier_key, items in data["tiers"].items():
        for item in items:
            if item["name"] in existing_items:
                prev = existing_items[item["name"]]
                item["nameKo"] = prev.get("nameKo", item["name"])
                item["description"] = prev.get("description", "")
                if not item.get("imageUrl") and prev.get("imageUrl"):
                    item["imageUrl"] = prev["imageUrl"]
                if not item.get("consensus") and prev.get("consensus") is not None:
                    item["consensus"] = prev["consensus"]
                if not item.get("sources") and prev.get("sources"):
                    item["sources"] = prev["sources"]
                if prev.get("rank") and prev["rank"] != item["rank"]:
                    rank_order = {"S+": 0, "S": 1, "A": 2, "B": 3, "C": 4, "D": 5}
                    prev_rank = rank_order.get(prev["rank"], 99)
                    curr_rank = rank_order.get(item["rank"], 99)
                    item["changeFromLast"] = "up" if curr_rank < prev_rank else "down"

    if analysis:
        if "editorial" not in data:
            data["editorial"] = {"summary": "", "recommendation": ""}
        data["editorial"]["tierSummaries"] = analysis.get("tierSummaries", {})
        data["editorial"]["analysis"] = analysis.get("analysis", "")
        data["editorial"]["analysisSources"] = analysis.get("analysisSources", [])
        data["editorial"]["analysisDate"] = analysis.get("analysisDate", "")

    write_content_file(filepath, data)
    return filepath
