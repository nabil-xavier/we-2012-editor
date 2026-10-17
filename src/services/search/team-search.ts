// src/services/search/team-search.ts
import type { DatabaseRow, DatabaseTable } from "@/types/database";
import type { TeamSearchIndex, TeamSearchItem } from "@/types/search";
import { createSearchIndex, searchIndex } from "@/services/search/create-index";
import { readRowNumber, readRowString } from "@/utils/database";

/** Physical table backing the team index */
export const TEAM_TABLE = "team";

/** Team columns exposed to Fuse */
export const TEAM_SEARCH_KEYS: (keyof TeamSearchItem & string)[] = [
  "name_short",
  "identifier",
];

/** Map one raw `team` row to its searchable shape */
export function toTeamSearchItem(row: DatabaseRow): TeamSearchItem {
  return {
    identifier: readRowNumber(row, "identifier"),
    name_short: readRowString(row, "name_short"),
  };
}

/** Build the team index from the loaded `team` table */
export function buildTeamIndex(table: DatabaseTable): TeamSearchIndex {
  const items = Object.values(table).map(toTeamSearchItem);
  return createSearchIndex(items, TEAM_SEARCH_KEYS);
}

/** Fuzzy search teams by 3-letter code or identifier */
export function searchTeams(
  index: TeamSearchIndex | null,
  query: string
): TeamSearchItem[] {
  return searchIndex(index, query);
}
