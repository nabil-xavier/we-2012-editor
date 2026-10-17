// src/store/useDatabaseStore.ts
import { create } from "zustand";
import type { Database, DatabaseTable } from "@/types/database";

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
  /** Replace the stored database */
  setDatabase: (database: Database, meta?: DatabaseMeta) => void;
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
};

export const useDatabaseStore = create<DatabaseStore>((set) => ({
  ...initialState,

  setDatabase: (database, meta) =>
    set({
      database,
      tableNames: meta?.tableNames ?? Object.keys(database),
      rowCounts: meta?.rowCounts ?? {},
      fileName: meta?.fileName ?? null,
      isLoading: false,
      error: null,
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
