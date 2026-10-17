// src/components/RecordDetailPanel.tsx
import { useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDirtyState } from "@/hooks/useDirtyState";
import { schemas } from "@/schema";
import { cn } from "@/lib/utils";
import type { DatabaseRow } from "@/types/database";
import { toDetailFields, type DetailField } from "@/utils/table-browser";

export interface RecordDetailPanelProps {
  /** Table the record belongs to, e.g. `player` */
  tableName: string;
  /** Human readable table name, e.g. `Player` */
  label: string;
  /** Primary key of the shown record */
  identifier: number;
  /** Record fields, `null` when the record is not in the database */
  row: DatabaseRow | null;
  /** Values joined from other tables (name, display labels) shown first */
  extraFields?: DetailField[];
  /** Close the panel and drop the selection */
  onClose: () => void;
  className?: string;
}

/**
 * Inspector of the selected record.
 *
 * Fields follow the table schema (`src/schema`) so enum values are annotated
 * with their label and relation values with their target table; columns that
 * the schema does not know yet are appended, keeping unknown `.bin` dumps
 * readable. Values stay read-only here — the record editors are a separate
 * surface.
 */
export function RecordDetailPanel({
  tableName,
  label,
  identifier,
  row,
  extraFields,
  onClose,
  className,
}: RecordDetailPanelProps) {
  const { isRecordDirty } = useDirtyState();
  const isDirty = isRecordDirty(tableName, identifier);

  const fields = useMemo(
    () => toDetailFields(row, schemas[tableName], extraFields),
    [row, tableName, extraFields]
  );

  return (
    <aside
      aria-label={`${label} details`}
      className={cn(
        "flex min-h-0 flex-col border border-border bg-card/40",
        className
      )}
    >
      {/* Panel header — identity + unsaved badge + close */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-semibold text-foreground">
            {label} #{identifier}
          </span>
          {isDirty && (
            <span className="shrink-0 font-mono text-[10px] text-amber-500">
              ● unsaved
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close details"
          className="text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Field list — schema order first, unknown columns appended */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {row === null ? (
          <p className="text-xs text-muted-foreground">
            This record is not part of the loaded database. It may have been
            deleted.
          </p>
        ) : (
          <dl className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs">
            {fields.map((field) => (
              <div key={field.key} className="col-span-2 grid grid-cols-subgrid">
                <dt className="truncate text-muted-foreground" title={field.key}>
                  {field.title}
                </dt>
                <dd className="break-words font-mono text-foreground">
                  {field.value.length > 0 ? field.value : "—"}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </aside>
  );
}

export default RecordDetailPanel;

