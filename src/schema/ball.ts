// src/schema/ball.ts
import type { TableSchema } from "@/types/schema";

export const ball: TableSchema = {
  identifier: {
    type: "integer",
  },

  name: {
    type: "string",
  },

  type: {
    type: "integer",
  },

  icon: {
    type: "image",
  },

  texture: {
    type: "image",
  },
};
