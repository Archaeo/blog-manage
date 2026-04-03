# Phase 2: 데이터 수집 파이프라인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 GameCodeKR 수집 파이프라인을 Git 기반으로 마이그레이션하여, Playwright로 코드/티어를 수집하고 JSON 컨텐츠로 변환 후 Git push로 자동 배포한다.

**Architecture:** 기존 Cowork Playwright 수집 → Python 교차검증 → Blogger API 게시 파이프라인에서, Blogger 게시를 Git commit/push로 교체한다. 교차검증 로직은 기존 코드를 그대로 이식하고, 출력을 sites/gamecodekr/content/ JSON 파일로 변환한다. 수집은 standalone Playwright headless로 동작하도록 리팩터링한다.

**Tech Stack:** Python 3.11+, Playwright (headless), pytest, launchd (macOS), GitHub Actions

**Phase 구조:**
- Phase 1 (완료): 모노레포 + 사이트 + SEO + 배포
- Phase 2 (이 문서): 데이터 수집 파이프라인 + 스케줄링
- Phase 3: 에이전트 시스템 + 문서/가이드 + 운영 체계

**기존 코드 참고 경로:** `/Users/arkeo/Documents/Claude/Projects/GameCodeKR`

---

## File Structure

### pipelines/gamecodekr/

| 파일 | 역할 |
|---|---|
| `pipelines/gamecodekr/config.py` | 게임 목록, 소스 URL, 제외 단어, 티어 설정 |
| `pipelines/gamecodekr/validate_codes.py` | 코드 교차검증 (기존 로직 이식) |
| `pipelines/gamecodekr/validate_tiers.py` | 티어 교차검증 (기존 로직 이식) |
| `pipelines/gamecodekr/generate_content.py` | 수집 데이터 → content/ JSON 변환 |
| `pipelines/gamecodekr/collect_codes.py` | Playwright headless 코드 수집 |
| `pipelines/gamecodekr/collect_tiers.py` | Playwright headless 티어 수집 |
| `pipelines/gamecodekr/run.py` | 단일 진입점 (collect → validate → generate → git push) |
| `pipelines/gamecodekr/requirements.txt` | Python 의존성 |
| `pipelines/gamecodekr/tests/test_validate_codes.py` | 교차검증 테스트 |
| `pipelines/gamecodekr/tests/test_validate_tiers.py` | 티어 검증 테스트 |
| `pipelines/gamecodekr/tests/test_generate_content.py` | JSON 생성 테스트 |

### pipelines/shared/

| 파일 | 역할 |
|---|---|
| `pipelines/shared/git_utils.py` | Git add/commit/push 유틸 |
| `pipelines/shared/tests/test_git_utils.py` | Git 유틸 테스트 |

### scripts/local/

| 파일 | 역할 |
|---|---|
| `scripts/local/install.sh` | launchd plist 등록 |
| `scripts/local/uninstall.sh` | launchd plist 해제 |
| `scripts/local/run-codes.sh` | 코드 수집 래퍼 스크립트 |
| `scripts/local/run-tiers.sh` | 티어 수집 래퍼 스크립트 |
| `scripts/local/run-monthly.sh` | 월초 페이지 생성 래퍼 |
| `scripts/local/com.blogmanage.codes.plist` | 코드 수집 스케줄 (매일 09:00) |
| `scripts/local/com.blogmanage.tiers.plist` | 티어 수집 스케줄 (매주 월 09:00) |
| `scripts/local/com.blogmanage.monthly.plist` | 월초 생성 (매월 1일 00:00) |

### .github/workflows/

| 파일 | 역할 |
|---|---|
| `.github/workflows/collect-codes.yml` | 코드 수집 (cron + manual) |
| `.github/workflows/collect-tiers.yml` | 티어 수집 (cron + manual) |
| `.github/workflows/monthly-setup.yml` | 월초 페이지 생성 (cron + manual) |

---

## Task 1: 파이프라인 설정 (config.py)

**Files:**
- Create: `pipelines/gamecodekr/config.py`
- Create: `pipelines/gamecodekr/__init__.py`
- Create: `pipelines/gamecodekr/requirements.txt`

- [ ] **Step 1: requirements.txt 생성**

```txt
playwright>=1.40.0
pytest>=7.0.0
```

- [ ] **Step 2: __init__.py 생성 (빈 파일)**

```python
# pipelines/gamecodekr/__init__.py
```

- [ ] **Step 3: config.py 생성**

기존 `/Users/arkeo/Documents/Claude/Projects/GameCodeKR/config.py`를 기반으로, Blogger 관련 설정을 제거하고 Git 기반으로 변환.

