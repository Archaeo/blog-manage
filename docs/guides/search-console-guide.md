# Google Search Console 가이드

## 사이트 등록

1. [Google Search Console](https://search.google.com/search-console) 접속
2. "속성 추가" → "URL 접두사" 선택
3. 사이트 URL 입력 (예: `https://blog-manage.pages.dev`)
4. 소유권 확인: HTML 태그 방식 권장
   - 제공된 `<meta>` 태그를 `sites/gamecodekr/src/app/layout.tsx`의 `metadata`에 추가
   - 빌드 & 배포 후 확인

## Sitemap 제출

1. Search Console → 색인 → Sitemaps
2. sitemap URL 입력: `sitemap.xml`
3. 제출 → 상태가 "성공"인지 확인

사이트맵은 `sites/gamecodekr/src/app/sitemap.ts`에서 자동 생성됨.
새 게임/월 추가 시 자동으로 포함됨.

## 색인 요청

새 페이지를 빠르게 색인하고 싶을 때:

1. Search Console → URL 검사
2. 페이지 URL 입력
3. "색인 생성 요청" 클릭

매월 새 페이지가 생성되므로 월초에 주요 페이지 색인 요청 권장.

## 실적 모니터링

주요 확인 포인트:
- 검색 노출수/클릭수 추이
- 주요 키워드별 순위
- 모바일 사용성 문제
- 색인 커버리지 오류
