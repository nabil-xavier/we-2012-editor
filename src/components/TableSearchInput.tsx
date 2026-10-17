// src/components/TableSearchInput.tsx
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TableSearchInputProps {
  /** Current search text */
  value: string;
  /** Called on every keystroke and on clear */
  onValueChange: (value: string) => void;
  /** Placeholder of the field, e.g. `Search Player` */
  placeholder?: string;
  /** Rows currently rendered by the table */
  resultCount: number;
  /** Rows stored in the table */
  totalCount: number;
  /** True while the deferred search still trails the typed query */
  isSearching?: boolean;
  className?: string;
}

/** Search box of the virtualized browser plus its result counter */
export function TableSearchInput({
  value,
  onValueChange,
  placeholder = "Search",
  resultCount,
  totalCount,
  isSearching = false,
  className,
}: TableSearchInputProps) {
  const hasQuery = value.trim().length > 0;
  const hasResults = resultCount > 0;
  const counterLabel = hasQuery
    ? `${resultCount} / ${totalCount}`
    : `${totalCount} record${totalCount === 1 ? "" : "s"}`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-8 pl-8 pr-8"
          onChange={(event) => onValueChange(event.target.value)}
        />
        {hasQuery && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Clear search"
            className="absolute right-0.5 text-muted-foreground hover:text-foreground"
            onClick={() => onValueChange("")}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span>{isSearching ? "Searching…" : " "}</span>
        <span className={cn("font-mono", hasQuery && !hasResults && "text-amber-500")}>
          {hasQuery && !hasResults ? "No matches" : counterLabel}
        </span>
      </div>
    </div>
  );
}

export default TableSearchInput;
