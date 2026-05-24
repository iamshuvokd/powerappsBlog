import { describe, expect, it } from "vitest";
import { calculateReadTime } from "./read-time";
import type { Content } from "../validation";

describe("calculateReadTime", () => {
  it("returns at least 1 minute for empty content", () => {
    expect(calculateReadTime([])).toBe(1);
  });

  it("counts words across paragraph/heading/quote", () => {
    const content: Content = [
      { type: "heading", level: 2, text: "Title words here" },
      { type: "paragraph", text: "one two three four five" },
      { type: "quote", text: "a tip" },
    ];
    expect(calculateReadTime(content)).toBe(1);
  });

  it("scales with longer content (200 wpm)", () => {
    const words = Array.from({ length: 400 }, () => "word").join(" ");
    const content: Content = [{ type: "paragraph", text: words }];
    expect(calculateReadTime(content)).toBe(2);
  });

  it("counts list items", () => {
    const content: Content = [{ type: "list", ordered: false, items: ["alpha beta", "gamma"] }];
    expect(calculateReadTime(content)).toBe(1);
  });
});
