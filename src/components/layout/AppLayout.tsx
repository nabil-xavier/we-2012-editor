import { useState, type ReactNode } from "react";
import { Sidebar, DEFAULT_NAV_ITEMS, type NavItem } from "#components/Sidebar";
import { MobileHeader } from "#components/MobileHeader";
import { MainContent } from "#components/MainContent";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "#components/ui/sidebar";
import { cn } from "#lib/utils";

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
      <Sidebar
        items={navItems}
        activeItemId={activeItemId}
        onSelectItem={handleSelectItem}
      />

      {/* Main layout container with inset */}
      <SidebarInset className="flex flex-col min-w-0 h-dvh overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader
          title={activeItem?.label}
        />

        {/* Details Page / Main View */}
        <MainContent
          title={activeItem?.label}
          description={`Editor frame for ${activeItem?.label.toLowerCase()}`}
          headerActions={
            <SidebarTrigger className="hidden md:flex" />
          }
        >
          {children ? children(activeItem) : undefined}
        </MainContent>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppLayout;
