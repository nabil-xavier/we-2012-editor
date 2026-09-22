import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { cn } from "#lib/utils";

export interface MobileHeaderProps {
  title?: string;
  onBack?: () => void;
  onMenuToggle?: () => void;
  showBack?: boolean;
  className?: string;
}

export function MobileHeader({
  title = "Details",
  onBack,
  showBack = false,
  className,
}: MobileHeaderProps) {
  return (
    <header
      className={cn(
        "flex md:hidden sticky top-0 z-40 items-center justify-between h-14 px-3 border-b border-border bg-background/90 backdrop-blur shadow-xs select-none",
        className
      )}
    >
      {/* Left Navigation / Trigger */}
      <div className="flex items-center gap-1.5 min-w-[70px]">
        {showBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground font-medium"
            aria-label="Go back"
          >
            <ChevronLeft className="size-4" />
            <span>Back</span>
          </Button>
        ) : (
          <SidebarTrigger />
        )}
      </div>

      {/* Center Title Display */}
      <div className="flex flex-col items-center justify-center text-center px-2 flex-1 min-w-0">
        <h3 className="text-sm font-semibold tracking-tight text-foreground truncate max-w-[200px]">
          {title}
        </h3>
      </div>

      {/* Right Balance Slot */}
      <div className="flex items-center justify-end min-w-[70px]">
        {showBack && (
          <SidebarTrigger />
        )}
      </div>
    </header>
  );
}

export default MobileHeader;

