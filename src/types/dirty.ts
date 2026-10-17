// src/types/dirty.ts

/**
 * Unsaved records of the loaded database, keyed by table name.
 *
 * `Set` gives unique identifiers, O(1) `has` and O(1) removal. The sets are
 * treated as immutable: every change produces a new `DirtyState`, so Zustand
 * consumers re-render on change. Mutate through `@/utils/dirty` helpers only.
 */
export type DirtyState = Record<string, ReadonlySet<number>>;
