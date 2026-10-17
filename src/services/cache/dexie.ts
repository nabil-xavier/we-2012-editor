// src/services/cache/dexie.ts
import Dexie, { type Table } from "dexie";
import type { CachedMeta, CachedRecord } from "@/types/cache";

/** IndexedDB database backing the local project cache */
export const CACHE_DATABASE_NAME = "we-2012-editor";

/** Cache schema version — bump when the store layout changes */
export const CACHE_SCHEMA_VERSION = 1;

/**
 * Local project cache.
 *
 * All database tables share one `records` store keyed by `[table+identifier]`
 * instead of one IndexedDB store per table: the table list of a `.bin` file is
 * only known after import, and Dexie schemas are fixed at open time.
 */
export class ProjectCacheDatabase extends Dexie {
  /** Every record of the loaded database */
  records!: Table<CachedRecord, [string, number]>;
  /** Single metadata row of the loaded project */
  meta!: Table<CachedMeta, string>;

  constructor() {
    super(CACHE_DATABASE_NAME);
    this.version(CACHE_SCHEMA_VERSION).stores({
      records: "[table+identifier], table",
      meta: "key",
    });
  }
}

/** Shared cache instance */
export const projectCache = new ProjectCacheDatabase();
