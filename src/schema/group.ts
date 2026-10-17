// src/schema/group.ts
import type { TableSchema } from "@/types/schema";

export const group: TableSchema = {
  identifier: {
    type: "integer",
  },

  logo: {
    type: "image",
  },
};

export const groupName: TableSchema = {
  identifier: {
    type: "integer",
  },

  group: {
    type: "relation",
    target: "group",
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

export const groupTeam: TableSchema = {
  identifier: {
    type: "integer",
  },

  group: {
    type: "relation",
    target: "group",
  },

  team: {
    type: "relation",
    target: "team",
  },
};
