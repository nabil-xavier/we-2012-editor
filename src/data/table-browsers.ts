// src/data/table-browsers.ts
import type { BrowserTableConfig } from "@/types/table-browser";

/** Identifier + jump-in label column shared by every browsed table */
const ID_COLUMN = { key: "identifier", title: "ID", track: "72px" } as const;

const NAME_COLUMN = {
  key: "name",
  title: "Name",
  track: "minmax(0, 2fr)",
} as const;

/** Width of the widest text column of a table (name, club, …) */
const WIDE_TEXT_WIDTH = "minmax(0, 1.2fr)";
const SMALL_WIDTH = "72px";

/**
 * Presentation + search description of every navigable table.
 * Column tracks are CSS grid tracks consumed by `VirtualizedTable`.
 */
export const BROWSER_TABLES: BrowserTableConfig[] = [
  {
    navId: "players",
    tableName: "player",
    label: "Player",
    searchPlaceholder: "Search Player",
    searchEntity: "player",
    searchKeys: ["identifier", "name", "name_shorter"],
    columns: [
      ID_COLUMN,
      NAME_COLUMN,
      { key: "name_shorter", title: "Short", track: "128px" },
      { key: "club", title: "Club", track: WIDE_TEXT_WIDTH },
      { key: "age", title: "Age", track: "56px", align: "right" },
      { key: "height", title: "Height", track: SMALL_WIDTH, align: "right" },
      { key: "price", title: "Value", track: "96px", align: "right" },
    ],
  },
  {
    navId: "teams",
    tableName: "team",
    label: "Team",
    searchPlaceholder: "Search Team",
    searchEntity: "team",
    searchKeys: ["identifier", "name_short", "name"],
    columns: [
      ID_COLUMN,
      { key: "name_short", title: "Code", track: "96px" },
      { key: "type", title: "Type", track: SMALL_WIDTH, align: "right" },
      { key: "formation", title: "Formation", track: "104px", align: "right" },
      { key: "hexagon_mean", title: "Mean", track: SMALL_WIDTH, align: "right" },
    ],
  },
  {
    navId: "competitions",
    tableName: "competition",
    label: "Competition",
    searchPlaceholder: "Search Competition",
    searchEntity: "competition",
    searchKeys: ["identifier", "name"],
    searchFromLabelTable: true,
    columns: [
      ID_COLUMN,
      NAME_COLUMN,
      { key: "type", title: "Type", track: SMALL_WIDTH, align: "right" },
      { key: "card", title: "Card", track: SMALL_WIDTH, align: "right" },
      { key: "leg", title: "Leg", track: "64px", align: "right" },
      { key: "qualification", title: "Qual.", track: "80px", align: "right" },
      { key: "lock", title: "Lock", track: "64px", align: "right" },
    ],
    labelSource: {
      tableName: "competition_name",
      foreignKey: "competition",
      valueColumn: "value",
      languageColumn: "language",
      language: 0,
      labelColumn: "name",
    },
  },
  {
    navId: "groups",
    tableName: "group",
    label: "Group",
    searchPlaceholder: "Search Group",
    searchEntity: "group",
    searchKeys: ["identifier", "name"],
    searchFromLabelTable: true,
    columns: [ID_COLUMN, NAME_COLUMN],
    labelSource: {
      tableName: "group_name",
      foreignKey: "group",
      valueColumn: "value",
      languageColumn: "language",
      language: 0,
      labelColumn: "name",
    },
  },
  {
    navId: "formations",
    tableName: "formation",
    label: "Formation",
    searchPlaceholder: "Search Formation",
    searchEntity: "formation",
    searchKeys: ["identifier", "name"],
    columns: [
      ID_COLUMN,
      NAME_COLUMN,
      { key: "data", title: "Data", track: "96px", align: "right" },
    ],
  },
  {
    navId: "balls",
    tableName: "ball",
    label: "Ball",
    searchPlaceholder: "Search Ball",
    searchEntity: null,
    searchKeys: ["identifier", "name", "type"],
    columns: [
      ID_COLUMN,
      NAME_COLUMN,
      { key: "type", title: "Type", track: SMALL_WIDTH, align: "right" },
      { key: "icon", title: "Icon", track: "96px", align: "right" },
      { key: "texture", title: "Texture", track: "96px", align: "right" },
    ],
  },
];

/** Browser configuration of every nav item, keyed by nav item id */
export const BROWSER_TABLE_BY_NAV_ID: Record<string, BrowserTableConfig> =
  Object.fromEntries(BROWSER_TABLES.map((config) => [config.navId, config]));

/** Browser configuration of one nav item, `null` for nav items without a table */
export function getBrowserTableConfig(navId: string): BrowserTableConfig | null {
  return BROWSER_TABLE_BY_NAV_ID[navId] ?? null;
}