```python
# pipelines/gamecodekr/config.py
"""GameCodeKR 파이프라인 설정.

게임 목록, 소스 URL, 제외 단어 필터, 티어 시스템 설정.
기존 GameCodeKR 프로젝트에서 이식 - Blogger 설정 제거, Git 기반으로 변환.
"""
import os
from pathlib import Path

# ── 경로 설정 ──────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SITE_DIR = PROJECT_ROOT / "sites" / "gamecodekr"
CONTENT_DIR = SITE_DIR / "content"
CODES_DIR = CONTENT_DIR / "codes"
TIERS_DIR = CONTENT_DIR / "tiers"

# 수집 중간 데이터 (Git에 커밋하지 않음)
DATA_DIR = Path(__file__).resolve().parent / "data"
COLLECTED_CODES_FILE = DATA_DIR / "collected_codes.json"
COLLECTED_TIERS_FILE = DATA_DIR / "collected_tiers.json"

# ── 게임 목록 ──────────────────────────────────────────────
GAMES = [
    {
        "slug": "blox-fruits",
        "en_name": "Blox Fruits",
        "kr_name": "블록스 프루츠",
        "image_url": "https://tr.rbxcdn.com/180DAY-942e3a26e921c8e360675b8e1deb6e77/150/150/Image/Webp/noFilter",
    },
    {
        "slug": "king-legacy",
        "en_name": "King Legacy",
        "kr_name": "킹 레거시",
        "image_url": "https://tr.rbxcdn.com/180DAY-80b2b063536c94a3a4ea40e29740db0b/150/150/Image/Webp/noFilter",
    },
    {
        "slug": "fruit-battlegrounds",
        "en_name": "Fruit Battlegrounds",
        "kr_name": "프루츠 배틀그라운드",
        "image_url": "https://tr.rbxcdn.com/180DAY-4a20e876a0b14d55d64aaa tried5c4d5f3a3/150/150/Image/Webp/noFilter",
    },
    {
        "slug": "anime-adventures",
        "en_name": "Anime Adventures",
        "kr_name": "애니메 어드벤처",
        "image_url": "https://tr.rbxcdn.com/180DAY-27bb2c7cdaa2ec93d3ced5b70b515ab2/150/150/Image/Webp/noFilter",
    },
    {
        "slug": "murder-mystery-2",
        "en_name": "Murder Mystery 2",
        "kr_name": "머더 미스터리 2",
        "image_url": "https://tr.rbxcdn.com/180DAY-5c75cfcef8c7f9c6f7c7c5f80e9be7e6/150/150/Image/Webp/noFilter",
    },
    {
        "slug": "pet-simulator-99",
        "en_name": "Pet Simulator 99",
        "kr_name": "펫 시뮬레이터 99",
        "image_url": "https://tr.rbxcdn.com/180DAY-1b7c58e71d82c1e1b00bbb83a01def32/150/150/Image/Webp/noFilter",
    },
    {
        "slug": "shindo-life",
        "en_name": "Shindo Life",
        "kr_name": "신도 라이프",
        "image_url": "https://tr.rbxcdn.com/180DAY-e3c2c57c76c89b86d5b5d3af2ba5b5e7/150/150/Image/Webp/noFilter",
    },
    {
        "slug": "tower-defense-simulator",
        "en_name": "Tower Defense Simulator",
        "kr_name": "타워 디펜스 시뮬레이터",
        "image_url": "https://tr.rbxcdn.com/180DAY-90e5b5b5f9ff8e80dc5f6cfe0afa8f57/150/150/Image/Webp/noFilter",
    },
    {
        "slug": "all-star-tower-defense",
        "en_name": "All Star Tower Defense",
        "kr_name": "올스타 타워 디펜스",
        "image_url": "https://tr.rbxcdn.com/180DAY-8fbe2c38e5f03a1f55c1e7e0aab52c70/150/150/Image/Webp/noFilter",
    },
    {
        "slug": "bee-swarm-simulator",
        "en_name": "Bee Swarm Simulator",
        "kr_name": "비 스웜 시뮬레이터",
        "image_url": "https://tr.rbxcdn.com/180DAY-c5b5a5c5a5f5e5d5c5b5a595857565/150/150/Image/Webp/noFilter",
    },
]


def get_game_by_slug(slug: str) -> dict | None:
    """slug로 게임 설정을 찾는다."""
    return next((g for g in GAMES if g["slug"] == slug), None)


def get_game_by_en_name(en_name: str) -> dict | None:
    """영문 이름으로 게임 설정을 찾는다."""
    return next((g for g in GAMES if g["en_name"] == en_name), None)


# ── 코드 수집 소스 URL ────────────────────────────────────
CODE_SOURCES = {
    "Pro Game Guides": "https://progameguides.com/roblox/roblox-{slug}-codes/",
    "Try Hard Guides": "https://tryhardguides.com/{slug}-codes/",
    "Pocket Gamer": "https://www.pocketgamer.com/roblox/{slug}-codes/",
}

# ── 제외 단어 필터 (false positive 방지) ──────────────────
EXCLUDED_WORDS = {
    "NEW", "CODES", "CODE", "ACTIVE", "EXPIRED", "LIST", "ALL", "HOW",
    "THE", "AND", "FOR", "GET", "FREE", "USE", "REDEEM", "WORKING",
    "LATEST", "UPDATED", "ROBLOX", "HERE", "CLICK", "COPY", "PASTE",
    "ENTER", "BUTTON", "MENU", "SETTINGS", "NOTE", "UPDATE", "HOME",
    "NEXT", "PREV", "MORE", "BACK", "EDIT", "ELEMENTS", "BLOODLINES",
    "SPIN", "SPINS", "LINKS", "LINK", "SUBSCRIBE", "SOCIAL", "GROUP",
    "WIKI", "GAME", "GAMES", "LEVEL", "CHARACTER", "PLAYER", "SERVER",
    "ITEMS", "ITEM", "DESCRIPTION", "ABOUT", "GUIDE", "TIPS", "STEP",
    "ANDROID", "MOBILE", "DESKTOP", "TABLET", "WINDOWS", "APPLE",
    "DISCORD", "TWITTER", "YOUTUBE", "TWITCH", "FACEBOOK", "INSTAGRAM",
    "SUB", "SUB2", "LIKE", "FOLLOW", "JOIN",
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
    "2024", "2025", "2026", "2027",
    "FORTUNE", "TALES", "HOPE", "MINUTES", "KING", "LEGACY",
    "INACTIVE", "COPPER", "DRAGON", "RAINBOW",
}

# ── 코드 검증 규칙 ────────────────────────────────────────
CODE_MIN_LENGTH = 3
CODE_MAX_LENGTH = 50
CODE_PATTERN = r"^[A-Za-z0-9_]+$"

# ── 수집 안전 설정 ────────────────────────────────────────
DELAY_BETWEEN_PAGES_SEC = (3, 7)      # 페이지 간 랜덤 딜레이 (초)
DELAY_WITHIN_SOURCE_SEC = (5, 10)     # 같은 소스 내 딜레이 (초)
MAX_CONSECUTIVE_FAILURES = 3          # 연속 실패 시 소스 스킵

# ── 티어 시스템 설정 ──────────────────────────────────────
TIER_GAMES = {
    "blox-fruits": {
        "categories": ["fruits", "swords", "fighting-styles"],
        "sources": {
            "blox-fruits.com": "https://blox-fruits.com/{category}/tier-list/",
            "bloxfruit.io": "https://bloxfruit.io/tier-lists/{category}/",
            "pockettactics.com": "https://www.pockettactics.com/blox-fruits/tier-list",
        },
        "category_map": {
            "fruits": "fruits-overall",
            "swords": "swords",
            "fighting-styles": "fighting-styles",
        },
    },
    "anime-adventures": {
        "categories": ["units"],
        "sources": {
            "Pro Game Guides": "https://progameguides.com/anime-adventures/anime-adventures-tier-list/",
            "Beebom": "https://beebom.com/anime-adventures-tier-list/",
        },
    },
    "all-star-tower-defense": {
        "categories": ["units"],
        "sources": {
            "Beebom": "https://beebom.com/all-star-tower-defense-tier-list/",
            "Pocket Gamer": "https://www.pocketgamer.com/all-star-tower-defense/tier-list/",
        },
    },
    "shindo-life": {
        "categories": ["bloodlines"],
        "sources": {
            "Beebom": "https://beebom.com/shindo-life-bloodline-tier-list/",
            "Pocket Gamer": "https://www.pocketgamer.com/shindo-life/bloodline-tier-list/",
            "Roblox Den": "https://robloxden.com/shindo-life-bloodline-tier-list/",
        },
    },
}

TIER_NORMALIZE = {
    "SS": "S", "S+": "S", "S": "S",
    "A+": "A", "A": "A",
    "B+": "B", "B": "B",
    "C+": "C", "C": "C",
    "D": "D",
    "E": "F", "F": "F",
}

TIER_ORDER = ["S", "A", "B", "C", "D", "F"]
```

