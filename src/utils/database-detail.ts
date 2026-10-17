// src/utils/database-detail.ts
/**
 * Adapters turning raw `.bin` rows into the structures the full detail pages
 * (`PlayerDetail`, `TeamDetail`, …) expect.
 *
 * The detail pages merge their props over a demo record
 * (`{ ...DEFAULT_FULL_TEAM.team, ...initialData?.team }`), so every builder here
 * emits the complete key set of its type: a column missing from the dump shows
 * up as `0` / `""` / `null` instead of leaking a demo value.
 *
 * Assumption: relation columns follow `src/types/*.ts` (`team_name.team`,
 * `group_team.group`, …). Table names are resolved from candidate spellings, so
 * a dump using the other convention still resolves; a missing table degrades to
 * an empty collection.
 */
import {
  COMPETITION_NAME_TABLES,
  FORMATION_TABLE,
  GROUP_NAME_TABLES,
  PLAYER_TABLE,
  TEAM_TABLE,
} from "@/services/search";
import { toImageDataUrl } from "@/utils/database-blob";
import type { BallData } from "@/types/ball";
import type {
  CompetitionData,
  CompetitionDetail,
  CompetitionGroupData,
  CompetitionNameData,
  CompetitionSizeData,
  CompetitionTeamData,
} from "@/types/competition";
import type { Database, DatabaseRow, DatabaseTable } from "@/types/database";
import type {
  FormationData,
  FormationDetail,
  FormationPositionData,
} from "@/types/formation";
import type { GroupData, GroupDetail, GroupTeamData } from "@/types/group";
import type { PlayerData } from "@/types/player";
import type { SelectOption } from "@/types/select";
import type { BrowserDetailKind, BrowserTableConfig } from "@/types/table-browser";
import type {
  FullTeamRecord,
  TeamData,
  TeamGloveData,
  TeamNameData,
  TeamPlayerData,
  TeamStyleData,
} from "@/types/team";

/** Relation tables — `.bin` dumps use either the snake or the camel spelling */
const TEAM_NAME_TABLES = ["team_name", "teamName"];
const TEAM_GLOVE_TABLES = ["team_glove", "teamGlove"];
const TEAM_PLAYER_TABLES = ["team_player", "teamPlayer"];
const TEAM_STYLE_TABLES = ["team_style", "teamStyle"];
const COMPETITION_GROUP_TABLES = ["competition_group", "competitionGroup"];
const COMPETITION_SIZE_TABLES = ["competition_size", "competitionSize"];
const COMPETITION_TEAM_TABLES = ["competition_team", "competitionTeam"];
const GROUP_TEAM_TABLES = ["group_team", "groupTeam"];
const FORMATION_POSITION_TABLES = ["formation_position", "formationPosition"];

/** Physical table backing the browsed `group` records */
const GROUP_TABLE = "group";

/** Physical table backing the browsed `competition` records */
const COMPETITION_TABLE = "competition";

/** Language variant read first when a name table holds several translations */
const DEFAULT_LANGUAGE = 0;

/** One entry of the searchable selects of the detail pages */
export interface DetailOption {
  /** Identifier of the referenced record */
  identifier: number;
  /** Display name, when the name table has one */
  name?: string;
}

/** Result of a competition lookup: the detail data plus its select options */
export interface CompetitionDetailLookup {
  detail: CompetitionDetail;
  availableGroups: DetailOption[];
  availableTeams: DetailOption[];
}

/** Payload of one opened record, discriminated by the browser `detailKind` */
export type BrowserDetailPayload =
  | { kind: "player"; player: PlayerData; clubOptions: SelectOption[] }
  | {
      kind: "team";
      team: FullTeamRecord;
      playerOptions: SelectOption[];
      formationOptions: SelectOption[];
      gloveOptions: SelectOption[];
    }
  | {
      kind: "competition";
      competition: CompetitionDetail;
      availableGroups: DetailOption[];
      availableTeams: DetailOption[];
    }
  | { kind: "group"; group: GroupDetail; teamOptions: SelectOption[] }
  | { kind: "formation"; formation: FormationDetail }
  | { kind: "ball"; ball: BallData };

