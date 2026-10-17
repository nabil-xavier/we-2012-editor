// src/components/DatabaseRecordDetail.tsx
import { Suspense, useMemo } from "react";
import { DetailLoading } from "@/components/DetailLoading";
import {
  LazyBallDetail,
  LazyCompetitionDetail,
  LazyFormationDetail,
  LazyGroupDetail,
  LazyPlayerDetail,
  LazyTeamDetail,
} from "@/components/LazyDetailPages";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import type { BrowserTableConfig } from "@/types/table-browser";
import { buildBrowserDetail, type BrowserDetailPayload } from "@/utils/database-detail";

export interface DatabaseRecordDetailProps {
  /** Table description of the record that was opened */
  config: BrowserTableConfig;
  /** Key of the record inside `config.tableName` */
  identifier: number;
  /** Leave the detail page and return to the table browser */
  onBack: () => void;
  className?: string;
}

/**
 * Full detail page of one database row, reached by clicking that row in the
 * browser.
 *
 * The payload is read straight from the database store, and the detail page is
 * remounted per identifier (`key`): the detail components seed their state once
 * (`useState(() => ({ ... }))`) and never resync with their props, so reusing an
 * instance across two records would keep showing the first one.
 *
 * Read-only round: no save callback is passed, so an edit made here is dropped
 * when the page is left.
 */
export function DatabaseRecordDetail({
  config,
  identifier,
  onBack,
  className,
}: DatabaseRecordDetailProps) {
  const database = useDatabaseStore((state) => state.database);

  const payload = useMemo(
    () => buildBrowserDetail(database, config, identifier),
    [database, config, identifier]
  );

  if (!payload) {
    return (
      <div
        className={cn(
          "flex h-full min-h-0 flex-col items-center justify-center gap-3 border border-dashed border-border p-6 text-center",
          className
        )}
      >
        <p className="text-xs text-muted-foreground">
          {config.label} #{identifier} is not part of the loaded database.
        </p>
        <Button variant="outline" size="sm" onClick={onBack}>
          Back to {config.label}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <Suspense fallback={<DetailLoading />}>
        {renderDetailPage(payload, {
          identifier,
          title: `${config.label} #${identifier}`,
          onBack,
        })}
      </Suspense>
    </div>
  );
}

/** Context shared by every rendered detail page */
interface DetailPageContext {
  identifier: number;
  title: string;
  onBack: () => void;
}

/** Detail page of one payload, remounted through `key` when the record changes */
function renderDetailPage(
  payload: BrowserDetailPayload,
  { identifier, title, onBack }: DetailPageContext
) {
  switch (payload.kind) {
    case "player":
      return (
        <LazyPlayerDetail
          key={identifier}
          player={payload.player}
          title={title}
          onBack={onBack}
        />
      );
    case "team":
      return (
        <LazyTeamDetail
          key={identifier}
          initialData={payload.team}
          title={title}
          onBack={onBack}
        />
      );
    case "competition":
      return (
        <LazyCompetitionDetail
          key={identifier}
          competitionDetail={payload.competition}
          availableGroups={payload.availableGroups}
          availableTeams={payload.availableTeams}
          title={title}
          onBack={onBack}
        />
      );
    case "group":
      return (
        <LazyGroupDetail
          key={identifier}
          groupDetail={payload.group}
          title={title}
          onBack={onBack}
        />
      );
    case "formation":
      return (
        <LazyFormationDetail
          key={identifier}
          formationDetail={payload.formation}
          title={title}
          onBack={onBack}
        />
      );
    case "ball":
      return (
        <LazyBallDetail
          key={identifier}
          ball={payload.ball}
          title={title}
          onBack={onBack}
        />
      );
  }
}

export default DatabaseRecordDetail;
