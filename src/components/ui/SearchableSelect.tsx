import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types/select";
import { Search } from "lucide-react";

export interface SearchableSelectProps {
  /** Element ID applied to the trigger */
  id?: string;
  /** Label text displayed above the select */
  label?: string;
  /** Hint text displayed below the select */
  helperText?: string;
  /** Placeholder shown when no value is selected */
  placeholder?: string;
  /** Placeholder of the inline search field */
  searchPlaceholder?: string;
  /** Message shown when the search returns no option */
  emptyMessage?: string;
  /** Current value (stringified option value) */
  value?: string;
  /** Available options */
  options: SelectOption[];
  /** Change callback fired with the selected option value */
  onValueChange?: (value: string) => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Additional class names applied to the trigger */
  className?: string;
  /** Additional class names applied to the outer wrapper */
  containerClassName?: string;
}

/**
 * Dropdown select with an inline search field filtering the option list.
 */
export function SearchableSelect({
  id,
  label,
  helperText,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found",
  value,
  options,
  onValueChange,
  disabled,
  className,
  containerClassName,
}: SearchableSelectProps) {
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return options;
    }
    return options.filter((option) => {
      const haystack = `${option.label} ${option.description ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [options, search]);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label ? (
        <label
          htmlFor={id}
          className="text-xs font-medium text-foreground select-none"
        >
          {label}
        </label>
      ) : null}

      <Select
        value={value}
        disabled={disabled}
        onValueChange={(val) => onValueChange?.(String(val ?? ""))}
        onOpenChange={(open) => {
          if (!open) {
            setSearch("");
          }
        }}
      >
        <SelectTrigger id={id} className={cn("w-full", className)}>
          <SelectValue placeholder={placeholder} />
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
                placeholder={searchPlaceholder}
                className="pl-8 h-7 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                {emptyMessage}
              </p>
            ) : (
              filteredOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex flex-col items-start gap-0.5">
                    <span className="text-xs text-foreground">{option.label}</span>
                    {option.description ? (
                      <span className="text-[10px] text-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>

      {helperText ? (
        <span className="text-[10px] text-muted-foreground select-none">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export default SearchableSelect;
