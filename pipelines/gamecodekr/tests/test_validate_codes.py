"""코드 교차검증 테스트."""
import pytest
from pipelines.gamecodekr.validate_codes import cross_verify_codes


def test_3소스_일치_코드는_verified_true():
    sources = {
        "Source A": [{"code": "CODE1", "reward": "2x EXP"}],
        "Source B": [{"code": "CODE1", "reward": "2x EXP"}],
        "Source C": [{"code": "CODE1", "reward": ""}],
    }
    result = cross_verify_codes(sources)
    assert len(result) == 1
    assert result[0]["code"] == "CODE1"
    assert result[0]["sources"] == 3
    assert result[0]["verified"] is True
    assert result[0]["reward"] == "2x EXP"


def test_2소스_일치도_verified_true():
    sources = {
        "Source A": [{"code": "CODE1", "reward": ""}],
        "Source B": [{"code": "CODE1", "reward": "보상"}],
        "Source C": [],
    }
    result = cross_verify_codes(sources)
    assert result[0]["verified"] is True
    assert result[0]["sources"] == 2
    assert result[0]["reward"] == "보상"


def test_1소스만_있으면_verified_false():
    sources = {
        "Source A": [{"code": "SOLO", "reward": "test"}],
        "Source B": [],
        "Source C": [],
    }
    result = cross_verify_codes(sources)
    assert result[0]["verified"] is False
    assert result[0]["sources"] == 1


def test_SKIPPED_소스는_무시():
    sources = {
        "Source A": [{"code": "CODE1", "reward": ""}],
        "Source B": "__SKIPPED__",
        "Source C": [{"code": "CODE1", "reward": "보상"}],
    }
    result = cross_verify_codes(sources)
    assert result[0]["sources"] == 2
    assert result[0]["verified"] is True


def test_대소문자_무시_정규화():
    sources = {
        "Source A": [{"code": "TestCode", "reward": ""}],
        "Source B": [{"code": "TESTCODE", "reward": ""}],
    }
    result = cross_verify_codes(sources)
    assert len(result) == 1
    assert result[0]["sources"] == 2


def test_소스_카운트_내림차순_정렬():
    sources = {
        "Source A": [
            {"code": "COMMON", "reward": ""},
            {"code": "RARE", "reward": ""},
        ],
        "Source B": [{"code": "COMMON", "reward": ""}],
        "Source C": [{"code": "COMMON", "reward": ""}],
    }
    result = cross_verify_codes(sources)
    assert result[0]["code"] == "COMMON"
    assert result[0]["sources"] == 3


def test_문자열_형식_하위호환():
    sources = {
        "Source A": ["CODE1", "CODE2"],
        "Source B": ["CODE1"],
    }
    result = cross_verify_codes(sources)
    code1 = next(r for r in result if r["code"] == "CODE1")
    assert code1["sources"] == 2
    assert code1["reward"] == ""


def test_빈_소스_처리():
    sources = {}
    result = cross_verify_codes(sources)
    assert result == []
