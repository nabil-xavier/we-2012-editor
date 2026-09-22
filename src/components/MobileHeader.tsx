import { Button } from "./ui/button";
import { ChevronLeft, Menu } from "lucide-react";
import { cn } from "#lib/utils";

export interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onMenuToggle?: () => void;
  showBack?: boolean;
  className?: string;
}

export function MobileHeader({
  title = "Details",
  subtitle,
  onBack,
  onMenuToggle,
  showBack = true,
  className,
}: MobileHeaderProps) {
  return (
    <header
      className={cn(
        "flex lg:hidden sticky top-0 z-40 items-center justify-between h-14 px-3 border-b border-border bg-background/90 backdrop-blur shadow-xs select-none",
        className
      )}
    >
      {/* Left Back Navigation Button */}
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
        ) : onMenuToggle ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </Button>
        ) : null}
      </div>

      {/* Center Title Display */}
      <div className="flex flex-col items-center justify-center text-center px-2 flex-1 min-w-0">
        <h1 className="text-sm font-semibold tracking-tight text-foreground truncate max-w-[200px]">
          {title}
        </h1>
        {subtitle && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
            {subtitle}
          </span>
        )}
      </div>

      {/* Right Balance Slot */}
      <div className="flex items-center justify-end min-w-[70px]">
        {onMenuToggle && showBack && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="size-4" />
          </Button>
        )}
      </div>
    </header>
  );
}

export default MobileHeader;