- [ ] **Step 4: .gitignore에 data/ 디렉토리 추가**

`pipelines/gamecodekr/data/` 는 수집 중간 데이터로 Git에 커밋하지 않는다.

`.gitignore`에 추가:
```
pipelines/*/data/
```

- [ ] **Step 5: 커밋**

```bash
git add pipelines/gamecodekr/config.py pipelines/gamecodekr/__init__.py pipelines/gamecodekr/requirements.txt .gitignore
git commit -m "파이프라인 설정: 게임 목록, 소스 URL, 제외 단어, 티어 설정"
```

---

## Task 2: 코드 교차검증 (validate_codes.py)

**Files:**
- Create: `pipelines/gamecodekr/validate_codes.py`
- Create: `pipelines/gamecodekr/tests/__init__.py`
- Create: `pipelines/gamecodekr/tests/test_validate_codes.py`

기존 `post_to_blogger.py`의 `cross_verify_codes()` 로직을 그대로 이식.

- [ ] **Step 1: 테스트 작성**

```python
# pipelines/gamecodekr/tests/test_validate_codes.py
"""코드 교차검증 테스트.

기존 GameCodeKR 프로젝트의 test_cross_verify_codes.py에서 이식.
"""
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd /project-root && python -m pytest pipelines/gamecodekr/tests/test_validate_codes.py -v`
Expected: FAIL - module not found

- [ ] **Step 3: validate_codes.py 구현**

```python
# pipelines/gamecodekr/validate_codes.py
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `python -m pytest pipelines/gamecodekr/tests/test_validate_codes.py -v`
Expected: 8 tests PASS

- [ ] **Step 5: 커밋**

```bash
git add pipelines/gamecodekr/validate_codes.py pipelines/gamecodekr/tests/
git commit -m "코드 교차검증: 기존 cross_verify_codes 로직 이식 및 테스트"
```

---

## Task 3: 티어 교차검증 (validate_tiers.py)

**Files:**
- Create: `pipelines/gamecodekr/validate_tiers.py`
- Create: `pipelines/gamecodekr/tests/test_validate_tiers.py`

기존 `tiers/tier_verify.py`의 `cross_verify_tiers()` 로직을 이식.

- [ ] **Step 1: 테스트 작성**

```python
# pipelines/gamecodekr/tests/test_validate_tiers.py
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
    result = cross_verify_tiers(sources)
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
    result = cross_verify_tiers(sources)
    dragon = result["fruits"][0]
    assert dragon["tier"] == "S"
    assert dragon["consensus"] is False


def test_동점시_높은_티어_선택():
    sources = {
        "site1": {"fruits": [{"name": "Buddha", "tier": "A", "image_url": ""}]},
        "site2": {"fruits": [{"name": "Buddha", "tier": "B", "image_url": ""}]},
    }
    result = cross_verify_tiers(sources)
    buddha = result["fruits"][0]
    assert buddha["tier"] == "A"


def test_티어_정규화():
    sources = {
        "site1": {"units": [{"name": "Unit1", "tier": "S+", "image_url": ""}]},
        "site2": {"units": [{"name": "Unit1", "tier": "SS", "image_url": ""}]},
    }
    result = cross_verify_tiers(sources)
    assert result["units"][0]["tier"] == "S"
    assert result["units"][0]["consensus"] is True


def test_SKIPPED_소스_무시():
    sources = {
        "site1": {"fruits": [{"name": "Leopard", "tier": "S", "image_url": ""}]},
        "site2": "__SKIPPED__",
    }
    result = cross_verify_tiers(sources)
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
    result = cross_verify_tiers(sources)
    tiers = [item["tier"] for item in result["fruits"]]
    assert tiers == ["S", "A", "C"]


