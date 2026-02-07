/**
 * @fileoverview Datos mock para el módulo de programación
 * @module mocks/scheduling
 * @description Funciones y datos específicos del módulo de programación
 * que utilizan los datos compartidos centralizados.
 * @author TMS-NAVITEL
 * @version 2.0.0
 */

import type { Order } from '@/types/order';
import type { 
  SchedulingKPIs,
  SchedulingFeatureFlags,
  ResourceTimeline,
  ResourceSuggestion,
} from '@/types/scheduling';

// Importar datos compartidos
import {
  SHARED_VEHICLES,
  SHARED_DRIVERS,
  SHARED_ORDERS,
  findCustomerById,
  findLocationById,
  findVehicleById as findSharedVehicleById,
  findDriverById as findSharedDriverById,
  getOrderStats,
  getFleetStats,
} from './shared-data';

import type { VehicleType } from '@/types/models/vehicle';

// Tipos para el módulo de scheduling
export interface MockVehicle {
  id: string;
  plateNumber: string;
  model: string;
  status: 'available' | 'in_use' | 'maintenance';
  type: VehicleType;
  capacityKg: number;
}

export interface MockDriver {
  id: string;
  fullName: string;
  name: string;
  status: 'available' | 'on_duty' | 'off_duty';
  phone: string;
  licenseExpiry: string;
  hoursThisWeek: number;
}

// ============================================
// DATOS DERIVADOS PARA SCHEDULING
// ============================================

/**
 * Vehículos disponibles para programación
 */
export const MOCK_VEHICLES = SHARED_VEHICLES.map(v => ({
  id: v.id,
  plateNumber: v.plate,
  model: `${v.brand} ${v.model}`,
  status: v.operationalStatus === 'available' ? 'available' as const : 
          v.operationalStatus === 'on-route' ? 'in_use' as const : 
          'maintenance' as const,
  type: v.type,
  capacityKg: v.capacityKg,
}));

/**
 * Conductores disponibles para programación
 */
export const MOCK_DRIVERS = SHARED_DRIVERS.map(d => ({
  id: d.id,
  fullName: d.fullName,
  name: d.shortName,
  status: d.availability === 'available' ? 'available' as const :
          d.availability === 'on-route' ? 'on_duty' as const :
          'off_duty' as const,
  phone: d.phone,
  licenseExpiry: d.licenseExpiry,
  hoursThisWeek: d.hoursThisWeek,
}));

// ============================================
// KPIs POR DEFECTO
// ============================================

export function getSchedulingKPIs(): SchedulingKPIs {
  const orderStats = getOrderStats();
  const fleetStats = getFleetStats();
  
  const fleetUtilization = fleetStats.totalVehicles > 0 
    ? Math.round((fleetStats.onRouteVehicles / fleetStats.totalVehicles) * 100)
    : 0;
    
  const driverUtilization = fleetStats.totalDrivers > 0
    ? Math.round((fleetStats.onRouteDrivers / fleetStats.totalDrivers) * 100)
    : 0;

  return {
    pendingOrders: orderStats.pending + orderStats.assigned,
    scheduledToday: orderStats.inTransit,
    atRiskOrders: orderStats.urgent,
    fleetUtilization,
    driverUtilization,
    onTimeDeliveryRate: 94, // Mock
    averageLeadTime: 18, // Mock hours
    weeklyTrend: 5, // Mock %
  };
}

export const DEFAULT_KPIS: SchedulingKPIs = getSchedulingKPIs();

// ============================================
// CONFIGURACIÓN POR DEFECTO
// ============================================

export const DEFAULT_SCHEDULING_CONFIG: SchedulingFeatureFlags = {
  enableHOSValidation: true,
  maxDrivingHours: 10,
  enableAutoSuggestion: true,
  enableRealtimeConflictCheck: true,
  conflictCheckIntervalMs: 5000,
  gpsIntegrationType: 'internal',
};

// ============================================
// GENERADORES DE DATOS
// ============================================

/**
 * Genera órdenes pendientes mock usando datos compartidos
 */
