// src/types/competition.ts

export interface CompetitionData {
  identifier: number;
  /**
   * Type:
   * 0 = Cup
   * 1 = League
   * 2 = UEFA
   * 4 = Super Challenge
   * 5 = Copa Santander Libertadores
   */
  type: number;
  banner_480: string | null;
  banner_960: string | null;
  cup: string | null;
  logo_64: string | null;
  logo_128: string | null;
  logo_256: string | null;
  color: number;
  card: number;
  leg: number;
  qualification: number;
  /**
   * Lock toggle:
   * 0 = Off
   * 1 = On
   */
  lock: number;
}

export interface CompetitionNameData {
  identifier: number;
  competition: number;
  /**
   * Language:
   * 0 = English
   * 1 = Alternative Language
   */
  language: number;
  value: string;
}

export interface CompetitionGroupData {
  identifier: number;
  competition: number;
  /** References group.identifier */
  group: number;
}

export interface CompetitionSizeData {
  identifier: number;
  competition: number;
  round: number;
  size: number;
}

export interface CompetitionTeamData {
  identifier: number;
  competition: number;
  /** References team.identifier */
  team: number;
  /**
   * Type:
   * 0 = Type 0
   * 1 = Type 1
   * 2 = Type 2
   */
  type: number;
}

export interface CompetitionDetail {
  competition: CompetitionData;
  names: CompetitionNameData[];
  groups: CompetitionGroupData[];
  sizes: CompetitionSizeData[];
  teams: CompetitionTeamData[];
}
