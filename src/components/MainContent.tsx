import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { PlayerDetail } from "@/components/PlayerDetail";
import type { PlayerData } from "@/types/player";

// ---------------------------------------------------------------------------
// Column definitions matching PlayerData attributes
// ---------------------------------------------------------------------------
const COLUMNS: DataTableColumn[] = [
  { key: "identifier", title: "ID" },
  { key: "name", title: "Name" },
  { key: "name_shorter", title: "Short Name" },
  { key: "club", title: "Club" },
  { key: "age", title: "Age" },
  { key: "height", title: "Height" },
  { key: "attack", title: "Attack" },
  { key: "speed", title: "Speed" },
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

export interface MainContentProps {
  children?: ReactNode;
  className?: string;
}

export function MainContent({
  children,
  className,
}: MainContentProps) {
  // null = list view; non-null = detail view for the selected player
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

  return (
    <main
      className={cn(
        "flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-background",
        className
      )}
    >
      {/* Main Details Body */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {children ? (
          children
        ) : selectedPlayer ? (
          <PlayerDetail
            player={selectedPlayer}
            onBack={() => setSelectedPlayer(null)}
            onSave={(updated) => setSelectedPlayer(updated)}
          />
        ) : (
          <DataTable
            columns={COLUMNS}
            data={DUMMY_PLAYERS}
            onRowClick={(row) => setSelectedPlayer(row as unknown as PlayerData)}
          />
        )}
      </div>
    </main>
  );
}

export default MainContent;
