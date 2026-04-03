"""코드 교차검증.

여러 소스에서 수집된 코드를 정규화하고 교차 대조하여 신뢰도를 산출한다.
2개 이상 소스에서 확인된 코드는 verified=True.
"""


def cross_verify_codes(sources: dict) -> list[dict]:
    """소스별 코드 목록을 교차검증하여 신뢰도 정보가 포함된 목록을 반환한다.

    Args:
        sources: {"source_name": [{"code": str, "reward": str}, ...] | "__SKIPPED__"}
                 문자열 리스트도 하위호환으로 지원: ["CODE1", "CODE2"]

    Returns:
        [{"code": str, "sources": int, "source_names": list, "verified": bool, "reward": str}]
        sources 수 내림차순 정렬.
    """
    code_map: dict[str, dict] = {}

    for source_name, codes in sources.items():
        if codes == "__SKIPPED__":
            continue

        for entry in codes:
            if isinstance(entry, dict):
                code_str = entry["code"]
                reward = entry.get("reward", "")
            else:
                code_str = str(entry)
                reward = ""

            normalized = code_str.upper()

            if normalized not in code_map:
                code_map[normalized] = {
                    "original": code_str,
                    "count": 0,
                    "source_names": [],
                    "reward": reward,
                }

            code_map[normalized]["count"] += 1
            code_map[normalized]["source_names"].append(source_name)

            if reward and not code_map[normalized]["reward"]:
                code_map[normalized]["reward"] = reward

    results = []
    for _normalized, info in sorted(
        code_map.items(), key=lambda x: -x[1]["count"]
    ):
        results.append(
            {
                "code": info["original"],
                "sources": info["count"],
                "source_names": info["source_names"],
                "verified": info["count"] >= 2,
                "reward": info["reward"],
            }
        )

    return results
