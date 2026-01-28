/**
 * NavGroup Component - Grupo de navegación con título y items
 * Estructura: OPERACIONES, FINANZAS, MAESTRO
 * Principio: SRP - Solo maneja grupos con título
 */

"use client";

import { NavGroupProps } from "@/types/navigation";
import { NavLink } from "./nav-link";

export function NavGroup({
  group,
  isCollapsed,
  isActive,
}: NavGroupProps) {
  return (
    <div className="mb-6">
      {/* Título del grupo - oculto cuando está colapsado */}
      {!isCollapsed && (
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          {group.groupTitle}
        </h3>
      )}

      {/* Items del grupo */}
      <div className="flex flex-col gap-1">
        {group.items.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            isCollapsed={isCollapsed}
            isActive={isActive(item.href)}
          />
        ))}
      </div>
    </div>
  );
}