// src/services/database.ts
import initSqlJs from "sql.js";
import type { Database as SqlDatabase, SqlJsStatic } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import type {
  Database,
  DatabaseLoadResult,
  DatabaseRow,
  DatabaseTable,
  LoadDatabaseOptions,
} from "@/types/database";

/** SQLite internal tables (sqlite_master, sqlite_sequence, ...) are not data tables */
const INTERNAL_TABLE_PREFIX = "sqlite_";

/** Only this extension is accepted for database imports */
export const DATABASE_FILE_EXTENSION = ".bin";

/** True when the picked file has the supported database extension */
export function isDatabaseFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(DATABASE_FILE_EXTENSION);
}

/** Cached sql.js runtime — wasm is fetched once per session */
let sqlJsRuntime: Promise<SqlJsStatic> | null = null;

function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsRuntime) {
    sqlJsRuntime = initSqlJs({ locateFile: () => sqlWasmUrl });
  }
  return sqlJsRuntime;
}

/** Read every user table name from the file */
export function discoverTables(db: SqlDatabase): string[] {
  const [result] = db.exec(
    "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
  );
  if (!result) {
    return [];
  }
  return result.values
    .map((row) => row[0])
    .filter(
      (name): name is string =>
        typeof name === "string" && !name.startsWith(INTERNAL_TABLE_PREFIX)
    );
}

/** Read all rows of one table as plain objects */
export function readTableRows(db: SqlDatabase, tableName: string): DatabaseRow[] {
  const statement = db.prepare(`SELECT * FROM "${tableName}"`);
  const rows: DatabaseRow[] = [];
  try {
    while (statement.step()) {
      rows.push(statement.getAsObject());
    }
  } finally {
    statement.free();
  }
  return rows;
}

/**
 * Convert a row list into a `key → row` map.
 * Uses `keyField` when the column holds a number, otherwise falls back to the
 * row index so tables without an identifier stay addressable.
 */
export function normalizeRecords(
  rows: DatabaseRow[],
  keyField = "identifier"
): DatabaseTable {
  const records: DatabaseTable = {};
  rows.forEach((row, index) => {
    const rawKey = row[keyField];
    const key = typeof rawKey === "number" ? rawKey : index;
    records[key] = row;
  });
  return records;
}

/** Open a SQLite file from memory and normalize every discovered table */
export async function loadDatabase(
  buffer: ArrayBuffer,
  options: LoadDatabaseOptions = {}
): Promise<DatabaseLoadResult> {
  const keyField = options.keyField ?? "identifier";
  const SQL = await getSqlJs();
  const db = new SQL.Database(new Uint8Array(buffer));

  try {
    const tableNames = discoverTables(db);
    const database: Database = {};
    const rowCounts: Record<string, number> = {};

    for (const tableName of tableNames) {
      const rows = readTableRows(db, tableName);
      database[tableName] = normalizeRecords(rows, keyField);
      rowCounts[tableName] = rows.length;
    }

    return { database, tableNames, rowCounts };
  } finally {
    db.close();
  }
}

/** Read a `File` from an `<input type="file" />` and normalize it */
export async function loadDatabaseFile(
  file: File,
  options: LoadDatabaseOptions = {}
): Promise<DatabaseLoadResult> {
  const buffer = await file.arrayBuffer();
  return loadDatabase(buffer, options);
}
