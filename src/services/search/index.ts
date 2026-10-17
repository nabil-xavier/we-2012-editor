// src/services/search/index.ts
import type { Database, DatabaseTable } from "@/types/database";
import type { SearchIndexes, SearchIndexKey } from "@/types/search";
import {
  buildCompetitionIndex,
  COMPETITION_NAME_TABLES,
} from "./competition-search";
import { buildFormationIndex, FORMATION_TABLE } from "./formation-search";
import { buildGroupIndex, GROUP_NAME_TABLES } from "./group-search";
import { buildPlayerIndex, PLAYER_TABLE } from "./player-search";
import { buildTeamIndex, TEAM_TABLE } from "./team-search";

export * from "./create-index";
export * from "./player-search";
export * from "./team-search";
export * from "./competition-search";
export * from "./group-search";
export * from "./formation-search";

/** One maintained index and the tables feeding it */
export interface SearchIndexDefinition {
  /** Field of `SearchIndexes` to fill */
  key: SearchIndexKey;
  /** Candidate table names — first match in the database wins */
  tableNames: string[];
}

/**
 * Single source of truth for the search layer.
 * Table spellings differ between `.bin` dumps, so both are listed.
 */
export const SEARCH_INDEX_DEFINITIONS: SearchIndexDefinition[] = [
  { key: "playerIndex", tableNames: [PLAYER_TABLE] },
  { key: "teamIndex", tableNames: [TEAM_TABLE] },
  { key: "competitionIndex", tableNames: COMPETITION_NAME_TABLES },
  { key: "groupIndex", tableNames: GROUP_NAME_TABLES },
  { key: "formationIndex", tableNames: [FORMATION_TABLE] },
];

/** Fresh index bundle with nothing built yet */
export function createEmptySearchIndexes(): SearchIndexes {
  return {
    playerIndex: null,
    teamIndex: null,
    competitionIndex: null,
    groupIndex: null,
    formationIndex: null,
  };
}

/** First candidate table found in the loaded database */
export function findSearchTable(
  database: Database,
  tableNames: string[]
): DatabaseTable | null {
  for (const tableName of tableNames) {
    const table = database[tableName];
    if (table) {
      return table;
    }
  }
  return null;
}

/** Build (or drop) one index from the current database contents */
function assignSearchIndex(
  indexes: SearchIndexes,
  definition: SearchIndexDefinition,
  database: Database
): void {
  const table = findSearchTable(database, definition.tableNames);

  switch (definition.key) {
    case "playerIndex":
      indexes.playerIndex = table ? buildPlayerIndex(table) : null;
      break;
    case "teamIndex":
      indexes.teamIndex = table ? buildTeamIndex(table) : null;
      break;
    case "competitionIndex":
      indexes.competitionIndex = table ? buildCompetitionIndex(table) : null;
      break;
    case "groupIndex":
      indexes.groupIndex = table ? buildGroupIndex(table) : null;
      break;
    case "formationIndex":
      indexes.formationIndex = table ? buildFormationIndex(table) : null;
      break;
  }
}

/** Build every search index — called once after a database import */
export function buildSearchIndexes(database: Database): SearchIndexes {
  const indexes = createEmptySearchIndexes();
  SEARCH_INDEX_DEFINITIONS.forEach((definition) =>
    assignSearchIndex(indexes, definition, database)
  );
  return indexes;
}

/**
 * Refresh only the indexes fed by `tableNames`, keeping the other index
 * objects untouched. Returns `current` unchanged when no table is indexed.
 */
export function rebuildSearchIndexes(
  database: Database,
  tableNames: string[],
  current: SearchIndexes
): SearchIndexes {
  const definitions = SEARCH_INDEX_DEFINITIONS.filter((definition) =>
    definition.tableNames.some((tableName) => tableNames.includes(tableName))
  );
  if (definitions.length === 0) {
    return current;
  }

  const indexes = { ...current };
  definitions.forEach((definition) =>
    assignSearchIndex(indexes, definition, database)
  );
  return indexes;
}
