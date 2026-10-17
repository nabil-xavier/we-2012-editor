// src/data/competitions.ts
import type {
  CompetitionData,
  CompetitionDetail,
} from "@/types/competition";

// ---------------------------------------------------------------------------
// Select options
// ---------------------------------------------------------------------------
export const COMPETITION_TYPE_OPTIONS = [
  { value: 0, label: "Cup" },
  { value: 1, label: "League" },
  { value: 2, label: "UEFA" },
  { value: 4, label: "Super Challenge" },
  { value: 5, label: "Copa Santander Libertadores" },
] as const;

export const COMPETITION_LANGUAGE_OPTIONS = [
  { value: 0, label: "English" },
  { value: 1, label: "Alternative Language" },
] as const;

export const COMPETITION_TEAM_TYPE_OPTIONS = [
  { value: 0, label: "Type 0" },
  { value: 1, label: "Type 1" },
  { value: 2, label: "Type 2" },
] as const;

// ---------------------------------------------------------------------------
// Dropdown source lists (searchable selects)
// ---------------------------------------------------------------------------
export const DEFAULT_AVAILABLE_GROUPS: { identifier: number; name: string }[] = [
  { identifier: 1, name: "Group 1 (Group A)" },
  { identifier: 2, name: "Group 2 (Group B)" },
  { identifier: 3, name: "Group 3 (Group C)" },
  { identifier: 4, name: "Group 4 (Group D)" },
];

export const DEFAULT_AVAILABLE_TEAMS: { identifier: number; name: string }[] = [
  { identifier: 101, name: "101 - FC Barcelona" },
  { identifier: 102, name: "102 - Real Madrid" },
  { identifier: 103, name: "103 - Atletico Madrid" },
  { identifier: 104, name: "104 - Manchester United" },
  { identifier: 105, name: "105 - Chelsea FC" },
  { identifier: 106, name: "106 - Arsenal FC" },
  { identifier: 107, name: "107 - Liverpool FC" },
  { identifier: 108, name: "108 - FC Bayern München" },
  { identifier: 109, name: "109 - Juventus" },
  { identifier: 110, name: "110 - AC Milan" },
];

// ---------------------------------------------------------------------------
// Dummy competition data for demonstration
// ---------------------------------------------------------------------------
export type CompetitionRow = CompetitionData & {
  name: string;
  type_label: string;
  teams_count: number;
} & Record<string, unknown>;

export const DUMMY_COMPETITIONS: CompetitionRow[] = [
  {
    identifier: 1,
    type: 1,
    name: "Premier League",
    type_label: "League",
    teams_count: 20,
    banner_480: null,
    banner_960: null,
    cup: null,
    logo_64: null,
    logo_128: null,
    logo_256: null,
    color: 1,
    card: 1,
    leg: 2,
    qualification: 4,
    lock: 0,
  },
  {
    identifier: 2,
    type: 2,
    name: "UEFA Champions League",
    type_label: "UEFA",
    teams_count: 32,
    banner_480: null,
    banner_960: null,
    cup: null,
    logo_64: null,
    logo_128: null,
    logo_256: null,
    color: 2,
    card: 2,
    leg: 2,
    qualification: 2,
    lock: 1,
  },
  {
    identifier: 3,
    type: 5,
    name: "Copa Santander Libertadores",
    type_label: "Copa Santander Libertadores",
    teams_count: 38,
    banner_480: null,
    banner_960: null,
    cup: null,
    logo_64: null,
    logo_128: null,
    logo_256: null,
    color: 3,
    card: 1,
    leg: 2,
    qualification: 3,
    lock: 0,
  },
];

export const DUMMY_COMPETITION_DETAILS: Record<number, CompetitionDetail> = {
  1: {
    competition: {
      identifier: 1,
      type: 1,
      banner_480: null,
      banner_960: null,
      cup: null,
      logo_64: null,
      logo_128: null,
      logo_256: null,
      color: 1,
      card: 1,
      leg: 2,
      qualification: 4,
      lock: 0,
    },
    names: [
      { identifier: 1, competition: 1, language: 0, value: "Premier League" },
      { identifier: 2, competition: 1, language: 1, value: "Liga Premier" },
    ],
    groups: [
      { identifier: 1, competition: 1, group: 1 },
      { identifier: 2, competition: 1, group: 2 },
    ],
    sizes: [
      { identifier: 1, competition: 1, round: 1, size: 20 },
      { identifier: 2, competition: 1, round: 2, size: 38 },
    ],
    teams: [
      { identifier: 1, competition: 1, team: 101, type: 0 },
      { identifier: 2, competition: 1, team: 102, type: 1 },
      { identifier: 3, competition: 1, team: 103, type: 2 },
    ],
  },
  2: {
    competition: {
      identifier: 2,
      type: 2,
      banner_480: null,
      banner_960: null,
      cup: null,
      logo_64: null,
      logo_128: null,
      logo_256: null,
      color: 2,
      card: 2,
      leg: 2,
      qualification: 2,
      lock: 1,
    },
    names: [
      { identifier: 3, competition: 2, language: 0, value: "UEFA Champions League" },
      { identifier: 4, competition: 2, language: 1, value: "Ligue des Champions" },
    ],
    groups: [
      { identifier: 3, competition: 2, group: 1 },
      { identifier: 4, competition: 2, group: 2 },
      { identifier: 5, competition: 2, group: 3 },
      { identifier: 6, competition: 2, group: 4 },
    ],
    sizes: [
      { identifier: 3, competition: 2, round: 1, size: 32 },
      { identifier: 4, competition: 2, round: 2, size: 16 },
    ],
    teams: [
      { identifier: 4, competition: 2, team: 101, type: 0 },
      { identifier: 5, competition: 2, team: 102, type: 0 },
    ],
  },
  3: {
    competition: {
      identifier: 3,
      type: 5,
      banner_480: null,
      banner_960: null,
      cup: null,
      logo_64: null,
      logo_128: null,
      logo_256: null,
      color: 3,
      card: 1,
      leg: 2,
      qualification: 3,
      lock: 0,
    },
    names: [
      { identifier: 5, competition: 3, language: 0, value: "Copa Santander Libertadores" },
    ],
    groups: [
      { identifier: 7, competition: 3, group: 1 },
    ],
    sizes: [
      { identifier: 5, competition: 3, round: 1, size: 38 },
    ],
    teams: [
      { identifier: 6, competition: 3, team: 103, type: 1 },
    ],
  },
};

/** Default detail used when no competition is supplied to the detail view. */
export const DUMMY_COMPETITION_DETAIL: CompetitionDetail =
  DUMMY_COMPETITION_DETAILS[1];
