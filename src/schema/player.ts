// src/schema/player.ts
import type { TableSchema } from "@/types/schema";

/**
 * Player table, mirroring `PlayerData` in `src/types/player.ts`.
 * `club` is kept as `string` because the current model stores the club name.
 */
export const player: TableSchema = {
  // Identity
  identifier: {
    type: "integer",
  },

  name: {
    type: "string",
  },

  name_shorter: {
    type: "string",
  },

  club: {
    type: "string",
  },

  age: {
    type: "integer",
  },

  height: {
    type: "integer",
  },

  price: {
    type: "integer",
  },

  // Appearance
  hair_color: {
    type: "integer",
  },

  hair_model: {
    type: "integer",
  },

  skin: {
    type: "integer",
  },

  shoe: {
    type: "integer",
  },

  // Preferred foot: 0 = Right Foot, 1 = Left Foot
  foot: {
    type: "enum",
    options: {
      0: "Right Foot",
      1: "Left Foot",
    },
  },

  // Position
  side: {
    type: "integer",
    min: 0,
    max: 2,
  },

  position: {
    type: "integer",
    min: 0,
    max: 11,
  },

  position_flag: {
    type: "integer",
  },

  // Offensive
  attack: {
    type: "integer",
    min: 0,
    max: 99,
  },

  teamwork: {
    type: "integer",
    min: 0,
    max: 99,
  },

  aggression: {
    type: "integer",
    min: 0,
    max: 99,
  },

  // Defensive
  defense: {
    type: "integer",
    min: 0,
    max: 99,
  },

  // Speed & movement
  speed: {
    type: "integer",
    min: 0,
    max: 99,
  },

  acceleration: {
    type: "integer",
    min: 0,
    max: 99,
  },

  agility: {
    type: "integer",
    min: 0,
    max: 99,
  },

  balance: {
    type: "integer",
    min: 0,
    max: 99,
  },

  stamina: {
    type: "integer",
    min: 0,
    max: 99,
  },

  response: {
    type: "integer",
    min: 0,
    max: 99,
  },

  jump: {
    type: "integer",
    min: 0,
    max: 99,
  },

  // Dribbling & technique
  technique: {
    type: "integer",
    min: 0,
    max: 99,
  },

  dribble_accuracy: {
    type: "integer",
    min: 0,
    max: 99,
  },

  dribble_speed: {
    type: "integer",
    min: 0,
    max: 99,
  },

  swerve: {
    type: "integer",
    min: 0,
    max: 99,
  },

  // Passing
  pass_short_accuracy: {
    type: "integer",
    min: 0,
    max: 99,
  },

  pass_short_speed: {
    type: "integer",
    min: 0,
    max: 99,
  },

  pass_long_accuracy: {
    type: "integer",
    min: 0,
    max: 99,
  },

  pass_long_speed: {
    type: "integer",
    min: 0,
    max: 99,
  },

  // Shooting
  shot_accuracy: {
    type: "integer",
    min: 0,
    max: 99,
  },

  shot_power: {
    type: "integer",
    min: 0,
    max: 99,
  },

  shot_technique: {
    type: "integer",
    min: 0,
    max: 99,
  },

  freekick_accuracy: {
    type: "integer",
    min: 0,
    max: 99,
  },

  // Aerial
  header: {
    type: "integer",
    min: 0,
    max: 99,
  },

  // Goalkeeper
  keeper: {
    type: "integer",
    min: 0,
    max: 99,
  },

  // Weak foot
  foot_weak_accuracy: {
    type: "integer",
    min: 0,
    max: 8,
  },

  foot_weak_frequency: {
    type: "integer",
    min: 0,
    max: 8,
  },

  // Mental
  form: {
    type: "integer",
    min: 0,
    max: 8,
  },

  tenacity: {
    type: "integer",
    min: 0,
    max: 99,
  },

  // Raw metadata
  index: {
    type: "integer",
  },
};
