/**
 * @fileoverview Contenedor principal del módulo Multiventana
 * 
 * @module components/monitoring/multi-window/multi-window-container
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";
import { useMultiWindow } from "@/hooks/monitoring/use-multi-window";
import { useVehicleTracking } from "@/hooks/monitoring/use-vehicle-tracking";
import { GridControls } from "./grid-controls";
import { MultiWindowGrid } from "./multi-window-grid";
import { VehicleSelectorModal } from "./vehicle-selector-modal";

interface MultiWindowContainerProps {
  /** Clase adicional */
  className?: string;
}

/**
 * Contenedor principal del módulo Multiventana
 */
export function MultiWindowContainer({
  className,
}: MultiWindowContainerProps) {
  // Estado del modal
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Hook de multiventana
  const {
    panels,
    gridConfig,
    panelCount,
    addPanels,
    removePanelByVehicle,
    clearAllPanels,
    setLayout,
  } = useMultiWindow({
    maxPanels: 20,
    persist: true,
  });

  // IDs de vehículos en paneles para suscripción
  const vehicleIds = useMemo(() => panels.map((p) => p.vehicleId), [panels]);

  // Hook de tracking
  const {
    vehicles,
    vehiclesList,
    isConnected,
    subscribeToVehicles,
  } = useVehicleTracking({
    vehicleIds,
    autoConnect: true,
  });

  // Suscribirse cuando cambian los paneles
  // useEffect para manejar suscripciones se maneja en el hook

  /**
   * Abre el modal de selección
   */
  const handleOpenSelector = useCallback(() => {
    setSelectorOpen(true);
  }, []);

  /**
   * Cierra el modal de selección
   */
  const handleCloseSelector = useCallback(() => {
    setSelectorOpen(false);
  }, []);

  /**
   * Agrega vehículos seleccionados
   */
  const handleSelectVehicles = useCallback(
    (selected: Array<{ vehicleId: string; vehiclePlate: string }>) => {
      addPanels(selected);
      // Suscribirse a los nuevos vehículos
      const newIds = selected.map((v) => v.vehicleId);
      subscribeToVehicles(newIds);
    },
    [addPanels, subscribeToVehicles]
  );

  /**
   * Remueve un vehículo
   */
  const handleRemoveVehicle = useCallback(
    (vehicleId: string) => {
      removePanelByVehicle(vehicleId);
    },
    [removePanelByVehicle]
  );

  // IDs excluidos (ya tienen panel)
  const excludeIds = useMemo(() => panels.map((p) => p.vehicleId), [panels]);

  // Máximo que se puede agregar
  const maxToAdd = gridConfig.maxPanels - panelCount;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Multiventana</h1>
            <p className="text-muted-foreground">
              Monitorea múltiples vehículos simultáneamente
            </p>
          </div>
          
          {/* Estado de conexión */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-600 dark:text-emerald-400">
                  Tiempo real activo
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  Desconectado
                </span>
              </>
            )}
          </div>
        </div>

        {/* Controles */}
        <GridControls
          panelCount={panelCount}
          maxPanels={gridConfig.maxPanels}
          gridConfig={gridConfig}
          onAddVehicles={handleOpenSelector}
          onLayoutChange={setLayout}
          onClearAll={clearAllPanels}
        />
      </div>

      {/* Grid de paneles */}
      <div className="flex-1 overflow-auto p-4">
        <MultiWindowGrid
          panels={panels}
          vehicles={vehicles}
          gridConfig={gridConfig}
          onRemovePanel={handleRemoveVehicle}
        />
      </div>

      {/* Modal selector */}
      <VehicleSelectorModal
        isOpen={selectorOpen}
        onClose={handleCloseSelector}
        onSelect={handleSelectVehicles}
        availableVehicles={vehiclesList}
        excludeIds={excludeIds}
        maxToAdd={maxToAdd}
      />
    </div>
  );
}
