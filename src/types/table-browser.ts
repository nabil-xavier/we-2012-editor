// src/types/table-browser.ts
import type { DatabaseRow } from "@/types/database";

/** Fuzzy-search family of a browsable table, matching the `SearchIndexes` fields */
export type BrowserSearchEntity =
  | "player"
  | "team"
  | "competition"
  | "group"
  | "formation";

/** Table whose rows are opened in a full detail page */
export type BrowserDetailKind =
  | "player"
  | "team"
  | "competition"
  | "group"
  | "formation"
  | "ball";

/** One column rendered by the virtualized table */
export interface BrowserColumn {
  /** Column name inside the database row */
  key: string;
  /** Header label */
  title: string;
  /** CSS grid track of the column, e.g. `72px` or `minmax(0, 2fr)` */
  track: string;
  /** Text alignment of the cells (default `left`) */
  align?: "left" | "right";
}

/**
 * Secondary table holding the display names of the browsed records.
 * Used when the browsed table itself has no human readable name column
 * (`group` → `group_name`, `competition` → `competition_name`).
 */
export interface BrowserLabelSource {
  /** Table holding the names, e.g. `group_name` */
  tableName: string;
  /** Column pointing back at the browsed record, e.g. `group` */
  foreignKey: string;
  /** Column holding the display text, e.g. `value` */
  valueColumn: string;
  /** Column selecting the language variant, e.g. `language` */
  languageColumn?: string;
  /** Preferred language value of `languageColumn` (first match wins otherwise) */
  language?: number;
  /** Column of `BrowserTableConfig.columns` filled from this table */
  labelColumn: string;
}

/** Everything the browser needs to render one navigable table */
export interface BrowserTableConfig {
  /** Nav item id rendering this table, e.g. `players` */
  navId: string;
  /** Physical table name inside the `.bin`, e.g. `player` */
  tableName: string;
  /** Human readable table name used in labels, e.g. `Player` */
  label: string;
  /** Placeholder of the search box, e.g. `Search Player` */
  searchPlaceholder: string;
  /** Fuzzy-search family, `null` when the table has no Fuse index */
  searchEntity: BrowserSearchEntity | null;
  /** Full detail page opened on row click, `null` when the table has none */
  detailKind: BrowserDetailKind | null;
  /**
   * Columns matched by the substring pass, in the spirit of the field lists in
   * `src/services/search/*-search.ts`. The first pass of the browser is a plain
   * case-insensitive substring scan over these columns (~1 ms per 10,000 rows);
   * Fuse runs only when that pass finds nothing, which keeps long queries under
   * the 50 ms budget while still tolerating typos.
   */
  searchKeys: string[];
  /**
   * True when the Fuse index behind `searchEntity` is built from the
   * `labelSource` table instead of the browsed table (`group`, `competition`):
   * result identifiers are then name-row identifiers and must be mapped back
   * through `labelSource.foreignKey` before they can select a record.
   */
  searchFromLabelTable?: boolean;
  /** Columns rendered by the virtualized table */
  columns: BrowserColumn[];
  /** Optional name table joined into `labelColumn` */
  labelSource?: BrowserLabelSource;
}

/** One table row paired with the identifier it is stored under */
export interface BrowserRecord {
  /** Primary key the row is stored under */
  identifier: number;
  /** Raw row as read from the `.bin` */
  row: DatabaseRow;
}
