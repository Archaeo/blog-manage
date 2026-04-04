"""소스 텍스트를 종합하여 분석 글을 생성한다.

Claude Code CLI를 사용하여 여러 소스의 텍스트를 종합 분석.
claude CLI가 없으면 건너뛴다.
"""
import json
import shutil
import subprocess
from datetime import datetime

from pipelines.gamecodekr.config import CATEGORY_LABELS, TIER_ORDER

# claude CLI 경로 (alias가 아닌 실제 바이너리)
CLAUDE_BIN = shutil.which("claude") or "/Users/arkeo/.local/bin/claude"


def _call_claude(prompt: str, timeout: int = 180) -> str | None:
    """Claude Code CLI를 비대화형으로 호출한다."""
    try:
        result = subprocess.run(
            [CLAUDE_BIN, "-p", prompt, "--system-prompt",
             "당신은 JSON 데이터 생성기입니다. 요청된 형식의 JSON만 반환하세요. 마크다운, 설명, 코드블록 없이 순수 JSON만 출력하세요."],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        if result.returncode != 0:
            print(f"[analysis] claude CLI 오류: {result.stderr[:200]}")
            return None
        return result.stdout.strip()
    except FileNotFoundError:
        print("[analysis] claude CLI 없음, 분석 생성 건너뜀")
        return None
    except subprocess.TimeoutExpired:
        print("[analysis] claude CLI 타임아웃")
        return None


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
        또는 CLI 없으면 None
    """
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

다음 형식으로 JSON만 반환해주세요 (마크다운 코드블록 없이):
{{
  "tierSummaries": {{
    "S+": "S+급 아이템들에 대한 1-2문장 요약",
    "S": "S급 아이템들에 대한 1-2문장 요약"
  }},
  "analysis": "3-5 단락의 종합 분석문. 각 단락은 \\n\\n으로 구분. 메타 변화, 주요 변동 이유, 소스 간 의견 차이, 초보자 조언 포함."
}}

규칙:
- 어려운 용어는 괄호 안에 쉬운 설명 추가 (예: "너프(약해짐)")
- 확인되지 않은 정보를 확정처럼 쓰지 않기
- JSON만 반환"""

    response = _call_claude(prompt)
    if not response:
        return None

    # JSON 파싱 (코드블록 감싸인 경우 처리)
    text = response.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    try:
        result = json.loads(text)
        return {
            "tierSummaries": result.get("tierSummaries", {}),
            "analysis": result.get("analysis", ""),
            "analysisSources": list(source_texts.keys()),
            "analysisDate": datetime.now().strftime("%Y-%m-%d"),
        }
    except (json.JSONDecodeError, KeyError) as e:
        print(f"[analysis] 파싱 실패: {e}")
        print(f"[analysis] 응답 일부: {text[:200]}")
        return None
