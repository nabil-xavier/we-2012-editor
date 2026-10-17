// src/services/search/competition-search.ts
import type { DatabaseRow, DatabaseTable } from "@/types/database";
import type {
  CompetitionSearchIndex,
  CompetitionSearchItem,
} from "@/types/search";
import { createSearchIndex, searchIndex } from "@/services/search/create-index";
import { readRowNumber, readRowString } from "@/utils/database";

/**
 * Tables holding competition names. The first one present in the loaded
 * database wins — `.bin` files use either spelling.
 */
export const COMPETITION_NAME_TABLES = ["competition_name", "competitionName"];

/** Competition name columns exposed to Fuse */
export const COMPETITION_SEARCH_KEYS: (keyof CompetitionSearchItem & string)[] =
  ["value", "identifier"];

/** Map one raw `competition_name` row to its searchable shape */
export function toCompetitionSearchItem(
  row: DatabaseRow
): CompetitionSearchItem {
  return {
    identifier: readRowNumber(row, "identifier"),
    value: readRowString(row, "value"),
  };
}

/** Build the competition index from the loaded name table */
export function buildCompetitionIndex(
  table: DatabaseTable
): CompetitionSearchIndex {
  const items = Object.values(table).map(toCompetitionSearchItem);
  return createSearchIndex(items, COMPETITION_SEARCH_KEYS);
}

/** Fuzzy search competition names by translated value or identifier */
export function searchCompetitions(
  index: CompetitionSearchIndex | null,
  query: string
): CompetitionSearchItem[] {
  return searchIndex(index, query);
}
