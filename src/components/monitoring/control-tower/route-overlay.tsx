"use client";

import { cn } from "@/lib/utils";
import { Route } from "lucide-react";
import type { TrackedOrder } from "@/types/monitoring";

interface RouteOverlayProps {
  /** Orden con ruta planificada */
  order: TrackedOrder;
  /** Color de la ruta */
  color?: string;
  /** Mostrar hitos */
  showMilestones?: boolean;
  /** Clase adicional */
  className?: string;
}

/**
 * Overlay de ruta planificada - Placeholder
 * TODO: Implementar con react-leaflet cuando los tipos est�n configurados
 */
export function RouteOverlay({
  order,
  showMilestones = true,
  className,
}: RouteOverlayProps) {
  const completedMilestones = order.milestones.filter(m => m.trackingStatus === "completed").length;
  const totalMilestones = order.milestones.length;

  return (
    <div className={cn("p-3 rounded-lg border bg-card/80 backdrop-blur-sm", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Route className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Ruta: {order.orderNumber}</span>
      </div>
      
      {showMilestones && (
        <div className="space-y-1 text-xs">
          <p className="text-muted-foreground">
            Hitos: {completedMilestones} / {totalMilestones}
          </p>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${(completedMilestones / totalMilestones) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
