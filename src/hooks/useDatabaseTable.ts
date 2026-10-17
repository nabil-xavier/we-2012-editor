// src/hooks/useDatabaseTable.ts
import { useDatabaseStore } from "@/store/useDatabaseStore";
import type { DatabaseRow, DatabaseTable } from "@/types/database";

/** Read one table map (`identifier → row`) from the store, O(1) per record */
export function useDatabaseTable(tableName: string): DatabaseTable {
  return useDatabaseStore((state) => state.database[tableName] ?? {});
}

/** Read a single record by table name + identifier, O(1) lookup */
export function useDatabaseRecord(
  tableName: string,
  identifier: number
): DatabaseRow | undefined {
  return useDatabaseStore((state) => state.database[tableName]?.[identifier]);
}