export function generateMockPendingOrders(count?: number): Order[] {
  const pendingOrders = SHARED_ORDERS.filter(
    o => o.status === 'pending' || o.status === 'assigned'
  );
  
  const ordersToReturn = count ? pendingOrders.slice(0, count) : pendingOrders;
  
  return ordersToReturn.map(order => {
    const customer = findCustomerById(order.customerId);
    const vehicle = order.vehicleId ? findSharedVehicleById(order.vehicleId) : undefined;
    const driver = order.driverId ? findSharedDriverById(order.driverId) : undefined;
    const origin = findLocationById(order.originId);
    const destination = findLocationById(order.destinationId);
    
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      priority: order.priority,
      customerId: order.customerId,
      customer: customer ? {
        id: customer.id,
        name: customer.name,
        code: customer.code,
        email: customer.email,
      } : undefined,
      vehicleId: order.vehicleId,
      vehicle: vehicle ? {
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type,
      } : undefined,
      driverId: order.driverId,
      driver: driver ? {
        id: driver.id,
        fullName: driver.fullName,
        phone: driver.phone,
      } : undefined,
      cargo: {
        description: order.cargoDescription,
        type: order.cargoType,
        weightKg: order.weightKg,
        quantity: 1,
      },
      milestones: [
        {
          id: `ms-${order.id}-origin`,
          orderId: order.id,
          geofenceId: order.originId,
          geofenceName: order.originName,
          type: 'origin' as const,
          sequence: 1,
          address: origin?.address || '',
          coordinates: {
            lat: origin?.lat || -12.0464,
            lng: origin?.lng || -77.0428,
          },
          estimatedArrival: order.scheduledStartDate,
          status: 'pending' as const,
        },
        {
          id: `ms-${order.id}-dest`,
          orderId: order.id,
          geofenceId: order.destinationId,
          geofenceName: order.destinationName,
          type: 'destination' as const,
          sequence: 2,
          address: destination?.address || '',
          coordinates: {
            lat: destination?.lat || -12.0464,
            lng: destination?.lng || -77.0428,
          },
          estimatedArrival: order.scheduledEndDate,
          status: 'pending' as const,
        },
      ],
      completionPercentage: 0,
      createdAt: order.createdAt,
      createdBy: 'system',
      updatedAt: order.createdAt,
      scheduledStartDate: order.scheduledStartDate,
      scheduledEndDate: order.scheduledEndDate,
      statusHistory: [],
      syncStatus: 'not_sent' as const,
    };
  }) as Order[];
}

/**
 * Genera timelines de recursos mock
 */
export function generateMockTimelines(): ResourceTimeline[] {
  const vehicleTimelines: ResourceTimeline[] = SHARED_VEHICLES.slice(0, 4).map(vehicle => ({
    resourceId: vehicle.id,
    type: 'vehicle' as const,
    name: `${vehicle.plate} - ${vehicle.brand}`,
    utilization: vehicle.operationalStatus === 'on-route' ? 80 : 
                 vehicle.operationalStatus === 'available' ? 30 : 0,
    assignments: [],
  }));

  const driverTimelines: ResourceTimeline[] = SHARED_DRIVERS.slice(0, 4).map(driver => ({
    resourceId: driver.id,
    type: 'driver' as const,
    name: driver.shortName,
    utilization: driver.availability === 'on-route' ? 85 :
                 driver.availability === 'available' ? 25 : 0,
    assignments: [],
  }));

  return [...vehicleTimelines, ...driverTimelines];
}

/**
 * Genera sugerencias de recursos para una orden
 */
export function generateMockSuggestions(_orderId: string): ResourceSuggestion[] {
  const availableVehicles = SHARED_VEHICLES.filter(v => v.operationalStatus === 'available');
  const availableDrivers = SHARED_DRIVERS.filter(d => d.availability === 'available');

  const vehicleSuggestions: ResourceSuggestion[] = availableVehicles
    .slice(0, 2)
    .map((vehicle, index) => ({
      type: 'vehicle' as const,
      resourceId: vehicle.id,
      name: `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`,
      score: 95 - (index * 10),
      reason: index === 0 
        ? 'Mejor disponibilidad y capacidad adecuada'
        : 'Vehículo alternativo con buena capacidad',
      isAvailable: true,
    }));

  const driverSuggestions: ResourceSuggestion[] = availableDrivers
    .slice(0, 2)
    .map((driver, index) => ({
      type: 'driver' as const,
      resourceId: driver.id,
      name: driver.fullName,
      score: 90 - (index * 8),
      reason: index === 0 
        ? `Horas disponibles: ${48 - driver.hoursThisWeek}h esta semana`
        : 'Conductor con experiencia en rutas similares',
      isAvailable: true,
    }));

  return [...vehicleSuggestions, ...driverSuggestions];
}

// Funciones de búsqueda para compatibilidad
export function findVehicleById(id: string): MockVehicle | undefined {
  return MOCK_VEHICLES.find(v => v.id === id);
}

export function findDriverById(id: string): MockDriver | undefined {
  return MOCK_DRIVERS.find(d => d.id === id);
}
