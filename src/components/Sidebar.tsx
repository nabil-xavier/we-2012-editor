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
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 xl:w-72 h-dvh shrink-0 border-r border-border bg-card/60 backdrop-blur select-none",
        className
      )}
    >
      {/* App Branding Header */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
        <div className="flex items-center justify-center size-9 rounded-md bg-primary text-primary-foreground shadow-sm">
          <Trophy className="size-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm tracking-tight text-foreground truncate">
            Football Editor
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            WE 2012 Engine
          </span>
        </div>
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-2 pb-2 text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
          Editor Menu
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItemId === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              onClick={() => onSelectItem?.(item.id)}
              className={cn(
                "w-full justify-start h-9 px-2.5 text-xs font-medium rounded-md gap-2.5",
                isActive
                  ? "bg-secondary text-secondary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="truncate flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                  {item.badge}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Quick Action Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
          <FolderOpen className="size-3.5" />
          <span>Open .bin File</span>
        </Button>
        <Button variant="default" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
          <Save className="size-3.5" />
          <span>Save Changes</span>
        </Button>
      </div>
    </aside>
  );
}

export default Sidebar;
