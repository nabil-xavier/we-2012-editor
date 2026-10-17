// src/components/GroupDetail.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { BlobImageInput } from "@/components/ui/BlobImageInput";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  GroupDetail,
  GroupData,
  GroupTeamData,
} from "@/types/group";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Search,
  Globe,
  Shield,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectOption } from "@/types/select";

export interface GroupDetailProps {
  /** Optional initial group detail */
  groupDetail?: GroupDetail;
  /** Callback when data changes */
  onSave?: (detail: GroupDetail) => void;
  /** Called when the user clicks Back */
  onBack?: () => void;
  /** Optional header title */
  title?: string;
  /** Team options offered by the team selects (from the loaded database) */
  teamOptions?: SelectOption[];
  /** Optional CSS class for root element */
  className?: string;
}

// ---------------------------------------------------------------------------
// Default empty objects
// ---------------------------------------------------------------------------
const emptyGroup: GroupData = {
  identifier: 0,
  logo: null,
  language: 0,
  value: "",
};

const emptyTeam = (group: number): GroupTeamData => ({
  identifier: 0,
  group,
  team: 0,
});

// ---------------------------------------------------------------------------
// Empty detail: no group row loaded yet
// ---------------------------------------------------------------------------
const EMPTY_GROUP_DETAIL: GroupDetail = {
  group: emptyGroup,
  teams: [],
};

export function GroupDetail({
  groupDetail = EMPTY_GROUP_DETAIL,
  onSave,
  onBack,
  title,
  teamOptions = [],
  className,
}: GroupDetailProps) {
  const [detail, setDetail] = useState<GroupDetail>(() => ({
    group: { ...emptyGroup, ...(groupDetail.group ?? {}) },
    teams: (groupDetail.teams ?? []).map((t) => ({
      ...emptyTeam(t.group),
      ...t,
    })),
  }));

  // Team select search state per row
  const [teamSearches, setTeamSearches] = useState<Record<number, string>>({});

  // -------------------------------------------------------------------------
  // Update helpers
  // -------------------------------------------------------------------------
  const updateGroupField = <K extends keyof GroupData>(
    field: K,
    value: GroupData[K],
  ) => {
    setDetail((prev) => {
      const updated = { ...prev, group: { ...prev.group, [field]: value } };
      onSave?.(updated);
      return updated;
    });
  };

  const updateTeamField = <K extends keyof GroupTeamData>(
    index: number,
    field: K,
    value: GroupTeamData[K],
  ) => {
    setDetail((prev) => {
      const teams = prev.teams.map((t, i) =>
        i === index ? { ...t, [field]: value } : t,
      );
      const updated = { ...prev, teams };
      onSave?.(updated);
      return updated;
    });
  };

  const addTeam = () => {
    setDetail((prev) => ({
      ...prev,
      teams: [...prev.teams, emptyTeam(prev.group.identifier)],
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

  const displayTitle = title ?? `Group ${detail.group.identifier || "Detail"}`;

  return (
    <div
      className={cn("flex flex-col gap-6 pb-12 w-full max-w-4xl", className)}
    >
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
            <h3 className="text-base font-semibold text-foreground truncate">
              {displayTitle}
            </h3>
          </div>
        </div>
      </div>

      {/* SECTION: Group */}
      <section className="border border-border bg-card/40 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
          <Globe className="size-4 text-primary" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Group
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ValidatedInput
            type="integer"
            label="Identifier"
            value={detail.group.identifier}
            placeholder="e.g. 1"
            min={0}
            rules={{ required: true }}
            onValueChange={(val) => updateGroupField("identifier", val ?? 0)}
          />
          <ValidatedInput
            type="integer"
            label="Language (0=EN, 1=Alt)"
            value={detail.group.language}
            placeholder="0 or 1"
            min={0}
            max={1}
            rules={{ required: true }}
            onValueChange={(val) => updateGroupField("language", val ?? 0)}
          />
          <ValidatedInput
            type="string"
            label="Value"
            value={detail.group.value}
            placeholder="e.g. Group A"
            rules={{ required: true }}
            onValueChange={(val) => updateGroupField("value", val ?? "")}
          />
          <div className="sm:col-span-2 lg:col-span-3">
            <BlobImageInput
              label="Logo"
              value={detail.group.logo}
              onValueChange={(val) => updateGroupField("logo", val)}
            />
          </div>
        </div>
      </section>

      {/* SECTION: Group Team */}
      <section className="border border-border bg-card/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/70">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Group Team
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
          <p className="text-sm text-muted-foreground">
            No team entries. Add one above.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {detail.teams.map((team, idx) => {
              const search = teamSearches[idx] ?? "";
              const filteredTeams = teamOptions.filter((option) =>
                option.label.toLowerCase().includes(search.toLowerCase()),
              );

              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border border-border/50 bg-background/50"
                >
                  {/* Team select with search */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-medium text-foreground select-none">
                      Team
                    </label>
                    <Select
                      value={team.team ? String(team.team) : undefined}
                      onValueChange={(val) =>
                        updateTeamField(idx, "team", Number(val) || 0)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select team..." />
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
                            filteredTeams.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                    <span className="text-[10px] text-muted-foreground select-none">
                      Team assigned to this group
                    </span>
                  </div>

                  <div className="flex items-center sm:col-span-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeam(idx)}
                      className="text-destructive hover:text-destructive gap-1.5"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
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

export default GroupDetail;
