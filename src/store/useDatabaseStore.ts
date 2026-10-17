// src/store/useDatabaseStore.ts
import { create } from "zustand";
import {
  buildSearchIndexes,
  createEmptySearchIndexes,
  rebuildSearchIndexes,
} from "@/services/search";
import type { Database, DatabaseRow, DatabaseTable } from "@/types/database";
import type { SearchIndexes } from "@/types/search";

/** Extra information describing the loaded file */
export interface DatabaseMeta {
  /** Source file name */
  fileName?: string | null;
  /** Table names discovered in the file */
  tableNames?: string[];
  /** Row count read per table */
  rowCounts?: Record<string, number>;
}

export interface DatabaseStore {
  /** Every table of the loaded database: table name → identifier → row */
  database: Database;
  /** Table names discovered in the loaded database */
  tableNames: string[];
  /** Row count read per table */
  rowCounts: Record<string, number>;
  /** Source file name of the loaded database */
  fileName: string | null;
  /** True while a database file is being parsed */
  isLoading: boolean;
  /** Last import error message */
  error: string | null;
  /** Fuse indexes, rebuilt after every database change */
  search: SearchIndexes;
  /** Replace the stored database */
  setDatabase: (database: Database, meta?: DatabaseMeta) => void;
  /** Insert or replace one record, then refresh the affected index */
  upsertRecord: (tableName: string, identifier: number, row: DatabaseRow) => void;
  /** Merge a patch into one record, then refresh the affected index */
  updateRecord: (
    tableName: string,
    identifier: number,
    patch: DatabaseRow
  ) => void;
  /** Remove one record, then refresh the affected index */
  deleteRecord: (tableName: string, identifier: number) => void;
  /** Set the parsing flag */
  setLoading: (isLoading: boolean) => void;
  /** Set or clear the import error */
  setError: (error: string | null) => void;
  /** Empty the store */
  resetDatabase: () => void;
}

const initialState = {
  database: {} as Database,
  tableNames: [] as string[],
  rowCounts: {} as Record<string, number>,
  fileName: null as string | null,
  isLoading: false,
  error: null as string | null,
  search: createEmptySearchIndexes(),
};

/**
 * Write one table back into the database, keeping `rowCounts` and the search
 * indexes consistent with the new contents.
 */
function writeTable(
  state: DatabaseStore,
  tableName: string,
  table: DatabaseTable
): Partial<DatabaseStore> {
  const database: Database = { ...state.database, [tableName]: table };
  return {
    database,
    rowCounts: { ...state.rowCounts, [tableName]: Object.keys(table).length },
    search: rebuildSearchIndexes(database, [tableName], state.search),
  };
}

/** Row count per table, used when the importer does not report counts */
function countRows(database: Database): Record<string, number> {
  const counts: Record<string, number> = {};
  Object.entries(database).forEach(([tableName, table]) => {
    counts[tableName] = Object.keys(table).length;
  });
  return counts;
}

export const useDatabaseStore = create<DatabaseStore>((set) => ({
  ...initialState,

  setDatabase: (database, meta) =>
    set({
      database,
      tableNames: meta?.tableNames ?? Object.keys(database),
      rowCounts: meta?.rowCounts ?? countRows(database),
      fileName: meta?.fileName ?? null,
      isLoading: false,
      error: null,
      search: buildSearchIndexes(database),
    }),

  upsertRecord: (tableName, identifier, row) =>
    set((state) =>
      writeTable(state, tableName, {
        ...state.database[tableName],
        [identifier]: row,
      })
    ),

  updateRecord: (tableName, identifier, patch) =>
    set((state) => {
      const current = state.database[tableName]?.[identifier];
      if (!current) {
        return {};
      }
      return writeTable(state, tableName, {
        ...state.database[tableName],
        [identifier]: { ...current, ...patch },
      });
    }),

  deleteRecord: (tableName, identifier) =>
    set((state) => {
      const current = state.database[tableName];
      if (!current || !(identifier in current)) {
        return {};
      }
      const table: DatabaseTable = { ...current };
      delete table[identifier];
      return writeTable(state, tableName, table);
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  resetDatabase: () => set({ ...initialState }),
}));

/** Read one table map out of the store state */
export function selectDatabaseTable(
  state: DatabaseStore,
  tableName: string
): DatabaseTable {
  return state.database[tableName] ?? {};
}
