/**
 * @fileoverview Componente de mapa interactivo para visualización de flota
 * 
 * Muestra los vehículos en un mapa de Leaflet con marcadores personalizados,
 * popups informativos y animaciones de selección. Utiliza CartoDB Positron
 * como capa base para un estilo minimalista.
 * 
 * @module components/fleet/fleet-map
 * @requires react
 * @requires leaflet
 * @requires @/types/fleet
 * 
 * @example
 * <FleetMap
 *   vehicles={vehicles}
 *   selectedVehicle={selected}
 *   onSelectVehicle={handleSelect}
 *   className="h-[600px]"
 * />
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Vehicle } from "@/types/fleet";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";
import "@/styles/leaflet-custom.css";

/**
 * Props para el componente FleetMap
 * @interface FleetMapProps
 */
interface FleetMapProps {
  /** Lista de vehículos a mostrar en el mapa */
  readonly vehicles: Vehicle[];
  /** Vehículo actualmente seleccionado (puede ser null) */
  readonly selectedVehicle: Vehicle | null;
  /** Callback cuando se selecciona un vehículo */
  readonly onSelectVehicle: (vehicle: Vehicle) => void;
  /** Clases CSS adicionales para el contenedor */
  readonly className?: string;
}

export function FleetMap({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  className,
}: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  const createVehicleIcon = useCallback(
    (L: typeof import("leaflet"), isSelected: boolean) => {
      const size = isSelected ? 52 : 40;
      
      // Icono de camión simple y limpio
      const svg = isSelected 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="24" fill="#00c9ff" opacity="0.25"/>
            <circle cx="26" cy="26" r="18" fill="#00c9ff" opacity="0.15"/>
            <g transform="translate(14, 16)">
              <rect x="0" y="2" width="24" height="14" rx="2" fill="#1e293b"/>
              <rect x="16" y="4" width="7" height="10" rx="1.5" fill="#334155"/>
              <circle cx="6" cy="16" r="3" fill="#1e293b"/>
              <circle cx="18" cy="16" r="3" fill="#1e293b"/>
              <circle cx="6" cy="16" r="1.5" fill="#94a3b8"/>
              <circle cx="18" cy="16" r="1.5" fill="#94a3b8"/>
            </g>
          </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
            <g transform="translate(8, 10)">
              <rect x="0" y="2" width="24" height="14" rx="2" fill="#1e293b"/>
              <rect x="16" y="4" width="7" height="10" rx="1.5" fill="#334155"/>
              <circle cx="6" cy="16" r="3" fill="#1e293b"/>
              <circle cx="18" cy="16" r="3" fill="#1e293b"/>
              <circle cx="6" cy="16" r="1.5" fill="#94a3b8"/>
              <circle cx="18" cy="16" r="1.5" fill="#94a3b8"/>
            </g>
          </svg>`;

      return L.divIcon({
        className: "custom-vehicle-marker",
        html: svg,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    },
    []
  );

  // Efecto para inicializar el mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Verificar que el contenedor tenga dimensiones
    const container = mapRef.current;
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      // Esperar a que el contenedor tenga dimensiones
      const checkDimensions = setInterval(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          clearInterval(checkDimensions);
          setIsMapReady(true);
        }
      }, 50);
      return () => clearInterval(checkDimensions);
    }
    setIsMapReady(true);
  }, []);

  // Efecto para crear el mapa cuando el contenedor está listo
  useEffect(() => {
    if (!isMapReady || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = await import("leaflet");
      leafletRef.current = L;

      // Crear el mapa
      const map = L.map(mapRef.current!, {
        center: [40.7512, -74.0123],
        zoom: 12,
        zoomControl: false, // Ocultar controles de zoom
        preferCanvas: true,
      });

      // Usar CartoDB Positron para el estilo gris minimalista
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        updateWhenZooming: false,
        updateWhenIdle: true,
      }).addTo(map);

      // Agregar controles de zoom en la esquina derecha
      L.control.zoom({
        position: 'topright'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Esperar a que el mapa se renderice completamente
      map.whenReady(() => {
        map.invalidateSize();
      });
      
      // Segundo invalidateSize con delay para asegurar renderizado
      setTimeout(() => {
        map.invalidateSize();
        setIsLoaded(true);
      }, 300);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        leafletRef.current = null;
        setIsLoaded(false);
        setIsMapReady(false);
      }
    };
  }, [isMapReady]);

  // Efecto para renderizar los marcadores
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !leafletRef.current) return;

    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    // Limpiar marcadores existentes
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Crear nuevos marcadores
    vehicles.forEach((vehicle) => {
      const isSelected = selectedVehicle?.id === vehicle.id;
      const icon = createVehicleIcon(L, isSelected);

      const marker = L.marker([vehicle.location.lat, vehicle.location.lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 0,
      }).addTo(map);

      // Popup con contenido seguro
      const popupContent = `
        <div style="padding:12px;min-width:180px;font-family:system-ui,sans-serif;">
          <p style="font-weight:700;margin:0 0 6px;font-size:15px;color:#1e293b;">${vehicle.code}</p>
          <p style="font-size:12px;color:#64748b;margin:0;">${vehicle.address}, ${vehicle.city}</p>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0;">
            <p style="font-size:11px;color:#00c9ff;margin:0;font-weight:600;">🚛 ${vehicle.driver}</p>
            <p style="font-size:11px;color:#64748b;margin:4px 0 0;">Progreso: ${vehicle.progress}%</p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'custom-popup',
      });

      marker.on("click", () => onSelectVehicle(vehicle));
      markersRef.current.set(vehicle.id, marker);
    });

    // Forzar actualización del mapa después de agregar marcadores
    setTimeout(() => map.invalidateSize(), 100);
  }, [vehicles, selectedVehicle, isLoaded, onSelectVehicle, createVehicleIcon]);

  // Efecto para centrar en el vehículo seleccionado
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedVehicle || !isLoaded) return;
    mapInstanceRef.current.flyTo(
      [selectedVehicle.location.lat, selectedVehicle.location.lng],
      14,
      { duration: 0.8 }
    );
  }, [selectedVehicle, isLoaded]);

  // Efecto para manejar resize
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;
    
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    
    window.addEventListener("resize", handleResize);
    
    // También invalidar cuando el componente se monta completamente
    const timers = [
      setTimeout(handleResize, 100),
      setTimeout(handleResize, 500),
      setTimeout(handleResize, 1000),
    ];
    
    return () => {
      window.removeEventListener("resize", handleResize);
      timers.forEach(clearTimeout);
    };
  }, [isLoaded]);

  return (
    <div className={cn("relative w-full h-full", className)} style={{ minHeight: "400px" }}>
      <div 
        ref={mapRef} 
        className="absolute inset-0" 
        style={{ 
          background: "#f8fafc", 
          zIndex: 1,
          width: "100%",
          height: "100%",
        }} 
      />
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
}
