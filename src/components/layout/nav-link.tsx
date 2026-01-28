/**
 * NavLink Component - Componente atómico para items de navegación
 * Principio: SRP - Solo renderiza un link de navegación
 * Principio: Open/Closed - Extensible via props, cerrado para modificación
 */

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavItemProps } from "@/types/navigation";

export function NavLink({
  title,
  href,
  icon: Icon,
  badge,
  isCollapsed,
  isActive,
}: NavItemProps) {
  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground",
        "transition-all duration-200 ease-out",
        "hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
        isActive && "bg-primary/10 text-primary font-medium"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1 text-sm font-medium">{title}</span>
          {badge && (
            <Badge variant="destructive" className="h-5 px-1.5 text-xs">
              {badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {title}
          {badge && (
            <Badge variant="destructive" className="h-5 px-1.5 text-xs">
              {badge}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
