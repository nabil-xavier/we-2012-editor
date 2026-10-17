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

/** Kit type: 0 = Home Kit, 1 = Away Kit */
export const TEAM_KIT_TYPE_OPTIONS: SelectOption[] = [
  { value: "0", label: "0 - Home Kit" },
  { value: "1", label: "1 - Away Kit" },
];
