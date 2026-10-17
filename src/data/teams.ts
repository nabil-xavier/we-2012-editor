// src/data/teams.ts
import type { SelectOption } from "@/types/select";

// ---------------------------------------------------------------------------
// Team static option lists (select / searchable-select sources)
// ---------------------------------------------------------------------------

/** Team category / classification index (0-4) */
export const TEAM_TYPE_OPTIONS: SelectOption[] = [
  { value: "0", label: "Type 0", description: "Team category index 0" },
  { value: "1", label: "Type 1", description: "Team category index 1" },
  { value: "2", label: "Type 2", description: "Team category index 2" },
  { value: "3", label: "Type 3", description: "Team category index 3" },
  { value: "4", label: "Type 4", description: "Team category index 4" },
];

/** Preset formation IDs */
export const TEAM_FORMATION_OPTIONS: SelectOption[] = [
  { value: "1", label: "1 - 4-4-2" },
  { value: "2", label: "2 - 4-3-3" },
  { value: "3", label: "3 - 3-5-2" },
  { value: "4", label: "4 - 5-3-2" },
  { value: "5", label: "5 - 4-2-3-1" },
];

/** Default team glove indices */
export const TEAM_GLOVE_OPTIONS: SelectOption[] = [
  { value: "1", label: "1 - Glove 1" },
  { value: "2", label: "2 - Glove 2" },
  { value: "3", label: "3 - Glove 3" },
  { value: "4", label: "4 - Glove 4" },
  { value: "5", label: "5 - Glove 5" },
  { value: "6", label: "6 - Glove 6" },
  { value: "7", label: "7 - Glove 7" },
  { value: "8", label: "8 - Glove 8" },
];

/** Kit type: 0 = Home Kit, 1 = Away Kit */
export const TEAM_KIT_TYPE_OPTIONS: SelectOption[] = [
  { value: "0", label: "0 - Home Kit" },
  { value: "1", label: "1 - Away Kit" },
];
