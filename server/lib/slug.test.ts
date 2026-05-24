import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Build an Enterprise Inventory System")).toBe(
      "build-an-enterprise-inventory-system",
    );
  });

  it("strips special characters", () => {
    expect(slugify("Power Apps & SharePoint!")).toBe("power-apps-sharepoint");
  });

  it("collapses repeated separators", () => {
    expect(slugify("a   b---c")).toBe("a-b-c");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Hello--  ")).toBe("hello");
  });

  it("strips diacritics", () => {
    expect(slugify("Café Déjà")).toBe("cafe-deja");
  });

  it("returns empty string for non-alphanumeric input", () => {
    expect(slugify("!!!")).toBe("");
  });
});
