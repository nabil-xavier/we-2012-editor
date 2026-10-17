// src/store/useDatabaseStore.ts
import { create } from "zustand";
import {
  deleteCachedRecord,
  saveCachedRecord,
  saveDatabaseToCache,
} from "@/services/cache";
import {
  buildSearchIndexes,
  createEmptySearchIndexes,
  rebuildSearchIndexes,
} from "@/services/search";
import type { Database, DatabaseRow, DatabaseTable } from "@/types/database";
import type { DirtyState } from "@/types/dirty";
import type { SearchIndexes } from "@/types/search";
import {
  clearDirtyState,
  createEmptyDirtyState,
  getDirtyIdentifiers,
  markRecordDirty,
  unmarkRecordDirty,
} from "@/utils/dirty";

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
  /**
   * Unsaved record identifiers per table. Filled by every edit, dropped by
   * `markDirty` / `unmarkDirty` / `clearDirty` and by any fresh load.
   */
  dirty: DirtyState;
  /** Replace the stored database and persist it to the local cache */
  setDatabase: (database: Database, meta?: DatabaseMeta) => void;
  /** Replace the stored database without touching the cache (cache restore) */
  hydrateDatabase: (database: Database, meta?: DatabaseMeta) => void;
  /** Insert or replace one record, then refresh index + cache + dirty state */
  upsertRecord: (tableName: string, identifier: number, row: DatabaseRow) => void;
  /** Merge a patch into one record, then refresh index + cache + dirty state */
  updateRecord: (
    tableName: string,
    identifier: number,
    patch: DatabaseRow
  ) => void;
  /** Remove one record, then refresh index + cache + dirty state */
  deleteRecord: (tableName: string, identifier: number) => void;
  /** Mark one record as changed without touching the data */
  markDirty: (tableName: string, identifier: number) => void;
  /** Drop the dirty mark of one record (e.g. edit reverted) */
  unmarkDirty: (tableName: string, identifier: number) => void;
  /** Drop dirty marks — the listed tables, or everything when omitted */
  clearDirty: (tableNames?: string[]) => void;
  /** Set the parsing flag */
  setLoading: (isLoading: boolean) => void;
  /** Set or clear the import error */
  setError: (error: string | null) => void;
  /** Empty the store (keeps the cached project on disk) */
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
  dirty: createEmptyDirtyState(),
};

/**
 * Write one table back into the database, keeping `rowCounts`, the search
 * indexes and the dirty state consistent with the new contents.
 */
function writeTable(
  state: DatabaseStore,
  tableName: string,
  table: DatabaseTable,
  dirty: DirtyState
): Partial<DatabaseStore> {
  const database: Database = { ...state.database, [tableName]: table };
  return {
    database,
    rowCounts: { ...state.rowCounts, [tableName]: Object.keys(table).length },
    search: rebuildSearchIndexes(database, [tableName], state.search),
    dirty,
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

/** State produced by loading a database into the store */
function databaseState(
  database: Database,
  meta?: DatabaseMeta
): Partial<DatabaseStore> {
  return {
    database,
    tableNames: meta?.tableNames ?? Object.keys(database),
    rowCounts: meta?.rowCounts ?? countRows(database),
    fileName: meta?.fileName ?? null,
    isLoading: false,
    error: null,
    search: buildSearchIndexes(database),
    // A freshly loaded database has no unsaved changes
    dirty: createEmptyDirtyState(),
  };
}

export const useDatabaseStore = create<DatabaseStore>((set, get) => ({
  ...initialState,

  setDatabase: (database, meta) => {
    set(databaseState(database, meta));
    // Persisted in the background; cache failures never block importing
    void saveDatabaseToCache(database, meta?.fileName ?? null);
  },

  hydrateDatabase: (database, meta) => set(databaseState(database, meta)),

  upsertRecord: (tableName, identifier, row) => {
    const state = get();
    set(
      writeTable(
        state,
        tableName,
        {
          ...state.database[tableName],
          [identifier]: row,
        },
        markRecordDirty(state.dirty, tableName, identifier)
      )
    );
    void saveCachedRecord(tableName, identifier, row);
  },

  updateRecord: (tableName, identifier, patch) => {
    const state = get();
    const current = state.database[tableName]?.[identifier];
    if (!current) {
      return;
    }
    const row: DatabaseRow = { ...current, ...patch };
    set(
      writeTable(
        state,
        tableName,
        {
          ...state.database[tableName],
          [identifier]: row,
        },
        markRecordDirty(state.dirty, tableName, identifier)
      )
    );
    void saveCachedRecord(tableName, identifier, row);
  },

  deleteRecord: (tableName, identifier) => {
    const state = get();
    const current = state.database[tableName];
    if (!current || !(identifier in current)) {
      return;
    }
    const table: DatabaseTable = { ...current };
    delete table[identifier];
    // Deleted identifiers stay dirty: the exporter tells deletions apart from
    // edits by looking the identifier up in `database`.
    set(
      writeTable(
        state,
        tableName,
        table,
        markRecordDirty(state.dirty, tableName, identifier)
      )
    );
    void deleteCachedRecord(tableName, identifier);
  },

  markDirty: (tableName, identifier) =>
    set((state) => ({ dirty: markRecordDirty(state.dirty, tableName, identifier) })),

  unmarkDirty: (tableName, identifier) =>
    set((state) => ({
      dirty: unmarkRecordDirty(state.dirty, tableName, identifier),
    })),

  clearDirty: (tableNames) =>
    set((state) => ({ dirty: clearDirtyState(state.dirty, tableNames) })),

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

/** Read the dirty identifiers of one table out of the store state */
export function selectDirtyIdentifiers(
  state: DatabaseStore,
  tableName: string
): ReadonlySet<number> {
  return getDirtyIdentifiers(state.dirty, tableName);
}
