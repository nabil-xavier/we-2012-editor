/**
 * Comprehensive player data interface matching Winning Eleven 2012 / PES database structure.
 */
export interface PlayerData {
  // Identity
  identifier?: number;
  name?: string;
  name_shorter?: string;
  age?: number;
  height?: number;
  price?: number;

  // Appearance
  hair_color?: number;
  hair_model?: number;
  skin?: number;
  shoe?: number;

  // Preferred Foot: 0 = Right Foot, 1 = Left Foot
  foot?: boolean | number;

  // Position
  side?: number; // 0-2 (0: Right, 1: Left, 2: Both)
  position?: number; // 0-11
  position_flag?: number;

  // Offensive
  attack?: number; // 0-99
  teamwork?: number; // 0-99
  aggression?: number; // 0-99

  // Defensive
  defense?: number; // 0-99

  // Speed & Movement
  speed?: number; // 0-99
  acceleration?: number; // 0-99
  agility?: number; // 0-99
  balance?: number; // 0-99
  stamina?: number; // 0-99
  response?: number; // 0-99
  jump?: number; // 0-99

  // Dribbling & Technique
  technique?: number; // 0-99
  dribble_accuracy?: number; // 0-99
  dribble_speed?: number; // 0-99
  swerve?: number; // 0-99

  // Passing
  pass_short_accuracy?: number; // 0-99
  pass_short_speed?: number; // 0-99
  pass_long_accuracy?: number; // 0-99
  pass_long_speed?: number; // 0-99

  // Shooting
  shot_accuracy?: number; // 0-99
  shot_power?: number; // 0-99
  shot_technique?: number; // 0-99
  freekick_accuracy?: number; // 0-99

  // Aerial
  header?: number; // 0-99

  // Goalkeeper
  keeper?: number; // 0-99

  // Weak Foot
  foot_weak_accuracy?: number; // 0-8
  foot_weak_frequency?: number; // 0-8

  // Mental
  form?: number; // 0-8
  tenacity?: number; // 0-99

  // Index and raw metadata
  index?: number;
}
