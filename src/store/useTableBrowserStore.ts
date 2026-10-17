// src/store/useTableBrowserStore.ts
import { create } from "zustand";

/**
 * View state of the virtualized table browser.
 * Kept next to the database store but separate from it: queries and selections
 * are per-tab UI state and are never exported or written to the cache.
 */
export interface TableBrowserStore {
  /** Search text per table name — survives navigation and edit round-trips */
  queries: Record<string, string>;
  /** Selected identifier per table name, `null` when nothing is selected */
  selections: Record<string, number | null>;
  /** Store the search text of one table */
  setQuery: (tableName: string, query: string) => void;
  /** Select one record, `null` clears the selection */
  selectRecord: (tableName: string, identifier: number | null) => void;
}

export const useTableBrowserStore = create<TableBrowserStore>((set, get) => ({
  queries: {},
  selections: {},

  setQuery: (tableName, query) => {
    if (get().queries[tableName] === query) {
      return;
    }
    set((state) => ({
      queries: { ...state.queries, [tableName]: query },
    }));
  },

  selectRecord: (tableName, identifier) => {
    if ((get().selections[tableName] ?? null) === identifier) {
      return;
    }
    set((state) => ({
      selections: { ...state.selections, [tableName]: identifier },
    }));
  },
}));
