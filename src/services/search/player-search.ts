// src/services/search/player-search.ts
import type { DatabaseRow, DatabaseTable } from "@/types/database";
import type { PlayerSearchIndex, PlayerSearchItem } from "@/types/search";
import { createSearchIndex, searchIndex } from "@/services/search/create-index";
import { readRowNumber, readRowString } from "@/utils/database";

/** Physical table backing the player index */
export const PLAYER_TABLE = "player";

/** Player columns exposed to Fuse */
export const PLAYER_SEARCH_KEYS: (keyof PlayerSearchItem & string)[] = [
  "name",
  "name_shorter",
  "identifier",
];

/** Map one raw `player` row to its searchable shape */
export function toPlayerSearchItem(row: DatabaseRow): PlayerSearchItem {
  return {
    identifier: readRowNumber(row, "identifier"),
    name: readRowString(row, "name"),
    name_shorter: readRowString(row, "name_shorter"),
  };
}

/** Build the player index from the loaded `player` table */
export function buildPlayerIndex(table: DatabaseTable): PlayerSearchIndex {
  const items = Object.values(table).map(toPlayerSearchItem);
  return createSearchIndex(items, PLAYER_SEARCH_KEYS);
}

/** Fuzzy search players by name, short name or identifier */
export function searchPlayers(
  index: PlayerSearchIndex | null,
  query: string
): PlayerSearchItem[] {
  return searchIndex(index, query);
}
