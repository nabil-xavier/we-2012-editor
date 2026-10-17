import { Suspense, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { DatabaseBrowser } from "@/components/DatabaseBrowser";
import { DatabaseRecordDetail } from "@/components/DatabaseRecordDetail";
import { DetailLoading } from "@/components/DetailLoading";
import {
  LazyBallDetail,
  LazyCompetitionDetail,
  LazyFormationDetail,
  LazyGroupDetail,
  LazyPlayerDetail,
  LazyTeamDetail,
} from "@/components/LazyDetailPages";
import { getBrowserTableConfig } from "@/data/table-browsers";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import type { PlayerData } from "@/types/player";
import type { FullTeamRecord } from "@/types/team";
import type { FormationDetail as FormationDetailType, FormationData } from "@/types/formation";
import type { BallData } from "@/types/ball";
import type { GroupDetail as GroupDetailType, GroupData } from "@/types/group";
import type { CompetitionDetail as CompetitionDetailType, CompetitionData } from "@/types/competition";
import {
  DUMMY_COMPETITIONS,
  DUMMY_COMPETITION_DETAILS,
} from "@/data/competitions";

// ---------------------------------------------------------------------------
// Column definitions matching PlayerData attributes
// ---------------------------------------------------------------------------
const PLAYER_COLUMNS: DataTableColumn[] = [
  { key: "identifier", title: "ID" },
  { key: "name", title: "Name" },
  { key: "name_shorter", title: "Short Name" },
  { key: "club", title: "Club" },
  { key: "age", title: "Age" },
  { key: "height", title: "Height" },
  { key: "attack", title: "Attack" },
  { key: "speed", title: "Speed" },
];

const TEAM_COLUMNS: DataTableColumn[] = [
  { key: "identifier", title: "ID" },
  { key: "name_short", title: "Code" },
  { key: "name", title: "Team Name" },
  { key: "type_label", title: "Category" },
  { key: "mean", title: "Hexagon Mean" },
];

const FORMATION_COLUMNS: DataTableColumn[] = [
  { key: "identifier", title: "ID" },
  { key: "name", title: "Name" },
];

const BALL_COLUMNS: DataTableColumn[] = [
  { key: "identifier", title: "ID" },
  { key: "name", title: "Name" },
  { key: "type", title: "Type" },
];

const GROUP_COLUMNS: DataTableColumn[] = [
  { key: "identifier", title: "ID" },
];

const COMPETITION_COLUMNS: DataTableColumn[] = [
  { key: "identifier", title: "ID" },
  { key: "name", title: "Competition Name" },
  { key: "type_label", title: "Type" },
  { key: "teams_count", title: "Teams" },
];

// ---------------------------------------------------------------------------
// Real WE-2012 sample players
// ---------------------------------------------------------------------------
const DUMMY_PLAYERS: (PlayerData & Record<string, unknown>)[] = [
  {
    identifier: 1001,
    name: "Lionel Messi",
    name_shorter: "L. MESSI",
    club: "FC Barcelona",
    age: 24,
    height: 169,
    price: 50000000,
    hair_color: 1,
    hair_model: 12,
    skin: 1,
    shoe: 5,
    foot: 1, // Left
    side: 2,
    position: 10,
    position_flag: 1,
    attack: 97,
    defense: 45,
    teamwork: 88,
    aggression: 92,
    speed: 90,
    acceleration: 96,
    agility: 95,
    balance: 86,
    stamina: 84,
    response: 95,
    jump: 76,
    technique: 96,
    dribble_accuracy: 97,
    dribble_speed: 92,
    swerve: 89,
    pass_short_accuracy: 90,
    pass_short_speed: 85,
    pass_long_accuracy: 86,
    pass_long_speed: 82,
    shot_accuracy: 94,
    shot_power: 84,
    shot_technique: 95,
    freekick_accuracy: 91,
    header: 72,
    keeper: 50,
    foot_weak_accuracy: 6,
    foot_weak_frequency: 5,
    form: 7,
    tenacity: 85,
  },
  {
    identifier: 1002,
    name: "Cristiano Ronaldo",
    name_shorter: "C. RONALDO",
    club: "Real Madrid",
    age: 26,
    height: 186,
    price: 48000000,
    hair_color: 2,
    hair_model: 8,
    skin: 2,
    shoe: 3,
    foot: 0, // Right
    side: 2,
    position: 11,
    position_flag: 1,
    attack: 96,
    defense: 42,
    teamwork: 80,
    aggression: 94,
    speed: 94,
    acceleration: 92,
    agility: 88,
    balance: 88,
    stamina: 88,
    response: 93,
    jump: 92,
    technique: 93,
    dribble_accuracy: 94,
    dribble_speed: 91,
    swerve: 85,
    pass_short_accuracy: 82,
    pass_short_speed: 84,
    pass_long_accuracy: 78,
    pass_long_speed: 82,
    shot_accuracy: 92,
    shot_power: 95,
    shot_technique: 94,
    freekick_accuracy: 89,
    header: 88,
    keeper: 50,
    foot_weak_accuracy: 7,
    foot_weak_frequency: 6,
    form: 8,
    tenacity: 90,
  },
  {
    identifier: 1003,
    name: "Xavi Hernandez",
    name_shorter: "XAVI",
    club: "FC Barcelona",
    age: 31,
    height: 170,
    price: 35000000,
    hair_color: 1,
    hair_model: 4,
    skin: 1,
    shoe: 2,
    foot: 0, // Right
    side: 2,
    position: 7,
    position_flag: 1,
    attack: 85,
    defense: 68,
    teamwork: 96,
    aggression: 75,
    speed: 76,
    acceleration: 78,
    agility: 82,
    balance: 78,
    stamina: 86,
    response: 85,
    jump: 68,
    technique: 97,
    dribble_accuracy: 93,
    dribble_speed: 78,
    swerve: 88,
    pass_short_accuracy: 98,
    pass_short_speed: 90,
    pass_long_accuracy: 97,
    pass_long_speed: 88,
    shot_accuracy: 78,
    shot_power: 79,
    shot_technique: 82,
    freekick_accuracy: 87,
    header: 64,
    keeper: 50,
    foot_weak_accuracy: 6,
    foot_weak_frequency: 6,
    form: 7,
    tenacity: 82,
  },
  {
    identifier: 1004,
    name: "Andres Iniesta",
    name_shorter: "INIESTA",
    club: "FC Barcelona",
    age: 27,
    height: 171,
    price: 40000000,
    hair_color: 1,
    hair_model: 2,
    skin: 1,
    shoe: 1,
    foot: 0, // Right
    side: 2,
    position: 8,
    position_flag: 1,
    attack: 89,
    defense: 62,
    teamwork: 94,
    aggression: 80,
    speed: 82,
    acceleration: 85,
    agility: 92,
    balance: 84,
    stamina: 84,
    response: 88,
    jump: 70,
    technique: 97,
    dribble_accuracy: 96,
    dribble_speed: 88,
    swerve: 86,
    pass_short_accuracy: 96,
    pass_short_speed: 88,
    pass_long_accuracy: 92,
    pass_long_speed: 84,
    shot_accuracy: 82,
    shot_power: 76,
    shot_technique: 86,
    freekick_accuracy: 82,
    header: 65,
    keeper: 50,
    foot_weak_accuracy: 7,
    foot_weak_frequency: 6,
    form: 7,
    tenacity: 84,
  },
];

// ---------------------------------------------------------------------------
// Sample WE-2012 Teams
// ---------------------------------------------------------------------------
const DUMMY_TEAMS: (FullTeamRecord & Record<string, unknown>)[] = [
  {
    identifier: 101,
    name_short: "FCB",
    name: "FC Barcelona",
    type_label: "Club Team (1)",
    mean: 223,
    team: {
      identifier: 101,
      name_short: "FCB",
      type: 1,
      formation: 4,
      glove: 1,
      captain: 1001,
      kick_corner_left: 1001,
      kick_corner_right: 1003,
      kick_free_long: 1003,
      kick_free_short: 1001,
      kick_penalty: 1001,
      hexagon_attack: 215,
      hexagon_defense: 175,
      hexagon_shot_power: 195,
      hexagon_speed: 210,
      hexagon_stamina: 200,
      hexagon_technique: 245,
    },
    names: [
      { identifier: 1, team: 101, language: 0, value: "FC Barcelona", value_shorter: "FC Barcelona" },
      { identifier: 2, team: 101, language: 1, value: "Barça", value_shorter: "Barça" },
    ],
    players: [
      { identifier: 1, team: 101, player: 1001, number: 10 },
      { identifier: 2, team: 101, player: 1003, number: 6 },
      { identifier: 3, team: 101, player: 1004, number: 8 },
    ],
    styles: [
      { identifier: 1, team: 101, type: 0, map: 1, text_player: 1, text_keeper: 1 },
      { identifier: 2, team: 101, type: 1, map: 2, text_player: 2, text_keeper: 2 },
    ],
  },
  {
    identifier: 102,
    name_short: "RMA",
    name: "Real Madrid",
    type_label: "Club Team (1)",
    mean: 220,
    team: {
      identifier: 102,
      name_short: "RMA",
      type: 1,
      formation: 2,
      glove: 2,
      captain: 1002,
      kick_corner_left: 1002,
      kick_corner_right: 1002,
      kick_free_long: 1002,
      kick_free_short: 1002,
      kick_penalty: 1002,
      hexagon_attack: 225,
      hexagon_defense: 180,
      hexagon_shot_power: 230,
      hexagon_speed: 220,
      hexagon_stamina: 205,
      hexagon_technique: 210,
    },
    names: [
      { identifier: 3, team: 102, language: 0, value: "Real Madrid", value_shorter: "Real Madrid" },
      { identifier: 4, team: 102, language: 1, value: "Los Blancos", value_shorter: "Los Blancos" },
    ],
    players: [
      { identifier: 4, team: 102, player: 1002, number: 7 },
    ],
    styles: [
      { identifier: 3, team: 102, type: 0, map: 3, text_player: 1, text_keeper: 1 },
    ],
  },
  {
    identifier: 103,
    name_short: "ATM",
    name: "Atletico Madrid",
    type_label: "Club Team (1)",
    mean: 195,
    team: {
      identifier: 103,
      name_short: "ATM",
      type: 1,
      formation: 1,
      glove: 1,
      captain: 1005,
      kick_corner_left: 1005,
      kick_corner_right: 1005,
      kick_free_long: 1005,
      kick_free_short: 1005,
      kick_penalty: 1005,
      hexagon_attack: 190,
      hexagon_defense: 215,
      hexagon_shot_power: 185,
      hexagon_speed: 180,
      hexagon_stamina: 210,
      hexagon_technique: 190,
    },
    names: [
      { identifier: 5, team: 103, language: 0, value: "Atletico Madrid", value_shorter: "Atletico Madrid" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Dummy formation data for demonstration
// ---------------------------------------------------------------------------
const DUMMY_FORMATIONS: (FormationData & Record<string, unknown>)[] = [
  { identifier: 1, name: "4-4-2", data: null },
  { identifier: 2, name: "4-3-3", data: null },
  { identifier: 3, name: "3-5-2", data: null },
  { identifier: 4, name: "5-3-2", data: null },
  { identifier: 5, name: "4-2-3-1", data: null },
];

const DUMMY_FORMATION_DETAIL: Record<number, FormationDetailType> = {
  1: {
    formation: { identifier: 1, name: "4-4-2", data: null },
    positions: [
      { identifier: 1, formation: 1, position: 2, x: 0, y: 0, x_display: 0, y_display: 0 },
      { identifier: 2, formation: 1, position: 3, x: 40, y: 20, x_display: 40, y_display: 20 },
      { identifier: 3, formation: 1, position: 4, x: 80, y: 20, x_display: 80, y_display: 20 },
      { identifier: 4, formation: 1, position: 5, x: 120, y: 20, x_display: 120, y_display: 20 },
      { identifier: 5, formation: 1, position: 6, x: 0, y: 100, x_display: 0, y_display: 100 },
      { identifier: 6, formation: 1, position: 7, x: 40, y: 100, x_display: 40, y_display: 100 },
      { identifier: 7, formation: 1, position: 8, x: 80, y: 100, x_display: 80, y_display: 100 },
      { identifier: 8, formation: 1, position: 9, x: 120, y: 100, x_display: 120, y_display: 100 },
      { identifier: 9, formation: 1, position: 10, x: 30, y: 200, x_display: 30, y_display: 200 },
      { identifier: 10, formation: 1, position: 11, x: 90, y: 200, x_display: 90, y_display: 200 },
    ]
  },
  2: {
    formation: { identifier: 2, name: "4-3-3", data: null },
    positions: [
      { identifier: 11, formation: 2, position: 2, x: 0, y: 0, x_display: 0, y_display: 0 },
      { identifier: 12, formation: 2, position: 3, x: 40, y: 20, x_display: 40, y_display: 20 },
      { identifier: 13, formation: 2, position: 4, x: 80, y: 20, x_display: 80, y_display: 20 },
      { identifier: 14, formation: 2, position: 5, x: 120, y: 20, x_display: 120, y_display: 20 },
      { identifier: 15, formation: 2, position: 6, x: 20, y: 110, x_display: 20, y_display: 110 },
      { identifier: 16, formation: 2, position: 7, x: 60, y: 110, x_display: 60, y_display: 110 },
      { identifier: 17, formation: 2, position: 8, x: 100, y: 110, x_display: 100, y_display: 110 },
      { identifier: 18, formation: 2, position: 9, x: 10, y: 200, x_display: 10, y_display: 200 },
      { identifier: 19, formation: 2, position: 10, x: 60, y: 200, x_display: 60, y_display: 200 },
      { identifier: 20, formation: 2, position: 11, x: 110, y: 200, x_display: 110, y_display: 200 },
    ]
  },
};

// ---------------------------------------------------------------------------
// Dummy ball data for demonstration
// ---------------------------------------------------------------------------
const DUMMY_BALLS: (BallData & Record<string, unknown>)[] = [
  { identifier: 1, name: "Classic Ball", type: 0, icon: null, texture: null },
  { identifier: 2, name: "Speed Ball", type: 1, icon: null, texture: null },
  { identifier: 3, name: "Power Ball", type: 2, icon: null, texture: null },
  { identifier: 4, name: "Gold Ball", type: 3, icon: null, texture: null },
  { identifier: 5, name: "Championship Ball", type: 4, icon: null, texture: null },
];

// ---------------------------------------------------------------------------
// Dummy group data for demonstration
// ---------------------------------------------------------------------------
const DUMMY_GROUPS: (GroupData & Record<string, unknown>)[] = [
  { identifier: 1, logo: null, language: 0, value: "Group A" },
  { identifier: 2, logo: null, language: 0, value: "Group B" },
  { identifier: 3, logo: null, language: 0, value: "Group C" },
  { identifier: 4, logo: null, language: 0, value: "Group D" },
];

const DUMMY_GROUP_DETAILS: Record<number, GroupDetailType> = {
  1: {
    group: { identifier: 1, logo: null, language: 0, value: "Group A" },
    teams: [
      { identifier: 1, group: 1, team: 101 },
      { identifier: 2, group: 1, team: 102 },
    ],
  },
  2: {
    group: { identifier: 2, logo: null, language: 0, value: "Group B" },
    teams: [
      { identifier: 3, group: 2, team: 103 },
    ],
  },
};

export interface MainContentProps {
  children?: ReactNode;
  activeNavId?: string;
  className?: string;
}

export function MainContent({
  children,
  activeNavId = "teams",
  className,
}: MainContentProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<FullTeamRecord | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<FormationDetailType | null>(null);
  const [selectedBall, setSelectedBall] = useState<BallData | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupDetailType | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionDetailType | null>(null);
  /** Record opened in its full detail page, `null` while its table is browsed */
  const [openRecord, setOpenRecord] = useState<{
    tableName: string;
    identifier: number;
  } | null>(null);

  const isTeams = activeNavId === "teams";
  const isFormations = activeNavId === "formations";
  const isBalls = activeNavId === "balls";
  const isGroups = activeNavId === "groups";
  const isCompetitions = activeNavId === "competitions";

  // Real data wins over the demo records: as soon as the imported database has
  // the table behind the active nav item, the virtualized browser replaces the
  // demo table (and the demo detail pages). Opening a row of that browser
  // swaps the table for the full detail page of the clicked record.
  const browserConfig = getBrowserTableConfig(activeNavId);
  const browserHasTable = useDatabaseStore((state) =>
    browserConfig ? state.database[browserConfig.tableName] !== undefined : false
  );

  return (
    <main
      className={cn(
        "flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-background",
        className
      )}
    >
      {/* Main Details Body */}
      <div className="flex flex-1 min-h-0 flex-col p-4 sm:p-6 lg:p-8">
        {/* Detail pages are code-split (demo and database alike), so the active
            one renders behind a boundary that shows the loading skeleton */}
        <Suspense fallback={<DetailLoading />}>
          {children ? (
            children
          ) : browserConfig && browserHasTable ? (
            openRecord !== null &&
            openRecord.tableName === browserConfig.tableName ? (
              <DatabaseRecordDetail
                config={browserConfig}
                identifier={openRecord.identifier}
                onBack={() => setOpenRecord(null)}
              />
            ) : (
              <DatabaseBrowser
                config={browserConfig}
                onOpenRecord={(identifier) =>
                  setOpenRecord({
                    tableName: browserConfig.tableName,
                    identifier,
                  })
                }
              />
            )
          ) : selectedTeam ? (
            <LazyTeamDetail
              initialData={selectedTeam}
              title={selectedTeam.names?.[0]?.value ?? selectedTeam.team.name_short}
              onBack={() => setSelectedTeam(null)}
              onChange={(updated) => setSelectedTeam(updated)}
            />
          ) : selectedPlayer ? (
            <LazyPlayerDetail
              player={selectedPlayer}
              onBack={() => setSelectedPlayer(null)}
              onSave={(updated) => setSelectedPlayer(updated)}
            />
          ) : selectedFormation ? (
            <LazyFormationDetail
              formationDetail={selectedFormation}
              onBack={() => setSelectedFormation(null)}
            />
          ) : selectedBall ? (
            <LazyBallDetail
              ball={selectedBall}
              onBack={() => setSelectedBall(null)}
              onSave={(updated) => setSelectedBall(updated)}
            />
          ) : selectedCompetition ? (
            <LazyCompetitionDetail
              competitionDetail={selectedCompetition}
              onBack={() => setSelectedCompetition(null)}
              onSave={(updated) => setSelectedCompetition(updated)}
            />
          ) : isTeams ? (
            <DataTable
              columns={TEAM_COLUMNS}
              data={DUMMY_TEAMS}
              onRowClick={(row) => setSelectedTeam(row as unknown as FullTeamRecord)}
            />
          ) : isCompetitions ? (
            <DataTable
              columns={COMPETITION_COLUMNS}
              data={DUMMY_COMPETITIONS}
              onRowClick={(row) => {
                const c = row as unknown as CompetitionData;
                setSelectedCompetition(
                  DUMMY_COMPETITION_DETAILS[c.identifier] ?? {
                    competition: c,
                    names: [],
                    groups: [],
                    sizes: [],
                    teams: [],
                  }
                );
              }}
            />
          ) : isFormations ? (
            <DataTable
              columns={FORMATION_COLUMNS}
              data={DUMMY_FORMATIONS}
              onRowClick={(row) => {
                const f = row as unknown as FormationData;
                setSelectedFormation(
                  DUMMY_FORMATION_DETAIL[f.identifier] ?? {
                    formation: f,
                    positions: [],
                  }
                );
              }}
            />
          ) : isBalls ? (
            <DataTable
              columns={BALL_COLUMNS}
              data={DUMMY_BALLS}
              onRowClick={(row) => setSelectedBall(row as unknown as BallData)}
            />
          ) : isGroups ? (
            selectedGroup ? (
              <LazyGroupDetail
                groupDetail={selectedGroup}
                onBack={() => setSelectedGroup(null)}
                onSave={(updated) => setSelectedGroup(updated)}
              />
            ) : (
              <DataTable
                columns={GROUP_COLUMNS}
                data={DUMMY_GROUPS}
                onRowClick={(row) => {
                  const g = row as unknown as GroupData;
                  setSelectedGroup(
                    DUMMY_GROUP_DETAILS[g.identifier] ?? {
                      group: g,
                      teams: [],
                    }
                  );
                }}
              />
            )
          ) : (
            <DataTable
              columns={PLAYER_COLUMNS}
              data={DUMMY_PLAYERS}
              onRowClick={(row) => setSelectedPlayer(row as unknown as PlayerData)}
            />
          )}
        </Suspense>
      </div>
    </main>
  );
}

export default MainContent;
