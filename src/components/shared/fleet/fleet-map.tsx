/**
 * @fileoverview Componente de mapa interactivo para visualización de flota
 * 
 * Muestra los vehículos en un mapa de Leaflet con marcadores personalizados,
 * popups informativos y animaciones de selección. Utiliza CartoDB Positron
 * como capa base para un estilo minimalista.
 * 
 * @module components/shared/fleet/fleet-map
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

import { useEffect, useRef, useState } from "react";
import { Vehicle } from "@/types/vehicle";
import { cn } from "@/lib/utils";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Usar estilo con tiles gratuitos de OpenStreetMap
const FREE_STYLE: mapboxgl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

interface FleetMapProps {
  readonly vehicles: Vehicle[];
  readonly selectedVehicle: Vehicle | null;
  readonly onSelectVehicle: (vehicle: Vehicle) => void;
  readonly className?: string;
}

// Colores según estado
const statusColors: Record<string, string> = {
  available: '#10b981',
  in_transit: '#3DBAFF',
  loading: '#f59e0b',
  unloading: '#f59e0b',
  maintenance: '#ef4444',
  out_of_service: '#6b7280'
};

// Etiquetas de estado
const statusLabels: Record<string, {label: string, color: string}> = {
  available: { label: 'Disponible', color: '#10b981' },
  in_transit: { label: 'En Tránsito', color: '#3DBAFF' },
  loading: { label: 'Cargando', color: '#f59e0b' },
  unloading: { label: 'Descargando', color: '#f59e0b' },
  maintenance: { label: 'Mantenimiento', color: '#ef4444' },
  out_of_service: { label: 'Fuera de Servicio', color: '#6b7280' }
};

export function FleetMap({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  className,
}: FleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  const createVehicleIcon = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L: any, isSelected: boolean) => {
      const size = isSelected ? 52 : 40;

      // Icono de camion simple y limpio
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = await import("leaflet") as any;
      leafletRef.current = L;

      // Crear el mapa
      const map = L.map(mapRef.current!, {
        center: [40.7512, -74.0123],
        zoom: 12,
        zoomControl: false,
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
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
      setIsLoaded(false);
    };
  }, []);

  // Actualizar marcadores de vehículos
  useEffect(() => {
    if (!mapRef.current || !isLoaded || vehicles.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = leafletRef.current as any;
    const map = mapInstanceRef.current;

    // Remover marcadores que ya no existen
    markersRef.current.forEach((marker, id) => {
      if (!vehicles.find(v => v.id === id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Preparar bounds para ajustar vista
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoords = false;

    // Actualizar o crear marcadores
    vehicles.forEach(vehicle => {
      if (!vehicle.lastLocation) return;

      const lngLat: [number, number] = [
        vehicle.lastLocation.lng,
        vehicle.lastLocation.lat
      ];
      bounds.extend(lngLat);
      hasValidCoords = true;

      const isSelected = selectedVehicle?.id === vehicle.id;
      let existingMarker = markersRef.current.get(vehicle.id);

      // Si el marcador ya existe, actualizarlo
      if (existingMarker) {
        existingMarker.setLngLat(lngLat);
        
        // Actualizar elemento si cambió la selección
        const el = existingMarker.getElement();
        if (el) {
          el.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
          el.style.zIndex = isSelected ? '1000' : '1';
        }
      } else {
        // Crear nuevo marcador
        const el = createMarkerElement(vehicle, isSelected);
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(createPopupContent(vehicle));
        
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(lngLat)
          .setPopup(popup)
          .addTo(map);
        
        // Evento de click
        el.addEventListener('click', () => {
          onSelectVehicle(vehicle);
        });
        
        markersRef.current.set(vehicle.id, marker);
      }
    });

    // Ajustar vista para mostrar todos los vehículos
    if (hasValidCoords) {
      map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
    }
  }, [vehicles, selectedVehicle, isLoaded, onSelectVehicle]);

  return (
    <div className={cn("relative h-full w-full rounded-lg overflow-hidden", className)}>
      <div ref={mapContainerRef} className="absolute inset-0" />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Cargando mapa de flota...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Crear elemento HTML para el marcador
function createMarkerElement(vehicle: Vehicle, isSelected: boolean): HTMLDivElement {
  const el = document.createElement('div');
  el.style.width = '40px';
  el.style.height = '40px';
  el.style.cursor = 'pointer';
  el.style.transition = 'transform 0.2s';
  el.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
  el.style.zIndex = isSelected ? '1000' : '1';
  
  const color = statusColors[vehicle.status] || statusColors.available;
  
  el.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
      <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3"/>
      <g transform="translate(20, 20)">
        <path d="M-6,-4 L-6,4 L6,4 L6,-4 Z M-4,-6 L4,-6 L4,-4 L-4,-4 Z" fill="white" stroke="white" stroke-width="1"/>
        <circle cx="-4" cy="5" r="1.5" fill="white"/>
        <circle cx="4" cy="5" r="1.5" fill="white"/>
      </g>
    </svg>
  `;
  
  el.addEventListener('mouseenter', () => {
    if (!isSelected) el.style.transform = 'scale(1.15)';
  });
  
  el.addEventListener('mouseleave', () => {
    if (!isSelected) el.style.transform = 'scale(1)';
  });
  
  return el;
}

// Crear contenido del popup
function createPopupContent(vehicle: Vehicle): string {
  const status = statusLabels[vehicle.status] || statusLabels.available;
  
  return `
    <div style="padding: 12px; min-width: 240px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="border-bottom: 2px solid ${status.color}; padding-bottom: 8px; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <p style="font-weight: 700; font-size: 15px; color: #1f2937; margin: 0;">
            ${vehicle.plate}
          </p>
          <span style="background: ${status.color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
            ${status.label}
          </span>
        </div>
        <p style="font-size: 12px; color: #6b7280; margin: 0;">
          ${vehicle.brand} ${vehicle.model}
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
        ${vehicle.fuelLevel !== undefined ? `
        <div style="text-align: center; padding: 6px; background: #f3f4f6; border-radius: 6px;">
          <p style="font-size: 10px; color: #6b7280; margin: 0 0 2px 0; text-transform: uppercase;">Combustible</p>
          <p style="font-weight: 600; color: #1f2937; margin: 0; font-size: 13px;">${vehicle.fuelLevel}%</p>
        </div>
        ` : ''}
        
        ${vehicle.odometer !== undefined ? `
        <div style="text-align: center; padding: 6px; background: #f3f4f6; border-radius: 6px;">
          <p style="font-size: 10px; color: #6b7280; margin: 0 0 2px 0; text-transform: uppercase;">Kilometraje</p>
          <p style="font-weight: 600; color: #1f2937; margin: 0; font-size: 13px;">${vehicle.odometer.toLocaleString()} km</p>
        </div>
        ` : ''}
      </div>
      
      ${vehicle.lastLocation?.timestamp ? `
      <p style="font-size: 10px; color: #9ca3af; margin-top: 8px; margin-bottom: 0; text-align: center;">
        Última actualización: ${new Date(vehicle.lastLocation.timestamp).toLocaleString()}
      </p>
      ` : ''}
    </div>
  `;
}
