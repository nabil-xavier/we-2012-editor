import type * as React from "react";
import { Button } from "./ui/button";
import {
  Trophy,
  Users,
  Shield,
  Sliders,
  Database,
  Settings,
  FolderOpen,
  Save,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
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
} from "./ui/sidebar";
import { cn } from "#lib/utils";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export interface SidebarProps {
  items?: NavItem[];
  activeItemId?: string;
  onSelectItem?: (id: string) => void;
  className?: string;
}

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "teams", label: "Teams & Clubs", icon: Shield, badge: "24" },
  { id: "players", label: "Player Database", icon: Users, badge: "500+" },
  { id: "competitions", label: "Competitions", icon: Trophy },
  { id: "tactics", label: "Tactics & Formations", icon: Sliders },
  { id: "database", label: "Raw Database (.bin)", icon: Database },
  { id: "settings", label: "Editor Settings", icon: Settings },
];

export function Sidebar({
  items = DEFAULT_NAV_ITEMS,
  activeItemId = "teams",
  onSelectItem,
  className,
  ...props
}: SidebarProps & React.ComponentProps<typeof ShadcnSidebar>) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleSelectItem = (id: string) => {
    onSelectItem?.(id);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <ShadcnSidebar
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
                        isActive && "font-semibold shadow-xs"
                      )}
                    >
                      <Icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span className="truncate flex-1 text-left">{item.label}</span>
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
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
            <FolderOpen className="size-3.5" />
            <span>Open .bin File</span>
          </Button>
          <Button variant="default" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
            <Save className="size-3.5" />
            <span>Save Changes</span>
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </ShadcnSidebar>
  );
}

export default Sidebar;
