import type { ReactNode } from "react";
import { cn } from "#lib/utils";
import { LayoutGrid } from "lucide-react";

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
  return (
    <main
      className={cn(
        "flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-background",
        className
      )}
    >
      {/* Desktop Page Frame Header */}
      <div className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-border bg-card/20">
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
          children
        ) : (
          /* Placeholder Details Frame */
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-3">
              <LayoutGrid className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {title} Frame
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              This is the main details area. Specific editor forms, tables, and content will be implemented here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default MainContent;
