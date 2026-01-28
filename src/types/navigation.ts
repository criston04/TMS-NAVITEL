/**
 * Navigation Types - Single source of truth para tipos de navegación
 * Principio: DRY - Definir tipos una sola vez
 */

import { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
}

export interface NavItemProps extends NavItem {
  isCollapsed: boolean;
  isActive: boolean;
  onNavigate?: () => void;
}

export interface NavGroupProps {
  item: NavItem;
  isCollapsed: boolean;
  isOpen: boolean;
  isChildActive: (href: string) => boolean;
  onToggle: () => void;
}
