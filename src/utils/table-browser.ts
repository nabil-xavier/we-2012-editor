// src/utils/table-browser.ts
import type {
  DatabaseRow,
  DatabaseTable,
  DatabaseValue,
} from "@/types/database";
import type { SchemaField, TableSchema } from "@/types/schema";
import type {
  BrowserColumn,
  BrowserLabelSource,
  BrowserRecord,
} from "@/types/table-browser";

/** Stable empty lookup reused when a table has no label source */
export const EMPTY_LABEL_LOOKUP: ReadonlyMap<number, string> = new Map();

/** Stable empty table reused when a table is missing from the database */
export const EMPTY_TABLE: DatabaseTable = {};

/**
 * Convert a `identifier → row` map into a record list.
 * Numeric keys keep their ascending order, so the table stays stable between
 * renders and edits (no re-sorting, no scroll jumps).
 */
export function toBrowserRecords(table: DatabaseTable): BrowserRecord[] {
  return Object.entries(table).map(([key, row]) => ({
    identifier: Number(key),
    row,
  }));
}

/**
 * Index the display names of a name table by the identifier of the browsed
 * record (`group_name.group` → `group_name.value`).
 */
export function buildLabelLookup(
  source: BrowserLabelSource,
  nameTable: DatabaseTable
): ReadonlyMap<number, string> {
  const lookup = new Map<number, string>();
  for (const row of Object.values(nameTable)) {
    const owner = row[source.foreignKey];
    if (typeof owner !== "number") {
      continue;
    }
    if (
      source.languageColumn !== undefined &&
      source.language !== undefined &&
      row[source.languageColumn] !== source.language &&
      lookup.has(owner)
    ) {
      continue;
    }
    const value = row[source.valueColumn];
    if (typeof value === "string") {
      lookup.set(owner, value);
    }
  }
  return lookup;
}

/** Display text of one raw column value — blobs and `null` never reach the DOM */
export function formatDatabaseValue(value: DatabaseValue | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Uint8Array) {
    return value.byteLength === 0 ? "empty" : `${value.byteLength} bytes`;
  }
  return String(value);
}

/** Display text of one row field, resolving joined name columns */
export function readBrowserField(
  record: BrowserRecord,
  key: string,
  labelSource?: BrowserLabelSource,
  labelLookup: ReadonlyMap<number, string> = EMPTY_LABEL_LOOKUP
): string {
  if (labelSource && labelSource.labelColumn === key) {
    return labelLookup.get(record.identifier) ?? "";
  }
  return formatDatabaseValue(record.row[key]);
}

/** Display text of one table cell, resolving joined name columns */
export function readBrowserCell(
  record: BrowserRecord,
  column: BrowserColumn,
  labelSource?: BrowserLabelSource,
  labelLookup: ReadonlyMap<number, string> = EMPTY_LABEL_LOOKUP
): string {
  return readBrowserField(record, column.key, labelSource, labelLookup);
}

/**
 * Lowercase search text of every record, built once per table.
 * Joining the searchable fields of one record into a single string keeps the
 * per-keystroke cost at one `String.includes` per row.
 */
export function buildBrowserHaystacks(
  records: BrowserRecord[],
  searchKeys: string[],
  labelSource?: BrowserLabelSource,
  labelLookup: ReadonlyMap<number, string> = EMPTY_LABEL_LOOKUP
): Map<number, string> {
  const haystacks = new Map<number, string>();
  for (const record of records) {
    let haystack = "";
    for (const key of searchKeys) {
      const value = readBrowserField(record, key, labelSource, labelLookup);
      if (value.length > 0) {
        haystack += `${value.toLowerCase()}\n`;
      }
    }
    haystacks.set(record.identifier, haystack);
  }
  return haystacks;
}

/**
 * Case-insensitive substring pass over prebuilt haystacks.
 * Runs in table order, so results stay stable between keystrokes.
 */
export function matchRecordsBySubstring(
  records: BrowserRecord[],
  haystacks: ReadonlyMap<number, string>,
  query: string
): BrowserRecord[] {
  const term = query.trim().toLowerCase();
  if (term.length === 0) {
    return records;
  }
  const matches: BrowserRecord[] = [];
  for (const record of records) {
    const haystack = haystacks.get(record.identifier);
    if (haystack !== undefined && haystack.includes(term)) {
      matches.push(record);
    }
  }
  return matches;
}

/**
 * Identifier of the browsed record behind every `labelSource` row
 * (`group_name` row id → `group_name.group`). Used to translate Fuse hits of
 * a name table back into the records the browser renders.
 */
export function buildLabelOwnerLookup(
  source: BrowserLabelSource,
  nameTable: DatabaseTable
): ReadonlyMap<number, number> {
  const lookup = new Map<number, number>();
  for (const [rowId, row] of Object.entries(nameTable)) {
    const owner = row[source.foreignKey];
    if (typeof owner === "number") {
      lookup.set(Number(rowId), owner);
    }
  }
  return lookup;
}

/** `hexagon_mean` → `Hexagon Mean`, used as fallback field label */
export function formatColumnLabel(column: string): string {
  return column
    .split("_")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** One labelled value of the details panel */
export interface DetailField {
  /** Column name */
  key: string;
  /** Label shown next to the value */
  title: string;
  /** Rendered value */
  value: string;
}

/**
 * Display value of one column, annotated with the schema meaning:
 * `1 — Left Foot` for enums, `27 → formation` for relations.
 */
export function formatSchemaValue(
  value: DatabaseValue | undefined,
  field?: SchemaField
): string {
  const raw = formatDatabaseValue(value);
  if (raw.length === 0 || typeof value !== "number") {
    return raw;
  }
  if (field?.type === "enum" && field.options?.[value] !== undefined) {
    return `${raw} — ${field.options[value]}`;
  }
  if (field?.type === "relation" && field.target) {
    return `${raw} → ${field.target}`;
  }
  return raw;
}

/**
 * Field list of the details panel: schema columns in schema order first, then
 * columns the schema does not know about yet (unknown `.bin` dumps).
 * `extraFields` (joined names, computed cells) are shown first.
 */
export function toDetailFields(
  row: DatabaseRow | null,
  schema?: TableSchema,
  extraFields: DetailField[] = []
): DetailField[] {
  if (!row) {
    return extraFields;
  }

  const fields: DetailField[] = [...extraFields];
  const seen = new Set(extraFields.map((field) => field.key));

  const push = (key: string, descriptor?: SchemaField) => {
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    fields.push({
      key,
      title: formatColumnLabel(key),
      value: formatSchemaValue(row[key], descriptor),
    });
  };

  if (schema) {
    Object.keys(schema).forEach((key) => push(key, schema[key]));
  }
  Object.keys(row).forEach((key) => push(key));

  return fields;
}
