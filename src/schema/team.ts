// src/schema/team.ts
import type { TableSchema } from "@/types/schema";

export const team: TableSchema = {
  identifier: {
    type: "integer",
  },

  name_short: {
    type: "string",
    required: true,
    length: 3,
  },

  type: {
    type: "integer",
    min: 0,
    max: 4,
  },

  flag_32: {
    type: "image",
  },

  flag_64: {
    type: "image",
  },

  flag_128: {
    type: "image",
  },

  formation: {
    type: "relation",
    target: "formation",
  },

  glove: {
    type: "relation",
    target: "team_glove",
  },

  captain: {
    type: "relation",
    target: "player",
  },

  kick_corner_left: {
    type: "relation",
    target: "player",
  },

  kick_corner_right: {
    type: "relation",
    target: "player",
  },

  kick_free_long: {
    type: "relation",
    target: "player",
  },

  kick_free_short: {
    type: "relation",
    target: "player",
  },

  kick_penalty: {
    type: "relation",
    target: "player",
  },

  hexagon_attack: {
    type: "number",
    min: 0,
    max: 255,
  },

  hexagon_defense: {
    type: "number",
    min: 0,
    max: 255,
  },

  hexagon_shot_power: {
    type: "number",
    min: 0,
    max: 255,
  },

  hexagon_speed: {
    type: "number",
    min: 0,
    max: 255,
  },

  hexagon_stamina: {
    type: "number",
    min: 0,
    max: 255,
  },

  hexagon_technique: {
    type: "number",
    min: 0,
    max: 255,
  },

  hexagon_mean: {
    type: "number",
    readonly: true,
  },
};
