"""소스 텍스트를 종합하여 분석 글을 생성한다.

Claude API를 사용하여 여러 소스의 텍스트를 종합 분석.
ANTHROPIC_API_KEY가 없으면 건너뛴다.
"""
import os
import json

from pipelines.gamecodekr.config import CATEGORY_LABELS, TIER_ORDER


def generate_tier_analysis(
    game_title: str,
    category: str,
    verified_items: list[dict],
    source_texts: dict[str, str],
    month: str,
) -> dict | None:
    """티어 분석 글을 생성한다.

    Returns:
        {
            "tierSummaries": {"S+": "...", "S": "...", ...},
            "analysis": "...",
            "analysisSources": ["source1", "source2"],
            "analysisDate": "2026-04-04",
        }
        또는 API 키 없으면 None
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("[analysis] ANTHROPIC_API_KEY 없음, 분석 생성 건너뜀")
        return None

    try:
        import anthropic
    except ImportError:
        print("[analysis] anthropic SDK 없음, pip install anthropic 필요")
        return None

    category_kr = CATEGORY_LABELS.get(category, category)
    year, m = month.split("-")
    month_label = f"{year}년 {int(m)}월"

    # 티어별 아이템 정리
    tier_summary_lines = []
    for tier in TIER_ORDER:
        items_in_tier = [i for i in verified_items if i["tier"] == tier]
        if items_in_tier:
            names = ", ".join(i["name"] for i in items_in_tier[:10])
            tier_summary_lines.append(f"{tier}: {names}")

    tier_info = "\n".join(tier_summary_lines)

    # 소스 텍스트 정리
    source_info = ""
    for src_name, text in source_texts.items():
        if text.strip():
            source_info += f"\n--- {src_name} ---\n{text[:1500]}\n"

    prompt = f"""당신은 로블록스 게임 전문 블로거입니다. 초등학생도 이해할 수 있는 쉬운 한국어로 작성해주세요.

{game_title}의 {month_label} {category_kr} 티어표 분석을 작성해주세요.

현재 티어 배치:
{tier_info}

참고 소스 분석글:
{source_info if source_info else "(소스 텍스트 없음)"}

다음 형식으로 JSON을 반환해주세요:
{{
  "tierSummaries": {{
    "S+": "S+급 아이템들에 대한 1-2문장 요약",
    "S": "S급 아이템들에 대한 1-2문장 요약",
    ... (비어있는 티어는 제외)
  }},
  "analysis": "3-5 단락의 종합 분석문. 각 단락은 \\n\\n으로 구분. 메타 변화, 주요 변동 이유, 소스 간 의견 차이, 초보자 조언 포함."
}}

규칙:
- 어려운 용어는 괄호 안에 쉬운 설명 추가 (예: "너프(약해짐)")
- 확인되지 않은 정보를 확정처럼 쓰지 않기
- JSON만 반환 (마크다운 코드블록 없이)"""

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )

    try:
        result = json.loads(message.content[0].text)
        from datetime import datetime
        return {
            "tierSummaries": result.get("tierSummaries", {}),
            "analysis": result.get("analysis", ""),
            "analysisSources": list(source_texts.keys()),
            "analysisDate": datetime.now().strftime("%Y-%m-%d"),
        }
    except (json.JSONDecodeError, IndexError, KeyError) as e:
        print(f"[analysis] 파싱 실패: {e}")
        return None