def test_이미지_URL_첫번째_유효값_사용():
    sources = {
        "site1": {"fruits": [{"name": "X", "tier": "S", "image_url": ""}]},
        "site2": {"fruits": [{"name": "X", "tier": "S", "image_url": "https://img.com/x.png"}]},
    }
    result = cross_verify_tiers(sources)
    assert result["fruits"][0]["image_url"] == "https://img.com/x.png"
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `python -m pytest pipelines/gamecodekr/tests/test_validate_tiers.py -v`
Expected: FAIL

- [ ] **Step 3: validate_tiers.py 구현**

```python
# pipelines/gamecodekr/validate_tiers.py
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


def cross_verify_tiers(sources: dict) -> dict[str, list[dict]]:
    """소스별 티어 데이터를 교차검증하여 카테고리별 정렬된 결과를 반환한다.

    Args:
        sources: {"source_name": {"category": [{"name", "tier", "image_url"}]} | "__SKIPPED__"}

    Returns:
        {"category": [{"name", "tier", "consensus", "image_url", "source_count", "disagreement"}]}
    """
    # 카테고리별 아이템별 투표 수집
    category_votes: dict[str, dict[str, dict]] = {}

    for source_name, categories in sources.items():
        if categories == "__SKIPPED__":
            continue

        for category, items in categories.items():
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

    # 다수결로 최종 티어 결정
    result: dict[str, list[dict]] = {}

    for category, items in category_votes.items():
        verified_items = []

        for _name_key, info in items.items():
            counter = Counter(info["tier_votes"])
            most_common = counter.most_common()

            if len(most_common) == 1 or most_common[0][1] > most_common[1][1]:
                final_tier = most_common[0][0]
            else:
                # 동점: 높은 티어(낮은 rank 값) 선택
                tied_tiers = [t for t, c in most_common if c == most_common[0][1]]
                final_tier = min(tied_tiers, key=_tier_rank)

            all_same = len(set(info["tier_votes"])) == 1
            disagreement = (
                {} if all_same else info["source_tiers"]
            )

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

        # 티어 순서로 정렬
        verified_items.sort(key=lambda x: _tier_rank(x["tier"]))
        result[category] = verified_items

    return result
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `python -m pytest pipelines/gamecodekr/tests/test_validate_tiers.py -v`
Expected: 7 tests PASS

- [ ] **Step 5: 커밋**

```bash
git add pipelines/gamecodekr/validate_tiers.py pipelines/gamecodekr/tests/test_validate_tiers.py
git commit -m "티어 교차검증: 다수결 기반 티어 결정 로직 이식 및 테스트"
```

---

## Task 4: 컨텐츠 JSON 생성 (generate_content.py)

**Files:**
- Create: `pipelines/gamecodekr/generate_content.py`
- Create: `pipelines/gamecodekr/tests/test_generate_content.py`

교차검증 결과를 sites/gamecodekr/content/ 의 JSON 파일로 변환한다.

- [ ] **Step 1: 테스트 작성**

```python
# pipelines/gamecodekr/tests/test_generate_content.py
"""컨텐츠 JSON 생성 테스트."""
import json
import os
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
    assert len(result["codes"]) == 1  # verified만
    assert result["codes"][0]["code"] == "CODE1"
    assert result["codes"][0]["verified"] == 3
    assert result["codes"][0]["status"] == "active"
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
    verified_tiers = {
        "fruits": [
            {"name": "Leopard", "tier": "S", "consensus": True, "image_url": "", "source_count": 3, "disagreement": {}},
            {"name": "Buddha", "tier": "A", "consensus": True, "image_url": "", "source_count": 2, "disagreement": {}},
        ]
    }
    result = generate_tier_json(
        game_slug="blox-fruits",
        game_title="블록스 프루츠",
        month="2026-04",
        category="fruits",
        verified_tiers=verified_tiers["fruits"],
    )

    assert result["game"] == "blox-fruits"
    assert result["category"] == "fruits"
    assert "S" in result["tiers"] or "S+" in result["tiers"]
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `python -m pytest pipelines/gamecodekr/tests/test_generate_content.py -v`
Expected: FAIL

- [ ] **Step 3: generate_content.py 구현**

