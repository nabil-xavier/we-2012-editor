// src/schema/index.ts
import { ball } from "./ball";
import {
  competition,
  competitionGroup,
  competitionName,
  competitionSize,
  competitionTeam,
} from "./competition";
import { formation, formationPosition } from "./formation";
import { group, groupName, groupTeam } from "./group";
import { player } from "./player";
import { referee } from "./referee";
import { team } from "./team";
import type { SchemaMap } from "@/types/schema";

export * from "./ball";
export * from "./competition";
export * from "./formation";
export * from "./group";
export * from "./player";
export * from "./referee";
export * from "./team";

/** Every table schema keyed by table name */
export const schemas: SchemaMap = {
  ball,

  competition,
  competitionGroup,
  competitionName,
  competitionSize,
  competitionTeam,

  formation,
  formationPosition,

  group,
  groupName,
  groupTeam,

  player,
  referee,

  team,
};
