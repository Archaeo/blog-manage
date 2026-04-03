# pipelines/gamecodekr/collect_codes.py
"""Playwright headless로 게임 코드를 수집한다.

3개 소스 사이트를 방문하여 코드를 추출하고 collected_codes.json에 저장.
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
    """페이지에서 코드를 추출한다."""
    codes = []
    try:
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
    random.shuffle(games)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 720},
        )
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

    with open(COLLECTED_CODES_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n수집 완료: {COLLECTED_CODES_FILE}")


if __name__ == "__main__":
    collect_all_codes()
