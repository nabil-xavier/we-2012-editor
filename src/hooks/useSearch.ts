// src/hooks/useSearch.ts
import { useCallback } from "react";
import {
  searchCompetitions as runCompetitionSearch,
  searchFormations as runFormationSearch,
  searchGroups as runGroupSearch,
  searchPlayers as runPlayerSearch,
  searchTeams as runTeamSearch,
} from "@/services/search";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import type {
  CompetitionSearchItem,
  FormationSearchItem,
  GroupSearchItem,
  PlayerSearchItem,
  TeamSearchItem,
} from "@/types/search";

/** Search functions bound to the indexes currently held by the store */
export interface UseSearchResult {
  /** Fuzzy search players by `name`, `name_shorter` or `identifier` */
  searchPlayers: (query: string) => PlayerSearchItem[];
  /** Fuzzy search teams by `name_short` or `identifier` */
  searchTeams: (query: string) => TeamSearchItem[];
  /** Fuzzy search competition names by `value` or `identifier` */
  searchCompetitions: (query: string) => CompetitionSearchItem[];
  /** Fuzzy search group names by `value` or `identifier` */
  searchGroups: (query: string) => GroupSearchItem[];
  /** Fuzzy search formations by `name` or `identifier` */
  searchFormations: (query: string) => FormationSearchItem[];
  /** True once a database import has built at least one index */
  hasIndexes: boolean;
}

/** Run Fuse searches against the indexes built for the loaded database */
export function useSearch(): UseSearchResult {
  const playerIndex = useDatabaseStore((state) => state.search.playerIndex);
  const teamIndex = useDatabaseStore((state) => state.search.teamIndex);
  const competitionIndex = useDatabaseStore(
    (state) => state.search.competitionIndex
  );
  const groupIndex = useDatabaseStore((state) => state.search.groupIndex);
  const formationIndex = useDatabaseStore(
    (state) => state.search.formationIndex
  );

  const searchPlayers = useCallback(
    (query: string) => runPlayerSearch(playerIndex, query),
    [playerIndex]
  );
  const searchTeams = useCallback(
    (query: string) => runTeamSearch(teamIndex, query),
    [teamIndex]
  );
  const searchCompetitions = useCallback(
    (query: string) => runCompetitionSearch(competitionIndex, query),
    [competitionIndex]
  );
  const searchGroups = useCallback(
    (query: string) => runGroupSearch(groupIndex, query),
    [groupIndex]
  );
  const searchFormations = useCallback(
    (query: string) => runFormationSearch(formationIndex, query),
    [formationIndex]
  );

  const hasIndexes = Boolean(
    playerIndex || teamIndex || competitionIndex || groupIndex || formationIndex
  );

  return {
    searchPlayers,
    searchTeams,
    searchCompetitions,
    searchGroups,
    searchFormations,
    hasIndexes,
  };
}
