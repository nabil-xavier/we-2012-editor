import { useRef } from "react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { FolderOpen, ArrowDownToLine, Loader2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useDatabaseImport } from "@/hooks/useDatabaseImport";
import { DATABASE_FILE_EXTENSION } from "@/services/database";
import type { NavItem } from "@/types/nav";

export interface AppSidebarProps {
  items?: NavItem[];
  activeItemId?: string;
  onSelectItem?: (id: string) => void;
  className?: string;
}

export function AppSidebar({
  items = [],
  activeItemId = "teams",
  onSelectItem,
  className,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile, isMobile } = useSidebar();
  const { handleFileChange, isLoading, error, fileName } = useDatabaseImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectItem = (id: string) => {
    onSelectItem?.(id);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleOpenDatabaseClick = () => {
    fileInputRef.current?.click();
  };

  // Derived UI state kept out of JSX (AGENTS.MD §5)
  const OpenDatabaseIcon = isLoading ? Loader2 : FolderOpen;
  const openDatabaseLabel = isLoading
    ? `Opening ${DATABASE_FILE_EXTENSION} File…`
    : `Open ${DATABASE_FILE_EXTENSION} File`;
  const statusMessage = error ?? fileName;
  const statusClassName = cn(
    "px-1 pt-0.5 text-[10px] leading-snug",
    error
      ? "text-destructive break-words"
      : "font-mono text-muted-foreground truncate",
  );

  return (
    <Sidebar
      className={cn("select-none", className)}
      collapsible="offcanvas"
      {...props}
    >
      {/* App Branding Header */}
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm tracking-tight text-sidebar-foreground truncate">
              WE 2012 Editor
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation Menu List */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
            Editor Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItemId === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleSelectItem(item.id)}
                      tooltip={item.label}
                      className={cn(
                        "rounded-md gap-2.5 px-2.5 h-9 text-xs",
                        isActive && "font-semibold shadow-xs",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span className="truncate flex-1 text-left">
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="rounded-full bg-muted text-muted-foreground font-mono text-[10px] px-1.5 py-0.5">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Quick Action Footer */}
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="space-y-1">
          <input
            ref={fileInputRef}
            type="file"
            accept={DATABASE_FILE_EXTENSION}
            className="hidden"
            disabled={isLoading}
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-8 text-xs"
            onClick={handleOpenDatabaseClick}
            disabled={isLoading}
          >
            <OpenDatabaseIcon
              className={cn("size-4 shrink-0", isLoading && "animate-spin")}
            />
            <span className="truncate">{openDatabaseLabel}</span>
          </Button>
          <Button
            className="w-full justify-start gap-2 h-8 text-xs"
          >
            <ArrowDownToLine className="size-4" />
            <span>Download .bin File</span>
          </Button>
          {statusMessage && <p className={statusClassName}>{statusMessage}</p>}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
