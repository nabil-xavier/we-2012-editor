// src/schema/referee.ts
import type { TableSchema } from "@/types/schema";

/**
 * Referee table.
 *
 * NOTE: no referee data exists in the project yet (no type, component or dummy
 * record references it), so only the columns that are certain to exist are
 * declared here. Extend once the real WE-2012 columns are confirmed.
 */
export const referee: TableSchema = {
  identifier: {
    type: "integer",
  },

  name: {
    type: "string",
  },

  name_shorter: {
    type: "string",
    length: 4,
  },
};
