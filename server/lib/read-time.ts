import type { Content } from "../validation";

const WORDS_PER_MINUTE = 200;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Estimate reading time (in whole minutes, minimum 1) from block content.
export function calculateReadTime(content: Content): number {
  let words = 0;

  for (const block of content) {
    switch (block.type) {
      case "paragraph":
      case "quote":
      case "heading":
        words += countWords(block.text);
        break;
      case "list":
        words += block.items.reduce((sum, item) => sum + countWords(item), 0);
        break;
      case "code":
        words += countWords(block.code) / 2; // code scans differently than prose
        break;
    }
  }

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
