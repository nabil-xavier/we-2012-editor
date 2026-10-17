/**
 * Data structures for Winning Eleven 2012 / PES team records and related entities.
 */

export interface TeamData {
  identifier?: number;
  name_short?: string; // required, exactly 3 characters
  type?: number; // 0-4
  flag_32?: string | null; // blob image (data URL or base64)
  flag_64?: string | null; // blob image (data URL or base64)
  flag_128?: string | null; // blob image (data URL or base64)
  formation?: number;
  glove?: number;
  captain?: number;
  kick_corner_left?: number;
  kick_corner_right?: number;
  kick_free_long?: number;
  kick_free_short?: number;
  kick_penalty?: number;
  hexagon_attack?: number; // 0-255
  hexagon_defense?: number; // 0-255
  hexagon_shot_power?: number; // 0-255
  hexagon_speed?: number; // 0-255
  hexagon_stamina?: number; // 0-255
  hexagon_technique?: number; // 0-255
  hexagon_mean?: number; // read-only, auto-calculated from all 6 hexagon stats
}

export interface TeamGloveData {
  identifier?: number;
  data?: string | null; // blob image
}

export interface TeamNameData {
  identifier?: number;
  team?: number;
  language?: number; // 0 = English, 1 = Alternative Language
  value?: string;
  value_shorter?: string; // read-only, mirrors value
}

export interface TeamPlayerData {
  identifier?: number;
  team?: number;
  player?: number;
  number?: number; // 1-99
}

export interface TeamStyleData {
  identifier?: number;
  team?: number;
  type?: number; // 0 = Home Kit, 1 = Away Kit
  map?: number;
  text_player?: number;
  text_keeper?: number;
  uniform_player?: string | null; // blob image
  uniform_keeper?: string | null; // blob image
}

export interface FullTeamRecord {
  team: TeamData;
  glove?: TeamGloveData;
  names?: TeamNameData[];
  players?: TeamPlayerData[];
  styles?: TeamStyleData[];
}
