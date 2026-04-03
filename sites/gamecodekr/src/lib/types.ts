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

/** 월단위 코드 페이지 데이터 */
export interface MonthlyCodeData {
  game: string;
  gameTitle: string;
  month: string;
  lastUpdated: string;
  codes: GameCode[];
  expiredCodes: GameCode[];
  meta: PageMeta;
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
}

/** 페이지 SEO 메타 */
export interface PageMeta {
  title: string;
  description: string;
  keywords: string[];
}

/** 게임 설정 */
export interface GameConfig {
  slug: string;
  title: string;
  titleEn: string;
  icon: string;
  description: string;
  hasCode: boolean;
  hasTier: boolean;
}
