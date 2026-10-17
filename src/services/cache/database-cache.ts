// src/services/cache/database-cache.ts
import { CACHE_SCHEMA_VERSION, projectCache } from "@/services/cache/dexie";
import type {
  CachedDatabaseLoadResult,
  CachedMeta,
  CachedProjectSummary,
  CachedRecord,
} from "@/types/cache";
import type { Database, DatabaseRow } from "@/types/database";

/** Key of the single metadata row */
export const CACHE_META_KEY = "current";

/** Records written per `bulkPut` call */
export const CACHE_WRITE_CHUNK_SIZE = 500;

/** True when IndexedDB is available — false in SSR and in Node tooling */
export function isCacheAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

/** Flatten a normalized database into one cache record per row */
export function toCachedRecords(database: Database): CachedRecord[] {
  const records: CachedRecord[] = [];
  Object.entries(database).forEach(([table, rows]) => {
    Object.entries(rows).forEach(([identifier, row]) => {
      records.push({ table, identifier: Number(identifier), row });
    });
  });
  return records;
}

/** Rebuild the normalized `table → identifier → row` shape from cache rows */
export function groupRecordsByTable(records: CachedRecord[]): Database {
  const database: Database = {};
  records.forEach(({ table, identifier, row }) => {
    database[table] ??= {};
    database[table][identifier] = row;
  });
  return database;
}

/** Row count per table of a normalized database */
function countRows(database: Database): Record<string, number> {
  const counts: Record<string, number> = {};
  Object.entries(database).forEach(([table, rows]) => {
    counts[table] = Object.keys(rows).length;
  });
  return counts;
}

/** Yield cache records in `bulkPut` sized batches */
function* chunkRecords(records: CachedRecord[]): Generator<CachedRecord[]> {
  for (let index = 0; index < records.length; index += CACHE_WRITE_CHUNK_SIZE) {
    yield records.slice(index, index + CACHE_WRITE_CHUNK_SIZE);
  }
}

/** Cache writes must never break editing, so failures are logged and dropped */
async function runCacheWrite(
  label: string,
  action: () => Promise<unknown>
): Promise<void> {
  try {
    await action();
  } catch (cause) {
    console.warn(`[cache] failed to ${label}`, cause);
  }
}

/** Replace the cached project with `database` (full write) */
export async function saveDatabaseToCache(
  database: Database,
  fileName: string | null
): Promise<void> {
  if (!isCacheAvailable()) {
    return;
  }

  const records = toCachedRecords(database);
  const meta: CachedMeta = {
    key: CACHE_META_KEY,
    fileName,
    importedAt: Date.now(),
    version: CACHE_SCHEMA_VERSION,
  };

  await runCacheWrite("save database", () =>
    projectCache.transaction(
      "rw",
      projectCache.records,
      projectCache.meta,
      async () => {
        await projectCache.records.clear();
        for (const chunk of chunkRecords(records)) {
          await projectCache.records.bulkPut(chunk);
        }
        await projectCache.meta.put(meta);
      }
    )
  );
}

/** Persist one record (create or update) */
export async function saveCachedRecord(
  table: string,
  identifier: number,
  row: DatabaseRow
): Promise<void> {
  if (!isCacheAvailable()) {
    return;
  }
  await runCacheWrite("save record", () =>
    projectCache.records.put({ table, identifier, row })
  );
}

/** Drop one record from the cache */
export async function deleteCachedRecord(
  table: string,
  identifier: number
): Promise<void> {
  if (!isCacheAvailable()) {
    return;
  }
  await runCacheWrite("delete record", () =>
    projectCache.records.delete([table, identifier])
  );
}

/** Metadata of the cached project, `null` when nothing is cached */
export async function readCachedMeta(): Promise<CachedMeta | null> {
  if (!isCacheAvailable()) {
    return null;
  }
  try {
    const meta = await projectCache.meta.get(CACHE_META_KEY);
    return meta ?? null;
  } catch (cause) {
    console.warn("[cache] failed to read metadata", cause);
    return null;
  }
}

/** Summary of the cached project — used to detect an existing project */
export async function readCachedProject(): Promise<CachedProjectSummary | null> {
  if (!isCacheAvailable()) {
    return null;
  }
  try {
    const [meta, recordCount, tableKeys] = await Promise.all([
      projectCache.meta.get(CACHE_META_KEY),
      projectCache.records.count(),
      projectCache.records.orderBy("table").uniqueKeys(),
    ]);

    if (!meta && recordCount === 0) {
      return null;
    }

    return {
      fileName: meta?.fileName ?? null,
      importedAt: meta?.importedAt ?? 0,
      tableNames: tableKeys.map(String),
      recordCount,
    };
  } catch (cause) {
    console.warn("[cache] failed to read cached project", cause);
    return null;
  }
}

/** Read the whole cache back into the normalized database shape */
export async function loadCachedDatabase(): Promise<CachedDatabaseLoadResult | null> {
  if (!isCacheAvailable()) {
    return null;
  }
  try {
    const [meta, records] = await Promise.all([
      projectCache.meta.get(CACHE_META_KEY),
      projectCache.records.toArray(),
    ]);

    if (!meta && records.length === 0) {
      return null;
    }

    const database = groupRecordsByTable(records);
    return {
      database,
      // Sorted for a deterministic table order regardless of IndexedDB ordering
      tableNames: Object.keys(database).sort(),
      rowCounts: countRows(database),
      fileName: meta?.fileName ?? null,
      importedAt: meta?.importedAt ?? 0,
    };
  } catch (cause) {
    console.warn("[cache] failed to read cached database", cause);
    return null;
  }
}

/** Delete the cached project — every record and the metadata row */
export async function clearCache(): Promise<void> {
  if (!isCacheAvailable()) {
    return;
  }
  await runCacheWrite("clear cache", () =>
    projectCache.transaction(
      "rw",
      projectCache.records,
      projectCache.meta,
      async () => {
        await projectCache.records.clear();
        await projectCache.meta.clear();
      }
    )
  );
}
