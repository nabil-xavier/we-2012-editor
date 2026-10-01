import type * as React from "react";
import { Button } from "@/components/ui/button";
import { FolderOpen, ArrowDownToLine } from "lucide-react";
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

  const handleSelectItem = (id: string) => {
    onSelectItem?.(id);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

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
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-8 text-xs"
          >
            <FolderOpen className="size-4" />
            <span>Open .bin File</span>
          </Button>
          <Button
            className="w-full justify-start gap-2 h-8 text-xs"
          >
            <ArrowDownToLine className="size-4" />
            <span>Download .bin File</span>
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
