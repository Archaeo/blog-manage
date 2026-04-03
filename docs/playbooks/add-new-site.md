# 새 사이트 추가 플레이북

모노레포에 새 블로그 사이트(예: TechBlogKR)를 추가할 때의 절차.

## 사전 준비

- 사이트 이름/slug 결정 (예: `techblogkr`)
- 사이트 도메인 계획 (*.pages.dev → 커스텀 도메인)
- 컨텐츠 구조 결정

## 체크리스트

### 1. Next.js 앱 생성

- [ ] `sites/{site-name}/` 디렉토리 생성
- [ ] `npx create-next-app@latest` 또는 기존 사이트 복사
- [ ] `next.config.mjs`: `output: "export"`, `images: { unoptimized: true }`
- [ ] TailwindCSS 4 설정 (`@import "tailwindcss"`, `@tailwindcss/postcss`)
- [ ] 공유 패키지 의존성 추가:
  ```json
  "@blog-manage/shared-ui": "workspace:*",
  "@blog-manage/shared-seo": "workspace:*",
  "@blog-manage/shared-adsense": "workspace:*"
  ```

### 2. pnpm workspace 확인

- [ ] `pnpm-workspace.yaml`에 `sites/*` 패턴이 이미 있으므로 자동 인식
- [ ] `pnpm install` 실행하여 의존성 연결 확인

### 3. 루트 package.json 업데이트

- [ ] 필요 시 사이트별 빌드 스크립트 추가

### 4. Cloudflare Pages 프로젝트 생성

- [ ] Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
- [ ] Build command: 사이트에 맞게 설정
- [ ] Build output directory: `sites/{site-name}/out`

### 5. 파이프라인 (필요 시)

- [ ] `pipelines/{site-name}/` 디렉토리 생성
- [ ] config.py, 수집/검증/생성 스크립트 작성

### 6. 에이전트 (필요 시)

- [ ] `.claude/agents/{site-name}/` 에이전트 폴더 생성
- [ ] 사이트별 페르소나/리뷰어 에이전트 작성

### 7. 테스트 & 배포

- [ ] `pnpm run build` — 전체 빌드 성공 확인
- [ ] Cloudflare Pages 배포 확인
