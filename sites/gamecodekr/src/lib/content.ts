import fs from "fs";
import path from "path";
import type { MonthlyCodeData, MonthlyTierData } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

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

export function getAvailableMonths(
  gameSlug: string,
  type: "codes" | "tiers"
): string[] {
  const dirPath = path.join(CONTENT_DIR, type, gameSlug);
  try {
    return fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}
