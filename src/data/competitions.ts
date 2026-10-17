// src/data/competitions.ts

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

