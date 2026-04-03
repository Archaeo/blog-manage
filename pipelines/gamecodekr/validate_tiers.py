"""티어 교차검증.

여러 소스의 티어 데이터를 정규화하고 다수결로 최종 티어를 결정한다.
"""
from collections import Counter

from pipelines.gamecodekr.config import TIER_NORMALIZE, TIER_ORDER


def _normalize_tier(tier: str) -> str:
    """티어 등급을 정규화한다 (S+, SS → S 등)."""
    return TIER_NORMALIZE.get(tier.strip(), tier.strip().upper())


def _tier_rank(tier: str) -> int:
    """티어의 정렬 순서를 반환한다. 낮을수록 높은 티어."""
    try:
        return TIER_ORDER.index(tier)
    except ValueError:
        return len(TIER_ORDER)


def cross_verify_tiers(sources: dict) -> tuple[dict[str, list[dict]], dict[str, dict[str, str]]]:
    """소스별 티어 데이터를 교차검증하여 카테고리별 정렬된 결과를 반환한다.

    Args:
        sources: {"source_name": {"category": [{"name", "tier", "image_url"}]} | "__SKIPPED__"}

    Returns:
        tuple of:
        - {"category": [{"name", "tier", "consensus", "image_url", "source_count", "disagreement"}]}
        - {"category": {"source_name": "source_text"}}
    """
    category_votes: dict[str, dict[str, dict]] = {}
    source_texts: dict[str, dict[str, str]] = {}  # {category: {source_name: text}}

    for source_name, categories in sources.items():
        if categories == "__SKIPPED__":
            continue

        for category, cat_data in categories.items():
            # 새 형식 (items + source_text) 또는 기존 형식 (list) 호환
            if isinstance(cat_data, dict):
                items = cat_data.get("items", [])
                if cat_data.get("source_text"):
                    if category not in source_texts:
                        source_texts[category] = {}
                    source_texts[category][source_name] = cat_data["source_text"]
            else:
                items = cat_data

            if category not in category_votes:
                category_votes[category] = {}

            for item in items:
                name_key = item["name"].upper()
                tier = _normalize_tier(item["tier"])
                image_url = item.get("image_url", "")

                if name_key not in category_votes[category]:
                    category_votes[category][name_key] = {
                        "original_name": item["name"],
                        "tier_votes": [],
                        "source_tiers": {},
                        "image_url": "",
                    }

                entry = category_votes[category][name_key]
                entry["tier_votes"].append(tier)
                entry["source_tiers"][source_name] = tier
                if image_url and not entry["image_url"]:
                    entry["image_url"] = image_url

    result: dict[str, list[dict]] = {}

    for category, items in category_votes.items():
        verified_items = []

        for _name_key, info in items.items():
            counter = Counter(info["tier_votes"])
            most_common = counter.most_common()

            if len(most_common) == 1 or most_common[0][1] > most_common[1][1]:
                final_tier = most_common[0][0]
            else:
                tied_tiers = [t for t, c in most_common if c == most_common[0][1]]
                final_tier = min(tied_tiers, key=_tier_rank)

            all_same = len(set(info["tier_votes"])) == 1
            disagreement = {} if all_same else info["source_tiers"]

            verified_items.append(
                {
                    "name": info["original_name"],
                    "tier": final_tier,
                    "consensus": all_same,
                    "image_url": info["image_url"],
                    "source_count": len(info["tier_votes"]),
                    "disagreement": disagreement,
                }
            )

        verified_items.sort(key=lambda x: _tier_rank(x["tier"]))
        result[category] = verified_items

    return result, source_texts
