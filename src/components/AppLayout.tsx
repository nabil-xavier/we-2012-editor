import { useState, type ReactNode } from "react";
import { Sidebar, DEFAULT_NAV_ITEMS, type NavItem } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { MainContent } from "./MainContent";
import { Button } from "./ui/button";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const activeItem =
    navItems.find((item) => item.id === activeItemId) || navItems[0];

  const handleSelectItem = (id: string) => {
    setActiveItemId(id);
    setIsMobileMenuOpen(false);
  };

  const handleBack = () => {
    // When on mobile, hitting back opens/returns to the menu selection list
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <div
      className={cn(
        "min-h-dvh flex flex-col lg:flex-row bg-background text-foreground overflow-hidden",
        className
      )}
    >
      {/* Desktop 2-Column: Column 1 (Left Sidebar Menu) */}
      <Sidebar
        items={navItems}
        activeItemId={activeItemId}
        onSelectItem={handleSelectItem}
      />

      {/* Mobile Stack: Floating Header for Back Route Navigation */}
      <MobileHeader
        title={isMobileMenuOpen ? "Select Menu" : activeItem?.label}
        subtitle="Football Game Editor"
        onBack={handleBack}
        showBack={!isMobileMenuOpen}
        onMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      {/* Mobile Menu Overlay / Route View when Back is clicked on mobile */}
      {isMobileMenuOpen ? (
        <div className="lg:hidden flex-1 flex flex-col p-4 bg-background overflow-y-auto">
          <div className="pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu Navigation
          </div>
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItemId === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => handleSelectItem(item.id)}
                  className={cn(
                    "w-full justify-start h-11 px-3 text-sm font-medium rounded-lg gap-3",
                    isActive
                      ? "bg-secondary text-secondary-foreground font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                      {item.badge}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Details Page: Column 2 on Desktop / Main View on Mobile */
        <MainContent
          title={activeItem?.label}
          description={`Editor frame for ${activeItem?.label.toLowerCase()}`}
        >
          {children ? children(activeItem) : undefined}
        </MainContent>
      )}
    </div>
  );
}

export default AppLayout;
