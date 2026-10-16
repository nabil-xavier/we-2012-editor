// src/types/formation.ts

export interface FormationData {
  /** Identifier of the formation */
  identifier: number;
  /** Name of the formation */
  name: string;
  /** Blob image data (Base64 string or URL) */
  data: string | null;
}

export interface FormationPositionData {
  /** Identifier for the position record */
  identifier: number;
  /** Formation ID this position belongs to */
  formation: number;
  /** Position index (2‑11) */
  position: number;
  /** X coordinate (0‑255) */
  x: number;
  /** Y coordinate (0‑255) */
  y: number;
  /** Display X coordinate (0‑255) */
  x_display: number;
  /** Display Y coordinate (0‑255) */
  y_display: number;
}

export interface FormationDetail {
  /** Core formation information */
  formation: FormationData;
  /** Positions belonging to the formation */
  positions: FormationPositionData[];
}
