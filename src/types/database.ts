// src/types/database.ts

/** Raw scalar value of a single column as returned by sql.js */
export type DatabaseValue = number | string | Uint8Array | null;

/** One table row, keyed by column name */
export type DatabaseRow = Record<string, DatabaseValue>;

/** Table records keyed by primary key (`identifier`) for O(1) lookup */
export type DatabaseTable = Record<number, DatabaseRow>;

/** Whole database, keyed by table name */
export type Database = Record<string, DatabaseTable>;

/** Options for loading a SQLite database */
export interface LoadDatabaseOptions {
  /** Column used as the record key while normalizing tables (default `identifier`) */
  keyField?: string;
}

/** Result of reading a SQLite database file */
export interface DatabaseLoadResult {
  /** Every table normalized to `identifier → row` */
  database: Database;
  /** Table names discovered in the file (SQLite internal tables excluded) */
  tableNames: string[];
  /** Row count read per table */
  rowCounts: Record<string, number>;
}
