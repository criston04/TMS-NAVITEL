/**
 * Navigation Types - Single source of truth para tipos de navegación
 */

import { LucideIcon } from "lucide-react";

/**
 * Item de navegación individual
 */
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

/**
 * Grupo de navegación con título y items
 * Estructura: OPERACIONES, FINANZAS, MAESTRO, etc.
 */
export interface NavGroup {
  /** Título del grupo (ej: "OPERACIONES") */
  groupTitle: string;
  /** Items dentro del grupo */
  items: NavItem[];
}

export interface NavItemProps extends NavItem {
  isCollapsed: boolean;
  isActive: boolean;
  onNavigate?: () => void;
}

export interface NavGroupProps {
  group: NavGroup;
  isCollapsed: boolean;
  isActive: (href: string) => boolean;
}
