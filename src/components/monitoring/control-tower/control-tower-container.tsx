/**
 * @fileoverview Contenedor principal de Torre de Control
 * 
 * @module components/monitoring/control-tower/control-tower-container
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { 
  PanelLeftClose, 
  PanelLeft, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Filter,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVehicleTracking } from "@/hooks/monitoring/use-vehicle-tracking";
import { useTrackedOrder } from "@/hooks/monitoring/use-tracked-order";
import { trackingService } from "@/services/monitoring/tracking.service";
import { ControlTowerFilters } from "./control-tower-filters";
import { VehicleInfoCard } from "./vehicle-info-card";
import { VehicleListSidebar } from "./vehicle-list-sidebar";
import { MapSkeleton } from "../common/skeletons/map-skeleton";
import type { TrackedVehicle } from "@/types/monitoring";

// Dynamic import del mapa para evitar SSR
const ControlTowerMap = dynamic(
  () => import("./control-tower-map").then((mod) => mod.ControlTowerMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

interface ControlTowerContainerProps {
  /** Clase adicional */
  className?: string;
}

/**
 * Contenedor principal del módulo Torre de Control
 */
export function ControlTowerContainer({
  className,
}: ControlTowerContainerProps) {
  // Estado del sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"vehicles" | "filters">("vehicles");
  const [carriers, setCarriers] = useState<string[]>([]);

  // Hook de tracking
  const {
    vehiclesList,
    isConnected,
    isLoading,
    error,
    selectedVehicle,
    filters,
    selectVehicle,
    setFilters,
    refresh,
    centerOnVehicle,
  } = useVehicleTracking({
    autoConnect: true,
  });

  // Hook de orden rastreada (para el vehículo seleccionado)
  const { order, isLoading: _isLoadingOrder } = useTrackedOrder(selectedVehicle?.id);

  // Cargar lista de transportistas
  useEffect(() => {
    trackingService.getCarriers().then(setCarriers);
  }, []);

  /**
   * Maneja selección de vehículo en el mapa
   */
  const handleVehicleSelect = useCallback((vehicle: TrackedVehicle) => {
    selectVehicle(vehicle.id);
  }, [selectVehicle]);

  /**
   * Cierra el panel de info
   */
  const handleCloseInfo = useCallback(() => {
    selectVehicle(null);
  }, [selectVehicle]);

  /**
   * Centra el mapa en el vehículo seleccionado
   */
  const handleCenterMap = useCallback(() => {
    if (selectedVehicle) {
      centerOnVehicle(selectedVehicle.id);
    }
  }, [selectedVehicle, centerOnVehicle]);

  return (
    <div className={cn("flex h-full w-full", className)}>
      {/* Sidebar con tabs */}
      <div
        className={cn(
          "flex flex-col border-r bg-background transition-all duration-300",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
          <h2 className="font-semibold">Torre de Control</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs: Vehículos / Filtros */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "vehicles" | "filters")} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-3 mb-2" style={{ width: 'calc(100% - 2rem)' }}>
            <TabsTrigger value="vehicles" className="gap-1.5">
              <List className="h-4 w-4" />
              Vehículos
            </TabsTrigger>
            <TabsTrigger value="filters" className="gap-1.5">
              <Filter className="h-4 w-4" />
              Filtros
            </TabsTrigger>
          </TabsList>

          {/* Lista de vehículos */}
          <TabsContent value="vehicles" className="flex-1 m-0 min-h-0">
            <VehicleListSidebar
              vehicles={vehiclesList}
              selectedVehicleId={selectedVehicle?.id}
              onVehicleSelect={handleVehicleSelect}
              className="h-full"
            />
          </TabsContent>

          {/* Filtros */}
          <TabsContent value="filters" className="flex-1 m-0 min-h-0">
            <ScrollArea className="h-full p-4">
              <ControlTowerFilters
                filters={filters}
                onFiltersChange={setFilters}
                carriers={carriers}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Estado de conexión */}
        <div className="border-t p-4 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Conectado en tiempo real
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-600 dark:text-red-400">
                  Desconectado
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Área principal del mapa */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Botón para abrir sidebar */}
        {!sidebarOpen && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-4 z-[1000] shadow-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Botón de refresh */}
        <Button
          variant="outline"
          size="sm"
          className="absolute left-4 top-16 z-[1000] shadow-lg"
          onClick={refresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Actualizar
        </Button>

        {/* Error */}
        {error && (
          <div className="absolute left-4 right-4 top-28 z-[1000] rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive shadow-lg">
            <p className="font-medium">Error de conexión</p>
            <p>{error.message}</p>
          </div>
        )}

        {/* Mapa */}
        <ControlTowerMap
          vehicles={vehiclesList}
          selectedVehicleId={selectedVehicle?.id}
          onVehicleSelect={handleVehicleSelect}
        />

        {/* Panel de información del vehículo seleccionado */}
        {selectedVehicle && (
          <div className="absolute right-4 top-4 z-[1000] w-80">
            <VehicleInfoCard
              vehicle={selectedVehicle}
              order={order}
              onClose={handleCloseInfo}
              onCenterMap={handleCenterMap}
            />
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && vehiclesList.length === 0 && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Cargando vehículos...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
