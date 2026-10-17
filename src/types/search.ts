// src/types/search.ts
import type Fuse from "fuse.js";

/** Searchable player record — source table `player` */
export interface PlayerSearchItem {
  identifier: number;
  name: string;
  name_shorter: string;
}

/** Searchable team record — source table `team` */
export interface TeamSearchItem {
  identifier: number;
  name_short: string;
}

/** Searchable competition name — source table `competition_name` */
export interface CompetitionSearchItem {
  identifier: number;
  value: string;
}

/** Searchable group name — source table `group_name` */
export interface GroupSearchItem {
  identifier: number;
  value: string;
}

/** Searchable formation — source table `formation` */
export interface FormationSearchItem {
  identifier: number;
  name: string;
}

export type PlayerSearchIndex = Fuse<PlayerSearchItem>;
export type TeamSearchIndex = Fuse<TeamSearchItem>;
export type CompetitionSearchIndex = Fuse<CompetitionSearchItem>;
export type GroupSearchIndex = Fuse<GroupSearchItem>;
export type FormationSearchIndex = Fuse<FormationSearchItem>;

/** Every search index kept in the store, `null` until built */
export interface SearchIndexes {
  playerIndex: PlayerSearchIndex | null;
  teamIndex: TeamSearchIndex | null;
  competitionIndex: CompetitionSearchIndex | null;
  groupIndex: GroupSearchIndex | null;
  formationIndex: FormationSearchIndex | null;
}

/** Field name of one search index inside `SearchIndexes` */
export type SearchIndexKey = keyof SearchIndexes;
