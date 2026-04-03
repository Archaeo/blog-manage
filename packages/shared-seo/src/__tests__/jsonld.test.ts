import { describe, it, expect } from "vitest";
import { generateCodePageJsonLd, generateTierPageJsonLd } from "../jsonld";

describe("JSON-LD", () => {
  it("코드 페이지 JSON-LD를 생성해야 한다", () => {
    const jsonld = generateCodePageJsonLd({
      title: "블록스 프루츠 코드",
      description: "최신 코드 모음",
      url: "https://test.pages.dev/blox-fruits/codes/2026-04",
      dateModified: "2026-04-03T10:00:00Z",
      gameName: "블록스 프루츠",
    });
    expect(jsonld["@type"]).toBe("Article");
    expect(jsonld.headline).toBe("블록스 프루츠 코드");
    expect(jsonld.about.name).toBe("블록스 프루츠");
  });

  it("티어 페이지 JSON-LD를 생성해야 한다", () => {
    const jsonld = generateTierPageJsonLd({
      title: "블록스 프루츠 티어표",
      description: "열매 순위",
      url: "https://test.pages.dev/blox-fruits/tier/2026-04",
      dateModified: "2026-04-03T10:00:00Z",
      gameName: "블록스 프루츠",
      itemCount: 10,
    });
    expect(jsonld["@type"]).toBe("ItemList");
    expect(jsonld.numberOfItems).toBe(10);
  });
});
