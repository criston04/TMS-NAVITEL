import type { Order } from '@/types/order';
import type { 
  SchedulingKPIs,
  SchedulingFeatureFlags,
  ResourceTimeline,
  ResourceSuggestion,
  ScheduleAuditLog,
  BlockedDay,
  SchedulingNotification,
  GanttResourceRow,
  ScheduledOrder,
} from '@/types/scheduling';

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

// KPIs POR DEFECTO

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

export const DEFAULT_SCHEDULING_CONFIG: SchedulingFeatureFlags = {
  enableHOSValidation: true,
  maxDrivingHours: 10,
  enableAutoSuggestion: true,
  enableRealtimeConflictCheck: true,
  conflictCheckIntervalMs: 5000,
  gpsIntegrationType: 'internal',
};

// GENERADORES DE DATOS

/**
 * Genera órdenes pendientes mock usando datos compartidos
 */
export function generateMockPendingOrders(count?: number): Order[] {
  const pendingOrders = SHARED_ORDERS.filter(
    o => o.status === 'pending' || o.status === 'assigned'
  );
  
  const ordersToReturn = count ? pendingOrders.slice(0, count) : pendingOrders;
  
  return ordersToReturn.map(order => mapSharedOrderToOrder(order)) as Order[];
}

/**
 * Genera TODAS las órdenes mock (todos los estados)
 */
export function generateMockAllOrders(): Order[] {
  return SHARED_ORDERS.map(order => mapSharedOrderToOrder(order)) as Order[];
}

/**
 * Mapea una SharedOrder a una Order completa
 */
function mapSharedOrderToOrder(order: (typeof SHARED_ORDERS)[number]): Order {
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
    completionPercentage: order.status === 'completed' ? 100 : order.status === 'in_transit' ? 50 : 0,
    createdAt: order.createdAt,
    createdBy: 'system',
    updatedAt: order.createdAt,
    scheduledStartDate: order.scheduledStartDate,
    scheduledEndDate: order.scheduledEndDate,
    statusHistory: [],
    syncStatus: 'not_sent' as const,
    serviceType: 'distribucion' as const,
    reference: order.reference,
    externalReference: order.externalReference,
  } as Order;
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

export function findVehicleById(id: string): MockVehicle | undefined {
  return MOCK_VEHICLES.find(v => v.id === id);
}

export function findDriverById(id: string): MockDriver | undefined {
  return MOCK_DRIVERS.find(d => d.id === id);
}

// ═══════════════════════════════════════════════════════════════
// AUDIT LOG MOCK (Feature 9)
// ═══════════════════════════════════════════════════════════════

/**
 * Genera registros de auditoría mock
 */
