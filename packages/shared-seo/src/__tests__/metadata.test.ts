import { describe, it, expect } from "vitest";
import { generateMetadata } from "../metadata";
import type { SiteConfig } from "../config";

const testConfig: SiteConfig = {
  siteName: "TestSite",
  baseUrl: "https://test.pages.dev",
  defaultLocale: "ko",
};

describe("generateMetadata", () => {
  it("기본 메타데이터를 생성해야 한다", () => {
    const meta = generateMetadata(testConfig, {
      title: "테스트 페이지",
      description: "테스트 설명",
    });
    expect(meta.title).toBe("테스트 페이지 | TestSite");
    expect(meta.description).toBe("테스트 설명");
  });

  it("keywords를 포함해야 한다", () => {
    const meta = generateMetadata(testConfig, {
      title: "테스트",
      description: "설명",
      keywords: ["키워드1", "키워드2"],
    });
    expect(meta.keywords).toEqual(["키워드1", "키워드2"]);
  });

  it("Open Graph 데이터를 포함해야 한다", () => {
    const meta = generateMetadata(testConfig, {
      title: "테스트",
      description: "설명",
      path: "/blox-fruits/codes/2026-04",
    });
    expect(meta.openGraph?.title).toBe("테스트 | TestSite");
    expect(meta.openGraph?.url).toBe("https://test.pages.dev/blox-fruits/codes/2026-04");
  });

  it("canonical URL을 설정해야 한다", () => {
    const meta = generateMetadata(testConfig, {
      title: "테스트",
      description: "설명",
      path: "/some/path",
    });
    expect(meta.alternates?.canonical).toBe("https://test.pages.dev/some/path");
  });
});
