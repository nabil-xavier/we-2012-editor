// src/services/search/group-search.ts
import type { DatabaseRow, DatabaseTable } from "@/types/database";
import type { GroupSearchIndex, GroupSearchItem } from "@/types/search";
import { createSearchIndex, searchIndex } from "@/services/search/create-index";
import { readRowNumber, readRowString } from "@/utils/database";

/**
 * Tables holding group names. The first one present in the loaded database
 * wins — `.bin` files use either spelling.
 */
export const GROUP_NAME_TABLES = ["group_name", "groupName"];

/** Group name columns exposed to Fuse */
export const GROUP_SEARCH_KEYS: (keyof GroupSearchItem & string)[] = [
  "value",
  "identifier",
];

/** Map one raw `group_name` row to its searchable shape */
export function toGroupSearchItem(row: DatabaseRow): GroupSearchItem {
  return {
    identifier: readRowNumber(row, "identifier"),
    value: readRowString(row, "value"),
  };
}

/** Build the group index from the loaded name table */
export function buildGroupIndex(table: DatabaseTable): GroupSearchIndex {
  const items = Object.values(table).map(toGroupSearchItem);
  return createSearchIndex(items, GROUP_SEARCH_KEYS);
}

/** Fuzzy search group names by translated value or identifier */
export function searchGroups(
  index: GroupSearchIndex | null,
  query: string
): GroupSearchItem[] {
  return searchIndex(index, query);
}
