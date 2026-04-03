"""티어 교차검증 테스트."""
import pytest
from pipelines.gamecodekr.validate_tiers import cross_verify_tiers
from pipelines.gamecodekr.config import TIER_NORMALIZE, TIER_ORDER


def test_전원_동의시_consensus_true():
    sources = {
        "site1": {"fruits": [{"name": "Leopard", "tier": "S", "image_url": ""}]},
        "site2": {"fruits": [{"name": "Leopard", "tier": "S", "image_url": ""}]},
        "site3": {"fruits": [{"name": "Leopard", "tier": "S", "image_url": ""}]},
    }
    result, _ = cross_verify_tiers(sources)
    leopard = result["fruits"][0]
    assert leopard["name"] == "Leopard"
    assert leopard["tier"] == "S"
    assert leopard["consensus"] is True


def test_다수결_티어_결정():
    sources = {
        "site1": {"fruits": [{"name": "Dragon", "tier": "S", "image_url": ""}]},
        "site2": {"fruits": [{"name": "Dragon", "tier": "A", "image_url": ""}]},
        "site3": {"fruits": [{"name": "Dragon", "tier": "S", "image_url": ""}]},
    }
    result, _ = cross_verify_tiers(sources)
    dragon = result["fruits"][0]
    assert dragon["tier"] == "S"
    assert dragon["consensus"] is False


def test_동점시_높은_티어_선택():
    sources = {
        "site1": {"fruits": [{"name": "Buddha", "tier": "A", "image_url": ""}]},
        "site2": {"fruits": [{"name": "Buddha", "tier": "B", "image_url": ""}]},
    }
    result, _ = cross_verify_tiers(sources)
    buddha = result["fruits"][0]
    assert buddha["tier"] == "A"


def test_티어_정규화():
    sources = {
        "site1": {"units": [{"name": "Unit1", "tier": "S+", "image_url": ""}]},
        "site2": {"units": [{"name": "Unit1", "tier": "SS", "image_url": ""}]},
    }
    result, _ = cross_verify_tiers(sources)
    assert result["units"][0]["tier"] == "S+"
    assert result["units"][0]["consensus"] is True


def test_SKIPPED_소스_무시():
    sources = {
        "site1": {"fruits": [{"name": "Leopard", "tier": "S", "image_url": ""}]},
        "site2": "__SKIPPED__",
    }
    result, _ = cross_verify_tiers(sources)
    assert len(result["fruits"]) == 1


def test_티어_순서_정렬():
    sources = {
        "site1": {
            "fruits": [
                {"name": "Low", "tier": "C", "image_url": ""},
                {"name": "High", "tier": "S", "image_url": ""},
                {"name": "Mid", "tier": "A", "image_url": ""},
            ]
        },
    }
    result, _ = cross_verify_tiers(sources)
    tiers = [item["tier"] for item in result["fruits"]]
    assert tiers == ["S", "A", "C"]


def test_이미지_URL_첫번째_유효값_사용():
    sources = {
        "site1": {"fruits": [{"name": "X", "tier": "S", "image_url": ""}]},
        "site2": {"fruits": [{"name": "X", "tier": "S", "image_url": "https://img.com/x.png"}]},
    }
    result, _ = cross_verify_tiers(sources)
    assert result["fruits"][0]["image_url"] == "https://img.com/x.png"