```python
# pipelines/gamecodekr/generate_content.py
"""수집 데이터를 sites/gamecodekr/content/ JSON 파일로 변환한다."""
import json
from datetime import datetime, timezone
from pathlib import Path

from pipelines.gamecodekr.config import CONTENT_DIR, CODES_DIR, TIERS_DIR


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
                "rewardAnalysis": "",  # 에이전트가 후속 작성
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
            "title": f"{game_title} 코드 총정리 ({month_label}) - 매일 업데이트 | GameCodeKR",
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

    # 티어별로 그룹핑
    tiers: dict[str, list] = {"S+": [], "S": [], "A": [], "B": [], "C": [], "D": []}
    for item in verified_tiers:
        tier_key = item["tier"]
        if tier_key not in tiers:
            tier_key = "D"  # fallback
        tiers[tier_key].append(
            {
                "name": item["name"],
                "nameKo": item["name"],  # 에이전트가 후속 번역
                "rank": tier_key,
                "description": "",  # 에이전트가 후속 작성
                "changeFromLast": "same",
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
            "title": f"{game_title} {category} 티어표 ({month_label}) | GameCodeKR",
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
    """코드 JSON을 생성하고 content/ 에 저장한다.

    기존 파일이 있으면 expiredCodes를 보존하고 codes만 업데이트한다.
    """
    filepath = CODES_DIR / game_slug / f"{month}.json"

    # 기존 데이터 로드 (있으면)
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

    # 기존 가치 분석 보존
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
) -> Path:
    """티어 JSON을 생성하고 content/ 에 저장한다.

    기존 파일이 있으면 description, nameKo, changeFromLast를 보존한다.
    """
    filepath = TIERS_DIR / game_slug / f"{month}.json"

    # 기존 데이터 로드
    existing_items: dict[str, dict] = {}
    if filepath.exists():
        with open(filepath, encoding="utf-8") as f:
            existing = json.load(f)
            for tier_items in existing.get("tiers", {}).values():
                for item in tier_items:
                    existing_items[item["name"]] = item

    data = generate_tier_json(game_slug, game_title, month, category, verified_tiers)

    # 기존 설명/번역 보존
    for tier_key, items in data["tiers"].items():
        for item in items:
            if item["name"] in existing_items:
                prev = existing_items[item["name"]]
                item["nameKo"] = prev.get("nameKo", item["name"])
                item["description"] = prev.get("description", "")
                # 티어 변동 감지
                if prev.get("rank") and prev["rank"] != item["rank"]:
                    rank_order = {"S+": 0, "S": 1, "A": 2, "B": 3, "C": 4, "D": 5}
                    prev_rank = rank_order.get(prev["rank"], 99)
                    curr_rank = rank_order.get(item["rank"], 99)
                    item["changeFromLast"] = "up" if curr_rank < prev_rank else "down"

    write_content_file(filepath, data)
    return filepath
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `python -m pytest pipelines/gamecodekr/tests/test_generate_content.py -v`
Expected: 4 tests PASS

- [ ] **Step 5: 커밋**

```bash
git add pipelines/gamecodekr/generate_content.py pipelines/gamecodekr/tests/test_generate_content.py
git commit -m "컨텐츠 JSON 생성: 코드/티어 검증 결과 → content/ JSON 변환"
```

---

## Task 5: Git 유틸리티 (git_utils.py)

**Files:**
- Create: `pipelines/shared/__init__.py`
- Create: `pipelines/shared/git_utils.py`
- Create: `pipelines/shared/tests/__init__.py`
- Create: `pipelines/shared/tests/test_git_utils.py`

- [ ] **Step 1: git_utils.py 구현**

```python
# pipelines/shared/git_utils.py
"""Git commit/push 유틸리티.

파이프라인 실행 후 변경된 content/ 파일을 자동 커밋하고 push한다.
"""
import subprocess
from pathlib import Path


def git_has_changes(repo_dir: Path) -> bool:
    """Git 워킹 디렉토리에 변경사항이 있는지 확인한다."""
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=repo_dir,
        capture_output=True,
        text=True,
    )
    return bool(result.stdout.strip())


def git_add_and_commit(repo_dir: Path, paths: list[Path], message: str) -> bool:
    """지정된 파일을 add하고 commit한다.

    Returns:
        True if commit was made, False if nothing to commit.
    """
    str_paths = [str(p) for p in paths]
    subprocess.run(["git", "add"] + str_paths, cwd=repo_dir, check=True)

    # 스테이지된 변경사항 확인
    result = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        cwd=repo_dir,
        capture_output=True,
    )
    if result.returncode == 0:
        return False  # nothing staged

    subprocess.run(
        ["git", "commit", "-m", message],
        cwd=repo_dir,
        check=True,
    )
    return True


def git_push(repo_dir: Path) -> None:
    """현재 브랜치를 remote에 push한다."""
    subprocess.run(["git", "push"], cwd=repo_dir, check=True)
```

- [ ] **Step 2: 테스트 작성**

```python
# pipelines/shared/tests/test_git_utils.py
"""Git 유틸 테스트 (실제 git repo 사용)."""
import subprocess
import tempfile
from pathlib import Path

import pytest
from pipelines.shared.git_utils import git_has_changes, git_add_and_commit


@pytest.fixture
def git_repo():
    """임시 Git 저장소를 생성한다."""
    with tempfile.TemporaryDirectory() as tmpdir:
        repo = Path(tmpdir)
        subprocess.run(["git", "init"], cwd=repo, capture_output=True)
        subprocess.run(["git", "config", "user.email", "test@test.com"], cwd=repo, capture_output=True)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=repo, capture_output=True)
        # initial commit
        (repo / "README.md").write_text("init")
        subprocess.run(["git", "add", "."], cwd=repo, capture_output=True)
        subprocess.run(["git", "commit", "-m", "init"], cwd=repo, capture_output=True)
        yield repo


def test_변경없으면_false(git_repo):
    assert git_has_changes(git_repo) is False


def test_변경있으면_true(git_repo):
    (git_repo / "new.txt").write_text("hello")
    assert git_has_changes(git_repo) is True


def test_커밋_성공(git_repo):
    new_file = git_repo / "test.txt"
    new_file.write_text("content")
    result = git_add_and_commit(git_repo, [new_file], "테스트 커밋")
    assert result is True
    assert git_has_changes(git_repo) is False


def test_변경없으면_커밋안함(git_repo):
    result = git_add_and_commit(git_repo, [git_repo / "README.md"], "빈 커밋")
    assert result is False
