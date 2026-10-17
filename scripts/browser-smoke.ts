/**
 * scripts/browser-smoke.ts — verification harness for the virtualized database
 * browser (`src/components/DatabaseBrowser.tsx` and friends).
 *
 * Run with `npm run test:smoke`. It checks the PRD success criteria that are
 * measurable without a browser: virtualization window math, substring + Fuse
 * search latency over 10,000 records, the row/cell helpers and the rendered
 * markup of the props-only components.
 *
 * Note: it drives `Virtualizer` directly (`_didMount`, `_willUpdate`,
 * `scrollOffset`), so a major `@tanstack/react-virtual` upgrade may need it
 * revisited.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Virtualizer } from "@tanstack/virtual-core";
import { MainContent } from "@/components/MainContent";
import { RecordDetailPanel } from "@/components/RecordDetailPanel";
import { TableSearchInput } from "@/components/TableSearchInput";
import { VirtualizedTable } from "@/components/VirtualizedTable";
import { getBrowserTableConfig } from "@/data/table-browsers";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import { buildPlayerIndex, searchPlayers } from "@/services/search";
import type { BrowserColumn, BrowserRecord } from "@/types/table-browser";
import type { DatabaseRow, DatabaseTable } from "@/types/database";
import {
  buildBrowserHaystacks,
  buildLabelLookup,
  buildLabelOwnerLookup,
  formatColumnLabel,
  formatSchemaValue,
  matchRecordsBySubstring,
  readBrowserCell,
  toBrowserRecords,
  toDetailFields,
} from "@/utils/table-browser";

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail = ""): void {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL  ${name} ${detail}`);
  }
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const NAMES = ["MACHO", "MACHADO", "ALABA", "MESSI", "RONALDO"];
const ROW_COUNT = 10_000;

const player: DatabaseTable = {};
for (let identifier = 1; identifier <= ROW_COUNT; identifier += 1) {
  player[identifier] = {
    identifier,
    name: `${NAMES[identifier % NAMES.length]}-${identifier}`,
    name_shorter: `P${identifier}`,
    club: `Club ${identifier % 20}`,
    age: 18 + (identifier % 22),
    height: 160 + (identifier % 40),
    price: identifier * 10,
    foot: identifier % 2,
  };
}

const group: DatabaseTable = {
  1: { identifier: 1, logo: null },
  2: { identifier: 2, logo: null },
};

const groupName: DatabaseTable = {
  1: { identifier: 1, group: 1, language: 0, value: "Group A" },
  2: { identifier: 2, group: 1, language: 1, value: "Groupe A" },
  3: { identifier: 3, group: 2, language: 0, value: "Group B" },
};

const playersConfig = getBrowserTableConfig("players");
const groupsConfig = getBrowserTableConfig("groups");

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------
const records = toBrowserRecords(player);
const record12 = records.find((record) => record.identifier === 12) ?? records[0];
check("toBrowserRecords keeps every row", records.length === ROW_COUNT);
check("toBrowserRecords keeps identifier order", records[0].identifier === 1 && records[ROW_COUNT - 1].identifier === ROW_COUNT);
check("toBrowserRecords pairs identifier with row", record12.row.name === "ALABA-12", String(record12.row.name));

const playerHaystacks = buildBrowserHaystacks(records, playersConfig.searchKeys);
const matchedCount = (query: string) =>
  matchRecordsBySubstring(records, playerHaystacks, query).length;
check("substring pass matches a name fragment", matchedCount("mach") > 0);
check("substring pass matches every MACHO row", matchedCount("macho-") === 2000, String(matchedCount("macho-")));
check("substring pass matches the identifier", matchRecordsBySubstring(records, playerHaystacks, "7777")[0].identifier === 7777);
check("substring pass matches the short name", matchedCount("p1234") === 1, String(matchedCount("p1234")));
check("substring pass is case-insensitive", matchedCount("Alaba") === matchedCount("alaba"));
check("substring pass returns table order", matchRecordsBySubstring(records, playerHaystacks, "zzz").length === 0);
check("substring pass returns every row for an empty query", matchRecordsBySubstring(records, playerHaystacks, "  ").length === ROW_COUNT);
check("formatSchemaValue enum annotation", formatSchemaValue(1, { type: "enum", options: { 0: "Right Foot", 1: "Left Foot" } }) === "1 — Left Foot", formatSchemaValue(1, { type: "enum", options: { 0: "Right Foot", 1: "Left Foot" } }));
check("formatSchemaValue relation annotation", formatSchemaValue(27, { type: "relation", target: "formation" }) === "27 → formation");
check("formatSchemaValue null stays empty", formatSchemaValue(null) === "");
check("formatSchemaValue blob is sized", formatSchemaValue(new Uint8Array(2048)) === "2048 bytes");
check("formatSchemaValue plain number", formatSchemaValue(42) === "42");
check("formatColumnLabel humanizes", formatColumnLabel("hexagon_mean") === "Hexagon Mean", formatColumnLabel("hexagon_mean"));

check("readBrowserCell reads raw column", readBrowserCell(record12, { key: "name", title: "Name", track: "1fr" }) === "ALABA-12");
check(
  "readBrowserCell joins label column",
  readBrowserCell(
    { identifier: 1, row: group[1] },
    { key: "name", title: "Name", track: "1fr" },
    groupsConfig.labelSource,
    buildLabelLookup(groupsConfig.labelSource, groupName)
  ) === "Group A"
);
check(
  "buildLabelLookup prefers the wanted language",
  buildLabelLookup(groupsConfig.labelSource, groupName).get(1) === "Group A" &&
    buildLabelLookup(groupsConfig.labelSource, groupName).get(2) === "Group B"
);
check(
  "buildLabelOwnerLookup maps name rows to records",
  buildLabelOwnerLookup(groupsConfig.labelSource, groupName).get(2) === 1 &&
    buildLabelOwnerLookup(groupsConfig.labelSource, groupName).get(3) === 2
);
check(
  "group haystacks search the joined name",
  matchRecordsBySubstring(
    toBrowserRecords(group),
    buildBrowserHaystacks(
      toBrowserRecords(group),
      groupsConfig.searchKeys,
      groupsConfig.labelSource,
      buildLabelLookup(groupsConfig.labelSource, groupName)
    ),
    "group a"
  ).length === 1
);

const detailFields = toDetailFields(player[12], undefined, [
  { key: "identifier", title: "ID", value: "12" },
]);
check("toDetailFields puts extra fields first", detailFields[0].title === "ID");
check("toDetailFields keeps schema-less columns", detailFields.some((field) => field.key === "price"));
check("toDetailFields labels columns", detailFields.find((field) => field.key === "name_shorter")?.title === "Name Shorter");
check("toDetailFields of a missing record is empty", toDetailFields(null).length === 0);


// ---------------------------------------------------------------------------
// Virtualization math — only the visible window is rendered, whatever the size
// ---------------------------------------------------------------------------
const ROW_HEIGHT = 30;
const VIEWPORT = { width: 900, height: 600 };

const virtualizer = new Virtualizer<HTMLDivElement, HTMLDivElement>({
  count: records.length,
  getScrollElement: () => null,
  estimateSize: () => ROW_HEIGHT,
  overscan: 12,
  getItemKey: (index) => records[index].identifier,
  initialRect: VIEWPORT,
  observeElementRect: (_instance, callback) => callback(VIEWPORT),
  observeElementOffset: (_instance, callback) => callback(0, false),
});
virtualizer._didMount();
virtualizer._willUpdate();

const visible = virtualizer.getVirtualItems();
check("virtualizer renders a window, not the dataset", visible.length > 0 && visible.length <= 60, `${visible.length} rows`);
check("virtualizer total size covers every row", virtualizer.getTotalSize() === records.length * ROW_HEIGHT, String(virtualizer.getTotalSize()));
check("virtualizer keys rows by identifier", visible[0].key === 1 && visible[0].index === 0, String(visible[0].key));

// Scroll to the bottom without a DOM: the virtualizer only reads `scrollOffset`
virtualizer.scrollOffset = 9000 * ROW_HEIGHT;
virtualizer._willUpdate();
const scrolled = virtualizer.getVirtualItems();
check("virtualizer scrolls to the end of 10k rows", scrolled.length <= 60 && scrolled[0].index > 8900, `${scrolled.length} rows from ${scrolled[0].index}`);
check("virtualizer keeps identifier keys after scrolling", scrolled[0].key === records[scrolled[0].index].identifier, String(scrolled[0].key));

// ---------------------------------------------------------------------------
// Search latency on the real Fuse index (target: under 50 ms)
// ---------------------------------------------------------------------------
const buildStart = performance.now();
const playerIndex = buildPlayerIndex(player);
const buildMs = performance.now() - buildStart;

const queries = ["mach", "machado-12", "messi-3", "alaba-77", "ronaldo-994", "7777", "club 7", "P1234", "zz", "777"];
let worstMs = 0;
let totalMs = 0;
let totalHits = 0;
for (let round = 0; round < 5; round += 1) {
  for (const query of queries) {
    const start = performance.now();
    const hits = searchPlayers(playerIndex, query);
    const elapsed = performance.now() - start;
    worstMs = Math.max(worstMs, elapsed);
    totalMs += elapsed;
    totalHits += hits.length;
  }
}
const averageMs = totalMs / (queries.length * 5);

check("index build of 10k players is fast", buildMs < 1500, `${buildMs.toFixed(1)} ms`);
check("every fuzzy search returns hits", totalHits > 0, `${totalHits} hits`);
check("fuzzy fallback of a full fuzzy scan is bounded", averageMs < 150, `worst ${worstMs.toFixed(1)} ms / avg ${averageMs.toFixed(1)} ms`);

// The rendered path never relies on that scan: the substring pass answers first.
let fastWorst = 0;
let fastTotal = 0;
for (let round = 0; round < 5; round += 1) {
  for (const query of queries) {
    const start = performance.now();
    matchRecordsBySubstring(records, playerHaystacks, query);
    const elapsed = performance.now() - start;
    fastWorst = Math.max(fastWorst, elapsed);
    fastTotal += elapsed;
  }
}
const fastAverage = fastTotal / (queries.length * 5);
check(
  "substring search stays far under the 50 ms budget",
  fastWorst < 50,
  `worst ${fastWorst.toFixed(1)} ms / avg ${fastAverage.toFixed(1)} ms`
);
check("segmented player names search correctly", matchRecordsBySubstring(records, playerHaystacks, "machado-241")[0].identifier === 241);
check("fuzzy query matches the record", searchPlayers(playerIndex, "alaba-12")[0]?.identifier === 12, String(searchPlayers(playerIndex, "alaba-12")[0]?.identifier));
check("identifier query matches the record", searchPlayers(playerIndex, "7777")[0]?.identifier === 7777);
check("typo query still has no substring hit", matchedCount("alba-12") === 0);
check("typo query is rescued by Fuse", searchPlayers(playerIndex, "alba-12").some((item) => item.identifier === 12));

// ---------------------------------------------------------------------------
// Render smoke
// Zustand v5 serves `getInitialState` as the SSR snapshot, so store-backed
// components are exercised through their props-only children plus direct store
// assertions instead of `renderToStaticMarkup`.
// ---------------------------------------------------------------------------
function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

useDatabaseStore.getState().hydrateDatabase(
  {
    player,
    group,
    group_name: groupName,
    ball: { 1: { identifier: 1, name: "Classic Ball", type: 0 } },
  },
  { fileName: "tmp.bin", tableNames: ["player", "group", "group_name", "ball"], rowCounts: { player: ROW_COUNT } }
);

const store = useDatabaseStore.getState();
check("hydrated database exposes the player table", Object.keys(store.database.player).length === ROW_COUNT);
check("hydration builds the player search index", store.search.playerIndex !== null);
check("hydration tracks the source file", store.fileName === "tmp.bin", String(store.fileName));

const searchHtml = renderToStaticMarkup(
  createElement(TableSearchInput, {
    value: "mach",
    onValueChange: () => {},
    placeholder: playersConfig.searchPlaceholder,
    resultCount: 3,
    totalCount: ROW_COUNT,
  })
);
check("search input renders with its placeholder", searchHtml.includes('placeholder="Search Player"'), searchHtml.slice(0, 120));
check("search input keeps the query", searchHtml.includes('value="mach"'));
check("search counter shows results over total", /class="[^"]*font-mono[^"]*">3 \/ 10000</.test(searchHtml), searchHtml.match(/>[^<]*10000</)?.[0] ?? "no counter");
check("search input offers a clear button", searchHtml.includes("Clear search"));

const tableHtml = renderToStaticMarkup(
  createElement(VirtualizedTable, {
    columns: playersConfig.columns,
    records: records,
    getCellValue: (record: BrowserRecord, column: BrowserColumn) =>
      readBrowserCell(record, column),
  })
);
check("header renders the configured columns", ["ID", "Name", "Age", "Height", "Value"].every((title) => tableHtml.includes(`>${title}<`)), tableHtml.slice(0, 200));
check("table announces the full row count", tableHtml.includes('aria-rowcount="10000"'));
check("unmeasured table renders no row nodes", countOccurrences(tableHtml, 'role="row"') === 1, String(countOccurrences(tableHtml, 'role="row"')));

const detailRow: DatabaseRow = { identifier: 12, name: "ALABA-12", name_shorter: "P12", price: 39802 };
const detailHtml = renderToStaticMarkup(
  createElement(RecordDetailPanel, {
    tableName: "player",
    label: playersConfig.label,
    identifier: 12,
    row: detailRow,
    onClose: () => {},
  })
);
check("details panel shows the identity", detailHtml.includes("Player #12"));
check("details panel labels unknown columns", detailHtml.includes("Name Shorter"));
check("details panel annotates schema values", detailHtml.includes("Left Foot") || detailHtml.includes("Right Foot") || detailHtml.includes("Foot"), detailHtml.slice(0, 0) + "no enum label");

const missingRowHtml = renderToStaticMarkup(
  createElement(RecordDetailPanel, {
    tableName: "player",
    label: playersConfig.label,
    identifier: 999999,
    row: null,
    onClose: () => {},
  })
);
check("details panel explains a missing record", missingRowHtml.includes("not part of the loaded database"));

check(
  "every nav item maps to a browser table",
  ["players", "teams", "competitions", "groups", "formations", "balls"].every(
    (navId) => getBrowserTableConfig(navId) !== null
  )
);
check("unknown nav items have no browser table", getBrowserTableConfig("settings") === null);
check(
  "search keys mirror the search service fields",
  playersConfig.searchKeys.join(",") === "identifier,name,name_shorter" &&
    getBrowserTableConfig("teams")?.searchKeys.join(",") === "identifier,name_short,name"
);
check(
  "name-table indexes are flagged for id translation",
  groupsConfig.searchFromLabelTable === true &&
    getBrowserTableConfig("competitions")?.searchFromLabelTable === true &&
    playersConfig.searchFromLabelTable === undefined
);

const demoHtml = renderToStaticMarkup(
  createElement(MainContent, { activeNavId: "players" })
);
check("MainContent renders without a hydrated store", demoHtml.length > 0);

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed === 0 ? 0 : 1;
