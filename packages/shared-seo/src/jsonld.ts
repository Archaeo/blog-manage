interface CodePageJsonLdInput {
  title: string;
  description: string;
  url: string;
  dateModified: string;
  gameName: string;
}

interface TierPageJsonLdInput {
  title: string;
  description: string;
  url: string;
  dateModified: string;
  gameName: string;
  itemCount: number;
}

export function generateCodePageJsonLd(input: CodePageJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article" as const,
    headline: input.title,
    description: input.description,
    url: input.url,
    dateModified: input.dateModified,
    inLanguage: "ko",
    about: {
      "@type": "VideoGame" as const,
      name: input.gameName,
    },
    publisher: {
      "@type": "Organization" as const,
      name: "GameCodeKR",
    },
  };
}

export function generateTierPageJsonLd(input: TierPageJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList" as const,
    name: input.title,
    description: input.description,
    url: input.url,
    numberOfItems: input.itemCount,
    dateModified: input.dateModified,
    inLanguage: "ko",
    about: {
      "@type": "VideoGame" as const,
      name: input.gameName,
    },
  };
}
