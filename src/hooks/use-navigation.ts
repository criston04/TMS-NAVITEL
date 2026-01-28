/**
 * useNavigation Hook - Lógica de navegación extraída
 * Principio: SRP - Separar lógica de estado de la UI
 * Principio: Alta cohesión - Todo lo relacionado con navegación junto
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";

interface UseNavigationOptions {
  defaultOpenMenus?: string[];
}

export function useNavigation(options: UseNavigationOptions = {}) {
  const { defaultOpenMenus = ["Logística"] } = options;
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(defaultOpenMenus);
  const [isCollapsed, setIsCollapsed] = useState(false);

  /** Verifica si una ruta está activa */
  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname]
  );

  /** Alterna el estado de un menú */
  const toggleMenu = useCallback((title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  }, []);

  /** Verifica si un menú está abierto */
  const isMenuOpen = useCallback(
    (title: string) => openMenus.includes(title),
    [openMenus]
  );

  /** Alterna el estado del sidebar */
  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  /** Abre un menú específico */
  const openMenu = useCallback((title: string) => {
    setOpenMenus((prev) => (prev.includes(title) ? prev : [...prev, title]));
  }, []);

  /** Cierra un menú específico */
  const closeMenu = useCallback((title: string) => {
    setOpenMenus((prev) => prev.filter((t) => t !== title));
  }, []);

  return useMemo(
    () => ({
      pathname,
      openMenus,
      isCollapsed,
      isActive,
      isMenuOpen,
      toggleMenu,
      toggleSidebar,
      openMenu,
      closeMenu,
    }),
    [
      pathname,
      openMenus,
      isCollapsed,
      isActive,
      isMenuOpen,
      toggleMenu,
      toggleSidebar,
      openMenu,
      closeMenu,
    ]
  );
}
