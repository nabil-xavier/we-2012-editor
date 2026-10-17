// src/types/schema.ts

/**
 * Value type stored in a schema field.
 * Matches the descriptor vocabulary used by the `src/schema/*` table definitions.
 */
export type SchemaFieldType =
  | "integer"
  | "number"
  | "string"
  | "image"
  | "enum"
  | "relation";

/** Single column descriptor inside a table schema */
export interface SchemaField {
  /** Value type of the column */
  type: SchemaFieldType;
  /** Column must be filled before saving */
  required?: boolean;
  /** Column is computed / not user editable */
  readonly?: boolean;
  /** Fixed character length (string columns) */
  length?: number;
  /** Minimum allowed value (integer / number columns) */
  min?: number;
  /** Maximum allowed value (integer / number columns) */
  max?: number;
  /** Referenced table name (relation columns) */
  target?: string;
  /** Allowed values keyed by stored integer (enum columns) */
  options?: Record<number, string>;
}

/** Column-name → column descriptor map for one database table */
export type TableSchema = Record<string, SchemaField>;

/** Table-name → table schema map for the whole database */
export type SchemaMap = Record<string, TableSchema>;
