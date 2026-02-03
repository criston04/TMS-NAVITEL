/**
 * @fileoverview Datos mock para el módulo de programación
 * @module mocks/scheduling
 * @description Contiene todos los datos simulados para desarrollo
 * del módulo de programación.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import type { Order, OrderPriority } from '@/types/order';
import type { VehicleType } from '@/types/models/vehicle';
import type { 
  SchedulingKPIs,
  SchedulingFeatureFlags,
  ResourceTimeline,
  ResourceSuggestion,
} from '@/types/scheduling';

// ============================================
// TIPOS LOCALES
// ============================================

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
// DATOS DE VEHÍCULOS
// ============================================

export const MOCK_VEHICLES: MockVehicle[] = [
  {
    id: 'v1',
    plateNumber: 'ABC-123',
    model: 'Freightliner Cascadia',
    status: 'available',
    type: 'camion',
    capacityKg: 25000,
  },
  {
    id: 'v2',
    plateNumber: 'XYZ-789',
    model: 'Kenworth T680',
    status: 'available',
    type: 'tractocamion',
    capacityKg: 30000,
  },
  {
    id: 'v3',
    plateNumber: 'DEF-456',
    model: 'Volvo VNL',
    status: 'available',
    type: 'camion',
    capacityKg: 28000,
  },
  {
    id: 'v4',
    plateNumber: 'GHI-321',
    model: 'Peterbilt 579',
    status: 'in_use',
    type: 'tractocamion',
    capacityKg: 27000,
  },
  {
    id: 'v5',
    plateNumber: 'JKL-654',
    model: 'Mack Anthem',
    status: 'maintenance',
    type: 'camion',
    capacityKg: 26000,
  },
];

// ============================================
// DATOS DE CONDUCTORES
// ============================================

export const MOCK_DRIVERS: MockDriver[] = [
  {
    id: 'd1',
    fullName: 'Juan Carlos Pérez Hernández',
    name: 'Juan Pérez',
    status: 'available',
    phone: '+52 555 123 4567',
    licenseExpiry: '2026-12-15',
    hoursThisWeek: 32,
  },
  {
    id: 'd2',
    fullName: 'María Elena García López',
    name: 'María García',
    status: 'available',
    phone: '+52 555 987 6543',
    licenseExpiry: '2025-08-20',
    hoursThisWeek: 28,
  },
  {
    id: 'd3',
    fullName: 'Carlos Alberto López Martínez',
    name: 'Carlos López',
    status: 'on_duty',
    phone: '+52 555 456 7890',
    licenseExpiry: '2027-03-10',
    hoursThisWeek: 45,
  },
  {
    id: 'd4',
    fullName: 'Roberto González Díaz',
    name: 'Roberto González',
    status: 'available',
    phone: '+52 555 111 2222',
    licenseExpiry: '2026-06-25',
    hoursThisWeek: 20,
  },
  {
    id: 'd5',
    fullName: 'Ana Patricia Rodríguez Torres',
    name: 'Ana Rodríguez',
    status: 'off_duty',
    phone: '+52 555 333 4444',
    licenseExpiry: '2025-11-30',
    hoursThisWeek: 48,
  },
];

// ============================================
// KPIs POR DEFECTO
// ============================================

export const DEFAULT_KPIS: SchedulingKPIs = {
  pendingOrders: 15,
  scheduledToday: 8,
  atRiskOrders: 2,
  fleetUtilization: 75,
  driverUtilization: 68,
  onTimeDeliveryRate: 94,
  averageLeadTime: 18,
  weeklyTrend: 5,
};

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

const CITIES = [
  'Ciudad de México',
  'Guadalajara',
  'Monterrey',
  'Tijuana',
  'Puebla',
  'León',
  'Querétaro',
  'Mérida',
];

const CARGO_TYPES = [
  'Electrónicos',
  'Alimentos Perecederos',
  'Materiales de Construcción',
  'Productos Farmacéuticos',
  'Textiles',
  'Autopartes',
  'Maquinaria Industrial',
  'Productos Químicos',
];

const CUSTOMER_NAMES = [
  'Distribuidora del Norte S.A.',
  'Comercializadora Pacífico',
  'Industrias Metalúrgicas MX',
  'Grupo Logístico Central',
  'Almacenes Regionales del Bajío',
  'Transportes Internacionales SA',
  'Cadena de Suministro Express',
  'Operador Logístico Global',
];

/**
 * Genera órdenes pendientes mock
 */