```

- [ ] **Step 3: 테스트 통과 확인**

Run: `python -m pytest pipelines/shared/tests/test_git_utils.py -v`
Expected: 4 tests PASS

- [ ] **Step 4: 커밋**

```bash
git add pipelines/shared/
git commit -m "Git 유틸: 변경 감지, 커밋, 푸시 헬퍼 함수"
```

---

## Task 6: 파이프라인 실행 스크립트 (run.py)

**Files:**
- Create: `pipelines/gamecodekr/run.py`

이 스크립트는 수집 → 검증 → JSON 생성 → Git push의 전체 흐름을 실행하는 단일 진입점이다.
수집 단계(collect_codes.py, collect_tiers.py)는 Task 7-8에서 구현하므로, 여기서는 검증/생성/커밋 부분만 동작하도록 한다. 수집 데이터는 `data/collected_codes.json` 에 있다고 가정한다.

- [ ] **Step 1: run.py 생성**

```python
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

    # 수집 데이터 로드
    if not COLLECTED_CODES_FILE.exists():
        print(f"[codes] 수집 데이터 없음: {COLLECTED_CODES_FILE}")
        return

    with open(COLLECTED_CODES_FILE, encoding="utf-8") as f:
        collected = json.load(f)

    changed_files: list[Path] = []

    for game_data in collected.get("games", {}).values():
        kr_name = game_data.get("kr_name", "")
        sources = game_data.get("sources", {})

        # 게임 설정 찾기
        game_config = None
        for g in GAMES:
            if g["kr_name"] == kr_name:
                game_config = g
                break

        if not game_config:
            print(f"[codes] 게임 설정 없음: {kr_name}")
            continue

        # 교차검증
        verified = cross_verify_codes(sources)
        print(f"[codes] {game_config['kr_name']}: {len(verified)}개 코드 (검증됨: {sum(1 for v in verified if v['verified'])})")

        # JSON 생성
        filepath = update_code_content(
            game_slug=game_config["slug"],
            game_title=game_config["kr_name"],
            month=month,
            verified_codes=verified,
        )
        changed_files.append(filepath)

    # Git commit & push
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

        verified = cross_verify_tiers(sources)

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
        # 코드 파일 초기화
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
```

- [ ] **Step 2: 커밋**

```bash
git add pipelines/gamecodekr/run.py
git commit -m "파이프라인 실행 스크립트: codes/tiers/monthly/generate 명령"
```

---

## Task 7: 코드 수집 스크립트 (collect_codes.py)

**Files:**
- Create: `pipelines/gamecodekr/collect_codes.py`

Playwright headless로 3개 소스에서 코드를 수집한다.
기존 cowork_collect.md의 로직을 standalone Python으로 변환.

- [ ] **Step 1: collect_codes.py 생성**

```python
# pipelines/gamecodekr/collect_codes.py
"""Playwright headless로 게임 코드를 수집한다.

3개 소스 사이트를 방문하여 코드를 추출하고 collected_codes.json에 저장.
기존 cowork_collect.md의 로직을 standalone Python으로 변환.
"""
import json
import random
import re
import time
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright, Page, TimeoutError as PWTimeoutError

from pipelines.gamecodekr.config import (
    CODE_MAX_LENGTH,
    CODE_MIN_LENGTH,
    CODE_PATTERN,
    CODE_SOURCES,
    COLLECTED_CODES_FILE,
    DATA_DIR,
    DELAY_BETWEEN_PAGES_SEC,
    DELAY_WITHIN_SOURCE_SEC,
    EXCLUDED_WORDS,
    GAMES,
    MAX_CONSECUTIVE_FAILURES,
)


def _random_delay(range_sec: tuple[int, int]) -> None:
    """랜덤 딜레이."""
    time.sleep(random.uniform(*range_sec))


def _is_valid_code(code: str) -> bool:
    """코드 문자열이 유효한지 확인."""
    if len(code) < CODE_MIN_LENGTH or len(code) > CODE_MAX_LENGTH:
        return False
    if not re.match(CODE_PATTERN, code):
        return False
    if code.upper() in EXCLUDED_WORDS:
        return False
    return True


def _extract_codes_from_page(page: Page) -> list[dict]:
    """페이지에서 코드를 추출한다.

    접근성 트리와 텍스트 콘텐츠에서 코드 패턴을 찾는다.
    """
    codes = []
    try:
        # 페이지 텍스트에서 코드 패턴 추출
        text_content = page.evaluate("""
            () => {
                const selectors = [
                    'code', 'strong', 'b', 'li',
                    '[class*="code"]', '[class*="Code"]',
                    'td', 'span[style]'
                ];
                const texts = [];
                for (const sel of selectors) {
                    document.querySelectorAll(sel).forEach(el => {
                        const text = el.textContent.trim();
                        if (text && text.length >= 3 && text.length <= 50) {
                            // reward 추출 시도: 다음 sibling이나 같은 row의 다른 셀
                            let reward = '';
                            const nextSibling = el.nextElementSibling;
                            if (nextSibling) {
                                reward = nextSibling.textContent.trim().substring(0, 100);
                            }
                            const parentRow = el.closest('tr');
                            if (parentRow) {
                                const cells = parentRow.querySelectorAll('td');
                                if (cells.length >= 2) {
                                    reward = cells[cells.length - 1].textContent.trim().substring(0, 100);
                                }
                            }
                            texts.push({code: text, reward: reward});
                        }
                    });
                }
                return texts;
            }
        """)

        seen = set()
        for item in text_content:
            code = item["code"].strip()
            if _is_valid_code(code) and code.upper() not in seen:
                seen.add(code.upper())
                codes.append({"code": code, "reward": item.get("reward", "")})

    except Exception as e:
        print(f"  코드 추출 오류: {e}")

    return codes


