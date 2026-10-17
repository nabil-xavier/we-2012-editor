// src/types/group.ts
export interface GroupData {
  /** Identifier of the group */
  identifier: number;
  /** Logo image (Base64 string or URL) */
  logo: string | null;
  /**
   * Language code:
   * 0 = English
   * 1 = Alternative Language
   */
  language: number;
  /** Translated name value */
  value: string;
}
export interface GroupNameData {
  /** Identifier of the group name record */
  identifier: number;
  /** Group ID this name belongs to */
  group: number;
}
export interface GroupTeamData {
  /** Identifier of the group team record */
  identifier: number;
  /** Group ID this team belongs to */
  group: number;
  /** Team ID */
  team: number;
}
export interface GroupDetail {
  /** Core group information */
  group: GroupData;
  /** Team entries for this group */
  teams: GroupTeamData[];
}