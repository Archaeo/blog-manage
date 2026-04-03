# 월초 컨텐츠 전환 플레이북

매월 1일에 수행되는 컨텐츠 전환 절차. 대부분 자동화되어 있으며 확인만 필요.

## 자동 실행

launchd 또는 GitHub Actions에 의해 매월 1일 00:00(KST)에 자동 실행:

```bash
python -m pipelines.gamecodekr.run monthly
```

이 명령은:
1. 현재 월(YYYY-MM)로 빈 코드 JSON 파일 10개 게임분 생성
2. Git commit & push
3. Cloudflare Pages 자동 빌드/배포

## 수동 확인 체크리스트

자동 실행 후 다음을 확인:

### 페이지 확인

- [ ] `/[game]/codes/` 리다이렉트가 새 월 페이지로 이동하는지 확인
  - 리다이렉트는 클라이언트 사이드 (`ClientRedirect.tsx`)로 현재 월 기준 자동 동작
- [ ] 이전 달 페이지에 아카이브 배너("최신 코드는 여기서 확인하세요") 표시 확인
  - `ArchiveBanner` 컴포넌트가 현재 월과 비교하여 자동 표시

### SEO 확인

- [ ] `/sitemap.xml`에 새 월 페이지가 포함되어 있는지 확인
- [ ] Google Search Console에서 새 sitemap 제출 (자동 감지되지만 수동 확인 권장)

### 이전 달 정리 (필요 시)

- [ ] 만료된 코드를 `expiredCodes` 배열로 이동 (수동 또는 에이전트 활용)
- [ ] rewardAnalysis가 비어있는 코드에 분석 추가 (에이전트 활용)

### 트러블슈팅

- 자동 실행이 안 된 경우: `launchctl list | grep blogmanage`로 스케줄 확인
- 수동 실행: `python -m pipelines.gamecodekr.run monthly --skip-push` 후 확인 → `git push`
- 빌드 실패: `pnpm run build`로 로컬에서 먼저 확인
