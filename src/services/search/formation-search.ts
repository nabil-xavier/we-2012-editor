// src/services/search/formation-search.ts
import type { DatabaseRow, DatabaseTable } from "@/types/database";
import type { FormationSearchIndex, FormationSearchItem } from "@/types/search";
import { createSearchIndex, searchIndex } from "@/services/search/create-index";
import { readRowNumber, readRowString } from "@/utils/database";

/** Physical table backing the formation index */
export const FORMATION_TABLE = "formation";

/** Formation columns exposed to Fuse */
export const FORMATION_SEARCH_KEYS: (keyof FormationSearchItem & string)[] = [
  "name",
  "identifier",
];

/** Map one raw `formation` row to its searchable shape */
export function toFormationSearchItem(row: DatabaseRow): FormationSearchItem {
  return {
    identifier: readRowNumber(row, "identifier"),
    name: readRowString(row, "name"),
  };
}

/** Build the formation index from the loaded `formation` table */
export function buildFormationIndex(
  table: DatabaseTable
): FormationSearchIndex {
  const items = Object.values(table).map(toFormationSearchItem);
  return createSearchIndex(items, FORMATION_SEARCH_KEYS);
}

/** Fuzzy search formations by name or identifier */
export function searchFormations(
  index: FormationSearchIndex | null,
  query: string
): FormationSearchItem[] {
  return searchIndex(index, query);
}
