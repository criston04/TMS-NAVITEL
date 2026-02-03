/**
 * @fileoverview Hook para herramientas de dibujo en Leaflet
 * 
 * Principio SRP: Solo maneja las herramientas de dibujo.
 * Principio DRY: Centraliza toda la lógica de Leaflet.Draw.
 * 
 * @module hooks/useDrawingTools
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Geofence, PolygonGeometry, CircleGeometry, GeoCoordinate } from "@/types/models/geofence";

/**
 * Tipo de dibujo activo
 */
export type DrawingMode = "polygon" | "circle" | "rectangle" | "none";

/**
 * Opciones de estilo para dibujo
 */
interface DrawingStyle {
  color: string;
  fillOpacity: number;
  weight?: number;
}

/**
 * Evento de creación de geometría
 */
interface GeometryCreatedEvent {
  type: "polygon" | "circle";
  layer: L.Layer;
  geometry: PolygonGeometry | CircleGeometry;
}

/**
 * Opciones del hook
 */
interface UseDrawingToolsOptions {
  map: L.Map | null;
  drawnItems: L.FeatureGroup | null;
  L: typeof L | null;
  defaultStyle?: DrawingStyle;
  onGeometryCreated?: (event: GeometryCreatedEvent) => void;
  onGeometryEdited?: (layer: L.Layer) => void;
  onGeometryDeleted?: (layer: L.Layer) => void;
}

/**
 * Retorno del hook
 */
interface UseDrawingToolsReturn {
  // Estado
  drawingMode: DrawingMode;
  activeLayer: L.Layer | null;
  isEditing: boolean;
  
  // Acciones de dibujo
  startDrawPolygon: () => void;
  startDrawCircle: () => void;
  startDrawRectangle: () => void;
  createPentagon: (center?: GeoCoordinate) => L.Polygon | null;
  cancelDrawing: () => void;
  
  // Acciones de edición
  enableEditing: (layer: L.Layer) => void;
  disableEditing: (layer: L.Layer) => void;
  enableDragging: (layer: L.Layer) => void;
  disableDragging: (layer: L.Layer) => void;
  
  // Acciones de capas
  addLayer: (layer: L.Layer) => void;
  removeLayer: (layer: L.Layer) => void;
  clearAllLayers: () => void;
  getLayerGeometry: (layer: L.Layer) => PolygonGeometry | CircleGeometry | null;
  
  // Crear capas desde geometría
  createPolygonLayer: (coordinates: GeoCoordinate[], style?: DrawingStyle) => L.Polygon | null;
  createCircleLayer: (center: GeoCoordinate, radius: number, style?: DrawingStyle) => L.Circle | null;
  createLayerFromGeofence: (geofence: Geofence) => L.Layer | null;
  
  // Estilo
  setLayerStyle: (layer: L.Layer, style: DrawingStyle) => void;
  currentStyle: DrawingStyle;
  setCurrentStyle: (style: DrawingStyle) => void;
  
  // Utilidades
  zoomToLayer: (layer: L.Layer, padding?: number) => void;
  getLayerBounds: (layer: L.Layer) => L.LatLngBounds | null;
}

/**
 * Estilo por defecto
 */
const DEFAULT_STYLE: DrawingStyle = {
  color: "#00c9ff",
  fillOpacity: 0.2,
  weight: 2,
};

/**
 * Hook para herramientas de dibujo en Leaflet
 * 
 * @param options - Opciones de configuración
 * @returns Estado y acciones de dibujo
 * 
 * @example
 * const { startDrawPolygon, activeLayer, createPentagon } = useDrawingTools({
 *   map: leafletMap,
 *   drawnItems: drawnItemsLayer,
 *   L: leafletInstance,
 *   onGeometryCreated: (event) => console.log(event)
 * });
 */
