# 네이버 웹마스터 도구 가이드

## 사이트 등록

1. [네이버 웹마스터 도구](https://searchadvisor.naver.com/) 접속
2. "사이트 관리" → "사이트 등록"
3. 사이트 URL 입력 (예: `https://blog-manage.pages.dev`)
4. 소유권 확인: HTML 태그 방식 권장
   - 제공된 `<meta name="naver-site-verification" content="...">` 태그를
     `sites/gamecodekr/src/app/layout.tsx`의 `metadata.verification`에 추가:
   ```typescript
   verification: {
     other: {
       'naver-site-verification': '발급받은_코드',
     },
   },
   ```
   - 빌드 & 배포 후 확인

## 사이트맵 등록

1. 웹마스터 도구 → 요청 → 사이트맵 제출
2. sitemap URL: `https://blog-manage.pages.dev/sitemap.xml`
3. 제출

## 신디케이션 (syndication.xml)

네이버 신디케이션은 콘텐츠 업데이트를 네이버에 즉시 알리는 방식.
현재는 sitemap 기반으로 운영하되, 추후 필요 시 `syndication.xml` 생성기 추가.

## 검색 노출 확인

1. 네이버에서 `site:blog-manage.pages.dev` 검색
2. 웹마스터 도구 → 현황 → 콘텐츠 수집
3. 수집 상태가 "정상"인지 확인

## 한국어 SEO 팁

- `lang="ko"` 필수 (layout.tsx에 이미 적용됨)
- 한국어 키워드 중심 title/description
- 네이버는 meta description을 구글보다 더 많이 참조
