"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { X, MapPin, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectionStatusBadge } from "../common/connection-status-badge";
import { MovementStatusBadge } from "../common/movement-status-badge";
import type { TrackedVehicle } from "@/types/monitoring";

// Dynamic import del mini mapa
const VehicleMiniMap = dynamic(
  () => import("./vehicle-mini-map").then((mod) => mod.VehicleMiniMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[150px] w-full animate-pulse rounded-md bg-muted" />
    ),
  }
);

interface VehiclePanelProps {
  /** Vehículo a mostrar */
  vehicle: TrackedVehicle;
  /** Callback al remover */
  onRemove: (vehicleId: string) => void;
  /** Clase adicional */
  className?: string;
}

/**
 * Formatea timestamp para mostrar
 */
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Formatea coordenadas
 */
function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/**
 * Panel individual de vehículo para la vista multiventana
 */
export function VehiclePanel({
  vehicle,
  onRemove,
  className,
}: VehiclePanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-bold">{vehicle.plate}</span>
          <ConnectionStatusBadge 
            status={vehicle.connectionStatus} 
            showText={false}
            size="sm"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onRemove(vehicle.id)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Mini mapa */}
      <VehicleMiniMap
        position={vehicle.position}
        movementStatus={vehicle.movementStatus}
        connectionStatus={vehicle.connectionStatus}
      />

      {/* Info */}
      <div className="flex-1 space-y-2 p-3">
        {/* Estado de movimiento */}
        <div className="flex items-center justify-between">
          <MovementStatusBadge
            status={vehicle.movementStatus}
            speed={vehicle.position.speed}
            size="sm"
          />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Navigation className="h-3 w-3" />
            {vehicle.position.heading}°
          </span>
        </div>

        {/* Posición */}
        <div className="flex items-start gap-1.5 text-xs">
          <MapPin className="mt-0.5 h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-muted-foreground">
            {formatCoords(vehicle.position.lat, vehicle.position.lng)}
          </span>
        </div>

        {/* Última actualización */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Actualizado: {formatTime(vehicle.lastUpdate)}</span>
        </div>

        {/* Orden activa */}
        {vehicle.activeOrderNumber && (
          <div className="rounded bg-primary/10 px-2 py-1 text-xs">
            <span className="font-medium text-primary">
              Orden: {vehicle.activeOrderNumber}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
