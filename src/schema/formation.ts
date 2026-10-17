// src/schema/formation.ts
import type { TableSchema } from "@/types/schema";

export const formation: TableSchema = {
  identifier: {
    type: "integer",
  },

  name: {
    type: "string",
  },

  data: {
    type: "image",
  },
};

export const formationPosition: TableSchema = {
  identifier: {
    type: "integer",
  },

  formation: {
    type: "relation",
    target: "formation",
  },

  position: {
    type: "number",
    min: 2,
    max: 11,
  },

  x: {
    type: "number",
    min: 0,
    max: 255,
  },

  y: {
    type: "number",
    min: 0,
    max: 255,
  },

  x_display: {
    type: "number",
    min: 0,
    max: 255,
  },

  y_display: {
    type: "number",
    min: 0,
    max: 255,
  },
};