export function useDrawingTools(options: UseDrawingToolsOptions): UseDrawingToolsReturn {
  const {
    map,
    drawnItems,
    L,
    defaultStyle = DEFAULT_STYLE,
    onGeometryCreated,
    onGeometryEdited,
    onGeometryDeleted,
  } = options;
  
  // Estado
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("none");
  const [currentStyle, setCurrentStyle] = useState<DrawingStyle>(defaultStyle);
  const [isEditing, setIsEditing] = useState(false);
  
  // Referencias
  const activeLayerRef = useRef<L.Layer | null>(null);
  const drawHandlerRef = useRef<L.Draw.Polygon | L.Draw.Circle | L.Draw.Rectangle | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const eventsRegisteredRef = useRef(false);
  
  // Registrar eventos de dibujo
  useEffect(() => {
    if (!map || !L || !drawnItems || eventsRegisteredRef.current) return;
    
    eventsRegisteredRef.current = true;
    
    // Evento: Geometría creada
    map.on(L.Draw.Event.CREATED, (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      const layer = event.layer;
      
      // Inicializar dragging
      initializeDragging(layer);
      
      // Agregar al FeatureGroup
      drawnItems.addLayer(layer);
      activeLayerRef.current = layer;
      
      // Obtener geometría
      const geometry = getLayerGeometry(layer);
      if (geometry && onGeometryCreated) {
        onGeometryCreated({
          type: geometry.type as "polygon" | "circle",
          layer,
          geometry,
        });
      }
      
      setDrawingMode("none");
    });
    
    // Evento: Geometría editada
    map.on(L.Draw.Event.EDITED, (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Edited;
      event.layers.eachLayer((layer: L.Layer) => {
        if (onGeometryEdited) {
          onGeometryEdited(layer);
        }
      });
    });
    
    // Evento: Geometría eliminada
    map.on(L.Draw.Event.DELETED, (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Deleted;
      event.layers.eachLayer((layer: L.Layer) => {
        if (onGeometryDeleted) {
          onGeometryDeleted(layer);
        }
      });
    });
    
    return () => {
      if (map && L) {
        map.off(L.Draw.Event.CREATED);
        map.off(L.Draw.Event.EDITED);
        map.off(L.Draw.Event.DELETED);
      }
      eventsRegisteredRef.current = false;
    };
  }, [map, L, drawnItems, onGeometryCreated, onGeometryEdited, onGeometryDeleted]);
  
  /**
   * Inicializa dragging en una capa
   */
  const initializeDragging = useCallback((layer: L.Layer) => {
    if (!L) return;
    
    const typedLayer = layer as L.Path & { 
      dragging?: L.Handler;
      editing?: L.Edit.Poly | L.Edit.Circle;
    };
    
    if (!typedLayer.dragging) {
      try {
        const Handler = (L as unknown as { Handler: { PathDrag?: new (layer: L.Layer) => L.Handler } }).Handler;
        if (Handler?.PathDrag) {
          typedLayer.dragging = new Handler.PathDrag(layer);
        }
      } catch (err) {
        console.warn("No se pudo inicializar dragging:", err);
      }
    }
    
    if (typedLayer.dragging) {
      typedLayer.dragging.enable();
      
      // Sincronizar edición con dragging
      layer.on("dragstart", () => {
        if (typedLayer.editing && (typedLayer.editing as { _enabled?: boolean })._enabled) {
          typedLayer.editing.disable();
        }
      });
      
      layer.on("dragend", () => {
        // No reactivar automáticamente
      });
    }
  }, [L]);
  
  /**
   * Obtiene geometría de una capa
   */
  const getLayerGeometry = useCallback((layer: L.Layer): PolygonGeometry | CircleGeometry | null => {
    if (!L) return null;
    
    if (layer instanceof L.Circle) {
      const center = layer.getLatLng();
      const radius = layer.getRadius();
      return {
        type: "circle",
        center: { lat: center.lat, lng: center.lng },
        radius,
      };
    }
    
    if (layer instanceof L.Polygon) {
      const latlngs = layer.getLatLngs()[0] as L.LatLng[];
      const coordinates: GeoCoordinate[] = latlngs.map((ll) => ({
        lat: ll.lat,
        lng: ll.lng,
      }));
      return {
        type: "polygon",
        coordinates,
      };
    }
    
    return null;
  }, [L]);
  
  // Acciones de dibujo
  const startDrawPolygon = useCallback(() => {
    if (!map || !L || !drawnItems) return;
    
    cancelDrawing();
    
    const handler = new L.Draw.Polygon(map, {
      allowIntersection: false,
      shapeOptions: {
        color: currentStyle.color,
        fillOpacity: currentStyle.fillOpacity,
        weight: currentStyle.weight,
      },
    });
    
    drawHandlerRef.current = handler;
    handler.enable();
    setDrawingMode("polygon");
  }, [map, L, drawnItems, currentStyle]);
  
  const startDrawCircle = useCallback(() => {
    if (!map || !L || !drawnItems) return;
    
    cancelDrawing();
    
    const handler = new L.Draw.Circle(map, {
      shapeOptions: {
        color: currentStyle.color,
        fillOpacity: currentStyle.fillOpacity,
        weight: currentStyle.weight,
      },
    });
    
    drawHandlerRef.current = handler;
    handler.enable();
    setDrawingMode("circle");
  }, [map, L, drawnItems, currentStyle]);
  
  const startDrawRectangle = useCallback(() => {
    if (!map || !L || !drawnItems) return;
    
    cancelDrawing();
    
    const handler = new L.Draw.Rectangle(map, {
      shapeOptions: {
        color: currentStyle.color,
        fillOpacity: currentStyle.fillOpacity,
        weight: currentStyle.weight,
      },
    });
    
    drawHandlerRef.current = handler;
    handler.enable();
    setDrawingMode("rectangle");
  }, [map, L, drawnItems, currentStyle]);
  
  const createPentagon = useCallback((center?: GeoCoordinate): L.Polygon | null => {
    if (!map || !L || !drawnItems) return null;
    
    const mapCenter = center || { 
      lat: map.getCenter().lat, 
      lng: map.getCenter().lng 
    };
    const zoom = map.getZoom();
    
    // Calcular radio basado en zoom
    const radiusInDegrees = 0.5 / Math.pow(2, zoom - 8);
    
    // Crear 5 puntos para el pentágono
    const pentagon: [number, number][] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72 - 90) * (Math.PI / 180);
      const lat = mapCenter.lat + radiusInDegrees * Math.cos(angle);
      const lng = mapCenter.lng + radiusInDegrees * Math.sin(angle) / Math.cos(mapCenter.lat * Math.PI / 180);
      pentagon.push([lat, lng]);
    }
    
    // Crear polígono
    const polygonLayer = L.polygon(pentagon, {
      color: currentStyle.color,
      fillOpacity: currentStyle.fillOpacity,
      weight: currentStyle.weight,
    });
    
    // Agregar a drawnItems
    drawnItems.addLayer(polygonLayer);
    
    // Inicializar dragging y edición
    initializeDragging(polygonLayer);
    
    // Inicializar edición
    const typedPolygon = polygonLayer as L.Polygon & { editing?: L.Edit.Poly };
    if (!typedPolygon.editing) {
      typedPolygon.editing = new (L.Edit as unknown as { Poly: new (layer: L.Polygon, options?: object) => L.Edit.Poly }).Poly(polygonLayer, {
        icon: new L.DivIcon({
          iconSize: new L.Point(12, 12),
          className: "leaflet-div-icon leaflet-editing-icon",
        }),
      });
    }
    typedPolygon.editing.enable();
    
    activeLayerRef.current = polygonLayer;
    setIsEditing(true);
    
    // Notificar creación
    const geometry = getLayerGeometry(polygonLayer);
    if (geometry && onGeometryCreated) {
      onGeometryCreated({
        type: "polygon",
        layer: polygonLayer,
        geometry,
      });
    }
    
    return polygonLayer;
  }, [map, L, drawnItems, currentStyle, initializeDragging, getLayerGeometry, onGeometryCreated]);
  
  const cancelDrawing = useCallback(() => {
    if (drawHandlerRef.current) {
      drawHandlerRef.current.disable();
      drawHandlerRef.current = null;
    }
    setDrawingMode("none");
  }, []);
  
  // Acciones de edición
  const enableEditing = useCallback((layer: L.Layer) => {
    if (!L) return;
    
    const typedLayer = layer as L.Path & { editing?: L.Edit.Poly | L.Edit.Circle };
    
    if (layer instanceof L.Polygon && !typedLayer.editing) {
      typedLayer.editing = new (L.Edit as unknown as { Poly: new (layer: L.Polygon, options?: object) => L.Edit.Poly }).Poly(layer as L.Polygon, {
        icon: new L.DivIcon({
          iconSize: new L.Point(12, 12),
          className: "leaflet-div-icon leaflet-editing-icon",
        }),
      });
    } else if (layer instanceof L.Circle && !typedLayer.editing) {
      typedLayer.editing = new (L.Edit as unknown as { Circle: new (layer: L.Circle) => L.Edit.Circle }).Circle(layer as L.Circle);
    }
    
    if (typedLayer.editing) {
      typedLayer.editing.enable();
      setIsEditing(true);
    }
  }, [L]);
  
  const disableEditing = useCallback((layer: L.Layer) => {
    const typedLayer = layer as L.Path & { editing?: L.Edit.Poly | L.Edit.Circle };
    
    if (typedLayer.editing && (typedLayer.editing as { _enabled?: boolean })._enabled) {
      typedLayer.editing.disable();
      setIsEditing(false);
    }
  }, []);
  
  const enableDragging = useCallback((layer: L.Layer) => {
    const typedLayer = layer as L.Path & { dragging?: L.Handler };
    if (typedLayer.dragging) {
      typedLayer.dragging.enable();
    }
  }, []);
  
  const disableDragging = useCallback((layer: L.Layer) => {
    const typedLayer = layer as L.Path & { dragging?: L.Handler };
    if (typedLayer.dragging) {
      typedLayer.dragging.disable();
    }
  }, []);
  
  // Acciones de capas
  const addLayer = useCallback((layer: L.Layer) => {
    if (!drawnItems) return;
    drawnItems.addLayer(layer);
  }, [drawnItems]);
  
  const removeLayer = useCallback((layer: L.Layer) => {
    if (!drawnItems) return;
    drawnItems.removeLayer(layer);
  }, [drawnItems]);
  
  const clearAllLayers = useCallback(() => {
    if (!drawnItems) return;
    drawnItems.clearLayers();
    activeLayerRef.current = null;
  }, [drawnItems]);
  
  // Crear capas desde geometría
  const createPolygonLayer = useCallback((
    coordinates: GeoCoordinate[], 
    style?: DrawingStyle
  ): L.Polygon | null => {
    if (!L) return null;
    
    const latlngs = coordinates.map((c) => [c.lat, c.lng] as [number, number]);
    const layerStyle = style || currentStyle;
    
    return L.polygon(latlngs, {
      color: layerStyle.color,
      fillOpacity: layerStyle.fillOpacity,
      weight: layerStyle.weight,
    });
  }, [L, currentStyle]);
  
  const createCircleLayer = useCallback((
    center: GeoCoordinate, 
    radius: number, 
    style?: DrawingStyle
  ): L.Circle | null => {
    if (!L) return null;
    
    const layerStyle = style || currentStyle;
    
    return L.circle([center.lat, center.lng], {
      radius,
      color: layerStyle.color,
      fillOpacity: layerStyle.fillOpacity,
      weight: layerStyle.weight,
    });
  }, [L, currentStyle]);
  
  const createLayerFromGeofence = useCallback((geofence: Geofence): L.Layer | null => {
    if (!L) return null;
    
    const style: DrawingStyle = {
      color: geofence.color,
      fillOpacity: geofence.opacity,
      weight: 2,
    };
    
    let layer: L.Layer | null = null;
    
    if (geofence.geometry.type === "polygon") {
      const polygonGeom = geofence.geometry as PolygonGeometry;
      layer = createPolygonLayer(polygonGeom.coordinates, style);
    } else if (geofence.geometry.type === "circle") {
      const circleGeom = geofence.geometry as CircleGeometry;
      layer = createCircleLayer(circleGeom.center, circleGeom.radius, style);
    }
    
    if (layer) {
      // Agregar ID de geocerca
      (layer as L.Layer & { geofenceId?: string }).geofenceId = geofence.id;
      
      // Inicializar dragging
      initializeDragging(layer);
    }
    
    return layer;
  }, [L, createPolygonLayer, createCircleLayer, initializeDragging]);
  
  // Estilo
  const setLayerStyle = useCallback((layer: L.Layer, style: DrawingStyle) => {
    if (layer instanceof L.Path) {
      layer.setStyle({
        color: style.color,
        fillOpacity: style.fillOpacity,
        weight: style.weight,
      });
    }
  }, []);
  
  // Utilidades
  const zoomToLayer = useCallback((layer: L.Layer, padding = 50) => {
    if (!map) return;
    
    if (layer instanceof L.Circle) {
      map.setView(layer.getLatLng(), 14);
    } else if ("getBounds" in layer && typeof layer.getBounds === "function") {
      map.fitBounds(layer.getBounds(), { padding: [padding, padding] });
    }
  }, [map]);
  
  const getLayerBounds = useCallback((layer: L.Layer): L.LatLngBounds | null => {
    if (!L) return null;
    
    if (layer instanceof L.Circle) {
      const center = layer.getLatLng();
      const radius = layer.getRadius();
      return center.toBounds(radius * 2);
    }
    
    if ("getBounds" in layer && typeof layer.getBounds === "function") {
      return layer.getBounds();
    }
    
    return null;
  }, [L]);
  
  return {
    // Estado
    drawingMode,
    activeLayer: activeLayerRef.current,
    isEditing,
    
    // Acciones de dibujo
    startDrawPolygon,
    startDrawCircle,
    startDrawRectangle,
    createPentagon,
    cancelDrawing,
    
    // Acciones de edición
    enableEditing,
    disableEditing,
    enableDragging,
    disableDragging,
    
    // Acciones de capas
    addLayer,
    removeLayer,
    clearAllLayers,
    getLayerGeometry,
    
    // Crear capas desde geometría
    createPolygonLayer,
    createCircleLayer,
    createLayerFromGeofence,
    
    // Estilo
    setLayerStyle,
    currentStyle,
    setCurrentStyle,
    
    // Utilidades
    zoomToLayer,
    getLayerBounds,
  };
}

export type { DrawingStyle, GeometryCreatedEvent, UseDrawingToolsOptions, UseDrawingToolsReturn };
