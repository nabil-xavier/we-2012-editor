// src/hooks/useTableBrowser.ts
import { useCallback, useDeferredValue, useMemo } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import { useTableBrowserStore } from "@/store/useTableBrowserStore";
import type { DatabaseTable } from "@/types/database";
import type {
  BrowserColumn,
  BrowserRecord,
  BrowserTableConfig,
} from "@/types/table-browser";
import {
  EMPTY_LABEL_LOOKUP,
  EMPTY_TABLE,
  buildBrowserHaystacks,
  buildLabelLookup,
  buildLabelOwnerLookup,
  matchRecordsBySubstring,
  readBrowserCell,
  toBrowserRecords,
} from "@/utils/table-browser";

export interface UseTableBrowserResult {
  /** Rows rendered by the virtualizer — search results, or all rows when idle */
  rows: BrowserRecord[];
  /** Search text as typed (kept in sync with every keystroke) */
  query: string;
  /** Search text the rendered rows were computed from */
  appliedQuery: string;
  /** True while the deferred search still trails the typed query */
  isSearching: boolean;
  /** Update the search text of this table */
  setQuery: (query: string) => void;
  /** True when the browsed table exists in the loaded database */
  hasTable: boolean;
  /** Total number of rows in the table */
  totalCount: number;
  /** Identifier of the selected record, `null` when nothing is selected */
  selectedIdentifier: number | null;
  /** Selected record, `null` when nothing is selected */
  selectedRecord: BrowserRecord | null;
  /** Select one record, `null` clears the selection */
  selectRecord: (identifier: number | null) => void;
  /** Display text of one cell */
  getCellValue: (record: BrowserRecord, column: BrowserColumn) => string;
}

/**
 * Bridge between the Zustand database and one virtualized table:
 * raw records in, filtered rows + selection out.
 *
 * Search runs in two passes: an exact case-insensitive substring scan over the
 * searchable columns (~1 ms for 10,000 rows) answers the common case, and Fuse
 * runs only when that pass finds nothing (`machdo` → `MACHADO`), tolerating
 * typos without paying a fuzzy scan per keystroke. The query is deferred so
 * typing never blocks on either pass.
 */
export function useTableBrowser(
  config: BrowserTableConfig
): UseTableBrowserResult {
  const { tableName, labelSource, searchEntity, searchKeys, searchFromLabelTable } =
    config;

  const table: DatabaseTable = useDatabaseStore(
    (state) => state.database[tableName] ?? EMPTY_TABLE
  );
  const hasTable = useDatabaseStore(
    (state) => state.database[tableName] !== undefined
  );
  const labelTable: DatabaseTable = useDatabaseStore((state) =>
    labelSource ? state.database[labelSource.tableName] ?? EMPTY_TABLE : EMPTY_TABLE
  );

  const query = useTableBrowserStore((state) => state.queries[tableName] ?? "");
  const setQueryStore = useTableBrowserStore((state) => state.setQuery);
  const selectedIdentifier = useTableBrowserStore(
    (state) => state.selections[tableName] ?? null
  );
  const selectStore = useTableBrowserStore((state) => state.selectRecord);

  const {
    searchPlayers,
    searchTeams,
    searchCompetitions,
    searchGroups,
    searchFormations,
  } = useSearch();

  const records = useMemo(() => toBrowserRecords(table), [table]);
  const recordsById = useMemo(
    () => new Map(records.map((record) => [record.identifier, record])),
    [records]
  );
  const labelLookup = useMemo(
    () =>
      labelSource
        ? buildLabelLookup(labelSource, labelTable)
        : EMPTY_LABEL_LOOKUP,
    [labelSource, labelTable]
  );

  /** Name-row id → browsed record id, for indexes fed by the name table */
  const labelOwnerLookup = useMemo(
    () =>
      labelSource && searchFromLabelTable
        ? buildLabelOwnerLookup(labelSource, labelTable)
        : null,
    [labelSource, searchFromLabelTable, labelTable]
  );

  /** Lowercase search text per record — rebuilt only when data or names change */
  const haystacks = useMemo(
    () => buildBrowserHaystacks(records, searchKeys, labelSource, labelLookup),
    [records, searchKeys, labelSource, labelLookup]
  );

  /** Fuse search of this table, `null` when the database has no index for it */
  const runSearch = useMemo(() => {
    switch (searchEntity) {
      case "player":
        return searchPlayers;
      case "team":
        return searchTeams;
      case "competition":
        return searchCompetitions;
      case "group":
        return searchGroups;
      case "formation":
        return searchFormations;
      default:
        return null;
    }
  }, [
    searchEntity,
    searchPlayers,
    searchTeams,
    searchCompetitions,
    searchGroups,
    searchFormations,
  ]);

  const appliedQuery = useDeferredValue(query);
  const term = appliedQuery.trim();

  const rows = useMemo(() => {
    if (term.length === 0) {
      return records;
    }

    // Pass 1 — exact substring over prebuilt haystacks: ~1 ms per 10,000 rows
    // and the only pass the common case (typing a known name) ever needs.
    const substringMatches = matchRecordsBySubstring(records, haystacks, term);
    if (substringMatches.length > 0 || !runSearch) {
      return substringMatches;
    }

    // Pass 2 — Fuse, only when nothing matched: tolerates typos on queries
    // like `machdo`, at the cost of a full fuzzy scan.
    const hits: BrowserRecord[] = [];
    const seen = new Set<number>();
    for (const item of runSearch(term)) {
      // Indexes fed by a name table report name-row ids, not record ids
      const identifier = labelOwnerLookup
        ? labelOwnerLookup.get(item.identifier)
        : item.identifier;
      if (identifier === undefined || seen.has(identifier)) {
        continue;
      }
      const record = recordsById.get(identifier);
      if (record) {
        seen.add(identifier);
        hits.push(record);
      }
    }
    return hits;
  }, [records, recordsById, haystacks, labelOwnerLookup, term, runSearch]);

  const selectedRecord =
    selectedIdentifier === null
      ? null
      : recordsById.get(selectedIdentifier) ?? null;

  const setQuery = useCallback(
    (nextQuery: string) => setQueryStore(tableName, nextQuery),
    [setQueryStore, tableName]
  );

  const selectRecord = useCallback(
    (identifier: number | null) => selectStore(tableName, identifier),
    [selectStore, tableName]
  );

  const getCellValue = useCallback(
    (record: BrowserRecord, column: BrowserColumn) =>
      readBrowserCell(record, column, labelSource, labelLookup),
    [labelSource, labelLookup]
  );

  return {
    rows,
    query,
    appliedQuery,
    isSearching: appliedQuery !== query,
    setQuery,
    hasTable,
    totalCount: records.length,
    selectedIdentifier,
    selectedRecord,
    selectRecord,
    getCellValue,
  };
}