export function generateMockAuditLogs(): ScheduleAuditLog[] {
  const now = new Date();
  return [
    {
      id: 'audit-001',
      scheduleId: 'sched-001',
      action: 'created',
      description: 'Orden ORD-2025-001 programada para el 10 de julio',
      changes: [
        { field: 'vehicleId', oldValue: '', newValue: 'VEH-001' },
        { field: 'driverId', oldValue: '', newValue: 'DRV-001' },
      ],
      performedBy: 'USR-001',
      performedByName: 'Carlos García',
      performedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'audit-002',
      scheduleId: 'sched-002',
      action: 'reassigned',
      description: 'Conductor reasignado en orden ORD-2025-003',
      changes: [
        { field: 'driverId', oldValue: 'DRV-002', newValue: 'DRV-003' },
      ],
      performedBy: 'USR-002',
      performedByName: 'Ana Martínez',
      performedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'audit-003',
      scheduleId: 'sched-001',
      action: 'conflict_detected',
      description: 'Conflicto de vehículo detectado: VEH-001 doble asignación',
      performedBy: 'SYSTEM',
      performedByName: 'Sistema',
      performedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'audit-004',
      scheduleId: 'sched-003',
      action: 'unscheduled',
      description: 'Orden ORD-2025-005 desprogramada por mantenimiento de vehículo',
      changes: [
        { field: 'scheduleStatus', oldValue: 'scheduled', newValue: 'unscheduled' },
      ],
      performedBy: 'USR-001',
      performedByName: 'Carlos García',
      performedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'audit-005',
      scheduleId: 'sched-004',
      action: 'updated',
      description: 'Fecha de programación actualizada en ORD-2025-002',
      changes: [
        { field: 'scheduledDate', oldValue: '2025-07-08', newValue: '2025-07-10' },
      ],
      performedBy: 'USR-002',
      performedByName: 'Ana Martínez',
      performedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'audit-006',
      scheduleId: 'sched-005',
      action: 'conflict_resolved',
      description: 'Conflicto de conductor resuelto: DRV-003 reasignado',
      performedBy: 'USR-001',
      performedByName: 'Carlos García',
      performedAt: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// BLOCKED DAYS MOCK (Feature 10)
// ═══════════════════════════════════════════════════════════════

/**
 * Genera días bloqueados mock
 */
export function generateMockBlockedDays(): BlockedDay[] {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const inTwoWeeks = new Date(today);
  inTwoWeeks.setDate(today.getDate() + 14);

  return [
    {
      id: 'block-001',
      date: nextWeek.toISOString().split('T')[0],
      reason: 'Feriado nacional - Fiestas Patrias',
      blockType: 'holiday',
      appliesToAll: true,
      createdBy: 'Carlos García',
      createdAt: today.toISOString(),
    },
    {
      id: 'block-002',
      date: inTwoWeeks.toISOString().split('T')[0],
      reason: 'Mantenimiento programado de flota',
      blockType: 'full_day',
      appliesToAll: false,
      resourceIds: [SHARED_VEHICLES[0].id, SHARED_VEHICLES[1].id],
      createdBy: 'Ana Martínez',
      createdAt: today.toISOString(),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS MOCK (Feature 6)
// ═══════════════════════════════════════════════════════════════

/**
 * Genera notificaciones mock iniciales
 */
export function generateMockNotifications(): SchedulingNotification[] {
  const now = new Date();
  return [
    {
      id: 'notif-001',
      type: 'conflict',
      severity: 'warning',
      title: 'Conflicto de vehículo',
      message: 'El vehículo ABC-123 tiene 2 asignaciones simultáneas para el 10 de julio.',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      isRead: false,
      relatedOrderId: 'ORD-001',
      actionLabel: 'Ver conflicto',
    },
    {
      id: 'notif-002',
      type: 'hos_warning',
      severity: 'error',
      title: 'HOS - Límite próximo',
      message: 'El conductor Juan Pérez alcanzará el límite semanal de horas en 2h.',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      actionLabel: 'Revisar',
    },
    {
      id: 'notif-003',
      type: 'assignment',
      severity: 'success',
      title: 'Asignación completada',
      message: 'Orden ORD-2025-004 asignada exitosamente a VEH-003 / DRV-002.',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// GANTT DATA MOCK (Feature 8)
// ═══════════════════════════════════════════════════════════════

/**
 * Genera datos para la vista Gantt multi-día
 */
export function generateMockGanttData(startDate: Date, days: number = 7): GanttResourceRow[] {
  const rows: GanttResourceRow[] = [];

  // Vehículos
  SHARED_VEHICLES.slice(0, 4).forEach(vehicle => {
    const dailyAssignments = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + d);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      dailyAssignments.push({
        date,
        orders: [] as ScheduledOrder[],
        utilization: isWeekend ? 0 : Math.floor(Math.random() * 80) + 10,
        isBlocked: false,
      });
    }
    rows.push({
      resourceId: vehicle.id,
      type: 'vehicle' as const,
      name: `${vehicle.plate} - ${vehicle.brand}`,
      code: vehicle.plate,
      dailyAssignments,
    });
  });

  // Conductores
  SHARED_DRIVERS.slice(0, 4).forEach(driver => {
    const dailyAssignments = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + d);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      dailyAssignments.push({
        date,
        orders: [] as ScheduledOrder[],
        utilization: isWeekend ? 0 : Math.floor(Math.random() * 75) + 15,
        isBlocked: false,
      });
    }
    rows.push({
      resourceId: driver.id,
      type: 'driver' as const,
      name: driver.shortName,
      code: driver.id,
      dailyAssignments,
    });
  });

  return rows;
}

/**
 * Ejecuta auto-programación mock
 */
export function mockAutoSchedule(
  pendingOrders: Order[],
  _vehicles: MockVehicle[],
  _drivers: MockDriver[]
): { assigned: number; failed: number; errors: string[] } {
  const maxAuto = Math.min(pendingOrders.length, 5);
  const assigned = Math.min(maxAuto, 3 + Math.floor(Math.random() * 3));
  const failed = maxAuto - assigned;
  const errors: string[] = [];
  if (failed > 0) {
    errors.push('No hay vehículos disponibles para 1 orden');
    if (failed > 1) errors.push('Conductor con HOS insuficiente para 1 orden');
  }
  return { assigned, failed, errors };
}
