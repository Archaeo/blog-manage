"""컨텐츠 JSON 생성 테스트."""
import json
import tempfile
from pathlib import Path

import pytest
from pipelines.gamecodekr.generate_content import (
    generate_code_json,
    generate_tier_json,
    write_content_file,
)


def test_코드_JSON_생성():
    verified = [
        {"code": "CODE1", "sources": 3, "source_names": ["A", "B", "C"], "verified": True, "reward": "2x EXP"},
        {"code": "CODE2", "sources": 1, "source_names": ["A"], "verified": False, "reward": "스킨"},
    ]
    result = generate_code_json(
        game_slug="blox-fruits",
        game_title="블록스 프루츠",
        month="2026-04",
        verified_codes=verified,
    )

    assert result["game"] == "blox-fruits"
    assert result["gameTitle"] == "블록스 프루츠"
    assert result["month"] == "2026-04"
    assert len(result["codes"]) == 2  # both verified and unverified included
    active_codes = [c for c in result["codes"] if c["status"] == "active"]
    assert len(active_codes) == 1
    assert active_codes[0]["code"] == "CODE1"
    assert active_codes[0]["verified"] == 3
    assert len(result["meta"]["keywords"]) > 0


def test_코드_JSON에_미확인_코드도_포함():
    verified = [
        {"code": "SURE", "sources": 2, "verified": True, "reward": "", "source_names": []},
        {"code": "MAYBE", "sources": 1, "verified": False, "reward": "", "source_names": []},
    ]
    result = generate_code_json("test", "테스트", "2026-04", verified)
    assert len(result["codes"]) == 2
    unverified = [c for c in result["codes"] if c["status"] == "unverified"]
    assert len(unverified) == 1


def test_티어_JSON_생성():
    verified_tiers = [
        {"name": "Leopard", "tier": "S", "consensus": True, "image_url": "", "source_count": 3, "disagreement": {}},
        {"name": "Buddha", "tier": "A", "consensus": True, "image_url": "", "source_count": 2, "disagreement": {}},
    ]
    result = generate_tier_json(
        game_slug="blox-fruits",
        game_title="블록스 프루츠",
        month="2026-04",
        category="fruits",
        verified_tiers=verified_tiers,
    )

    assert result["game"] == "blox-fruits"
    assert result["category"] == "fruits"
    assert "S" in result["tiers"]
    assert result["meta"]["title"]


def test_파일_쓰기():
    with tempfile.TemporaryDirectory() as tmpdir:
        data = {"test": "data"}
        filepath = Path(tmpdir) / "codes" / "blox-fruits" / "2026-04.json"
        write_content_file(filepath, data)

        assert filepath.exists()
        with open(filepath) as f:
            loaded = json.load(f)
        assert loaded["test"] == "data"
