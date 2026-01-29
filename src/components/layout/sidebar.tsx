/**
 * Sidebar Component - Refactorizado con principios SOLID
 * 
 * SRP: Componente orquestador que delega a componentes especializados
 * OCP: Extensible via navigationConfig sin modificar el código
 * DIP: Depende de abstracciones (hooks, types) no implementaciones
 * 
 * Alta cohesión: Todo relacionado con el sidebar está junto
 * Bajo acoplamiento: Componentes independientes y reutilizables
 */

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChevronLeft, Package, Settings, HelpCircle, LogOut } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useNavigation } from "@/hooks/use-navigation";
import { navigationConfig } from "@/config/navigation";
import { NavLink } from "./nav-link";
import { NavGroup } from "./nav-group";

/* ============================================
   SIDEBAR HEADER - Logo y branding
   ============================================ */
function SidebarHeader({ isCollapsed }: Readonly<{ isCollapsed: boolean }>) {
  return (
    <div className="flex h-12 items-center justify-between px-3">
      {isCollapsed ? (
        <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Package className="h-4 w-4" />
        </div>
      ) : (
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Package className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-primary">Navitel</span>
        </Link>
      )}
    </div>
  );
}

/* ============================================
   SIDEBAR FOOTER - Settings, Help, Logout
   ============================================ */
function SidebarFooter({
  isCollapsed,
  onLogout,
}: Readonly<{
  isCollapsed: boolean;
  onLogout: () => void;
}>) {
  const footerItems = [
    { title: "Configuración", href: "/settings", icon: Settings },
    { title: "Ayuda", href: "/help", icon: HelpCircle },
  ];

  return (
    <div className="border-t p-2 space-y-0.5">
      {footerItems.map((item) => (
        <NavLink
          key={item.href}
          {...item}
          isCollapsed={isCollapsed}
          isActive={false}
        />
      ))}

      {/* Logout button */}
      <TooltipProvider>
        <button
          onClick={onLogout}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-muted-foreground",
            "transition-all duration-200 ease-out",
            "hover:bg-destructive/10 hover:text-destructive"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <span className="text-xs font-medium">Cerrar sesión</span>
          )}
        </button>
      </TooltipProvider>
    </div>
  );
}

/* ============================================
   SIDEBAR TOGGLE BUTTON
   ============================================ */
function SidebarToggle({
  isCollapsed,
  onToggle,
}: Readonly<{
  isCollapsed: boolean;
  onToggle: () => void;
}>) {
  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "absolute -right-2.5 top-4 z-50 h-5 w-5 rounded-full border shadow-sm",
        "transition-all duration-200 hover:scale-110"
      )}
      onClick={onToggle}
    >
      <ChevronLeft
        className={cn(
          "h-3 w-3 transition-transform duration-300",
          isCollapsed && "rotate-180"
        )}
      />
    </Button>
  );
}

/* ============================================
   MAIN SIDEBAR COMPONENT
   ============================================ */
export function Sidebar() {
  const { logout } = useAuth();
  const {
    isCollapsed,
    isActive,
    toggleSidebar,
  } = useNavigation();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-screen flex-col border-r bg-card",
          "transition-all duration-300 ease-out",
          isCollapsed ? "w-14" : "w-56"
        )}
      >
        <SidebarHeader isCollapsed={isCollapsed} />
        <SidebarToggle isCollapsed={isCollapsed} onToggle={toggleSidebar} />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2">
          <nav className="flex flex-col py-2">
            {navigationConfig.map((group) => (
              <NavGroup
                key={group.groupTitle}
                group={group}
                isCollapsed={isCollapsed}
                isActive={isActive}
              />
            ))}
          </nav>
        </ScrollArea>

        <SidebarFooter isCollapsed={isCollapsed} onLogout={logout} />
      </aside>
    </TooltipProvider>
  );
}
