// src/utils/database.ts
import type { DatabaseRow } from "@/types/database";

/** Read a string column — empty string when the column is missing or not textual */
export function readRowString(row: DatabaseRow, column: string): string {
  const value = row[column];
  return typeof value === "string" ? value : "";
}

/** Read a numeric column — `fallback` when the column is missing or not numeric */
export function readRowNumber(
  row: DatabaseRow,
  column: string,
  fallback = 0
): number {
  const value = row[column];
  return typeof value === "number" ? value : fallback;
}
