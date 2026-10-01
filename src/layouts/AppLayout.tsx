import { useState, type ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { MainContent } from "@/components/MainContent";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/nav";
import { DEFAULT_NAV_ITEMS } from "@/data/nav-items";

export interface AppLayoutProps {
  navItems?: NavItem[];
  defaultSelectedId?: string;
  children?: (activeItem: NavItem) => ReactNode;
  className?: string;
}

export function AppLayout({
  navItems = DEFAULT_NAV_ITEMS,
  defaultSelectedId = "teams",
  children,
  className,
}: AppLayoutProps) {
  const [activeItemId, setActiveItemId] = useState<string>(defaultSelectedId);

  const activeItem =
    navItems.find((item) => item.id === activeItemId) || navItems[0];

  const handleSelectItem = (id: string) => {
    setActiveItemId(id);
  };

  return (
    <SidebarProvider className={cn("min-h-dvh bg-background text-foreground", className)}>
      {/* Sidebar navigation using ui/sidebar primitives */}
      <AppSidebar
        items={navItems}
        activeItemId={activeItemId}
        onSelectItem={handleSelectItem}
      />

      {/* Main layout container with inset */}
      <SidebarInset className="flex flex-col min-w-0 h-dvh overflow-hidden">
        {/* Page Header (Mobile & Desktop) */}
        <Header
          title={activeItem?.label}
          description={`Editor frame for ${activeItem?.label.toLowerCase()}`}
        />

        {/* Details Page / Main View */}
        <MainContent>
          {children ? children(activeItem) : undefined}
        </MainContent>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppLayout;
