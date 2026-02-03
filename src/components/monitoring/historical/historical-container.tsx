/**
 * @fileoverview Contenedor principal del módulo de Rastreo Histórico
 * 
 * @module components/monitoring/historical/historical-container
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { History, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useHistoricalRoute } from "@/hooks/monitoring/use-historical-route";
import { useRoutePlayback } from "@/hooks/monitoring/use-route-playback";
import { historicalTrackingService } from "@/services/monitoring/historical.service";
import { SearchForm } from "./search-form";
import { RouteStatsPanel } from "./route-stats-panel";
import { PlaybackControls } from "./playback-controls";
import { ExportButton } from "./export-button";
import { MapSkeleton } from "../common/skeletons/map-skeleton";
import type { HistoricalRouteParams, RouteExportFormat, HistoricalRoutePoint } from "@/types/monitoring";

// Dynamic import del mapa
const HistoricalMap = dynamic(
  () => import("./historical-map").then((mod) => mod.HistoricalMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

interface HistoricalContainerProps {
  /** Clase adicional */
  className?: string;
}

/**
 * Contenedor principal del módulo de Rastreo Histórico
 */
export function HistoricalContainer({
  className,
}: HistoricalContainerProps) {
  // Estado del sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Vehículos disponibles
  const [vehicles, setVehicles] = useState<Array<{ id: string; plate: string }>>([]);
  
  // Punto actual para reproducción
  const [currentPlaybackPoint, setCurrentPlaybackPoint] = useState<HistoricalRoutePoint | null>(null);

  // Hook de ruta histórica
  const {
    route,
    stats,
    isLoading,
    error,
    loadRoute,
  } = useHistoricalRoute();

  // Hook de reproducción
  const playback = useRoutePlayback({
    points: route?.points || [],
    onPointChange: (point, _index) => {
      setCurrentPlaybackPoint(point);
    },
  });

  // Cargar vehículos disponibles
  useEffect(() => {
    historicalTrackingService.getAvailableVehicles().then((data) => {
      setVehicles(data.map((v) => ({ id: v.id, plate: v.plate })));
    });
  }, []);

  /**
   * Busca una ruta histórica
   */
  const handleSearch = useCallback(async (params: HistoricalRouteParams) => {
    // Detener reproducción actual
    playback.stop();
    setCurrentPlaybackPoint(null);

    await loadRoute(params);
  }, [loadRoute, playback]);

  /**
   * Exporta la ruta
   */
  const handleExport = useCallback(async (format: RouteExportFormat) => {
    if (!route) return;

    const blob = await historicalTrackingService.exportRoute(route, { format });

    // Descargar archivo
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ruta_${route.vehiclePlate}_${new Date().toISOString().split("T")[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [route]);

  return (
    <div className={cn("flex h-full w-full", className)}>
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r bg-background transition-all duration-300",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <h2 className="font-semibold">Rastreo Histórico</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-6 p-4">
            {/* Formulario de búsqueda */}
            <SearchForm
              onSearch={handleSearch}
              vehicles={vehicles}
              isLoading={isLoading}
            />

            {/* Resultados */}
            {route && (
              <>
                <Separator />

                {/* Estadísticas */}
                {stats && (
                  <RouteStatsPanel stats={stats} />
                )}

                <Separator />

                {/* Exportar */}
                <div className="flex justify-end">
                  <ExportButton
                    route={route}
                    onExport={handleExport}
                  />
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <p className="font-medium">Error al cargar la ruta</p>
                <p>{error.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Área del mapa */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Botón para abrir sidebar */}
        {!sidebarOpen && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-4 z-1000 shadow-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Mapa */}
        {route ? (
          <HistoricalMap
            route={route}
            currentPoint={currentPlaybackPoint}
            currentIndex={playback.currentIndex}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-muted/30">
            <History className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">
              Selecciona un vehículo y rango de fechas
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              La ruta aparecerá aquí
            </p>
          </div>
        )}

        {/* Controles de reproducción (sobre el mapa) */}
        {route && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-1000">
            <PlaybackControls
              state={{
                playbackState: playback.playbackState,
                isPlaying: playback.isPlaying,
                isPaused: playback.isPaused,
                currentIndex: playback.currentIndex,
                currentPoint: playback.currentPoint,
                speed: playback.speed,
                progress: playback.progress,
                currentTime: playback.currentTime,
                totalPoints: playback.totalPoints,
              }}
              actions={{
                play: playback.play,
                pause: playback.pause,
                stop: playback.stop,
                reset: playback.reset,
                setSpeed: playback.setSpeed,
                seekTo: playback.seekTo,
                seekToProgress: playback.seekToProgress,
                stepForward: playback.stepForward,
                stepBackward: playback.stepBackward,
              }}
              compact
            />
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-999 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Cargando ruta histórica...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
