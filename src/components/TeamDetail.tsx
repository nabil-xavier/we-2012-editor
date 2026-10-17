import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { BlobImageInput } from "@/components/ui/BlobImageInput";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TEAM_KIT_TYPE_OPTIONS, TEAM_TYPE_OPTIONS } from "@/data/teams";
import type { SelectOption } from "@/types/select";
import type {
  TeamData,
  TeamGloveData,
  TeamNameData,
  TeamPlayerData,
  TeamStyleData,
  FullTeamRecord,
} from "@/types/team";
import {
  ChevronLeft,
  Shield,
  Flag,
  UserCheck,
  Target,
  Hexagon,
  Hand,
  Tag,
  Users,
  Shirt,
  Sparkles,
} from "lucide-react";

export interface TeamDetailProps {
  /** Initial or controlled full team record */
  initialData?: Partial<FullTeamRecord>;
  /** Navigation callback to return to previous list or page */
  onBack: () => void;
  /** Callback fired when any team data changes */
  onChange?: (record: FullTeamRecord) => void;
  /** Optional custom header title */
  title?: string;
  /** Formation options offered by the formation select (from the database) */
  formationOptions?: SelectOption[];
  /** Glove options offered by the glove select (from the database) */
  gloveOptions?: SelectOption[];
  /** Player options offered by the captain / squad selects (from the database) */
  playerOptions?: SelectOption[];
  /** Optional container class name */
  className?: string;
}

/** Zeroed team row: a column absent from the database stays empty, never fake */
const EMPTY_TEAM: TeamData = {
  identifier: 0,
  name_short: "",
  type: 0,
  flag_32: null,
  flag_64: null,
  flag_128: null,
  formation: 0,
  glove: 0,
  captain: 0,
  kick_corner_left: 0,
  kick_corner_right: 0,
  kick_free_long: 0,
  kick_free_short: 0,
  kick_penalty: 0,
  hexagon_attack: 0,
  hexagon_defense: 0,
  hexagon_shot_power: 0,
  hexagon_speed: 0,
  hexagon_stamina: 0,
  hexagon_technique: 0,
};

/** Zeroed glove row of a team that has no glove record yet */
const EMPTY_TEAM_GLOVE: TeamGloveData = {
  identifier: 0,
  data: null,
};

