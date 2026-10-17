// src/types/ball.ts

export interface BallData {
  /** Identifier of the ball */
  identifier: number;
  /** Name of the ball */
  name: string;
  /** Type of the ball */
  type: number;
  /** Icon image (Base64 string or URL) */
  icon: string | null;
  /** Texture image (Base64 string or URL) */
  texture: string | null;
}
