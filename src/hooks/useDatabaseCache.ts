// src/hooks/useDatabaseCache.ts
import { useCallback, useEffect, useState } from "react";
import {
  clearCache,
  loadCachedDatabase,
  readCachedProject,
  saveDatabaseToCache,
} from "@/services/cache";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import type { CachedProjectSummary } from "@/types/cache";

export interface UseDatabaseCacheResult {
  /** Summary of the cached project, `null` when nothing is cached */
  cachedProject: CachedProjectSummary | null;
  /** True while the cached project is read during startup */
  isRestoring: boolean;
  /** True while the cached project is deleted */
  isClearing: boolean;
  /** True when a database is already loaded in the store */
  hasDatabase: boolean;
  /** Read the cache into the store (returns `false` when nothing is cached) */
  restoreProject: () => Promise<boolean>;
  /** Delete the cache and empty the store */
  clearProject: () => Promise<void>;
  /** Write the database currently in the store back to the cache */
  persistProject: () => Promise<void>;
}

/** The startup restore must happen once per page load, not once per consumer */
let hasRestoreStarted = false;

/** Cache restore on startup + manual persist / clear actions */
export function useDatabaseCache(): UseDatabaseCacheResult {
  const hydrateDatabase = useDatabaseStore((state) => state.hydrateDatabase);
  const resetDatabase = useDatabaseStore((state) => state.resetDatabase);
  const database = useDatabaseStore((state) => state.database);

  const [cachedProject, setCachedProject] =
    useState<CachedProjectSummary | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const restoreProject = useCallback(async () => {
    const result = await loadCachedDatabase();
    if (!result) {
      return false;
    }
    hydrateDatabase(result.database, {
      fileName: result.fileName,
      tableNames: result.tableNames,
      rowCounts: result.rowCounts,
    });
    return true;
  }, [hydrateDatabase]);

  const persistProject = useCallback(async () => {
    const state = useDatabaseStore.getState();
    await saveDatabaseToCache(state.database, state.fileName);
  }, []);

  const clearProject = useCallback(async () => {
    setIsClearing(true);
    try {
      resetDatabase();
      await clearCache();
      setCachedProject(null);
    } finally {
      setIsClearing(false);
    }
  }, [resetDatabase]);

  // Step 8 (PRD): cache exists → hydrate Zustand, otherwise wait for an import
  useEffect(() => {
    let isActive = true;

    const restore = async () => {
      const summary = await readCachedProject();
      if (!isActive) {
        return;
      }
      setCachedProject(summary);

      const alreadyLoaded =
        Object.keys(useDatabaseStore.getState().database).length > 0;
      if (!summary || hasRestoreStarted || alreadyLoaded) {
        return;
      }

      hasRestoreStarted = true;
      setIsRestoring(true);
      const restored = await restoreProject();
      if (!isActive) {
        return;
      }
      setIsRestoring(false);

      if (!restored) {
        // Nothing usable was cached after all — allow a later retry
        hasRestoreStarted = false;
      }
    };

    void restore();

    return () => {
      isActive = false;
    };
  }, [restoreProject]);

  return {
    cachedProject,
    isRestoring,
    isClearing,
    hasDatabase: Object.keys(database).length > 0,
    restoreProject,
    clearProject,
    persistProject,
  };
}

export default useDatabaseCache;
