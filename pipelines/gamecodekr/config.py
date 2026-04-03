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
        "image_url": "https://tr.rbxcdn.com/180DAY-90afa57850c8c8d1518b398b6c119ee9/512/512/Image/Png/noFilter",
    },
    {
        "slug": "king-legacy",
        "en_name": "King Legacy",
        "kr_name": "킹 레거시",
        "image_url": "https://tr.rbxcdn.com/180DAY-64a6c0401158d77168afeff93cd50baa/512/512/Image/Png/noFilter",
    },
    {
        "slug": "fruit-battlegrounds",
        "en_name": "Fruit Battlegrounds",
        "kr_name": "프루츠 배틀그라운드",
        "image_url": "https://tr.rbxcdn.com/180DAY-5bb6ef0585a08a63cad145807db0f78f/512/512/Image/Png/noFilter",
    },
    {
        "slug": "anime-adventures",
        "en_name": "Anime Adventures",
        "kr_name": "애니메 어드벤처",
        "image_url": "https://tr.rbxcdn.com/180DAY-ceec97df50507c3436e05dfca16cd467/512/512/Image/Png/noFilter",
    },
    {
        "slug": "murder-mystery-2",
        "en_name": "Murder Mystery 2",
        "kr_name": "머더 미스터리 2",
        "image_url": "https://tr.rbxcdn.com/180DAY-7fc1713c02b50d12c51b78b59f2a4b15/512/512/Image/Png/noFilter",
    },
    {
        "slug": "pet-simulator-99",
        "en_name": "Pet Simulator 99",
        "kr_name": "펫 시뮬레이터 99",
        "image_url": "https://tr.rbxcdn.com/180DAY-03854432095bc666d812e935e8aa758f/512/512/Image/Png/noFilter",
    },
    {
        "slug": "shindo-life",
        "en_name": "Shindo Life",
        "kr_name": "신도 라이프",
        "image_url": "https://tr.rbxcdn.com/180DAY-ec3b7cc4591f09fc94c19bec25b8d381/512/512/Image/Png/noFilter",
    },
    {
        "slug": "tower-defense-simulator",
        "en_name": "Tower Defense Simulator",
        "kr_name": "타워 디펜스 시뮬레이터",
        "image_url": "https://tr.rbxcdn.com/180DAY-aa3fb80164bc870b3a5d7e6bbb2cc893/512/512/Image/Png/noFilter",
    },
    {
        "slug": "all-star-tower-defense",
        "en_name": "All Star Tower Defense",
        "kr_name": "올스타 타워 디펜스",
        "image_url": "https://tr.rbxcdn.com/180DAY-defb5ce1522d2458e3a2e36289e88723/512/512/Image/Png/noFilter",
    },
    {
        "slug": "bee-swarm-simulator",
        "en_name": "Bee Swarm Simulator",
        "kr_name": "비 스웜 시뮬레이터",
        "image_url": "https://tr.rbxcdn.com/180DAY-9d7481d5f4b40acde9feacd3c3212e9f/512/512/Image/Png/noFilter",
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
DELAY_BETWEEN_PAGES_SEC = (3, 7)
DELAY_WITHIN_SOURCE_SEC = (5, 10)
MAX_CONSECUTIVE_FAILURES = 3

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
    "king-legacy": {
        "categories": ["fruits"],
        "sources": {
            "Pro Game Guides": "https://progameguides.com/roblox/king-legacy-tier-list/",
            "Beebom": "https://beebom.com/king-legacy-tier-list/",
            "Pocket Tactics": "https://www.pockettactics.com/king-legacy/tier-list",
        },
    },
    "fruit-battlegrounds": {
        "categories": ["fruits"],
        "sources": {
            "Pro Game Guides": "https://progameguides.com/roblox/fruit-battlegrounds-tier-list/",
            "Beebom": "https://beebom.com/fruit-battlegrounds-tier-list/",
            "Pocket Tactics": "https://www.pockettactics.com/fruit-battlegrounds/tier-list",
        },
    },
    "murder-mystery-2": {
        "categories": ["weapons"],
        "sources": {
            "Pro Game Guides": "https://progameguides.com/roblox/murder-mystery-2-value-list/",
            "Beebom": "https://beebom.com/murder-mystery-2-value-list/",
        },
    },
    "pet-simulator-99": {
        "categories": ["pets"],
        "sources": {
            "Pro Game Guides": "https://progameguides.com/roblox/pet-simulator-99-tier-list/",
            "Beebom": "https://beebom.com/pet-simulator-99-tier-list/",
            "Pocket Tactics": "https://www.pockettactics.com/pet-simulator-99/tier-list",
        },
    },
    "tower-defense-simulator": {
        "categories": ["towers"],
        "sources": {
            "Beebom": "https://beebom.com/tower-defense-simulator-tier-list/",
            "Pro Game Guides": "https://progameguides.com/roblox/tower-defense-simulator-tier-list/",
        },
    },
    "bee-swarm-simulator": {
        "categories": ["bees"],
        "sources": {
            "Pro Game Guides": "https://progameguides.com/roblox/bee-swarm-simulator-tier-list/",
            "Beebom": "https://beebom.com/bee-swarm-simulator-tier-list/",
        },
    },
}

TIER_NORMALIZE = {
    "SS": "S+", "S+": "S+", "S": "S",
    "A+": "A", "A": "A",
    "B+": "B", "B": "B",
    "C+": "C", "C": "C",
    "D": "D",
    "E": "D", "F": "D",
}

TIER_ORDER = ["S+", "S", "A", "B", "C", "D"]
