/**
 * NavGroup Component - Grupo de navegación con título y items
 * Estructura: OPERACIONES, FINANZAS, MAESTRO
 */

"use client";

import type { FC } from "react";
import type { NavGroupProps } from "@/types/navigation";
import { NavLink } from "./nav-link";

export const NavGroup: FC<Readonly<NavGroupProps>> = ({
  group,
  isCollapsed,
  isActive,
}) => {
  return (
    <div className="mb-3">
      {/* Título del grupo - oculto cuando está colapsado */}
      {!isCollapsed && (
        <h3 className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {group.groupTitle}
        </h3>
      )}

      {/* Items del grupo */}
      <div className="flex flex-col gap-0.5">
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
};