// src/components/DetailLoading.tsx
import { cn } from "@/lib/utils";

export interface DetailLoadingProps {
  /** Optional CSS class for root element */
  className?: string;
}

/**
 * Suspense fallback of the code-split detail pages: shown while the chunk of a
 * detail page is downloaded, which only happens on the first visit.
 */
export function DetailLoading({ className }: DetailLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex h-full min-h-0 flex-col gap-3 border border-dashed border-border p-4 sm:p-6",
        className
      )}
    >
      <span className="text-xs text-muted-foreground">Loading details…</span>
      <div className="h-24 animate-pulse bg-muted/60" />
      <div className="h-40 animate-pulse bg-muted/40" />
    </div>
  );
}

export default DetailLoading;
