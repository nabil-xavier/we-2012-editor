import { useState, type ReactNode } from "react";
import { cn } from "#lib/utils";
import { DataTable, type DataTableColumn } from "./DataTable";
import { ItemDetail } from "./ItemDetail";

// ---------------------------------------------------------------------------
// Placeholder data — replace with real data sources per nav item later
// ---------------------------------------------------------------------------
const COLUMNS: DataTableColumn[] = [
  { key: "id", title: "ID" },
  { key: "name", title: "Name" },
  { key: "status", title: "Status" },
];

const DUMMY_DATA: Record<string, unknown>[] = [
  { id: 1, name: "FC Barcelona", status: "Active" },
  { id: 2, name: "Real Madrid", status: "Active" },
  { id: 3, name: "Atletico Madrid", status: "Inactive" },
  { id: 4, name: "Sevilla FC", status: "Active" },
  { id: 5, name: "Valencia CF", status: "Inactive" },
];
// ---------------------------------------------------------------------------

export interface MainContentProps {
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function MainContent({
  title = "Details Page",
  description = "Content will be rendered here in subsequent editor modules.",
  headerActions,
  children,
  className,
}: MainContentProps) {
  // null = list view; non-null = detail view for the selected row
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null);

  return (
    <main
      className={cn(
        "flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-background",
        className
      )}
    >
      {/* Desktop Page Frame Header */}
      <div className="hidden md:flex items-center justify-between px-8 py-5 border-b border-border bg-card/20">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
        {headerActions && (
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        )}
      </div>

      {/* Main Details Body */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {children ? (
          // If parent passes explicit children, render those instead
          children
        ) : selectedItem ? (
          // Detail view — shown after clicking a row
          <ItemDetail
            title={String(selectedItem["name"] ?? "Item Details")}
            onBack={() => setSelectedItem(null)}
          />
        ) : (
          // List view — the data table
          <DataTable
            columns={COLUMNS}
            data={DUMMY_DATA}
            onRowClick={(row) => setSelectedItem(row)}
          />
        )}
      </div>
    </main>
  );
}

export default MainContent;
