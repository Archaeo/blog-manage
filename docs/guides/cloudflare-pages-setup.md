# Cloudflare Pages 배포 가이드

## 사전 준비
1. Cloudflare 계정 생성 (https://dash.cloudflare.com)
2. GitHub 저장소에 코드 push

## Cloudflare Pages 프로젝트 생성

1. Cloudflare 대시보드 → Workers & Pages → Create
2. Pages 탭 → Connect to Git
3. GitHub 저장소 선택: `blog-manage`

## 빌드 설정

| 항목 | 값 |
|---|---|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `cd sites/gamecodekr && pnpm install && pnpm build` |
| Build output directory | `sites/gamecodekr/out` |
| Root directory | `/` |
| Node.js version | 18 |

## 환경 변수

| 변수 | 값 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://gamecodekr.pages.dev` | 사이트 기본 URL |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | `false` | 애드센스 비활성화 |

## 커스텀 도메인 추가 (추후)

1. Pages 프로젝트 → Custom Domains
2. 도메인 입력 → DNS 설정 자동 추가
3. 환경변수 `NEXT_PUBLIC_SITE_URL`을 새 도메인으로 변경
4. 재배포

## 배포 확인

- 배포 URL: `https://gamecodekr.pages.dev`
- 빌드 로그: Cloudflare 대시보드 → Deployments
