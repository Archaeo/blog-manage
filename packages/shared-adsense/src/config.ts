export interface AdsenseConfig {
  enabled: boolean;
  publisherId: string;
}

export function getAdsenseConfig(): AdsenseConfig {
  return {
    enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true",
    publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ?? "",
  };
}
