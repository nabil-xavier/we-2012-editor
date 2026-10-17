// src/components/DatabaseBrowser.tsx
import { useMemo } from "react";
import { RecordDetailPanel } from "@/components/RecordDetailPanel";
import { TableSearchInput } from "@/components/TableSearchInput";
import { VirtualizedTable } from "@/components/VirtualizedTable";
import { useTableBrowser } from "@/hooks/useTableBrowser";
import { cn } from "@/lib/utils";
import type { BrowserTableConfig } from "@/types/table-browser";

export interface DatabaseBrowserProps {
  /** Table description: physical table, columns, search family, labels */
  config: BrowserTableConfig;
  className?: string;
}

/**
 * Search + virtualized table + details panel for one database table.
 *
 * Search text, scroll position and selection live in the view store, so an
 * edit routed through the database store re-renders the rows without losing
 * the query, the scroll offset or the selected record.
 */
export function DatabaseBrowser({ config, className }: DatabaseBrowserProps) {
  const {
    rows,
    query,
    appliedQuery,
    isSearching,
    setQuery,
    hasTable,
    totalCount,
    selectedIdentifier,
    selectedRecord,
    selectRecord,
    getCellValue,
  } = useTableBrowser(config);

  /** Values joined from other tables (group/competition names) shown first */
  const joinedFields = useMemo(() => {
    const labelColumnKey = config.labelSource?.labelColumn;
    if (!selectedRecord || !labelColumnKey) {
      return [];
    }
    return config.columns
      .filter((column) => column.key === labelColumnKey)
      .map((column) => ({
        key: column.key,
        title: column.title,
        value: getCellValue(selectedRecord, column),
      }));
  }, [config, selectedRecord, getCellValue]);

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

      {/* Table + details: side by side on desktop, stacked on mobile */}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <VirtualizedTable
          columns={config.columns}
          records={rows}
          getCellValue={getCellValue}
          selectedIdentifier={selectedIdentifier}
          onSelect={selectRecord}
          resetKey={appliedQuery}
          emptyMessage={emptyMessage}
          className="max-lg:h-[60dvh]"
        />

        {selectedIdentifier === null ? (
          <aside className="flex min-h-0 items-center justify-center border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Select a {config.label.toLowerCase()} to inspect it.
          </aside>
        ) : (
          <RecordDetailPanel
            tableName={config.tableName}
            label={config.label}
            identifier={selectedIdentifier}
            row={selectedRecord?.row ?? null}
            extraFields={joinedFields}
            onClose={() => selectRecord(null)}
            className="max-lg:max-h-[70dvh]"
          />
        )}
      </div>
    </div>
  );
}

export default DatabaseBrowser;

