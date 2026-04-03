import type { SiteConfig } from "./config";

export interface MetadataInput {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  noIndex?: boolean;
}

/** Simplified metadata output matching Next.js Metadata shape */
export interface MetadataOutput {
  title: string;
  description: string;
  keywords?: string[];
  robots?: { index: boolean; follow: boolean };
  alternates?: { canonical: string };
  openGraph?: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: string;
    type: string;
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
  };
  other?: Record<string, string>;
}

export function generateMetadata(
  config: SiteConfig,
  input: MetadataInput
): MetadataOutput {
  const fullTitle = `${input.title} | ${config.siteName}`;
  const canonicalUrl = input.path
    ? `${config.baseUrl}${input.path}`
    : config.baseUrl;

  return {
    title: fullTitle,
    description: input.description,
    keywords: input.keywords,
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: canonicalUrl,
      siteName: config.siteName,
      locale: config.defaultLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
    },
    other: {
      ...(config.naverVerification
        ? { "naver-site-verification": config.naverVerification }
        : {}),
    },
  };
}