/** First spelling of `candidates` present in the table list, `null` when absent */
export function resolveTableName(
  tableNames: readonly string[],
  candidates: readonly string[]
): string | null {
  for (const candidate of candidates) {
    if (tableNames.includes(candidate)) {
      return candidate;
    }
  }
  return null;
}

/** First candidate table present in the database, `null` when absent */
function pickTable(
  database: Database,
  candidates: readonly string[]
): DatabaseTable | null {
  for (const candidate of candidates) {
    const table = database[candidate];
    if (table) {
      return table;
    }
  }
  return null;
}

/** Number column, `0` when the dump has no such column */
function readNumber(row: DatabaseRow, key: string): number {
  const value = row[key];
  return typeof value === "number" ? value : 0;
}

/** Text column, `""` when the dump has no such column */
function readString(row: DatabaseRow, key: string): string {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

/** Blob column as an `<img src>` value, `null` when empty or missing */
function readImage(row: DatabaseRow, key: string): string | null {
  return toImageDataUrl(row[key]);
}

/** Identifier of one row, falling back to the key the row is stored under */
function readIdentifier(row: DatabaseRow, fallback: number): number {
  const value = row.identifier;
  return typeof value === "number" ? value : fallback;
}

/** Rows of a relation table pointing at `owner`, in table order */
function relatedRows(
  table: DatabaseTable | null,
  foreignKey: string,
  owner: number
): DatabaseRow[] {
  if (!table) {
    return [];
  }
  return Object.values(table).filter((row) => row[foreignKey] === owner);
}

/** Name row of one owner in the preferred language, first row as fallback */
function findNameRow(
  table: DatabaseTable | null,
  foreignKey: string,
  owner: number
): DatabaseRow | null {
  const rows = relatedRows(table, foreignKey, owner);
  return rows.find((row) => row.language === DEFAULT_LANGUAGE) ?? rows[0] ?? null;
}

/** Hexagon columns averaged into `hexagon_mean` when the dump has no such column */
const HEXAGON_KEYS = [
  "hexagon_attack",
  "hexagon_defense",
  "hexagon_shot_power",
  "hexagon_speed",
  "hexagon_stamina",
  "hexagon_technique",
] as const;

/** Stored `hexagon_mean`, or the rounded average of the six hexagon values */
function readHexagonMean(row: DatabaseRow): number {
  const stored = row.hexagon_mean;
  if (typeof stored === "number") {
    return stored;
  }
  const total = HEXAGON_KEYS.reduce((sum, key) => sum + readNumber(row, key), 0);
  return Math.round(total / HEXAGON_KEYS.length);
}

/** Every column `PlayerData` knows, read out of one `player` row */
export function toPlayerData(row: DatabaseRow, identifier: number): PlayerData {
  return {
    identifier: readIdentifier(row, identifier),
    name: readString(row, "name"),
    name_shorter: readString(row, "name_shorter"),
    club: readString(row, "club"),
    age: readNumber(row, "age"),
    height: readNumber(row, "height"),
    price: readNumber(row, "price"),
    hair_color: readNumber(row, "hair_color"),
    hair_model: readNumber(row, "hair_model"),
    skin: readNumber(row, "skin"),
    shoe: readNumber(row, "shoe"),
    foot: readNumber(row, "foot"),
    side: readNumber(row, "side"),
    position: readNumber(row, "position"),
    position_flag: readNumber(row, "position_flag"),
    attack: readNumber(row, "attack"),
    teamwork: readNumber(row, "teamwork"),
    aggression: readNumber(row, "aggression"),
    defense: readNumber(row, "defense"),
    speed: readNumber(row, "speed"),
    acceleration: readNumber(row, "acceleration"),
    agility: readNumber(row, "agility"),
    balance: readNumber(row, "balance"),
    stamina: readNumber(row, "stamina"),
    response: readNumber(row, "response"),
    jump: readNumber(row, "jump"),
    technique: readNumber(row, "technique"),
    dribble_accuracy: readNumber(row, "dribble_accuracy"),
    dribble_speed: readNumber(row, "dribble_speed"),
    swerve: readNumber(row, "swerve"),
    pass_short_accuracy: readNumber(row, "pass_short_accuracy"),
    pass_short_speed: readNumber(row, "pass_short_speed"),
    pass_long_accuracy: readNumber(row, "pass_long_accuracy"),
    pass_long_speed: readNumber(row, "pass_long_speed"),
    shot_accuracy: readNumber(row, "shot_accuracy"),
    shot_power: readNumber(row, "shot_power"),
    shot_technique: readNumber(row, "shot_technique"),
    freekick_accuracy: readNumber(row, "freekick_accuracy"),
    header: readNumber(row, "header"),
    keeper: readNumber(row, "keeper"),
    foot_weak_accuracy: readNumber(row, "foot_weak_accuracy"),
    foot_weak_frequency: readNumber(row, "foot_weak_frequency"),
    form: readNumber(row, "form"),
    tenacity: readNumber(row, "tenacity"),
    index: readNumber(row, "index"),
  };
}

/** Every column `BallData` knows, read out of one `ball` row */
export function toBallData(row: DatabaseRow, identifier: number): BallData {
  return {
    identifier: readIdentifier(row, identifier),
    name: readString(row, "name"),
    type: readNumber(row, "type"),
    icon: readImage(row, "icon"),
    texture: readImage(row, "texture"),
  };
}

/** One `team_name` row */
function toTeamNameData(row: DatabaseRow, team: number): TeamNameData {
  const value = readString(row, "value");
  return {
    identifier: readIdentifier(row, 0),
    team: readNumber(row, "team") || team,
    language: readNumber(row, "language"),
    value,
    value_shorter: readString(row, "value_shorter") || value,
  };
}

/** One `team_player` row */
function toTeamPlayerData(row: DatabaseRow): TeamPlayerData {
  return {
    identifier: readIdentifier(row, 0),
    team: readNumber(row, "team"),
    player: readNumber(row, "player"),
    number: readNumber(row, "number"),
  };
}

/** One `team_style` row */
function toTeamStyleData(row: DatabaseRow): TeamStyleData {
  return {
    identifier: readIdentifier(row, 0),
    team: readNumber(row, "team"),
    type: readNumber(row, "type"),
    map: readNumber(row, "map"),
    text_player: readNumber(row, "text_player"),
    text_keeper: readNumber(row, "text_keeper"),
    uniform_player: readImage(row, "uniform_player"),
    uniform_keeper: readImage(row, "uniform_keeper"),
  };
}

/** Full team record: row + glove, names, players and styles of that team */
export function toTeamRecord(
  database: Database,
  identifier: number
): FullTeamRecord | null {
  const row = database[TEAM_TABLE]?.[identifier];
  if (!row) {
    return null;
  }

  const team: TeamData = {
    identifier: readIdentifier(row, identifier),
    name_short: readString(row, "name_short"),
    type: readNumber(row, "type"),
    flag_32: readImage(row, "flag_32"),
    flag_64: readImage(row, "flag_64"),
    flag_128: readImage(row, "flag_128"),
    formation: readNumber(row, "formation"),
    glove: readNumber(row, "glove"),
    captain: readNumber(row, "captain"),
    kick_corner_left: readNumber(row, "kick_corner_left"),
    kick_corner_right: readNumber(row, "kick_corner_right"),
    kick_free_long: readNumber(row, "kick_free_long"),
    kick_free_short: readNumber(row, "kick_free_short"),
    kick_penalty: readNumber(row, "kick_penalty"),
    hexagon_attack: readNumber(row, "hexagon_attack"),
    hexagon_defense: readNumber(row, "hexagon_defense"),
    hexagon_shot_power: readNumber(row, "hexagon_shot_power"),
    hexagon_speed: readNumber(row, "hexagon_speed"),
    hexagon_stamina: readNumber(row, "hexagon_stamina"),
    hexagon_technique: readNumber(row, "hexagon_technique"),
    hexagon_mean: readHexagonMean(row),
  };

  const gloveIndex = team.glove ?? 0;
  const gloveRow = pickTable(database, TEAM_GLOVE_TABLES)?.[gloveIndex];
  const glove: TeamGloveData = gloveRow
    ? {
        identifier: readIdentifier(gloveRow, gloveIndex),
        data: readImage(gloveRow, "data"),
      }
    : { identifier: gloveIndex, data: null };

  const names = relatedRows(
    pickTable(database, TEAM_NAME_TABLES),
    "team",
    identifier
  ).map((nameRow) => toTeamNameData(nameRow, identifier));
  const players = relatedRows(
    pickTable(database, TEAM_PLAYER_TABLES),
    "team",
    identifier
  ).map(toTeamPlayerData);
  const styles = relatedRows(
    pickTable(database, TEAM_STYLE_TABLES),
    "team",
    identifier
  ).map(toTeamStyleData);

  return { team, glove, names, players, styles };
}

/** Group record: row + translated name + member teams */
export function toGroupDetail(
  database: Database,
  identifier: number
): GroupDetail | null {
  const row = database[GROUP_TABLE]?.[identifier];
  if (!row) {
    return null;
  }

  const nameRow = findNameRow(
    pickTable(database, GROUP_NAME_TABLES),
    "group",
    identifier
  );
  const group: GroupData = {
    identifier: readIdentifier(row, identifier),
    logo: readImage(row, "logo"),
    language: nameRow ? readNumber(nameRow, "language") : 0,
    value: nameRow ? readString(nameRow, "value") : readString(row, "value"),
  };

  const teams: GroupTeamData[] = relatedRows(
    pickTable(database, GROUP_TEAM_TABLES),
    "group",
    identifier
  ).map((teamRow) => ({
    identifier: readIdentifier(teamRow, 0),
    group: readNumber(teamRow, "group") || identifier,
    team: readNumber(teamRow, "team"),
  }));

  return { group, teams };
}

/** Select options of a name table: `identifier` is the referenced record */
export function toNameOptions(
  database: Database,
  nameTables: readonly string[],
  foreignKey: string
): DetailOption[] {
  const table = pickTable(database, nameTables);
  if (!table) {
    return [];
  }

  const options = new Map<number, DetailOption>();
  for (const row of Object.values(table)) {
    const owner = row[foreignKey];
    const name = row.value;
    if (typeof owner !== "number" || typeof name !== "string") {
      continue;
    }
    if (row.language !== undefined && row.language !== DEFAULT_LANGUAGE) {
      continue;
    }
    if (!options.has(owner)) {
      options.set(owner, { identifier: owner, name });
    }
  }
  return [...options.values()];
}

/** `${identifier} - ${name}` label, with a placeholder when the name is missing */
function toOptionLabel(
  identifier: number,
  name: string,
  placeholder: string
): string {
  return `${identifier} - ${name || placeholder}`;
}

/** Options ordered by identifier, the order the selects show them in */
function sortOptions(
  entries: { identifier: number; option: SelectOption }[]
): SelectOption[] {
  return entries
    .sort((left, right) => left.identifier - right.identifier)
    .map((entry) => entry.option);
}

/** Display name of every team: `team_name` (language 0), else the short code */
function toTeamLabels(database: Database): Map<number, string> {
  const labels = new Map<number, string>();
  for (const option of toNameOptions(database, TEAM_NAME_TABLES, "team")) {
    if (option.name) {
      labels.set(option.identifier, option.name);
    }
  }

  const table = database[TEAM_TABLE];
  for (const [key, row] of Object.entries(table ?? {})) {
    const identifier = readIdentifier(row, Number(key));
    const short = readString(row, "name_short");
    if (short && !labels.has(identifier)) {
      labels.set(identifier, short);
    }
  }
  return labels;
}

/** Select options of the `player` table, labelled `id - name` */
export function toPlayerOptions(database: Database): SelectOption[] {
  const table = database[PLAYER_TABLE];
  return sortOptions(
    Object.entries(table ?? {}).map(([key, row]) => {
      const identifier = readIdentifier(row, Number(key));
      const club = readString(row, "club");
      return {
        identifier,
        option: {
          value: String(identifier),
          label: toOptionLabel(identifier, readString(row, "name"), "Player"),
          description: club || undefined,
        },
      };
    })
  );
}

/**
 * Club options of `PlayerData.club`: the team names, used as the value itself
 * because the column stores the name and not a foreign key.
 */
export function toClubOptions(database: Database): SelectOption[] {
  const names = [...new Set(toTeamLabels(database).values())].sort((left, right) =>
    left.localeCompare(right)
  );
  return names.map((name) => ({ value: name, label: name }));
}

/** Select options of the `team` table, labelled `id - name` */
export function toTeamOptions(database: Database): SelectOption[] {
  return sortOptions(
    [...toTeamLabels(database)].map(([identifier, name]) => ({
      identifier,
      option: {
        value: String(identifier),
        label: toOptionLabel(identifier, name, "Team"),
      },
    }))
  );
}

/** Select options of the `formation` table, labelled `id - name` */
export function toFormationOptions(database: Database): SelectOption[] {
  const table = database[FORMATION_TABLE];
  return sortOptions(
    Object.entries(table ?? {}).map(([key, row]) => {
      const identifier = readIdentifier(row, Number(key));
      return {
        identifier,
        option: {
          value: String(identifier),
          label: toOptionLabel(
            identifier,
            readString(row, "name"),
            "Formation"
          ),
        },
      };
    })
  );
}

/** Select options of the glove table (`team_glove`) */
export function toGloveOptions(database: Database): SelectOption[] {
  const table = pickTable(database, TEAM_GLOVE_TABLES);
  return sortOptions(
    Object.entries(table ?? {}).map(([key, row]) => {
      const identifier = readIdentifier(row, Number(key));
      return {
        identifier,
        option: {
          value: String(identifier),
          label: toOptionLabel(identifier, readString(row, "name"), "Glove"),
        },
      };
    })
  );
}

/** Competition record: row + names, groups, sizes and teams of that competition */
export function toCompetitionDetail(
  database: Database,
  identifier: number
): CompetitionDetailLookup | null {
  const row = database[COMPETITION_TABLE]?.[identifier];
  if (!row) {
    return null;
  }

  const competition: CompetitionData = {
    identifier: readIdentifier(row, identifier),
    type: readNumber(row, "type"),
    banner_480: readImage(row, "banner_480"),
    banner_960: readImage(row, "banner_960"),
    cup: readImage(row, "cup"),
    logo_64: readImage(row, "logo_64"),
    logo_128: readImage(row, "logo_128"),
    logo_256: readImage(row, "logo_256"),
    color: readNumber(row, "color"),
    card: readNumber(row, "card"),
    leg: readNumber(row, "leg"),
    qualification: readNumber(row, "qualification"),
    lock: readNumber(row, "lock"),
  };

  const names: CompetitionNameData[] = relatedRows(
    pickTable(database, COMPETITION_NAME_TABLES),
    "competition",
    identifier
  ).map((nameRow) => ({
    identifier: readIdentifier(nameRow, 0),
    competition: readNumber(nameRow, "competition") || identifier,
    language: readNumber(nameRow, "language"),
    value: readString(nameRow, "value"),
  }));

  const groups: CompetitionGroupData[] = relatedRows(
    pickTable(database, COMPETITION_GROUP_TABLES),
    "competition",
    identifier
  ).map((groupRow) => ({
    identifier: readIdentifier(groupRow, 0),
    competition: readNumber(groupRow, "competition") || identifier,
    group: readNumber(groupRow, "group"),
  }));

  const sizes: CompetitionSizeData[] = relatedRows(
    pickTable(database, COMPETITION_SIZE_TABLES),
    "competition",
    identifier
  ).map((sizeRow) => ({
    identifier: readIdentifier(sizeRow, 0),
    competition: readNumber(sizeRow, "competition") || identifier,
    round: readNumber(sizeRow, "round"),
    size: readNumber(sizeRow, "size"),
  }));

  const teams: CompetitionTeamData[] = relatedRows(
    pickTable(database, COMPETITION_TEAM_TABLES),
    "competition",
    identifier
  ).map((teamRow) => ({
    identifier: readIdentifier(teamRow, 0),
    competition: readNumber(teamRow, "competition") || identifier,
    team: readNumber(teamRow, "team"),
    type: readNumber(teamRow, "type"),
  }));

  return {
    detail: { competition, names, groups, sizes, teams },
    availableGroups: toNameOptions(database, GROUP_NAME_TABLES, "group"),
    availableTeams: toNameOptions(database, TEAM_NAME_TABLES, "team"),
  };
}

/** Formation record: row + its player positions, ordered by position index */
export function toFormationDetail(
  database: Database,
  identifier: number
): FormationDetail | null {
  const row = database[FORMATION_TABLE]?.[identifier];
  if (!row) {
    return null;
  }

  const formation: FormationData = {
    identifier: readIdentifier(row, identifier),
    name: readString(row, "name"),
    data: readImage(row, "data"),
  };

  const positions: FormationPositionData[] = relatedRows(
    pickTable(database, FORMATION_POSITION_TABLES),
    "formation",
    identifier
  )
    .map((positionRow) => ({
      identifier: readIdentifier(positionRow, 0),
      formation: readNumber(positionRow, "formation") || identifier,
      position: readNumber(positionRow, "position"),
      x: readNumber(positionRow, "x"),
      y: readNumber(positionRow, "y"),
      x_display: readNumber(positionRow, "x_display"),
      y_display: readNumber(positionRow, "y_display"),
    }))
    .sort(
      (left, right) =>
        left.position - right.position || left.identifier - right.identifier
    );

  return { formation, positions };
}

/** Row of the browsed table, `null` when the table or the key is missing */
function readTableRow(
  database: Database,
  config: BrowserTableConfig,
  identifier: number
): DatabaseRow | null {
  return database[config.tableName]?.[identifier] ?? null;
}

/**
 * Payload of the detail page opened for one browsed row, `null` when the row or
 * the browsed table is missing from the loaded database, and `null` for tables
 * without a `detailKind`.
 */
export function buildBrowserDetail(
  database: Database,
  config: BrowserTableConfig,
  identifier: number
): BrowserDetailPayload | null {
  const kind: BrowserDetailKind | null = config.detailKind;
  const row = kind ? readTableRow(database, config, identifier) : null;
  if (!kind || !row) {
    return null;
  }

  switch (kind) {
    case "player":
      return {
        kind,
        player: toPlayerData(row, identifier),
        clubOptions: toClubOptions(database),
      };
    case "team": {
      const team = toTeamRecord(database, identifier);
      return team
        ? {
            kind,
            team,
            playerOptions: toPlayerOptions(database),
            formationOptions: toFormationOptions(database),
            gloveOptions: toGloveOptions(database),
          }
        : null;
    }
    case "competition": {
      const lookup = toCompetitionDetail(database, identifier);
      return lookup
        ? {
            kind,
            competition: lookup.detail,
            availableGroups: lookup.availableGroups,
            availableTeams: lookup.availableTeams,
          }
        : null;
    }
    case "group": {
      const group = toGroupDetail(database, identifier);
      return group ? { kind, group, teamOptions: toTeamOptions(database) } : null;
    }
    case "formation": {
      const formation = toFormationDetail(database, identifier);
      return formation ? { kind, formation } : null;
    }
    case "ball":
      return { kind, ball: toBallData(row, identifier) };
  }
}
