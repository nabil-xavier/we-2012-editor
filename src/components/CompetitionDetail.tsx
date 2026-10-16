// src/components/CompetitionDetail.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { BlobImageInput } from "@/components/ui/BlobImageInput";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  CompetitionDetail,
  CompetitionData,
  CompetitionNameData,
  CompetitionGroupData,
  CompetitionSizeData,
  CompetitionTeamData,
} from "@/types/competition";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Search,
  Trophy,
  Tag,
  Layers,
  Maximize2,
  Shield,
  Lock,
  Unlock,
} from "lucide-react";

export interface CompetitionDetailProps {
  /** Initial competition detail */
  competitionDetail?: CompetitionDetail;
  /** Callback when detail changes */
  onSave?: (detail: CompetitionDetail) => void;
  /** Back navigation callback */
  onBack?: () => void;
  /** Header title override */
  title?: string;
  /** Available groups for selection in dropdown with search */
  availableGroups?: { identifier: number; name?: string }[];
  /** Available teams for selection in dropdown with search */
  availableTeams?: { identifier: number; name?: string }[];
  /** Extra CSS classes */
  className?: string;
}

export const COMPETITION_TYPE_OPTIONS = [
  { value: 0, label: "Cup" },
  { value: 1, label: "League" },
  { value: 2, label: "UEFA" },
  { value: 4, label: "Super Challenge" },
  { value: 5, label: "Copa Santander Libertadores" },
] as const;

export const COMPETITION_LANGUAGE_OPTIONS = [
  { value: 0, label: "English" },
  { value: 1, label: "Alternative Language" },
] as const;

export const COMPETITION_TEAM_TYPE_OPTIONS = [
  { value: 0, label: "Type 0" },
  { value: 1, label: "Type 1" },
  { value: 2, label: "Type 2" },
] as const;

const DEFAULT_AVAILABLE_GROUPS: { identifier: number; name: string }[] = [
  { identifier: 1, name: "Group 1 (Group A)" },
  { identifier: 2, name: "Group 2 (Group B)" },
  { identifier: 3, name: "Group 3 (Group C)" },
  { identifier: 4, name: "Group 4 (Group D)" },
];

const DEFAULT_AVAILABLE_TEAMS: { identifier: number; name: string }[] = [
  { identifier: 101, name: "101 - FC Barcelona" },
  { identifier: 102, name: "102 - Real Madrid" },
  { identifier: 103, name: "103 - Atletico Madrid" },
  { identifier: 104, name: "104 - Manchester United" },
  { identifier: 105, name: "105 - Chelsea FC" },
  { identifier: 106, name: "106 - Arsenal FC" },
  { identifier: 107, name: "107 - Liverpool FC" },
  { identifier: 108, name: "108 - FC Bayern München" },
  { identifier: 109, name: "109 - Juventus" },
  { identifier: 110, name: "110 - AC Milan" },
];

const emptyCompetition: CompetitionData = {
  identifier: 0,
  type: 1,
  banner_480: null,
  banner_960: null,
  cup: null,
  logo_64: null,
  logo_128: null,
  logo_256: null,
  color: 0,
  card: 0,
  leg: 0,
  qualification: 0,
  lock: 0,
};

const emptyName = (competition: number): CompetitionNameData => ({
  identifier: 0,
  competition,
  language: 0,
  value: "",
});

const emptyGroup = (competition: number): CompetitionGroupData => ({
  identifier: 0,
  competition,
  group: 1,
});

const emptySize = (competition: number): CompetitionSizeData => ({
  identifier: 0,
  competition,
  round: 1,
  size: 16,
});

const emptyTeam = (competition: number): CompetitionTeamData => ({
  identifier: 0,
  competition,
  team: 101,
  type: 0,
});

