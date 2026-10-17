// src/services/search/create-index.ts
import Fuse from "fuse.js";

/**
 * Highest Fuse score still reported as a match.
 * 0 = exact match only, 1 = everything matches.
 */
export const SEARCH_THRESHOLD = 0.35;

/** Build one reusable Fuse index over `items`, matching any of `keys` */
export function createSearchIndex<T extends object>(
  items: T[],
  keys: (keyof T & string)[]
): Fuse<T> {
  return new Fuse(items, {
    keys: [...keys],
    threshold: SEARCH_THRESHOLD,
    ignoreLocation: true,
    minMatchCharLength: 1,
  });
}

/** Run a query against a rebuilt index, returning bare records (no scores) */
export function searchIndex<T>(index: Fuse<T> | null, query: string): T[] {
  const term = query.trim();
  if (!index || term.length === 0) {
    return [];
  }
  return index.search(term).map((result) => result.item);
}
