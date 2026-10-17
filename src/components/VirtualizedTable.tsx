// src/components/VirtualizedTable.tsx
import { useCallback, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import type { BrowserColumn, BrowserRecord } from "@/types/table-browser";

/** Fixed row height in pixels — a constant height keeps scroll stable across edits */
export const TABLE_ROW_HEIGHT = 30;

/** Rows kept rendered above and below the viewport while scrolling */
const DEFAULT_OVERSCAN = 12;

export interface VirtualizedTableProps {
  /** Column definitions driving the grid tracks and the header */
  columns: BrowserColumn[];
  /** Rows to render, in display order */
  records: BrowserRecord[];
  /** Display text of one cell */
  getCellValue: (record: BrowserRecord, column: BrowserColumn) => string;
  /** Identifier of the highlighted row */
  selectedIdentifier?: number | null;
  /** Called with the row identifier when a row is clicked or activated */
  onSelect?: (identifier: number) => void;
  /**
   * Value that resets the scroll position when it changes.
   * Pass the applied search query: editing a record leaves it untouched, so
   * the scroll position survives every save.
   */
  resetKey?: string;
  /** Row height used by the virtualizer, in pixels */
  rowHeight?: number;
  /** Message shown when `records` is empty */
  emptyMessage?: string;
  className?: string;
}

/**
 * Table body rendered through `@tanstack/react-virtual`: only the rows inside
 * the viewport (plus a small overscan) exist in the DOM, so 10,000+ records
 * scroll like a short list.
 *
 * Built on CSS grid rows instead of `ui/table` because a virtualized `<tbody>`
 * needs `display: block` + absolutely positioned rows, which breaks `<table>`
 * column layout. ARIA table roles are applied so assistive technology still
 * reads it as a table.
 */
export function VirtualizedTable({
  columns,
  records,
  getCellValue,
  selectedIdentifier = null,
  onSelect,
  resetKey = "",
  rowHeight = TABLE_ROW_HEIGHT,
  emptyMessage = "No records to display.",
  className,
}: VirtualizedTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: DEFAULT_OVERSCAN,
    // Key rows by identifier so a row keeps its DOM node when the list is
    // filtered or edited instead of being remounted per index.
    getItemKey: (index) => records[index]?.identifier ?? index,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const gridTemplateColumns = columns.map((column) => column.track).join(" ");
  const isEmpty = records.length === 0;

  // A new search restarts at the top; an edit never changes `resetKey`.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [resetKey]);

  const handleActivate = useCallback(
    (identifier: number) => {
      onSelect?.(identifier);
    },
    [onSelect]
  );

  return (
    <div
      role="table"
      aria-rowcount={records.length}
      aria-colcount={columns.length}
      className={cn(
        "flex min-h-0 flex-col overflow-hidden border border-border bg-card/40",
        className
      )}
    >
      {/* Header — one cell per configured column, never virtualized */}
      <div
        role="row"
        className="grid shrink-0 border-b border-border bg-muted/40 text-xs font-medium text-foreground"
        style={{ gridTemplateColumns }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            role="columnheader"
            className={cn(
              "truncate px-2 py-2",
              column.align === "right" && "text-right"
            )}
          >
            {column.title}
          </div>
        ))}
      </div>

      {/* Viewport — the only scroll container of the table */}
      <div
        ref={scrollRef}
        role="rowgroup"
        className="min-h-0 flex-1 overflow-auto"
      >
        {isEmpty ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <div
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualRows.map((virtualRow) => {
              const record = records[virtualRow.index];
              if (!record) {
                return null;
              }
              const isSelected = record.identifier === selectedIdentifier;

              return (
                <div
                  key={virtualRow.key}
                  role="row"
                  aria-selected={isSelected}
                  data-index={virtualRow.index}
                  tabIndex={0}
                  onClick={() => handleActivate(record.identifier)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleActivate(record.identifier);
                    }
                  }}
                  className={cn(
                    "absolute inset-x-0 top-0 grid cursor-pointer items-center border-b border-border/60 text-xs transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
                    isSelected && "bg-muted"
                  )}
                  style={{
                    gridTemplateColumns,
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      role="cell"
                      className={cn(
                        "truncate px-2",
                        column.align === "right" && "text-right"
                      )}
                    >
                      {getCellValue(record, column)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualizedTable;