export const DUMMY_COMPETITION_DETAIL: CompetitionDetail = {
  competition: {
    identifier: 1,
    type: 1,
    banner_480: null,
    banner_960: null,
    cup: null,
    logo_64: null,
    logo_128: null,
    logo_256: null,
    color: 1,
    card: 1,
    leg: 2,
    qualification: 4,
    lock: 0,
  },
  names: [
    { identifier: 1, competition: 1, language: 0, value: "Premier League" },
    { identifier: 2, competition: 1, language: 1, value: "Liga Premier" },
  ],
  groups: [
    { identifier: 1, competition: 1, group: 1 },
    { identifier: 2, competition: 1, group: 2 },
  ],
  sizes: [
    { identifier: 1, competition: 1, round: 1, size: 20 },
    { identifier: 2, competition: 1, round: 2, size: 38 },
  ],
  teams: [
    { identifier: 1, competition: 1, team: 101, type: 0 },
    { identifier: 2, competition: 1, team: 102, type: 1 },
  ],
};
export function CompetitionDetail({
  competitionDetail = DUMMY_COMPETITION_DETAIL,
  onSave,
  onBack,
  title,
  availableGroups = DEFAULT_AVAILABLE_GROUPS,
  availableTeams = DEFAULT_AVAILABLE_TEAMS,
  className,
}: CompetitionDetailProps) {
  const [detail, setDetail] = useState<CompetitionDetail>(() => ({
    competition: { ...emptyCompetition, ...(competitionDetail.competition ?? {}) },
    names: (
      competitionDetail.names ?? [emptyName(competitionDetail.competition?.identifier ?? 0)]
    ).map((n) => ({ ...emptyName(n.competition), ...n })),
    groups: (
      competitionDetail.groups ?? [emptyGroup(competitionDetail.competition?.identifier ?? 0)]
    ).map((g) => ({ ...emptyGroup(g.competition), ...g })),
    sizes: (
      competitionDetail.sizes ?? [emptySize(competitionDetail.competition?.identifier ?? 0)]
    ).map((s) => ({ ...emptySize(s.competition), ...s })),
    teams: (
      competitionDetail.teams ?? [emptyTeam(competitionDetail.competition?.identifier ?? 0)]
    ).map((t) => ({ ...emptyTeam(t.competition), ...t })),
  }));

  const [groupSearches, setGroupSearches] = useState<Record<number, string>>({});
  const [teamSearches, setTeamSearches] = useState<Record<number, string>>({});

  const updateCompetitionField = <K extends keyof CompetitionData>(
    field: K,
    value: CompetitionData[K],
  ) => {
    setDetail((prev) => {
      const updated = {
        ...prev,
        competition: { ...prev.competition, [field]: value },
      };
      onSave?.(updated);
      return updated;
    });
  };

  const updateNameField = <K extends keyof CompetitionNameData>(
    index: number,
    field: K,
    value: CompetitionNameData[K],
  ) => {
    setDetail((prev) => {
      const names = prev.names.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      const updated = { ...prev, names };
      onSave?.(updated);
      return updated;
    });
  };

  const addName = () => {
    setDetail((prev) => ({
      ...prev,
      names: [...prev.names, emptyName(prev.competition.identifier)],
    }));
  };

  const removeName = (index: number) => {
    setDetail((prev) => ({
      ...prev,
      names: prev.names.filter((_, i) => i !== index),
    }));
  };

  const updateGroupField = <K extends keyof CompetitionGroupData>(
    index: number,
    field: K,
    value: CompetitionGroupData[K],
  ) => {
    setDetail((prev) => {
      const groups = prev.groups.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      const updated = { ...prev, groups };
      onSave?.(updated);
      return updated;
    });
  };

  const addGroup = () => {
    setDetail((prev) => ({
      ...prev,
      groups: [...prev.groups, emptyGroup(prev.competition.identifier)],
    }));
  };

  const removeGroup = (index: number) => {
    setDetail((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index),
    }));
    setGroupSearches((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const updateSizeField = <K extends keyof CompetitionSizeData>(
    index: number,
    field: K,
    value: CompetitionSizeData[K],
  ) => {
    setDetail((prev) => {
      const sizes = prev.sizes.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      const updated = { ...prev, sizes };
      onSave?.(updated);
      return updated;
    });
  };

  const addSize = () => {
    setDetail((prev) => ({
      ...prev,
      sizes: [...prev.sizes, emptySize(prev.competition.identifier)],
    }));
  };

  const removeSize = (index: number) => {
    setDetail((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const updateTeamField = <K extends keyof CompetitionTeamData>(
    index: number,
    field: K,
    value: CompetitionTeamData[K],
  ) => {
    setDetail((prev) => {
      const teams = prev.teams.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      const updated = { ...prev, teams };
      onSave?.(updated);
      return updated;
    });
  };

  const addTeam = () => {
    setDetail((prev) => ({
      ...prev,
      teams: [...prev.teams, emptyTeam(prev.competition.identifier)],
    }));
  };

  const removeTeam = (index: number) => {
    setDetail((prev) => ({
      ...prev,
      teams: prev.teams.filter((_, i) => i !== index),
    }));
    setTeamSearches((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const displayTitle =
    title ?? detail.names[0]?.value ?? `Competition ${detail.competition.identifier || "Detail"}`;

  return (
    <div className={cn("flex flex-col gap-6 pb-12 w-full max-w-4xl", className)}>
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onBack}
              aria-label="Go back"
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <ChevronLeft className="size-4" />
            </Button>
          )}
          <div className="flex flex-col min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">
              {displayTitle}
            </h3>
            <span className="text-xs text-muted-foreground">
              ID: {detail.competition.identifier}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION: Competition */}
      <section className="border border-border bg-card/40 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
          <Trophy className="size-4 text-primary" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Competition
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Identifier */}
          <ValidatedInput
            type="integer"
            label="Identifier"
            value={detail.competition.identifier}
            placeholder="e.g. 1"
            min={0}
            rules={{ required: true }}
            onValueChange={(val) => updateCompetitionField("identifier", val ?? 0)}
          />

          {/* 2. Type Dropdown */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-medium text-foreground select-none">
              Type
            </label>
            <Select
              value={String(detail.competition.type)}
              onValueChange={(val) => updateCompetitionField("type", Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {COMPETITION_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.value} = {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-[10px] text-muted-foreground select-none">
              Competition format category
            </span>
          </div>

          {/* 9. Color */}
          <ValidatedInput
            type="integer"
            label="Color"
            value={detail.competition.color}
            placeholder="e.g. 1"
            onValueChange={(val) => updateCompetitionField("color", val ?? 0)}
          />

          {/* 10. Card */}
          <ValidatedInput
            type="integer"
            label="Card"
            value={detail.competition.card}
            placeholder="e.g. 1"
            onValueChange={(val) => updateCompetitionField("card", val ?? 0)}
          />

          {/* 11. Leg */}
          <ValidatedInput
            type="integer"
            label="Leg"
            value={detail.competition.leg}
            placeholder="e.g. 2"
            onValueChange={(val) => updateCompetitionField("leg", val ?? 0)}
          />

          {/* 12. Qualification */}
          <ValidatedInput
            type="integer"
            label="Qualification"
            value={detail.competition.qualification}
            placeholder="e.g. 4"
            onValueChange={(val) => updateCompetitionField("qualification", val ?? 0)}
          />

          {/* 13. Lock Switch Toggle */}
          <div className="flex flex-col gap-2 p-3 border border-border/70 rounded-md bg-background/50 justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {detail.competition.lock === 1 ? (
                  <Lock className="size-3.5 text-primary" />
                ) : (
                  <Unlock className="size-3.5 text-muted-foreground" />
                )}
                <span className="text-xs font-medium text-foreground">Lock</span>
              </div>
              <Switch
                checked={detail.competition.lock === 1}
                onCheckedChange={(checked) =>
                  updateCompetitionField("lock", checked ? 1 : 0)
                }
                aria-label="Lock toggle"
              />
            </div>
            <span className="text-[10px] text-muted-foreground select-none">
              {detail.competition.lock === 1 ? "1 = On (Locked)" : "0 = Off (Unlocked)"}
            </span>
          </div>
        </div>

        {/* Blob Images */}
        <div className="mt-6 pt-4 border-t border-border/70">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Images & Logos
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <BlobImageInput
              label="Banner 480"
              suggestedDimensions="480 × 120"
              value={detail.competition.banner_480}
              onValueChange={(val) => updateCompetitionField("banner_480", val)}
            />
            <BlobImageInput
              label="Banner 960"
              suggestedDimensions="960 × 240"
              value={detail.competition.banner_960}
              onValueChange={(val) => updateCompetitionField("banner_960", val)}
            />
            <BlobImageInput
              label="Cup"
              value={detail.competition.cup}
              onValueChange={(val) => updateCompetitionField("cup", val)}
            />
            <BlobImageInput
              label="Logo 64"
              suggestedDimensions="64 × 64"
              value={detail.competition.logo_64}
              onValueChange={(val) => updateCompetitionField("logo_64", val)}
            />
            <BlobImageInput
              label="Logo 128"
              suggestedDimensions="128 × 128"
              value={detail.competition.logo_128}
              onValueChange={(val) => updateCompetitionField("logo_128", val)}
            />
            <BlobImageInput
              label="Logo 256"
              suggestedDimensions="256 × 256"
              value={detail.competition.logo_256}
              onValueChange={(val) => updateCompetitionField("logo_256", val)}
            />
          </div>
        </div>
      </section>

      {/* SECTION: Competition Name */}
      <section className="border border-border bg-card/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/70">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Competition Name
            </h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addName}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            Add Name
          </Button>
        </div>

        {detail.names.length === 0 ? (
          <p className="text-sm text-muted-foreground">No names defined.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {detail.names.map((nameItem, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3 border border-border/50 bg-background/50 items-end"
              >
                {/* 1. Language Dropdown */}
                <div className="sm:col-span-1 lg:col-span-4 flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-medium text-foreground select-none">
                    Language
                  </label>
                  <Select
                    value={String(nameItem.language)}
                    onValueChange={(val) =>
                      updateNameField(idx, "language", Number(val))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPETITION_LANGUAGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.value} = {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Value Text */}
                <div className="sm:col-span-1 lg:col-span-7">
                  <ValidatedInput
                    type="string"
                    label="Value"
                    value={nameItem.value}
                    placeholder="e.g. Premier League"
                    rules={{ required: true }}
                    onValueChange={(val) => updateNameField(idx, "value", val ?? "")}
                  />
                </div>

                {/* Remove button */}
                <div className="lg:col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeName(idx)}
                    className="text-destructive hover:text-destructive h-9 px-2"
                    aria-label="Remove name"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION: Competition Group */}
      <section className="border border-border bg-card/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/70">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Competition Group
            </h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addGroup}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            Add Group
          </Button>
        </div>

        {detail.groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No groups defined.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {detail.groups.map((groupItem, idx) => {
              const search = groupSearches[idx] ?? "";
              const filteredGroups = availableGroups.filter((g) =>
                (g.name ?? `Group ${g.identifier}`)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              );
              const selectedGroup = availableGroups.find(
                (g) => g.identifier === groupItem.group,
              );

              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 border border-border/50 bg-background/50 items-end"
                >
                  {/* 1. Group Dropdown with Search */}
                  <div className="sm:col-span-11 flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-medium text-foreground select-none">
                      Group
                    </label>
                    <Select
                      value={selectedGroup ? String(selectedGroup.identifier) : String(groupItem.group)}
                      onValueChange={(val) =>
                        updateGroupField(idx, "group", Number(val) || 0)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select group...">
                          {selectedGroup?.name ?? `Group ${groupItem.group}`}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        align="start"
                        alignItemWithTrigger={false}
                        className="w-[--anchor-width] min-w-56 max-h-72 p-0"
                      >
                        <div className="p-2 border-b border-border sticky top-0 bg-popover z-10">
                          <div className="relative flex items-center">
                            <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                              type="text"
                              placeholder="Search group..."
                              className="pl-8 h-7 text-xs"
                              value={search}
                              onChange={(e) =>
                                setGroupSearches((prev) => ({
                                  ...prev,
                                  [idx]: e.target.value,
                                }))
                              }
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="p-1">
                          {filteredGroups.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              No groups found
                            </p>
                          ) : (
                            filteredGroups.map((g) => (
                              <SelectItem key={g.identifier} value={String(g.identifier)}>
                                {g.name ?? `Group ${g.identifier}`}
                              </SelectItem>
                            ))
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                    <span className="text-[10px] text-muted-foreground select-none">
                      Selected ID: {groupItem.group}
                    </span>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroup(idx)}
                      className="text-destructive hover:text-destructive h-9 px-2"
                      aria-label="Remove group"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION: Competition Size */}
      <section className="border border-border bg-card/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/70">
          <div className="flex items-center gap-2">
            <Maximize2 className="size-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Competition Size
            </h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addSize}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            Add Size
          </Button>
        </div>

        {detail.sizes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sizes defined.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {detail.sizes.map((sizeItem, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 border border-border/50 bg-background/50 items-end"
              >
                {/* 1. Round */}
                <div className="sm:col-span-5">
                  <ValidatedInput
                    type="integer"
                    label="Round"
                    value={sizeItem.round}
                    placeholder="e.g. 1"
                    min={0}
                    rules={{ required: true }}
                    onValueChange={(val) => updateSizeField(idx, "round", val ?? 0)}
                  />
                </div>

                {/* 2. Size */}
                <div className="sm:col-span-6">
                  <ValidatedInput
                    type="integer"
                    label="Size"
                    value={sizeItem.size}
                    placeholder="e.g. 16"
                    min={0}
                    rules={{ required: true }}
                    onValueChange={(val) => updateSizeField(idx, "size", val ?? 0)}
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSize(idx)}
                    className="text-destructive hover:text-destructive h-9 px-2"
                    aria-label="Remove size"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION: Competition Team */}
      <section className="border border-border bg-card/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/70">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Competition Team
            </h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addTeam}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            Add Team
          </Button>
        </div>

        {detail.teams.length === 0 ? (
          <p className="text-sm text-muted-foreground">No teams assigned.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {detail.teams.map((teamItem, idx) => {
              const search = teamSearches[idx] ?? "";
              const filteredTeams = availableTeams.filter((t) =>
                (t.name ?? `Team ${t.identifier}`)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              );
              const selectedTeam = availableTeams.find(
                (t) => t.identifier === teamItem.team,
              );

              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 border border-border/50 bg-background/50 items-end"
                >
                  {/* 1. Team dropdown with search */}
                  <div className="sm:col-span-6 flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-medium text-foreground select-none">
                      Team
                    </label>
                    <Select
                      value={selectedTeam ? String(selectedTeam.identifier) : String(teamItem.team)}
                      onValueChange={(val) =>
                        updateTeamField(idx, "team", Number(val) || 0)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select team...">
                          {selectedTeam?.name ?? `Team ${teamItem.team}`}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        align="start"
                        alignItemWithTrigger={false}
                        className="w-[--anchor-width] min-w-56 max-h-72 p-0"
                      >
                        <div className="p-2 border-b border-border sticky top-0 bg-popover z-10">
                          <div className="relative flex items-center">
                            <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                              type="text"
                              placeholder="Search team..."
                              className="pl-8 h-7 text-xs"
                              value={search}
                              onChange={(e) =>
                                setTeamSearches((prev) => ({
                                  ...prev,
                                  [idx]: e.target.value,
                                }))
                              }
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="p-1">
                          {filteredTeams.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              No teams found
                            </p>
                          ) : (
                            filteredTeams.map((t) => (
                              <SelectItem key={t.identifier} value={String(t.identifier)}>
                                {t.name ?? `Team ${t.identifier}`}
                              </SelectItem>
                            ))
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                    <span className="text-[10px] text-muted-foreground select-none">
                      Selected ID: {teamItem.team}
                    </span>
                  </div>

                  {/* 2. Type Dropdown */}
                  <div className="sm:col-span-5 flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-medium text-foreground select-none">
                      Type
                    </label>
                    <Select
                      value={String(teamItem.type)}
                      onValueChange={(val) =>
                        updateTeamField(idx, "type", Number(val))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPETITION_TEAM_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.value} = {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-[10px] text-muted-foreground select-none">
                      Team participation slot type
                    </span>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeam(idx)}
                      className="text-destructive hover:text-destructive h-9 px-2"
                      aria-label="Remove team"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default CompetitionDetail;