export function TeamDetail({
  initialData,
  onBack,
  onChange,
  title,
  formationOptions = [],
  gloveOptions = [],
  playerOptions = [],
  className,
}: TeamDetailProps) {
  const [team, setTeam] = useState<TeamData>(() => ({
    ...EMPTY_TEAM,
    ...(initialData?.team ?? {}),
  }));

  const [glove, setGlove] = useState<TeamGloveData>(() => ({
    ...EMPTY_TEAM_GLOVE,
    ...(initialData?.glove ?? {}),
  }));

  const [names, setNames] = useState<TeamNameData[]>(() => {
    return initialData?.names ?? [];
  });

  const [players, setPlayers] = useState<TeamPlayerData[]>(() => {
    return initialData?.players ?? [];
  });

  const [styles, setStyles] = useState<TeamStyleData[]>(() => {
    return initialData?.styles ?? [];
  });

  const [activeTab, setActiveTab] = useState<
    "all" | "team" | "glove" | "name" | "player" | "style"
  >("all");

  const [activeKitType, setActiveKitType] = useState<0 | 1>(0); // 0 = Home, 1 = Away
  const [activeNameLang, setActiveNameLang] = useState<0 | 1>(0); // 0 = English, 1 = Alternative

  // ---------------------------------------------------------------------------
  // Calculated Hexagon Mean (read-only, auto calculated from all 6 hexagon stats)
  // ---------------------------------------------------------------------------
  const hexagonMean = useMemo(() => {
    const stats = [
      team.hexagon_attack ?? 0,
      team.hexagon_defense ?? 0,
      team.hexagon_shot_power ?? 0,
      team.hexagon_speed ?? 0,
      team.hexagon_stamina ?? 0,
      team.hexagon_technique ?? 0,
    ];
    return Math.round(
      stats.reduce((acc, current) => acc + (Number(current) || 0), 0) / 6
    );
  }, [
    team.hexagon_attack,
    team.hexagon_defense,
    team.hexagon_shot_power,
    team.hexagon_speed,
    team.hexagon_stamina,
    team.hexagon_technique,
  ]);

  // Notify parent of record changes
  const notifyChange = (
    updatedTeam = team,
    updatedGlove = glove,
    updatedNames = names,
    updatedPlayers = players,
    updatedStyles = styles
  ) => {
    onChange?.({
      team: { ...updatedTeam, hexagon_mean: hexagonMean },
      glove: updatedGlove,
      names: updatedNames,
      players: updatedPlayers,
      styles: updatedStyles,
    });
  };

  const updateTeamField = <K extends keyof TeamData>(
    field: K,
    val: TeamData[K]
  ) => {
    setTeam((prev) => {
      const next = { ...prev, [field]: val };
      notifyChange(next, glove, names, players, styles);
      return next;
    });
  };

  const updateGloveField = <K extends keyof TeamGloveData>(
    field: K,
    val: TeamGloveData[K]
  ) => {
    setGlove((prev) => {
      const next = { ...prev, [field]: val };
      notifyChange(team, next, names, players, styles);
      return next;
    });
  };

  const updateActiveNameField = (
    field: keyof TeamNameData,
    val: string | number | undefined
  ) => {
    setNames((prev) => {
      const existingIndex = prev.findIndex((n) => n.language === activeNameLang);
      const next = [...prev];

      if (existingIndex >= 0) {
        const item = { ...next[existingIndex] };
        if (field === "value") {
          item.value = String(val ?? "");
          // SECTION: Team Name: value_shorter (read-only, same value as value)
          item.value_shorter = String(val ?? "");
        } else if (field === "language") {
          item.language = Number(val ?? 0);
        }
        next[existingIndex] = item;
      } else {
        next.push({
          identifier: 1,
          team: team.identifier ?? 0,
          language: activeNameLang,
          value: field === "value" ? String(val ?? "") : "",
          value_shorter: field === "value" ? String(val ?? "") : "",
        });
      }
      notifyChange(team, glove, next, players, styles);
      return next;
    });
  };

  const activeName = names.find((n) => n.language === activeNameLang) ?? {
    identifier: 1,
    team: team.identifier,
    language: activeNameLang,
    value: "",
    value_shorter: "",
  };

  const updateActiveStyleField = <K extends keyof TeamStyleData>(
    field: K,
    val: TeamStyleData[K]
  ) => {
    setStyles((prev) => {
      const existingIndex = prev.findIndex((s) => s.type === activeKitType);
      const next = [...prev];

      if (existingIndex >= 0) {
        next[existingIndex] = {
          ...next[existingIndex],
          [field]: val,
        };
      } else {
        next.push({
          identifier: activeKitType + 1,
          team: team.identifier ?? 0,
          type: activeKitType,
          [field]: val,
        });
      }
      notifyChange(team, glove, names, players, next);
      return next;
    });
  };

  const activeStyle = styles.find((s) => s.type === activeKitType) ?? {
    identifier: activeKitType + 1,
    team: team.identifier,
    type: activeKitType,
    map: 1,
    text_player: 1,
    text_keeper: 1,
    uniform_player: null,
    uniform_keeper: null,
  };

  const updatePlayerRow = (index: number, field: keyof TeamPlayerData, val: number | undefined) => {
    setPlayers((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index],
          [field]: val,
        };
      }
      notifyChange(team, glove, names, next, styles);
      return next;
    });
  };

  const addPlayerRow = () => {
    setPlayers((prev) => {
      const next = [
        ...prev,
        {
          identifier: prev.length + 1,
          team: team.identifier ?? 0,
          player: 1000 + prev.length + 1,
          number: Math.min(99, prev.length + 1),
        },
      ];
      notifyChange(team, glove, names, next, styles);
      return next;
    });
  };

  const removePlayerRow = (index: number) => {
    setPlayers((prev) => {
      const next = prev.filter((_, i) => i !== index);
      notifyChange(team, glove, names, next, styles);
      return next;
    });
  };

  const displayTitle =
    title ?? (activeName?.value ? `${activeName.value} Details` : "Team Details");

  return (
    <div className={cn("flex flex-col gap-6 pb-12 w-full max-w-6xl", className)}>
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            aria-label="Go back"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground truncate">
                {displayTitle}
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Team ID: {team.identifier ?? "—"} · Mean: {hexagonMean} / 255
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-none border transition-colors",
            activeTab === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
          )}
        >
          All Sections
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-none border transition-colors flex items-center gap-1.5",
            activeTab === "team"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
          )}
        >
          <Shield className="size-3.5" />
          <span>Team Profile</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("name")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-none border transition-colors flex items-center gap-1.5",
            activeTab === "name"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
          )}
        >
          <Tag className="size-3.5" />
          <span>Team Name</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-none border transition-colors flex items-center gap-1.5",
            activeTab === "style"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
          )}
        >
          <Shirt className="size-3.5" />
          <span>Team Style (Kits)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("glove")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-none border transition-colors flex items-center gap-1.5",
            activeTab === "glove"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
          )}
        >
          <Hand className="size-3.5" />
          <span>Team Glove</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("player")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-none border transition-colors flex items-center gap-1.5",
            activeTab === "player"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
          )}
        >
          <Users className="size-3.5" />
          <span>Team Players</span>
        </button>
      </div>

      {/* Main Sections */}
      <div className="flex flex-col gap-6">
        {/* ================================================================= */}
        {/* SECTION: Team */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "team") && (
          <div className="flex flex-col gap-6">
            {/* Identity & Basic Parameters */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <Shield className="size-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Section: Team — Identity
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ValidatedInput
                  type="integer"
                  label="1. Identifier"
                  value={team.identifier ?? ""}
                  placeholder="e.g. 101"
                  min={0}
                  rules={{ required: true }}
                  helperText="Primary team identifier (integer)"
                  onValueChange={(val) => updateTeamField("identifier", val ?? undefined)}
                />
                <ValidatedInput
                  type="string"
                  label="2. Name Short (3 chars)"
                  value={team.name_short ?? ""}
                  placeholder="e.g. FCB"
                  rules={{
                    required: true,
                    exactLength: 3,
                  }}
                  helperText="Required, exactly 3 characters"
                  onValueChange={(val) => updateTeamField("name_short", val.toUpperCase())}
                />
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-medium text-foreground select-none">
                    3. Type (0 - 4)
                  </label>
                  <Select
                    value={team.type !== undefined ? String(team.type) : undefined}
                    onValueChange={(val) => updateTeamField("type", Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select team type..." />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {TEAM_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-[10px] text-muted-foreground select-none">
                    Team category / classification index (0 to 4)
                  </span>
                </div>
              </div>
            </section>

            {/* Team Flags (Blob Images: 32, 64, 128) */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <Flag className="size-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Section: Team — Flags (Blob Images)
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <BlobImageInput
                  label="4. Flag 32"
                  suggestedDimensions="32 × 32"
                  value={team.flag_32}
                  helperText="Small in-game emblem / flag (32x32)"
                  onValueChange={(val) => updateTeamField("flag_32", val)}
                />
                <BlobImageInput
                  label="5. Flag 64"
                  suggestedDimensions="64 × 64"
                  value={team.flag_64}
                  helperText="Medium team logo / badge (64x64)"
                  onValueChange={(val) => updateTeamField("flag_64", val)}
                />
                <BlobImageInput
                  label="6. Flag 128"
                  suggestedDimensions="128 × 128"
                  value={team.flag_128}
                  helperText="High-resolution team shield (128x128)"
                  onValueChange={(val) => updateTeamField("flag_128", val)}
                />
              </div>
            </section>

            {/* Tactics, Formation & Key Roles */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <UserCheck className="size-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Section: Team — Formation & Roles
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-medium text-foreground select-none">
                    4. Formation
                  </label>
                  <Select
                    value={
                      team.formation !== undefined
                        ? String(team.formation)
                        : undefined
                    }
                    onValueChange={(val) =>
                      updateTeamField("formation", Number(val))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select formation..." />
                    </SelectTrigger>
                    <SelectContent
                      align="start"
                      alignItemWithTrigger={false}
                      className="w-[--anchor-width]"
                    >
                      {formationOptions.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No formations in the loaded database
                        </p>
                      ) : (
                        formationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <span className="text-[10px] text-muted-foreground select-none">
                    Preset formation ID
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-medium text-foreground select-none">
                    5. Glove
                  </label>
                  <Select
                    value={
                      team.glove !== undefined ? String(team.glove) : undefined
                    }
                    onValueChange={(val) => updateTeamField("glove", Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select glove..." />
                    </SelectTrigger>
                    <SelectContent
                      align="start"
                      alignItemWithTrigger={false}
                      className="w-[--anchor-width]"
                    >
                      {gloveOptions.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No gloves in the loaded database
                        </p>
                      ) : (
                        gloveOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <span className="text-[10px] text-muted-foreground select-none">
                    Default team glove index
                  </span>
                </div>
                <SearchableSelect
                  label="6. Captain"
                  value={
                    team.captain !== undefined ? String(team.captain) : undefined
                  }
                  placeholder="Select captain..."
                  searchPlaceholder="Search player..."
                  options={playerOptions}
                  helperText="Designated team captain player"
                  onValueChange={(val) =>
                    updateTeamField(
                      "captain",
                      val === "" ? undefined : Number(val)
                    )
                  }
                />
              </div>
            </section>

            {/* Set Piece Takers */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <Target className="size-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Section: Team — Set Piece Takers (Kicks)
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <ValidatedInput
                  type="integer"
                  label="7. Kick Corner Left"
                  value={team.kick_corner_left ?? ""}
                  placeholder="Player ID"
                  min={0}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateTeamField("kick_corner_left", val ?? undefined)
                  }
                />
                <ValidatedInput
                  type="integer"
                  label="8. Kick Corner Right"
                  value={team.kick_corner_right ?? ""}
                  placeholder="Player ID"
                  min={0}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateTeamField("kick_corner_right", val ?? undefined)
                  }
                />
                <ValidatedInput
                  type="integer"
                  label="9. Kick Free Long"
                  value={team.kick_free_long ?? ""}
                  placeholder="Player ID"
                  min={0}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateTeamField("kick_free_long", val ?? undefined)
                  }
                />
                <ValidatedInput
                  type="integer"
                  label="10. Kick Free Short"
                  value={team.kick_free_short ?? ""}
                  placeholder="Player ID"
                  min={0}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateTeamField("kick_free_short", val ?? undefined)
                  }
                />
                <ValidatedInput
                  type="integer"
                  label="11. Kick Penalty"
                  value={team.kick_penalty ?? ""}
                  placeholder="Player ID"
                  min={0}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateTeamField("kick_penalty", val ?? undefined)
                  }
                />
              </div>
            </section>

            {/* Hexagon Stats & Mean */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <Hexagon className="size-4 text-primary" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Section: Team — Hexagon Stats & Mean
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>Mean: <strong className="text-foreground">{hexagonMean}</strong> / 255</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 6 Hexagon inputs + Auto Mean */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <ValidatedInput
                    type="custom-integer"
                    label="12. Hexagon Attack (0-255)"
                    value={team.hexagon_attack ?? ""}
                    placeholder="0 - 255"
                    max={255}
                    rules={{ required: true }}
                    onValueChange={(val) =>
                      updateTeamField("hexagon_attack", val ?? undefined)
                    }
                  />
                  <ValidatedInput
                    type="custom-integer"
                    label="13. Hexagon Defense (0-255)"
                    value={team.hexagon_defense ?? ""}
                    placeholder="0 - 255"
                    max={255}
                    rules={{ required: true }}
                    onValueChange={(val) =>
                      updateTeamField("hexagon_defense", val ?? undefined)
                    }
                  />
                  <ValidatedInput
                    type="custom-integer"
                    label="14. Hexagon Shot Power (0-255)"
                    value={team.hexagon_shot_power ?? ""}
                    placeholder="0 - 255"
                    max={255}
                    rules={{ required: true }}
                    onValueChange={(val) =>
                      updateTeamField("hexagon_shot_power", val ?? undefined)
                    }
                  />
                  <ValidatedInput
                    type="custom-integer"
                    label="15. Hexagon Speed (0-255)"
                    value={team.hexagon_speed ?? ""}
                    placeholder="0 - 255"
                    max={255}
                    rules={{ required: true }}
                    onValueChange={(val) =>
                      updateTeamField("hexagon_speed", val ?? undefined)
                    }
                  />
                  <ValidatedInput
                    type="custom-integer"
                    label="16. Hexagon Stamina (0-255)"
                    value={team.hexagon_stamina ?? ""}
                    placeholder="0 - 255"
                    max={255}
                    rules={{ required: true }}
                    onValueChange={(val) =>
                      updateTeamField("hexagon_stamina", val ?? undefined)
                    }
                  />
                  <ValidatedInput
                    type="custom-integer"
                    label="17. Hexagon Technique (0-255)"
                    value={team.hexagon_technique ?? ""}
                    placeholder="0 - 255"
                    max={255}
                    rules={{ required: true }}
                    onValueChange={(val) =>
                      updateTeamField("hexagon_technique", val ?? undefined)
                    }
                  />

                  {/* 21. Hexagon Mean: Read-only, auto calculated */}
                  <div className="sm:col-span-2 lg:col-span-3 pt-2">
                    <ValidatedInput
                      type="custom-integer"
                      label="18. Hexagon Mean (Read-only, Auto Calculated)"
                      value={hexagonMean}
                      placeholder="Calculated automatically"
                      max={255}
                      readOnly
                      helperText="Computed as the mathematical mean of all 6 hexagon values: Attack, Defense, Power, Speed, Stamina, and Technique."
                    />
                  </div>
                </div>

                {/* Hexagon Radar Visualizer */}
                <div className="flex flex-col items-center justify-center p-4 border border-border/80 bg-card/60">
                  <div className="relative size-48">
                    {/* SVG Hexagon Radar */}
                    <svg viewBox="0 0 200 200" className="size-full overflow-visible">
                      {/* Concentric guide hexagons */}
                      {[0.25, 0.5, 0.75, 1].map((scale, i) => {
                        const r = 80 * scale;
                        const points = [0, 60, 120, 180, 240, 300]
                          .map((deg) => {
                            const rad = ((deg - 90) * Math.PI) / 180;
                            return `${100 + r * Math.cos(rad)},${100 + r * Math.sin(rad)}`;
                          })
                          .join(" ");
                        return (
                          <polygon
                            key={i}
                            points={points}
                            fill="none"
                            stroke="currentColor"
                            className="text-border"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Stat Polygon */}
                      {(() => {
                        const vals = [
                          (team.hexagon_attack ?? 0) / 255,
                          (team.hexagon_technique ?? 0) / 255,
                          (team.hexagon_stamina ?? 0) / 255,
                          (team.hexagon_speed ?? 0) / 255,
                          (team.hexagon_defense ?? 0) / 255,
                          (team.hexagon_shot_power ?? 0) / 255,
                        ];
                        const points = vals
                          .map((val, idx) => {
                            const deg = idx * 60 - 90;
                            const r = Math.max(10, 80 * Math.min(1, val));
                            const rad = (deg * Math.PI) / 180;
                            return `${100 + r * Math.cos(rad)},${100 + r * Math.sin(rad)}`;
                          })
                          .join(" ");
                        return (
                          <polygon
                            points={points}
                            className="fill-primary/25 stroke-primary"
                            strokeWidth="2"
                          />
                        );
                      })()}

                      {/* Labels */}
                      <text x="100" y="10" textAnchor="middle" className="text-[9px] fill-muted-foreground font-mono">ATT</text>
                      <text x="180" y="55" textAnchor="start" className="text-[9px] fill-muted-foreground font-mono">TEC</text>
                      <text x="180" y="150" textAnchor="start" className="text-[9px] fill-muted-foreground font-mono">STA</text>
                      <text x="100" y="195" textAnchor="middle" className="text-[9px] fill-muted-foreground font-mono">SPD</text>
                      <text x="20" y="150" textAnchor="end" className="text-[9px] fill-muted-foreground font-mono">DEF</text>
                      <text x="20" y="55" textAnchor="end" className="text-[9px] fill-muted-foreground font-mono">POW</text>
                    </svg>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-foreground mt-2">
                    Hexagon Mean: {hexagonMean} / 255
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION: Team Name */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "name") && (
          <section className="border border-border bg-card/40 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Section: Team Name
                </h2>
              </div>

              {/* Language Switcher: 0 = English, 1 = Alternative Language */}
              <div className="flex items-center gap-1 border border-border bg-background p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveNameLang(0)}
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium transition-colors",
                    activeNameLang === 0
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  0 - English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNameLang(1)}
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium transition-colors",
                    activeNameLang === 1
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  1 - Alternative Language
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ValidatedInput
                type="custom-integer"
                label="1. Language (0 - 1)"
                value={activeName.language ?? 0}
                placeholder="0 or 1"
                max={1}
                rules={{ required: true }}
                helperText="0 = English, 1 = Alternative Language"
                onValueChange={(val) => {
                  const lang = val === 1 ? 1 : 0;
                  setActiveNameLang(lang);
                  updateActiveNameField("language", lang);
                }}
              />
              <ValidatedInput
                type="string"
                label="2. Value"
                value={activeName.value ?? ""}
                placeholder="e.g. FC Barcelona"
                rules={{ required: true }}
                helperText="Full team name text in selected language"
                onValueChange={(val) => updateActiveNameField("value", val)}
              />

              {/* 3. value_shorter: read-only, same value as value */}
              <ValidatedInput
                type="string"
                label="3. Value Shorter (Read-only, Same as Value)"
                value={activeName.value_shorter ?? activeName.value ?? ""}
                placeholder="Mirrored from Value"
                readOnly
                helperText="Read-only: mirrors the exact value of team name"
              />
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* SECTION: Team Style */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "style") && (
          <section className="border border-border bg-card/40 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <Shirt className="size-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Section: Team Style (Kits & Uniforms)
                </h2>
              </div>

              {/* Kit Type Switcher: 0 = Home Kit, 1 = Away Kit */}
              <div className="flex items-center gap-1 border border-border bg-background p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveKitType(0)}
                  className={cn(
                    "px-2.5 py-0.5 text-xs font-medium transition-colors",
                    activeKitType === 0
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  0 - Home Kit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveKitType(1)}
                  className={cn(
                    "px-2.5 py-0.5 text-xs font-medium transition-colors",
                    activeKitType === 1
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  1 - Away Kit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-medium text-foreground select-none">
                  1. Type (0 - 1)
                </label>
                <Select
                  value={String(activeStyle.type ?? activeKitType)}
                  onValueChange={(val) => {
                    const kit = Number(val) === 1 ? 1 : 0;
                    setActiveKitType(kit);
                    updateActiveStyleField("type", kit);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select kit type..." />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    alignItemWithTrigger={false}
                    className="w-[--anchor-width]"
                  >
                    {TEAM_KIT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-muted-foreground select-none">
                  0 = Home Kit, 1 = Away Kit
                </span>
              </div>
              <ValidatedInput
                type="integer"
                label="2. Map"
                value={activeStyle.map ?? ""}
                placeholder="Texture map ID"
                min={0}
                rules={{ required: true }}
                helperText="Texture coordinate map ID"
                onValueChange={(val) => updateActiveStyleField("map", val ?? undefined)}
              />
              <ValidatedInput
                type="integer"
                label="3. Text Player"
                value={activeStyle.text_player ?? ""}
                placeholder="Font / text ID"
                min={0}
                rules={{ required: true }}
                helperText="Player jersey font / color preset"
                onValueChange={(val) => updateActiveStyleField("text_player", val ?? undefined)}
              />
              <ValidatedInput
                type="integer"
                label="4. Text Keeper"
                value={activeStyle.text_keeper ?? ""}
                placeholder="GK Font / text ID"
                min={0}
                rules={{ required: true }}
                helperText="Goalkeeper jersey font / color preset"
                onValueChange={(val) => updateActiveStyleField("text_keeper", val ?? undefined)}
              />
            </div>

            {/* Blob Images for Uniforms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/70">
              <BlobImageInput
                label="5. Uniform Player (Blob Image)"
                suggestedDimensions="512 × 512"
                value={activeStyle.uniform_player}
                helperText={`Player kit texture for ${activeKitType === 0 ? "Home" : "Away"} kit`}
                onValueChange={(val) => updateActiveStyleField("uniform_player", val)}
              />
              <BlobImageInput
                label="6. Uniform Keeper (Blob Image)"
                suggestedDimensions="512 × 512"
                value={activeStyle.uniform_keeper}
                helperText={`Goalkeeper kit texture for ${activeKitType === 0 ? "Home" : "Away"} kit`}
                onValueChange={(val) => updateActiveStyleField("uniform_keeper", val)}
              />
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* SECTION: Team Glove */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "glove") && (
          <section className="border border-border bg-card/40 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
              <Hand className="size-4 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Section: Team Glove
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BlobImageInput
                label="1. Data (Blob Image)"
                suggestedDimensions="128 × 128"
                value={glove.data}
                helperText="Goalkeeper glove texture / sprite blob"
                onValueChange={(val) => updateGloveField("data", val)}
              />
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* SECTION: Team Player */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "player") && (
          <section className="border border-border bg-card/40 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Section: Team Player (Squad List)
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={addPlayerRow}
                className="text-xs h-7 gap-1"
              >
                + Add Player
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {players.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border">
                  No squad players registered for this team yet. Click "+ Add Player" to allocate a shirt number.
                </div>
              ) : (
                players.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 border border-border bg-card/60 items-end"
                  >
                    <div className="sm:col-span-6">
                      <SearchableSelect
                        label="1. Player"
                        value={
                          item.player !== undefined
                            ? String(item.player)
                            : undefined
                        }
                        placeholder="Select player..."
                        searchPlaceholder="Search player..."
                        options={playerOptions}
                        onValueChange={(val) =>
                          updatePlayerRow(
                            idx,
                            "player",
                            val === "" ? undefined : Number(val)
                          )
                        }
                      />
                    </div>
                    <div className="sm:col-span-5">
                      {/* 2. number = integer (1-99) */}
                      <ValidatedInput
                        type="integer"
                        label="2. Number (1-99)"
                        value={item.number ?? ""}
                        placeholder="1 - 99"
                        min={1}
                        max={99}
                        rules={{ required: true, min: 1, max: 99 }}
                        onValueChange={(val) => updatePlayerRow(idx, "number", val ?? undefined)}
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => removePlayerRow(idx)}
                        className="text-muted-foreground hover:text-destructive h-8 px-2"
                        title="Remove player"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default TeamDetail;
