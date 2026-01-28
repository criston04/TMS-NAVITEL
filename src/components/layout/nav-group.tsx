/**
 * NavGroup Component - Grupo de navegación con children colapsables
 * Principio: SRP - Solo maneja grupos con submenús
 * Principio: Composición sobre herencia
 */

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavGroupProps } from "@/types/navigation";

export function NavGroup({
  item,
  isCollapsed,
  isOpen,
  isChildActive,
  onToggle,
}: NavGroupProps) {
  const Icon = item.icon;
  const hasActiveChild = item.children?.some((child) => isChildActive(child.href));

  const buttonContent = (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground",
        "transition-all duration-200 ease-out",
        "hover:bg-accent hover:text-accent-foreground",
        (isOpen || hasActiveChild) && "bg-accent/50 text-primary"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1 text-left text-sm font-medium">
            {item.title}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </>
      )}
    </button>
  );

  return (
    <div className="animate-fade-in">
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right">{item.title}</TooltipContent>
        </Tooltip>
      ) : (
        buttonContent
      )}

      {/* Children con animación */}
      {!isCollapsed && (
        <div
          className={cn(
            "ml-4 overflow-hidden transition-all duration-300 ease-out",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="mt-1 flex flex-col gap-1 border-l border-border/50 pl-4">
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground",
                  "transition-all duration-200 ease-out",
                  "hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
                  isChildActive(child.href) &&
                    "bg-primary/10 text-primary font-medium"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    isChildActive(child.href)
                      ? "bg-primary"
                      : "bg-muted-foreground/50"
                  )}
                />
                {child.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