def collect_all_codes() -> None:
    """모든 게임의 코드를 수집하여 collected_codes.json에 저장."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    result = {
        "collected_at": datetime.now(timezone.utc).isoformat(),
        "games": {},
    }

    games = list(GAMES)
    random.shuffle(games)  # 방문 순서 랜덤화

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 720},
        )
        # 광고/트래커 차단
        context.route("**/*doubleclick.net*", lambda route: route.abort())
        context.route("**/*google-analytics.com*", lambda route: route.abort())
        context.route("**/*googlesyndication.com*", lambda route: route.abort())
        context.route("**/*.{png,jpg,jpeg,gif,webp,svg,ico,woff,woff2}", lambda route: route.abort())

        page = context.new_page()

        for game in games:
            en_name = game["en_name"]
            slug = game["slug"]
            kr_name = game["kr_name"]
            print(f"\n{'='*50}")
            print(f"게임: {kr_name} ({en_name})")

            sources_result: dict = {}
            consecutive_failures = 0

            source_items = list(CODE_SOURCES.items())
            random.shuffle(source_items)

            for source_name, url_template in source_items:
                if consecutive_failures >= MAX_CONSECUTIVE_FAILURES:
                    print(f"  연속 {MAX_CONSECUTIVE_FAILURES}회 실패 → 나머지 소스 스킵")
                    sources_result[source_name] = "__SKIPPED__"
                    continue

                url = url_template.format(slug=slug)
                print(f"  소스: {source_name} → {url}")

                try:
                    page.goto(url, timeout=30000, wait_until="domcontentloaded")
                    _random_delay(DELAY_WITHIN_SOURCE_SEC)

                    # 403/429 체크
                    if page.url != url and "denied" in page.content().lower():
                        raise Exception("Access denied")

                    codes = _extract_codes_from_page(page)
                    sources_result[source_name] = codes
                    print(f"    → {len(codes)}개 코드 수집")
                    consecutive_failures = 0

                except (PWTimeoutError, Exception) as e:
                    print(f"    → 실패: {e}")
                    sources_result[source_name] = "__SKIPPED__"
                    consecutive_failures += 1

                _random_delay(DELAY_BETWEEN_PAGES_SEC)

            result["games"][en_name] = {
                "kr_name": kr_name,
                "sources": sources_result,
            }

        browser.close()

    # 저장
    with open(COLLECTED_CODES_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n수집 완료: {COLLECTED_CODES_FILE}")


if __name__ == "__main__":
    collect_all_codes()
```

- [ ] **Step 2: 커밋**

```bash
git add pipelines/gamecodekr/collect_codes.py
git commit -m "코드 수집: Playwright headless로 3소스 × 10게임 수집"
```

---

## Task 8: 로컬 스케줄러 (launchd)

**Files:**
- Create: `scripts/local/run-codes.sh`
- Create: `scripts/local/run-tiers.sh`
- Create: `scripts/local/run-monthly.sh`
- Create: `scripts/local/com.blogmanage.codes.plist`
- Create: `scripts/local/com.blogmanage.tiers.plist`
- Create: `scripts/local/com.blogmanage.monthly.plist`
- Create: `scripts/local/install.sh`
- Create: `scripts/local/uninstall.sh`

- [ ] **Step 1: 래퍼 스크립트 생성**

`scripts/local/run-codes.sh`:
```bash
#!/bin/bash
# 코드 수집 파이프라인 실행
cd "$(dirname "$0")/../.."
source pipelines/gamecodekr/.venv/bin/activate 2>/dev/null || true
python -m pipelines.gamecodekr.run codes 2>&1 | tee -a logs/codes-$(date +%Y-%m-%d).log
```

`scripts/local/run-tiers.sh`:
```bash
#!/bin/bash
# 티어 수집 파이프라인 실행
cd "$(dirname "$0")/../.."
source pipelines/gamecodekr/.venv/bin/activate 2>/dev/null || true
python -m pipelines.gamecodekr.run tiers 2>&1 | tee -a logs/tiers-$(date +%Y-%m-%d).log
```

`scripts/local/run-monthly.sh`:
```bash
#!/bin/bash
# 월초 페이지 생성
cd "$(dirname "$0")/../.."
source pipelines/gamecodekr/.venv/bin/activate 2>/dev/null || true
python -m pipelines.gamecodekr.run monthly 2>&1 | tee -a logs/monthly-$(date +%Y-%m-%d).log
```

- [ ] **Step 2: launchd plist 생성**

`scripts/local/com.blogmanage.codes.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.blogmanage.codes</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>INSTALL_DIR/scripts/local/run-codes.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>INSTALL_DIR/logs/launchd-codes.log</string>
    <key>StandardErrorPath</key>
    <string>INSTALL_DIR/logs/launchd-codes-err.log</string>
</dict>
</plist>
```

`scripts/local/com.blogmanage.tiers.plist` (매주 월요일 09:00):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.blogmanage.tiers</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>INSTALL_DIR/scripts/local/run-tiers.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>1</integer>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>INSTALL_DIR/logs/launchd-tiers.log</string>
    <key>StandardErrorPath</key>
    <string>INSTALL_DIR/logs/launchd-tiers-err.log</string>
</dict>
</plist>
```

`scripts/local/com.blogmanage.monthly.plist` (매월 1일 00:00):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.blogmanage.monthly</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>INSTALL_DIR/scripts/local/run-monthly.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Day</key>
        <integer>1</integer>
        <key>Hour</key>
        <integer>0</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>INSTALL_DIR/logs/launchd-monthly.log</string>
    <key>StandardErrorPath</key>
    <string>INSTALL_DIR/logs/launchd-monthly-err.log</string>
</dict>
</plist>
```

- [ ] **Step 3: install.sh / uninstall.sh 생성**

`scripts/local/install.sh`:
```bash
#!/bin/bash
# launchd 스케줄러 설치
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"

echo "프로젝트 경로: $PROJECT_DIR"

# logs 디렉토리 생성
mkdir -p "$PROJECT_DIR/logs"

# plist 복사 및 경로 치환
for plist in com.blogmanage.codes.plist com.blogmanage.tiers.plist com.blogmanage.monthly.plist; do
    sed "s|INSTALL_DIR|$PROJECT_DIR|g" "$SCRIPT_DIR/$plist" > "$LAUNCH_AGENTS_DIR/$plist"
    echo "등록: $plist"
    launchctl load "$LAUNCH_AGENTS_DIR/$plist"
done

# 실행 권한 부여
chmod +x "$SCRIPT_DIR"/run-*.sh

echo "설치 완료! 스케줄:"
echo "  코드 수집: 매일 09:00"
echo "  티어 수집: 매주 월요일 09:00"
echo "  월초 생성: 매월 1일 00:00"
```

`scripts/local/uninstall.sh`:
```bash
#!/bin/bash
# launchd 스케줄러 제거
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"

for plist in com.blogmanage.codes.plist com.blogmanage.tiers.plist com.blogmanage.monthly.plist; do
    if [ -f "$LAUNCH_AGENTS_DIR/$plist" ]; then
        launchctl unload "$LAUNCH_AGENTS_DIR/$plist" 2>/dev/null
        rm "$LAUNCH_AGENTS_DIR/$plist"
        echo "제거: $plist"
    fi
done

echo "제거 완료"
```

- [ ] **Step 4: .gitignore에 logs/ 추가**

```
logs/
```

- [ ] **Step 5: 커밋**

```bash
chmod +x scripts/local/*.sh
git add scripts/local/ .gitignore
git commit -m "로컬 스케줄러: launchd plist + 래퍼 스크립트 + install/uninstall"
```

---

## Task 9: GitHub Actions 워크플로우

**Files:**
- Create: `.github/workflows/collect-codes.yml`
- Create: `.github/workflows/collect-tiers.yml`
- Create: `.github/workflows/monthly-setup.yml`

- [ ] **Step 1: collect-codes.yml 생성**

```yaml
# .github/workflows/collect-codes.yml
name: 코드 수집

on:
  # schedule:
  #   - cron: '0 0 * * *'  # UTC 00:00 = KST 09:00 (활성화 시 주석 해제)
  workflow_dispatch:  # 수동 트리거

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Playwright 설치
        run: |
          pip install playwright
          playwright install chromium

      - name: 의존성 설치
        run: pip install -r pipelines/gamecodekr/requirements.txt

      - name: 코드 수집 및 생성
        run: python -m pipelines.gamecodekr.run codes --skip-push

      - name: 변경사항 커밋 및 Push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add sites/gamecodekr/content/codes/
          git diff --cached --quiet || git commit -m "[자동] 코드 업데이트 ($(date +%Y-%m-%d))"
          git push
```

- [ ] **Step 2: collect-tiers.yml 생성**

```yaml
# .github/workflows/collect-tiers.yml
name: 티어 수집

on:
  # schedule:
  #   - cron: '0 0 * * 1'  # 매주 월요일 UTC 00:00 (활성화 시 주석 해제)
  workflow_dispatch:

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Playwright 설치
        run: |
          pip install playwright
          playwright install chromium

      - name: 의존성 설치
        run: pip install -r pipelines/gamecodekr/requirements.txt

      - name: 티어 수집 및 생성
        run: python -m pipelines.gamecodekr.run tiers --skip-push

      - name: 변경사항 커밋 및 Push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add sites/gamecodekr/content/tiers/
          git diff --cached --quiet || git commit -m "[자동] 티어 업데이트 ($(date +%Y-%m-%d))"
          git push
```

- [ ] **Step 3: monthly-setup.yml 생성**

```yaml
# .github/workflows/monthly-setup.yml
name: 월초 페이지 생성

on:
  # schedule:
  #   - cron: '0 15 1 * *'  # 매월 1일 UTC 15:00 = KST 00:00 (활성화 시 주석 해제)
  workflow_dispatch:

jobs:
  monthly:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: 월초 페이지 생성
        run: python -m pipelines.gamecodekr.run monthly --skip-push

      - name: 변경사항 커밋 및 Push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add sites/gamecodekr/content/
          git diff --cached --quiet || git commit -m "[자동] $(date +%Y-%m) 월초 페이지 생성"
          git push
```

- [ ] **Step 4: 커밋**

```bash
git add .github/workflows/
git commit -m "GitHub Actions: 코드/티어 수집 + 월초 생성 워크플로우"
```

---

## Task 10: 전체 파이프라인 검증

- [ ] **Step 1: Python 가상환경 설정**

```bash
cd pipelines/gamecodekr
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

- [ ] **Step 2: 전체 테스트 실행**

```bash
cd /project-root
python -m pytest pipelines/ -v
```
Expected: 모든 테스트 PASS (validate_codes 8 + validate_tiers 7 + generate_content 4 + git_utils 4 = 23)

- [ ] **Step 3: 기존 수집 데이터로 generate 테스트**

기존 프로젝트의 collected_codes.json을 복사하여 테스트:
```bash
mkdir -p pipelines/gamecodekr/data
cp /Users/arkeo/Documents/Claude/Projects/GameCodeKR/collected_codes.json pipelines/gamecodekr/data/
python -m pipelines.gamecodekr.run generate --skip-push
```
Expected: sites/gamecodekr/content/codes/ 에 10개 게임의 JSON 파일 생성

- [ ] **Step 4: 사이트 빌드 테스트**

```bash
cd sites/gamecodekr && pnpm build
```
Expected: 새로 생성된 컨텐츠를 포함한 정적 페이지 빌드 성공

- [ ] **Step 5: 최종 커밋**

```bash
git add -A
git commit -m "Phase 2 완료: 데이터 수집 파이프라인 + 스케줄링"
```

---

## 다음 단계

Phase 2 완료 후:

- **Phase 3**: 에이전트 시스템 + 문서 + 운영 체계
  - 게임별 전문 블로거 페르소나 추가 (나머지 9개 게임)
  - 운영 플레이북 (게임 추가, 사이트 추가, 월초 전환)
  - 컨텐츠 템플릿 양식
  - 가이드 문서 (Google Search Console, 네이버 웹마스터 등)
