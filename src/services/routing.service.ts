/**
 * @fileoverview Routing Service - Servicio de cálculo de rutas usando OSRM
 * @module services/routing
 */

/* ============================================
   TIPOS
   ============================================ */

export interface RouteSegment {
  coordinates: [number, number][];
  distance: number; // en metros
  duration: number; // en segundos
}

export interface RoutingResult {
  polyline: [number, number][];
  totalDistance: number; // en km
  totalDuration: number; // en minutos
  segments: RouteSegment[];
}

/* ============================================
   SERVICIO DE ROUTING
   ============================================ */

class RoutingService {
  private readonly OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

  /**
   * Calcula una ruta entre múltiples puntos usando OSRM
   * @param coordinates Array de coordenadas [lat, lng]
   * @returns Resultado de la ruta con polyline siguiendo calles
   */
  async calculateRoute(
    coordinates: [number, number][]
  ): Promise<RoutingResult> {
    try {
      if (coordinates.length < 2) {
        throw new Error('Se requieren al menos 2 puntos para calcular una ruta');
      }

      // Convertir coordenadas a formato OSRM (lng,lat)
      const coords = coordinates
        .map(([lat, lng]) => `${lng},${lat}`)
        .join(';');

      // Hacer petición a OSRM
      const url = `${this.OSRM_URL}/${coords}?overview=full&geometries=geojson&steps=true`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('Error en OSRM:', response.statusText);
        // Fallback a línea recta si falla OSRM
        return this.fallbackStraightLine(coordinates);
      }

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        console.warn('No se encontraron rutas, usando fallback');
        return this.fallbackStraightLine(coordinates);
      }

      const route = data.routes[0];
      
      // Extraer las coordenadas del polyline (ya vienen en formato [lng, lat])
      const polyline: [number, number][] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );

      // Calcular distancia total en km
      const totalDistance = Math.round((route.distance / 1000) * 10) / 10;

      // Calcular duración total en minutos
      const totalDuration = Math.round(route.duration / 60);

      // Procesar segmentos
      const segments: RouteSegment[] = route.legs.map((leg: any) => ({
        coordinates: leg.steps
          .flatMap((step: any) => step.geometry.coordinates)
          .map(([lng, lat]: [number, number]) => [lat, lng]),
        distance: leg.distance,
        duration: leg.duration,
      }));

      return {
        polyline,
        totalDistance,
        totalDuration,
        segments,
      };
    } catch (error) {
      console.error('Error calculando ruta:', error);
      // Fallback a línea recta si hay error
      return this.fallbackStraightLine(coordinates);
    }
  }

  /**
   * Fallback: Genera una ruta con líneas rectas cuando OSRM falla
   */
  private fallbackStraightLine(
    coordinates: [number, number][]
  ): RoutingResult {
    const polyline: [number, number][] = [];
    let totalDistance = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];

      // Interpolar puntos entre inicio y fin
      const steps = 20;
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        const lat = start[0] + (end[0] - start[0]) * t;
        const lng = start[1] + (end[1] - start[1]) * t;
        polyline.push([lat, lng]);
      }

      // Calcular distancia del segmento
      totalDistance += this.calculateDistance(start, end);
    }

    const totalDuration = Math.round((totalDistance / 40) * 60); // 40 km/h promedio

    return {
      polyline,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalDuration,
      segments: [],
    };
  }

  /**
   * Calcula la distancia entre dos puntos usando la fórmula de Haversine
   */
  private calculateDistance(
    coord1: [number, number],
    coord2: [number, number]
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
    const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1[0] * Math.PI) / 180) *
        Math.cos((coord2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calcula rutas optimizadas para múltiples paradas
   * Usa OSRM para calcular la mejor secuencia
   */
  async calculateOptimizedRoute(
    coordinates: [number, number][],
    startIndex: number = 0
  ): Promise<RoutingResult & { waypointOrder: number[] }> {
    try {
      if (coordinates.length < 2) {
        throw new Error('Se requieren al menos 2 puntos');
      }

      // Para rutas con más de 2 puntos, calcular sin optimización de orden
      // OSRM puede optimizar pero requiere configuración diferente
      const routingResult = await this.calculateRoute(coordinates);

      return {
        ...routingResult,
        waypointOrder: coordinates.map((_, index) => index),
      };
    } catch (error) {
      console.error('Error en ruta optimizada:', error);
      return {
        ...this.fallbackStraightLine(coordinates),
        waypointOrder: coordinates.map((_, index) => index),
      };
    }
  }
}

// Exportar instancia única
export const routingService = new RoutingService();
