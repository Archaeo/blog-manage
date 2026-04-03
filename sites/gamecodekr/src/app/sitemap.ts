import type { MetadataRoute } from "next";
import { getAllGameSlugs, getGameBySlug } from "@/lib/games";
import { getAvailableMonths } from "@/lib/content";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  for (const slug of getAllGameSlugs()) {
    const game = getGameBySlug(slug)!;
    entries.push({
      url: `${BASE_URL}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    if (game.hasCode) {
      for (const month of getAvailableMonths(slug, "codes")) {
        entries.push({
          url: `${BASE_URL}/${slug}/codes/${month}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.9,
        });
      }
    }

    if (game.hasTier) {
      for (const month of getAvailableMonths(slug, "tiers")) {
        entries.push({
          url: `${BASE_URL}/${slug}/tier/${month}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
