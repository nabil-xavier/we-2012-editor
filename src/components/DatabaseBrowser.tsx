// src/components/DatabaseBrowser.tsx
import { useCallback } from "react";
import { TableSearchInput } from "@/components/TableSearchInput";
import { VirtualizedTable } from "@/components/VirtualizedTable";
import { useTableBrowser } from "@/hooks/useTableBrowser";
import { cn } from "@/lib/utils";
import type { BrowserTableConfig } from "@/types/table-browser";

export interface DatabaseBrowserProps {
  /** Table description: physical table, columns, search family, labels */
  config: BrowserTableConfig;
  /**
   * Called with the identifier of the clicked (or activated) row, just after
   * that row is selected. Opening the full detail page is the caller's job.
   */
  onOpenRecord?: (identifier: number) => void;
  className?: string;
}

/**
 * Search + virtualized table for one database table.
 *
 * Search text, scroll position and selection live in the view store, so an
 * edit routed through the database store re-renders the rows without losing
 * the query, the scroll offset or the selected record. Clicking a row selects
 * it and reports it through `onOpenRecord`, which routes to the detail page.
 */
export function DatabaseBrowser({
  config,
  onOpenRecord,
  className,
}: DatabaseBrowserProps) {
  const {
    rows,
    query,
    appliedQuery,
    isSearching,
    setQuery,
    hasTable,
    totalCount,
    selectedIdentifier,
    selectRecord,
    getCellValue,
  } = useTableBrowser(config);

  const handleSelect = useCallback(
    (identifier: number) => {
      selectRecord(identifier);
      onOpenRecord?.(identifier);
    },
    [selectRecord, onOpenRecord]
  );

  const term = appliedQuery.trim();
  const emptyMessage =
    totalCount === 0
      ? `No rows in “${config.tableName}”.`
      : `No ${config.label.toLowerCase()} matches “${term}”.`;

  if (!hasTable) {
    return (
      <div
        className={cn(
          "flex h-full min-h-0 items-center justify-center border border-dashed border-border p-6 text-xs text-muted-foreground",
          className
        )}
      >
        Table “{config.tableName}” is not part of the loaded database.
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-3", className)}>
      <TableSearchInput
        value={query}
        onValueChange={setQuery}
        placeholder={config.searchPlaceholder}
        resultCount={rows.length}
        totalCount={totalCount}
        isSearching={isSearching}
        className="w-full max-w-md shrink-0"
      />

      <VirtualizedTable
        columns={config.columns}
        records={rows}
        getCellValue={getCellValue}
        selectedIdentifier={selectedIdentifier}
        onSelect={handleSelect}
        resetKey={appliedQuery}
        emptyMessage={emptyMessage}
        className="min-h-0 flex-1 max-lg:h-[60dvh]"
      />
    </div>
  );
}

export default DatabaseBrowser;

