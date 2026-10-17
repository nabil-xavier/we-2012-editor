// src/schema/competition.ts
import type { TableSchema } from "@/types/schema";

export const competition: TableSchema = {
  identifier: {
    type: "integer",
  },

  /**
   * Type:
   * 0 = Cup
   * 1 = League
   * 2 = UEFA
   * 4 = Super Challenge
   * 5 = Copa Santander Libertadores
   */
  type: {
    type: "integer",
  },

  banner_480: {
    type: "image",
  },

  banner_960: {
    type: "image",
  },

  cup: {
    type: "image",
  },

  logo_64: {
    type: "image",
  },

  logo_128: {
    type: "image",
  },

  logo_256: {
    type: "image",
  },

  color: {
    type: "integer",
  },

  card: {
    type: "integer",
  },

  leg: {
    type: "integer",
  },

  qualification: {
    type: "integer",
  },

  /**
   * Lock toggle:
   * 0 = Off
   * 1 = On
   */
  lock: {
    type: "integer",
    min: 0,
    max: 1,
  },
};

export const competitionName: TableSchema = {
  identifier: {
    type: "integer",
  },

  competition: {
    type: "relation",
    target: "competition",
  },

  language: {
    type: "enum",
    options: {
      0: "English",
      1: "Alternative",
    },
  },

  value: {
    type: "string",
  },
};

export const competitionGroup: TableSchema = {
  identifier: {
    type: "integer",
  },

  competition: {
    type: "relation",
    target: "competition",
  },

  group: {
    type: "relation",
    target: "group",
  },
};

export const competitionSize: TableSchema = {
  identifier: {
    type: "integer",
  },

  competition: {
    type: "relation",
    target: "competition",
  },

  round: {
    type: "integer",
  },

  size: {
    type: "integer",
  },
};

export const competitionTeam: TableSchema = {
  identifier: {
    type: "integer",
  },

  competition: {
    type: "relation",
    target: "competition",
  },

  team: {
    type: "relation",
    target: "team",
  },

  /**
   * Type:
   * 0 = Type 0
   * 1 = Type 1
   * 2 = Type 2
   */
  type: {
    type: "integer",
    min: 0,
    max: 2,
  },
};
