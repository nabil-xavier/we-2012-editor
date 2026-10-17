// src/utils/dirty.ts
import type { DirtyState } from "@/types/dirty";

/** Shared empty set, returned for tables without dirty records */
const NO_IDENTIFIERS: ReadonlySet<number> = new Set<number>();

/** Fresh state — nothing edited yet */
export function createEmptyDirtyState(): DirtyState {
  return {};
}

/** Dirty identifiers of one table (empty set when the table is untouched) */
export function getDirtyIdentifiers(
  state: DirtyState,
  tableName: string
): ReadonlySet<number> {
  return state[tableName] ?? NO_IDENTIFIERS;
}

/** True when the record has unsaved changes */
export function isRecordDirty(
  state: DirtyState,
  tableName: string,
  identifier: number
): boolean {
  return state[tableName]?.has(identifier) ?? false;
}

/**
 * Mark one record as changed. Returns `state` untouched when the record is
 * already dirty, so duplicate marks neither allocate nor notify.
 *
 * Cost is O(dirty records of the table) because the set is copied to keep the
 * state immutable (required for Zustand re-renders). Single edits stay in the
 * microseconds even with thousands of dirty rows; a bulk edit that marks
 * thousands of records in one loop should copy the set once instead.
 */
export function markRecordDirty(
  state: DirtyState,
  tableName: string,
  identifier: number
): DirtyState {
  const current = state[tableName];
  if (current?.has(identifier)) {
    return state;
  }
  const identifiers = new Set(current);
  identifiers.add(identifier);
  return { ...state, [tableName]: identifiers };
}

/** Drop the dirty mark of one record (e.g. field reverted to its old value) */
export function unmarkRecordDirty(
  state: DirtyState,
  tableName: string,
  identifier: number
): DirtyState {
  const current = state[tableName];
  if (!current?.has(identifier)) {
    return state;
  }
  const identifiers = new Set(current);
  identifiers.delete(identifier);
  if (identifiers.size > 0) {
    return { ...state, [tableName]: identifiers };
  }
  const next: DirtyState = { ...state };
  delete next[tableName];
  return next;
}

/** Number of unsaved records — one table or the whole database */
export function countDirtyRecords(
  state: DirtyState,
  tableName?: string
): number {
  if (tableName !== undefined) {
    return state[tableName]?.size ?? 0;
  }
  return Object.values(state).reduce((total, ids) => total + ids.size, 0);
}

/** True when at least one record has unsaved changes */
export function hasDirtyRecords(state: DirtyState): boolean {
  return Object.values(state).some((identifiers) => identifiers.size > 0);
}

/** Table names currently holding dirty records */
export function getDirtyTables(state: DirtyState): string[] {
  return Object.entries(state)
    .filter(([, identifiers]) => identifiers.size > 0)
    .map(([tableName]) => tableName);
}

/** Unsaved record count per table, tables without changes omitted */
export function countDirtyRecordsByTable(
  state: DirtyState
): Record<string, number> {
  const counts: Record<string, number> = {};
  getDirtyTables(state).forEach((tableName) => {
    counts[tableName] = state[tableName].size;
  });
  return counts;
}

/** Clear dirty marks — the listed tables, or everything when omitted */
export function clearDirtyState(
  state: DirtyState,
  tableNames?: string[]
): DirtyState {
  if (tableNames === undefined) {
    return createEmptyDirtyState();
  }
  const next: DirtyState = { ...state };
  tableNames.forEach((tableName) => {
    delete next[tableName];
  });
  return next;
}
