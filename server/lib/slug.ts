// Convert arbitrary text into a URL-safe slug.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphen
    .replace(/-{2,}/g, "-") // collapse repeats
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}
