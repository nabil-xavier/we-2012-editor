// src/hooks/useDirtyState.ts
import { useCallback, useMemo } from "react";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import {
  countDirtyRecords,
  countDirtyRecordsByTable,
  hasDirtyRecords,
  getDirtyIdentifiers,
} from "@/utils/dirty";

export interface UseDirtyStateResult {
  /** Total number of records with unsaved changes */
  dirtyCount: number;
  /** Unsaved record count per table, tables without changes omitted */
  dirtyCounts: Record<string, number>;
  /** True when at least one record has unsaved changes */
  hasChanges: boolean;
  /** Check one record (edited badge, per-row indicator) */
  isRecordDirty: (tableName: string, identifier: number) => boolean;
  /** Drop dirty marks — the listed tables, or everything when omitted */
  clearDirty: (tableNames?: string[]) => void;
}

/** Unsaved-change indicator + lookup + reset for the loaded database */
export function useDirtyState(): UseDirtyStateResult {
  const dirty = useDatabaseStore((state) => state.dirty);
  const clearDirty = useDatabaseStore((state) => state.clearDirty);

  const { dirtyCount, dirtyCounts, hasChanges } = useMemo(() => {
    const counts = countDirtyRecordsByTable(dirty);
    return {
      dirtyCount: countDirtyRecords(dirty),
      dirtyCounts: counts,
      hasChanges: hasDirtyRecords(dirty),
    };
  }, [dirty]);

  const isRecordDirty = useCallback(
    (tableName: string, identifier: number) =>
      getDirtyIdentifiers(dirty, tableName).has(identifier),
    [dirty]
  );

  return { dirtyCount, dirtyCounts, hasChanges, isRecordDirty, clearDirty };
}

/** Dirty identifiers of one table, for exporters and per-row lists */
export function useDirtyIdentifiers(
  tableName: string
): ReadonlySet<number> {
  return useDatabaseStore(
    (state) => getDirtyIdentifiers(state.dirty, tableName)
  );
}
