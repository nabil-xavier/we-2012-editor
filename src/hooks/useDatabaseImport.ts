// src/hooks/useDatabaseImport.ts
import { useCallback, type ChangeEvent } from "react";
import { loadDatabaseFile, isDatabaseFile, DATABASE_FILE_EXTENSION } from "@/services/database";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import type { DatabaseLoadResult } from "@/types/database";

export interface UseDatabaseImportResult {
  /** Parse a `File` and store it (returns `null` on failure) */
  importFromFile: (file: File) => Promise<DatabaseLoadResult | null>;
  /** Direct `onChange` handler for `<input type="file" accept=".bin" />` */
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  /** True while a file is parsed */
  isLoading: boolean;
  /** Last import error message */
  error: string | null;
  /** Table names of the loaded database */
  tableNames: string[];
  /** Source file name of the loaded database */
  fileName: string | null;
  /** Empty the store */
  reset: () => void;
}

/** File → sql.js → normalized Zustand state */
export function useDatabaseImport(): UseDatabaseImportResult {
  const setDatabase = useDatabaseStore((state) => state.setDatabase);
  const setLoading = useDatabaseStore((state) => state.setLoading);
  const setError = useDatabaseStore((state) => state.setError);
  const resetDatabase = useDatabaseStore((state) => state.resetDatabase);
  const isLoading = useDatabaseStore((state) => state.isLoading);
  const error = useDatabaseStore((state) => state.error);
  const tableNames = useDatabaseStore((state) => state.tableNames);
  const fileName = useDatabaseStore((state) => state.fileName);

  const importFromFile = useCallback(
    async (file: File) => {
      if (!isDatabaseFile(file)) {
        setError(
          `Unsupported file "${file.name}". Only ${DATABASE_FILE_EXTENSION} files are supported.`
        );
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await loadDatabaseFile(file);
        setDatabase(result.database, {
          fileName: file.name,
          tableNames: result.tableNames,
          rowCounts: result.rowCounts,
        });
        
        return result;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Failed to load database");
        return null;
      }
    },
    [setDatabase, setError, setLoading]
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      await importFromFile(file);
      // Allow re-selecting the same file
      event.target.value = "";
    },
    [importFromFile]
  );

  const reset = useCallback(() => resetDatabase(), [resetDatabase]);

  return { importFromFile, handleFileChange, isLoading, error, tableNames, fileName, reset };
}
