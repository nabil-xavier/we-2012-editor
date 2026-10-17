// src/types/cache.ts
import type { DatabaseRow, DatabaseLoadResult } from "@/types/database";

/** One persisted record: owning table, primary key and raw row */
export interface CachedRecord {
  /** Database table the record belongs to */
  table: string;
  /** Primary key of the record (`identifier` column) */
  identifier: number;
  /** Raw column values, structured-cloned by IndexedDB */
  row: DatabaseRow;
}

/** Metadata row describing the cached project (single row) */
export interface CachedMeta {
  /** Fixed key of the metadata row */
  key: string;
  /** Source `.bin` file name */
  fileName: string | null;
  /** Epoch milliseconds of the last full write */
  importedAt: number;
  /** Cache format version */
  version: number;
}

/** Summary of the cached project, used to detect an existing project */
export interface CachedProjectSummary {
  /** Source `.bin` file name */
  fileName: string | null;
  /** Epoch milliseconds of the last full write */
  importedAt: number;
  /** Table names holding cached records */
  tableNames: string[];
  /** Cached record count */
  recordCount: number;
}

/** Cached database read back from IndexedDB */
export interface CachedDatabaseLoadResult extends DatabaseLoadResult {
  /** Source `.bin` file name of the cached project */
  fileName: string | null;
  /** Epoch milliseconds of the last full write */
  importedAt: number;
}
