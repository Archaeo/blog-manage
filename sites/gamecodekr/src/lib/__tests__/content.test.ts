import { describe, it, expect } from "vitest";
import {
  getMonthlyCodeData,
  getMonthlyTierData,
  getAvailableMonths,
  getCurrentMonth,
} from "../content";

describe("content", () => {
  it("getCurrentMonth는 YYYY-MM 형식을 반환해야 한다", () => {
    const month = getCurrentMonth();
    expect(month).toMatch(/^\d{4}-\d{2}$/);
  });

  it("블록스 프루츠 2026-04 코드 데이터를 로드할 수 있어야 한다", () => {
    const data = getMonthlyCodeData("blox-fruits", "2026-04");
    expect(data).toBeDefined();
    expect(data!.game).toBe("blox-fruits");
    expect(data!.codes.length).toBeGreaterThan(0);
    expect(data!.meta.title).toContain("블록스 프루츠");
  });

  it("존재하지 않는 데이터는 null을 반환해야 한다", () => {
    const data = getMonthlyCodeData("nonexistent", "2026-04");
    expect(data).toBeNull();
  });

  it("블록스 프루츠 2026-04 티어 데이터를 로드할 수 있어야 한다", () => {
    const data = getMonthlyTierData("blox-fruits", "2026-04");
    expect(data).toBeDefined();
    expect(data!.tiers["S+"]).toBeDefined();
  });

  it("사용 가능한 월 목록을 반환해야 한다", () => {
    const months = getAvailableMonths("blox-fruits", "codes");
    expect(months).toContain("2026-04");
  });
});
