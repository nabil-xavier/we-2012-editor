// src/data/players.ts
import type { SelectOption } from "@/types/select";

// ---------------------------------------------------------------------------
// Player pick list used by team captain / squad selects
// ---------------------------------------------------------------------------
export const PLAYER_OPTIONS: SelectOption[] = [
  { value: "1001", label: "1001 - Lionel Messi", description: "FC Barcelona" },
  { value: "1002", label: "1002 - Cristiano Ronaldo", description: "Real Madrid" },
  { value: "1003", label: "1003 - Xavi Hernandez", description: "FC Barcelona" },
  { value: "1004", label: "1004 - Andres Iniesta", description: "FC Barcelona" },
  { value: "1005", label: "1005 - Iker Casillas", description: "Real Madrid" },
  { value: "1006", label: "1006 - Carles Puyol", description: "FC Barcelona" },
  { value: "1007", label: "1007 - Sergio Ramos", description: "Real Madrid" },
  { value: "1008", label: "1008 - Wayne Rooney", description: "Manchester United" },
  { value: "1009", label: "1009 - Robin van Persie", description: "Arsenal FC" },
  { value: "1010", label: "1010 - Frank Lampard", description: "Chelsea FC" },
  { value: "1011", label: "1011 - Steven Gerrard", description: "Liverpool FC" },
  { value: "1012", label: "1012 - Andrea Pirlo", description: "Juventus" },
];