export function generateMockPendingOrders(count: number = 12): Order[] {
  const priorities: OrderPriority[] = ['low', 'normal', 'high', 'urgent'];
  const baseDate = new Date();
  
  return Array.from({ length: count }, (_, i) => {
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const customerIndex = i % CUSTOMER_NAMES.length;
    const cityIndex = i % CITIES.length;
    const cargoIndex = i % CARGO_TYPES.length;
    
    const orderId = `order-${i + 1}`;
    
    return {
      id: orderId,
      orderNumber: `ORD-${String(2024001 + i).padStart(7, '0')}`,
      status: 'pending' as const,
      priority,
      customer: {
        id: `customer-${customerIndex + 1}`,
        name: CUSTOMER_NAMES[customerIndex],
        code: `C${String(customerIndex + 1).padStart(4, '0')}`,
        email: `contacto@${CUSTOMER_NAMES[customerIndex].toLowerCase().replace(/\s+/g, '').slice(0, 10)}.com`,
      },
      destination: {
        city: CITIES[cityIndex],
        country: 'México',
      },
      cargo: {
        description: CARGO_TYPES[cargoIndex],
        type: 'general' as const,
        weightKg: 1000 + Math.floor(Math.random() * 9000),
        quantity: 10 + Math.floor(Math.random() * 50),
      },
      milestones: [
        {
          id: `milestone-origin-${i}`,
          orderId: orderId,
          geofenceId: `geo-origin-${i}`,
          geofenceName: 'Centro de Distribución Principal',
          type: 'origin' as const,
          sequence: 1,
          address: 'Av. Industrial 123, CDMX',
          coordinates: {
            lat: 19.4326 + (Math.random() * 0.1 - 0.05),
            lng: -99.1332 + (Math.random() * 0.1 - 0.05),
          },
          estimatedArrival: baseDate.toISOString(),
          status: 'pending' as const,
        },
        {
          id: `milestone-dest-${i}`,
          orderId: orderId,
          geofenceId: `geo-dest-${i}`,
          geofenceName: CITIES[cityIndex],
          type: 'destination' as const,
          sequence: 2,
          address: `${CITIES[cityIndex]}, México`,
          coordinates: {
            lat: 20.6597 + (Math.random() * 2 - 1),
            lng: -103.3496 + (Math.random() * 2 - 1),
          },
          estimatedArrival: new Date(baseDate.getTime() + 8 * 60 * 60 * 1000).toISOString(),
          status: 'pending' as const,
        },
      ],
      completionPercentage: 0,
      createdAt: new Date(baseDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'system',
      updatedAt: new Date().toISOString(),
      scheduledStartDate: new Date(baseDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      scheduledEndDate: new Date(baseDate.getTime() + (i + 2) * 24 * 60 * 60 * 1000).toISOString(),
      statusHistory: [],
      syncStatus: 'not_sent' as const,
      customerId: `customer-${customerIndex + 1}`,
    };
  }) as Order[];
}

/**
 * Genera timelines de recursos mock
 */
export function generateMockTimelines(): ResourceTimeline[] {
  const vehicleTimelines: ResourceTimeline[] = MOCK_VEHICLES.slice(0, 3).map(vehicle => ({
    resourceId: vehicle.id,
    type: 'vehicle' as const,
    name: `${vehicle.plateNumber} - ${vehicle.model.split(' ')[0]}`,
    utilization: Math.floor(Math.random() * 40) + 40,
    assignments: [],
  }));

  const driverTimelines: ResourceTimeline[] = MOCK_DRIVERS.slice(0, 3).map(driver => ({
    resourceId: driver.id,
    type: 'driver' as const,
    name: driver.name,
    utilization: Math.floor(Math.random() * 40) + 30,
    assignments: [],
  }));

  return [...vehicleTimelines, ...driverTimelines];
}

/**
 * Genera sugerencias de recursos para una orden
 */
export function generateMockSuggestions(_orderId: string): ResourceSuggestion[] {
  const vehicleSuggestions: ResourceSuggestion[] = MOCK_VEHICLES
    .filter(v => v.status === 'available')
    .slice(0, 2)
    .map((vehicle, index) => ({
      type: 'vehicle' as const,
      resourceId: vehicle.id,
      name: `${vehicle.plateNumber} - ${vehicle.model}`,
      score: 95 - (index * 13),
      reason: index === 0 
        ? 'Mejor disponibilidad y cercanía al origen'
        : 'Capacidad adecuada para la carga',
      isAvailable: true,
    }));

  const driverSuggestions: ResourceSuggestion[] = MOCK_DRIVERS
    .filter(d => d.status === 'available')
    .slice(0, 2)
    .map((driver, index) => ({
      type: 'driver' as const,
      resourceId: driver.id,
      name: driver.name,
      score: 90 - (index * 12),
      reason: index === 0 
        ? 'Experiencia en la ruta y horas disponibles'
        : 'Buena puntuación de entregas a tiempo',
      isAvailable: true,
    }));

  return [...vehicleSuggestions, ...driverSuggestions];
}

/**
 * Busca un vehículo por ID
 */
export function findVehicleById(vehicleId: string): MockVehicle | undefined {
  return MOCK_VEHICLES.find(v => v.id === vehicleId);
}

/**
 * Busca un conductor por ID
 */
export function findDriverById(driverId: string): MockDriver | undefined {
  return MOCK_DRIVERS.find(d => d.id === driverId);
}
