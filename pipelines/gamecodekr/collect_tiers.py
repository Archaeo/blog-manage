# pipelines/gamecodekr/collect_tiers.py
"""Playwright headless로 게임 티어를 수집한다.

TIER_GAMES에 정의된 게임별 소스를 방문하여 티어 데이터를 추출하고 collected_tiers.json에 저장.
"""
import json
import random
import re
import time
from datetime import datetime, timezone

from playwright.sync_api import sync_playwright, Page, TimeoutError as PWTimeoutError

from pipelines.gamecodekr.config import (
    COLLECTED_TIERS_FILE,
    DATA_DIR,
    DELAY_BETWEEN_PAGES_SEC,
    DELAY_WITHIN_SOURCE_SEC,
    MAX_CONSECUTIVE_FAILURES,
    TIER_GAMES,
)


def _random_delay(range_sec: tuple[int, int]) -> None:
    """랜덤 딜레이."""
    time.sleep(random.uniform(*range_sec))


def _extract_tiers_from_page(page: Page) -> list[dict]:
    """페이지에서 티어 정보를 추출한다."""
    items = []
    try:
        raw = page.evaluate("""
            () => {
                const results = [];
                // 일반적인 티어리스트 구조: 헤더(S, A, B...) + 아이템 리스트
                const tierSections = document.querySelectorAll(
                    '[class*="tier"], [class*="Tier"], h2, h3, tr'
                );

                let currentTier = '';
                for (const section of tierSections) {
                    const text = section.textContent.trim();

                    // 티어 헤더 감지
                    const tierMatch = text.match(/^(SS|S\\+|S|A\\+|A|B\\+|B|C\\+|C|D|E|F)\\s*(?:Tier|tier)?$/);
                    if (tierMatch) {
                        currentTier = tierMatch[1];
                        continue;
                    }

                    // 테이블 행에서 아이템 + 티어 추출
                    if (section.tagName === 'TR') {
                        const cells = section.querySelectorAll('td');
                        if (cells.length >= 2) {
                            const name = cells[0].textContent.trim();
                            const tierCell = cells[1].textContent.trim();
                            const tierVal = tierCell.match(/(SS|S\\+|S|A\\+|A|B\\+|B|C\\+|C|D|E|F)/);
                            if (name && tierVal) {
                                const img = cells[0].querySelector('img');
                                results.push({
                                    name: name.substring(0, 50),
                                    tier: tierVal[1],
                                    image_url: img ? img.src : ''
                                });
                            }
                        }
                    }

                    // 티어 섹션 내 아이템
                    if (currentTier) {
                        const items = section.querySelectorAll('li, .item, [class*="character"], [class*="unit"]');
                        for (const item of items) {
                            const name = item.textContent.trim();
                            if (name && name.length <= 50 && name.length >= 2) {
                                const img = item.querySelector('img');
                                results.push({
                                    name: name,
                                    tier: currentTier,
                                    image_url: img ? img.src : ''
                                });
                            }
                        }
                    }
                }
                return results;
            }
        """)

        seen = set()
        for item in raw:
            name = item["name"].strip()
            if name and name.upper() not in seen:
                seen.add(name.upper())
                items.append({
                    "name": name,
                    "tier": item["tier"],
                    "image_url": item.get("image_url", ""),
                })

    except Exception as e:
        print(f"  티어 추출 오류: {e}")

    return items


def _extract_source_text(page: Page) -> str:
    """페이지에서 티어 관련 분석/설명 텍스트를 추출한다."""
    try:
        text = page.evaluate("""
            () => {
                const selectors = [
                    'article p',
                    '.entry-content p',
                    '.post-content p',
                    'main p',
                    '[class*="content"] p',
                ];
                const paragraphs = [];
                for (const sel of selectors) {
                    const els = document.querySelectorAll(sel);
                    if (els.length > 0) {
                        for (const el of els) {
                            const t = el.textContent.trim();
                            if (t.length > 30 && t.length < 500) {
                                paragraphs.push(t);
                            }
                        }
                        break;
                    }
                }
                return paragraphs.slice(0, 20).join('\\n\\n');
            }
        """)
        return text[:3000]
    except Exception:
        return ""


def collect_all_tiers() -> None:
    """모든 티어 게임의 데이터를 수집하여 collected_tiers.json에 저장."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    result = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 720},
        )
        context.route("**/*doubleclick.net*", lambda route: route.abort())
        context.route("**/*google-analytics.com*", lambda route: route.abort())
        context.route("**/*googlesyndication.com*", lambda route: route.abort())
        # 폰트만 차단 (이미지는 수집을 위해 허용)
        context.route("**/*.{ico,woff,woff2}", lambda route: route.abort())

        page = context.new_page()

        for game_slug, config in TIER_GAMES.items():
            print(f"\n{'='*50}")
            print(f"게임: {game_slug}")

            sources_result = {}
            consecutive_failures = 0

            source_items = list(config["sources"].items())
            random.shuffle(source_items)

            for source_name, url_template in source_items:
                if consecutive_failures >= MAX_CONSECUTIVE_FAILURES:
                    sources_result[source_name] = "__SKIPPED__"
                    continue

                categories = config["categories"]
                category_results = {}

                for category in categories:
                    url = url_template.format(category=category)
                    print(f"  소스: {source_name} / {category} → {url}")

                    try:
                        page.goto(url, timeout=30000, wait_until="domcontentloaded")
                        _random_delay(DELAY_WITHIN_SOURCE_SEC)

                        items = _extract_tiers_from_page(page)
                        source_text = _extract_source_text(page)
                        category_results[category] = {
                            "items": items,
                            "source_text": source_text,
                        }
                        print(f"    → {len(items)}개 항목 수집")
                        consecutive_failures = 0

                    except (PWTimeoutError, Exception) as e:
                        print(f"    → 실패: {e}")
                        category_results[category] = []
                        consecutive_failures += 1

                    _random_delay(DELAY_BETWEEN_PAGES_SEC)

                sources_result[source_name] = category_results

            result[game_slug] = sources_result

        browser.close()

    with open(COLLECTED_TIERS_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n수집 완료: {COLLECTED_TIERS_FILE}")


if __name__ == "__main__":
    collect_all_tiers()
