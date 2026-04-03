/** 코드 검증 상태: 3=3소스 확인, 2=2소스, 1=미확인 */
export type VerificationLevel = 1 | 2 | 3;

/** 코드 상태 */
export type CodeStatus = "active" | "expired" | "unverified";

/** 개별 게임 코드 */
export interface GameCode {
  code: string;
  reward: string;
  verified: VerificationLevel;
  status: CodeStatus;
  addedDate: string;
  rewardAnalysis: string;
}

/** 코드 페이지 에디토리얼 */
export interface CodeEditorial {
  summary: string;
  tips: string;
  totalValue: string;
}

/** 월단위 코드 페이지 데이터 */
export interface MonthlyCodeData {
  game: string;
  gameTitle: string;
  month: string;
  lastUpdated: string;
  codes: GameCode[];
  expiredCodes: GameCode[];
  meta: PageMeta;
  editorial?: CodeEditorial;
}

/** 티어 등급 */
export type TierRank = "S+" | "S" | "A" | "B" | "C" | "D";

/** 티어 아이템 */
export interface TierItem {
  name: string;
  nameKo: string;
  rank: TierRank;
  description: string;
  changeFromLast: "up" | "down" | "new" | "same";
  imageUrl?: string;
  consensus?: boolean;
  sources?: number;
}

/** 티어 페이지 에디토리얼 */
export interface TierEditorial {
  summary: string;
  recommendation: string;
}

/** 월단위 티어 페이지 데이터 */
export interface MonthlyTierData {
  game: string;
  gameTitle: string;
  month: string;
  lastUpdated: string;
  category: string;
  tiers: Record<TierRank, TierItem[]>;
  meta: PageMeta;
  editorial?: TierEditorial;
}

/** 페이지 SEO 메타 */
export interface PageMeta {
  title: string;
  description: string;
  keywords: string[];
}

/** 블로그 글 유형 */
export type PostType = "code-analysis" | "tier-analysis" | "patch" | "guide";

/** 블로그 글 */
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  game: string;
  type: PostType;
  tags: string[];
  description: string;
  content: string;
}

/** 게임 설정 */
export interface GameConfig {
  slug: string;
  title: string;
  titleEn: string;
  icon: string;
  imageUrl: string;
  description: string;
  hasCode: boolean;
  hasTier: boolean;
}
