import fs from "fs";
import path from "path";
import type { MonthlyCodeData, MonthlyTierData, CategoryTierData, CategoryLabel } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

const CATEGORY_LABELS: Record<string, CategoryLabel> = {
  fruits: { name: "열매", icon: "🍎" },
  "fruits-overall": { name: "열매", icon: "🍎" },
  swords: { name: "검", icon: "⚔️" },
  "fighting-styles": { name: "격투 스타일", icon: "🥊" },
  units: { name: "유닛", icon: "⚔️" },
  bloodlines: { name: "혈통", icon: "🩸" },
  pets: { name: "펫", icon: "🐾" },
  towers: { name: "타워", icon: "🗼" },
  bees: { name: "벌", icon: "🐝" },
  weapons: { name: "무기", icon: "🔪" },
};

export function getCategoryLabel(category: string): CategoryLabel {
  return CATEGORY_LABELS[category] || { name: category, icon: "📋" };
}

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getMonthlyCodeData(
  gameSlug: string,
  month: string
): MonthlyCodeData | null {
  const filePath = path.join(CONTENT_DIR, "codes", gameSlug, `${month}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as MonthlyCodeData;
  } catch {
    return null;
  }
}

export function getMonthlyTierData(
  gameSlug: string,
  month: string
): MonthlyTierData | null {
  const filePath = path.join(CONTENT_DIR, "tiers", gameSlug, `${month}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as MonthlyTierData;
  } catch {
    return null;
  }
}

export function getTierCategories(gameSlug: string, month: string): string[] {
  const dirPath = path.join(CONTENT_DIR, "tiers", gameSlug);
  try {
    const files = fs.readdirSync(dirPath);
    const catFiles = files.filter(
      (f) => f.startsWith(`${month}-`) && f.endsWith(".json") && f !== `${month}.json`
    );
    if (catFiles.length > 0) {
      return catFiles.map((f) => f.replace(`${month}-`, "").replace(".json", ""));
    }
    const data = getMonthlyTierData(gameSlug, month);
    return data ? [data.category] : [];
  } catch {
    return [];
  }
}

export function getCategoryTierData(
  gameSlug: string,
  month: string,
  category: string
): MonthlyTierData | null {
  const catPath = path.join(CONTENT_DIR, "tiers", gameSlug, `${month}-${category}.json`);
  try {
    const raw = fs.readFileSync(catPath, "utf-8");
    return JSON.parse(raw) as MonthlyTierData;
  } catch {
    const data = getMonthlyTierData(gameSlug, month);
    if (data && data.category === category) return data;
    return null;
  }
}

export function getAllCategoryTierData(
  gameSlug: string,
  month: string
): CategoryTierData[] {
  const categories = getTierCategories(gameSlug, month);
  const results: CategoryTierData[] = [];

  for (const cat of categories) {
    const data = getCategoryTierData(gameSlug, month, cat);
    if (data) {
      results.push({
        category: cat,
        categoryLabel: getCategoryLabel(cat),
        lastUpdated: data.lastUpdated,
        tiers: data.tiers,
        editorial: data.editorial,
      });
    }
  }

  return results;
}

export function getAvailableMonths(
  gameSlug: string,
  type: "codes" | "tiers"
): string[] {
  const dirPath = path.join(CONTENT_DIR, type, gameSlug);
  try {
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
    const months = new Set(
      files.map((f) => {
        const match = f.match(/^(\d{4}-\d{2})/);
        return match ? match[1] : "";
      }).filter(Boolean)
    );
    return [...months].sort().reverse();
  } catch {
    return [];
  }
}
