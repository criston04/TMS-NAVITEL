"use client";

import { cn } from "@/lib/utils";
import { X, MapPin, User, Package, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectionStatusBadge } from "../common/connection-status-badge";
import { MovementStatusBadge } from "../common/movement-status-badge";
import { MilestoneList } from "./milestone-list";
import type { TrackedVehicle, TrackedOrder } from "@/types/monitoring";

interface VehicleInfoCardProps {
  /** Vehículo */
  vehicle: TrackedVehicle;
  /** Orden asociada (opcional) */
  order?: TrackedOrder | null;
  /** Callback al cerrar */
  onClose: () => void;
  /** Callback al centrar en mapa */
  onCenterMap?: () => void;
  /** Clase adicional */
  className?: string;
}

/**
 * Formatea coordenadas para mostrar
 */
function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Formatea fecha para mostrar
 */
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Tarjeta con información detallada de un vehículo
 */
export function VehicleInfoCard({
  vehicle,
  order,
  onClose,
  onCenterMap,
  className,
}: VehicleInfoCardProps) {
  return (
    <div className={cn("relative rounded-xl border bg-card/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden transition-all duration-300 max-h-[calc(100vh-180px)]", className)}>
      {/* Header con gradiente sutil */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-r from-primary/5 to-transparent rounded-t-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{vehicle.plate.slice(-3)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{vehicle.plate}</h3>
            {vehicle.economicNumber && (
              <p className="text-xs text-muted-foreground">#{vehicle.economicNumber}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body con scroll invisible */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-4">
          {/* Estados */}
          <div className="flex flex-wrap gap-2">
            <ConnectionStatusBadge status={vehicle.connectionStatus} />
            <MovementStatusBadge 
              status={vehicle.movementStatus} 
              speed={vehicle.position.speed}
            />
          </div>

          {/* Información del vehículo */}
          <div className="space-y-2 text-sm">
            {/* Posición */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Posición actual</p>
                <p className="text-muted-foreground">
                  {formatCoordinates(vehicle.position.lat, vehicle.position.lng)}
                </p>
              </div>
            </div>

            {/* Conductor */}
            {vehicle.driverName && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Conductor</p>
                  <p className="text-muted-foreground">{vehicle.driverName}</p>
                </div>
              </div>
            )}

            {/* Dirección/Velocidad */}
            <div className="flex items-start gap-2">
              <Navigation className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Velocidad / Dirección</p>
                <p className="text-muted-foreground">
                  {vehicle.position.speed} km/h • {vehicle.position.heading}°
                </p>
              </div>
            </div>

            {/* Última actualización */}
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Última actualización</p>
                <p className="text-muted-foreground">{formatTime(vehicle.lastUpdate)}</p>
              </div>
            </div>

            {/* Empresa */}
            {vehicle.companyName && (
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Operador</p>
                  <p className="text-muted-foreground">{vehicle.companyName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Información de orden */}
          {order && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <p className="text-sm font-medium">Orden activa</p>
                <p className="text-sm text-primary">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">{order.customerName}</p>
              </div>

              {/* Progreso */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>Progreso</span>
                  <span>{order.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${order.progress}%` }}
                  />
                </div>
              </div>

              {/* Lista de hitos */}
              <MilestoneList 
                milestones={order.milestones}
                currentIndex={order.currentMilestoneIndex}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Footer sticky con acciones */}
      <div className="shrink-0 border-t bg-card/95 backdrop-blur-sm p-3 rounded-b-xl">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full gap-2"
          onClick={onCenterMap}
        >
          <MapPin className="h-4 w-4" />
          Centrar en mapa
        </Button>
      </div>
    </div>
  );
}
