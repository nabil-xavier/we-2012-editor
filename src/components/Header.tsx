import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";

export interface HeaderProps {
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  onSave?: () => void;
  className?: string;
}

export function Header({
  title = "Details",
  onSave,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border select-none",
        className,
      )}
    >
      <div className="flex items-center justify-between h-14 md:h-16 px-3 md:px-8">
        {/* Left: Mobile Back button or Sidebar Trigger (hidden on desktop) */}
        <div className="flex md:hidden items-center gap-1.5 min-w-17.5">
          <SidebarTrigger className="size-4 px-2.5" />
        </div>

        {/* Center: Title & Description */}
        <div className="flex flex-col justify-center min-w-0 flex-1 md:flex-initial">
          <h2 className="text-sm md:text-xl font-bold tracking-tight text-foreground truncate text-center">
            {title}
          </h2>
        </div>

        {/* Right: Minimal Save Changes button */}
        <div className="flex items-center justify-end gap-2 min-w-17.5">
          <Button variant="default" onClick={onSave} className="h-8 px-2.5">
            <Save className="size-4" />
            <span className="hidden md:inline">Save</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
