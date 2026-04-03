export interface SiteConfig {
  siteName: string;
  baseUrl: string;
  defaultLocale: string;
  naverVerification?: string;
  googleVerification?: string;
}

export function createSiteConfig(overrides: Partial<SiteConfig> = {}): SiteConfig {
  return {
    siteName: overrides.siteName ?? "Blog",
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? overrides.baseUrl ?? "http://localhost:3000",
    defaultLocale: overrides.defaultLocale ?? "ko",
    naverVerification: overrides.naverVerification,
    googleVerification: overrides.googleVerification,
    ...overrides,
  };
}
