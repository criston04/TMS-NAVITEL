import type { Order } from '@/types/order';
import type {
  ScheduledOrder,
  CalendarDayData,
  ScheduleConflict,
  ResourceSuggestion,
  HOSValidationResult,
  SchedulingKPIs,
  ScheduleAuditLog,
  BlockedDay,
  SchedulingNotification,
  GanttResourceRow,
  BulkAssignmentResult,
} from '@/types/scheduling';
import {
  MOCK_VEHICLES,
  MOCK_DRIVERS,
  generateMockPendingOrders,
  generateMockAllOrders,
  generateMockSuggestions,
  generateMockAuditLogs,
  generateMockBlockedDays,
  generateMockNotifications,
  generateMockGanttData,
  mockAutoSchedule,
  findVehicleById,
  findDriverById,
  DEFAULT_KPIS,
  type MockVehicle,
  type MockDriver,
} from '@/mocks/scheduling';
import { moduleConnectorService } from '@/services/integration';
import { apiConfig, API_ENDPOINTS } from '@/config/api.config';
import { apiClient } from '@/lib/api';

export interface AssignmentPayload {
  orderId: string;
  vehicleId: string;
  driverId: string;
  scheduledDate: Date;
  notes?: string;
}

export interface SchedulingServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// SERVICIO DE PROGRAMACIÓN

class SchedulingService {
  private readonly useMocks: boolean;
  private readonly simulateDelay = 500;

  constructor() {
    this.useMocks = apiConfig.useMocks;
  }

  /**
   * Simula una llamada API con delay
   */
  private async delay(ms: number = this.simulateDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtiene las órdenes pendientes de programar
   */
  async getPendingOrders(): Promise<Order[]> {
    if (!this.useMocks) {
      return apiClient.get<Order[]>(`${API_ENDPOINTS.operations.scheduling}/pending-orders`);
    }

    await this.delay();
    return generateMockPendingOrders(12);
  }

  /**
   * Obtiene todas las órdenes (todos los estados)
   */
  async getAllOrders(): Promise<Order[]> {
    if (!this.useMocks) {
      return apiClient.get<Order[]>(`${API_ENDPOINTS.operations.scheduling}/all-orders`);
    }

    await this.delay();
    return generateMockAllOrders();
  }

  /**
   * Obtiene los vehículos disponibles
   */
  async getVehicles(): Promise<MockVehicle[]> {
    if (!this.useMocks) {
      return apiClient.get<MockVehicle[]>(`${API_ENDPOINTS.operations.scheduling}/vehicles`);
    }

    await this.delay(200);
    return MOCK_VEHICLES;
  }

  /**
   * Obtiene los conductores disponibles
   */
  async getDrivers(): Promise<MockDriver[]> {
    if (!this.useMocks) {
      return apiClient.get<MockDriver[]>(`${API_ENDPOINTS.operations.scheduling}/drivers`);
    }

    await this.delay(200);
    return MOCK_DRIVERS;
  }

  /**
   * Obtiene los KPIs del módulo
   */
  async getKPIs(): Promise<SchedulingKPIs> {
    if (!this.useMocks) {
      return apiClient.get<SchedulingKPIs>(`${API_ENDPOINTS.operations.scheduling}/kpis`);
    }

    await this.delay(300);
    return DEFAULT_KPIS;
  }

  /**
   * Genera datos del calendario para un mes
   */
  generateCalendarDays(month: Date, existingOrders: ScheduledOrder[] = []): CalendarDayData[] {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    const days: CalendarDayData[] = [];
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, monthIndex, day);
      
      // Buscar órdenes existentes para este día
      const dayOrders = existingOrders.filter(order => {
        const orderDate = order.scheduledDate instanceof Date 
          ? order.scheduledDate 
          : new Date(order.scheduledDate);
        return this.isSameDay(orderDate, date);
      });
      
      days.push({
        date,
        orders: dayOrders,
        utilization: Math.min(100, dayOrders.length * 15),
        isBlocked: false,
      });
    }
    
    return days;
  }

  /**
   * Compara si dos fechas son el mismo día
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Crea una orden programada a partir de una orden y datos de asignación
   */
  createScheduledOrder(
    order: Order,
    payload: AssignmentPayload
  ): ScheduledOrder {
    const vehicle = findVehicleById(payload.vehicleId);
    const driver = findDriverById(payload.driverId);

    const scheduledOrder: ScheduledOrder = {
      ...order,
      scheduledDate: payload.scheduledDate,
      scheduledStartTime: this.formatTime(payload.scheduledDate),
      estimatedEndTime: this.calculateEndTime(payload.scheduledDate, 4),
      estimatedDuration: 4,
      vehicleId: payload.vehicleId,
      driverId: payload.driverId,
      scheduleStatus: 'scheduled',
      hasConflict: false,
      conflicts: [],
      schedulingNotes: payload.notes,
      scheduledBy: 'current-user',
      scheduledByName: 'Usuario Actual',
      vehicle: vehicle ? {
        id: vehicle.id,
        plate: vehicle.plateNumber,
        brand: vehicle.model.split(' ')[0],
        model: vehicle.model,
        type: vehicle.type,
      } : undefined,
      driver: driver ? {
        id: driver.id,
        fullName: driver.fullName,
        phone: driver.phone,
      } : undefined,
    };

    return scheduledOrder;
  }

  /**
   * Formatea una fecha a formato de hora HH:mm
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  /**
   * Calcula la hora de fin estimada
   */
  private calculateEndTime(startDate: Date, durationHours: number): string {
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
    return this.formatTime(endDate);
  }

  /**
   * Asigna recursos a una orden con validación de workflow
   */
  async assignOrder(payload: AssignmentPayload): Promise<SchedulingServiceResult<ScheduledOrder>> {
    if (!this.useMocks) {
      return apiClient.post<SchedulingServiceResult<ScheduledOrder>>(`${API_ENDPOINTS.operations.scheduling}/assign`, payload);
    }

    await this.delay(800);
    
    try {
      // Validar que existan los recursos
      const vehicle = findVehicleById(payload.vehicleId);
      const driver = findDriverById(payload.driverId);

      if (!vehicle) {
        return {
          success: false,
          error: 'Vehículo no encontrado',
        };
      }

      if (!driver) {
        return {
          success: false,
          error: 'Conductor no encontrado',
        };
      }

      // CONEXIÓN CON WORKFLOWS (VALIDACIÓN)
      // Nota: En producción, se obtendría la orden completa con su workflowId
      // Por ahora validamos si se pasa la información
      const scheduledOrderPartial: Partial<ScheduledOrder> = {
        scheduledDate: payload.scheduledDate,
        vehicleId: payload.vehicleId,
        driverId: payload.driverId,
        estimatedDuration: 4, // Default, en producción vendría del payload
      };

      const { validation, recommendations } = 
        await moduleConnectorService.prepareScheduledOrderWithValidation(scheduledOrderPartial);
      
      if (!validation.isValid) {
        console.warn('[SchedulingService] Validación de workflow falló:', validation.errors);
        return {
          success: false,
          error: validation.errors.join('. '),
        };
      }

      if (validation.warnings.length > 0) {
        console.info('[SchedulingService] Advertencias de workflow:', validation.warnings);
      }
      
      if (recommendations.length > 0) {
        console.info('[SchedulingService] Recomendaciones:', recommendations);
      }

      // En producción aquí iría la llamada real a la API
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Valida una orden contra su workflow antes de programar
   * @param order - Orden a validar
   * @returns Resultado de validación con sugerencias
   */
  async validateOrderWorkflow(order: Partial<ScheduledOrder>): Promise<{
    isValid: boolean;
    suggestedDuration: number | null;
    warnings: string[];
    errors: string[];
  }> {
    if (!this.useMocks) {
      return apiClient.post<{ isValid: boolean; suggestedDuration: number | null; warnings: string[]; errors: string[] }>(`${API_ENDPOINTS.operations.scheduling}/validate-workflow`, { orderId: order.id });
    }

    const result = await moduleConnectorService.validateSchedulingWithWorkflow(order);
    return {
      isValid: result.isValid,
      suggestedDuration: result.suggestedDuration || null,
      warnings: result.warnings,
      errors: result.errors,
    };
  }

  /**
   * Obtiene información del workflow para mostrar en la UI de programación
   */
  async getWorkflowInfoForScheduling(workflowId: string): Promise<{
    steps: number;
    totalDuration: number;
    requiredGeofences: string[];
  } | null> {
    if (!this.useMocks) {
      return apiClient.get<{ steps: number; totalDuration: number; requiredGeofences: string[] } | null>(`${API_ENDPOINTS.operations.scheduling}/workflow-info/${workflowId}`);
    }

    const info = await moduleConnectorService.getWorkflowStepsForScheduling(workflowId);
    if (!info) return null;
    return {
      steps: info.steps.length,
      totalDuration: info.totalDuration,
      requiredGeofences: info.requiredGeofences,
    };
  }

  /**
   * Obtiene sugerencias de recursos para una orden
   */
  async getSuggestions(orderId: string, date: Date): Promise<ResourceSuggestion[]> {
    if (!this.useMocks) {
      return apiClient.get<ResourceSuggestion[]>(`${API_ENDPOINTS.operations.scheduling}/suggestions/${orderId}`, { params: { date: date.toISOString() } });
    }

    await this.delay(600);
    return generateMockSuggestions(orderId);
  }

  /**
   * Valida las horas de servicio de un conductor
   */
  async validateHOS(
    driverId: string,
    date: Date,
    estimatedDuration: number
  ): Promise<HOSValidationResult> {
    if (!this.useMocks) {
      return apiClient.post<HOSValidationResult>(`${API_ENDPOINTS.operations.scheduling}/validate-hos`, { driverId, date: date.toISOString(), estimatedDuration });
    }

    await this.delay(400);
    
    const driver = findDriverById(driverId);
    
    if (!driver) {
      return {
        isValid: false,
        remainingHoursToday: 0,
        weeklyHoursUsed: 0,
        violations: ['Conductor no encontrado en el sistema'],
      };
    }

    const maxWeeklyHours = 60;
    const maxDailyHours = 10;
    
    const violations: string[] = [];
    
    if (estimatedDuration > maxDailyHours) {
      violations.push(`La duración estimada excede las horas diarias disponibles (${maxDailyHours}h)`);
    }
    
    if (driver.hoursThisWeek + estimatedDuration > maxWeeklyHours) {
      violations.push(`El conductor alcanzaría el límite semanal de ${maxWeeklyHours}h`);
    }

    return {
      isValid: violations.length === 0,
      remainingHoursToday: maxDailyHours,
      weeklyHoursUsed: driver.hoursThisWeek,
      violations,
    };
  }

  /**
   * Detecta conflictos para una asignación propuesta
   */
  async detectConflicts(
    orderId: string,
    vehicleId: string,
    driverId: string,
    scheduledDate: Date,
    existingOrders: ScheduledOrder[]
  ): Promise<ScheduleConflict[]> {
    if (!this.useMocks) {
      return apiClient.post<ScheduleConflict[]>(`${API_ENDPOINTS.operations.scheduling}/detect-conflicts`, { orderId, vehicleId, driverId, scheduledDate: scheduledDate.toISOString() });
    }

    await this.delay(300);
    
    const conflicts: ScheduleConflict[] = [];
    const dateStr = scheduledDate.toDateString();
    
    // Buscar órdenes en el mismo día
    const sameDayOrders = existingOrders.filter(order => {
      const orderDate = order.scheduledDate instanceof Date 
        ? order.scheduledDate 
        : new Date(order.scheduledDate);
      return orderDate.toDateString() === dateStr && order.id !== orderId;
    });

    // Verificar conflictos de vehículo
    const vehicleConflict = sameDayOrders.find(o => o.vehicleId === vehicleId);
    if (vehicleConflict) {
      conflicts.push({
        id: `conflict-vehicle-${Date.now()}`,
        type: 'vehicle_overlap',
        severity: 'high',
        message: `El vehículo ya está asignado a la orden ${vehicleConflict.orderNumber}`,
        suggestedResolution: 'Seleccione otro vehículo o reprograme la orden existente',
        affectedEntity: {
          type: 'vehicle',
          id: vehicleId,
          name: vehicleConflict.vehicle?.plate || vehicleId,
        },
        relatedOrderIds: [vehicleConflict.id],
        detectedAt: new Date().toISOString(),
      });
    }

    // Verificar conflictos de conductor
    const driverConflict = sameDayOrders.find(o => o.driverId === driverId);
    if (driverConflict) {
      conflicts.push({
        id: `conflict-driver-${Date.now()}`,
        type: 'driver_overlap',
        severity: 'high',
        message: `El conductor ya está asignado a la orden ${driverConflict.orderNumber}`,
        suggestedResolution: 'Seleccione otro conductor o ajuste los horarios',
        affectedEntity: {
          type: 'driver',
          id: driverId,
          name: driverConflict.driver?.fullName || driverId,
        },
        relatedOrderIds: [driverConflict.id],
        detectedAt: new Date().toISOString(),
      });
    }

    return conflicts;
  }

  /**
   * Actualiza los KPIs después de una asignación
   */
  updateKPIsAfterAssignment(currentKPIs: SchedulingKPIs): SchedulingKPIs {
    return {
      ...currentKPIs,
      pendingOrders: Math.max(0, currentKPIs.pendingOrders - 1),
      scheduledToday: currentKPIs.scheduledToday + 1,
      fleetUtilization: Math.min(100, currentKPIs.fleetUtilization + 3),
      driverUtilization: Math.min(100, currentKPIs.driverUtilization + 2),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  //  BULK ASSIGNMENT (Feature 1)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Asigna múltiples órdenes a un mismo par vehículo/conductor
   */
  async bulkAssign(
    orderIds: string[],
    vehicleId: string,
    driverId: string,
    scheduledDate: Date,
    notes?: string
  ): Promise<BulkAssignmentResult> {
    if (!this.useMocks) {
      return apiClient.post<BulkAssignmentResult>(
        `${API_ENDPOINTS.operations.scheduling}/bulk-assign`,
        { orderIds, vehicleId, driverId, scheduledDate: scheduledDate.toISOString(), notes }
      );
    }

    await this.delay(1200);

    const result: BulkAssignmentResult = {
      total: orderIds.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    const vehicle = findVehicleById(vehicleId);
    const driver = findDriverById(driverId);

    if (!vehicle) {
      result.failed = orderIds.length;
      result.errors = orderIds.map(id => ({
        orderId: id,
        orderNumber: id,
        error: 'Vehículo no encontrado',
      }));
      return result;
    }

    if (!driver) {
      result.failed = orderIds.length;
      result.errors = orderIds.map(id => ({
        orderId: id,
        orderNumber: id,
        error: 'Conductor no encontrado',
      }));
      return result;
    }

    // Simular asignación exitosa para todas
    result.success = orderIds.length;
    return result;
  }

  // ═══════════════════════════════════════════════════════════════
  //  RESCHEDULE (Feature 3)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Reprograma una orden ya asignada a otra fecha/hora
   */
  async rescheduleOrder(
    orderId: string,
    newDate: Date,
    newResourceId?: string
  ): Promise<SchedulingServiceResult<ScheduledOrder>> {
    if (!this.useMocks) {
      return apiClient.post<SchedulingServiceResult<ScheduledOrder>>(
        `${API_ENDPOINTS.operations.scheduling}/reschedule`,
        { orderId, newDate: newDate.toISOString(), newResourceId }
      );
    }

    await this.delay(600);
    return { success: true };
  }

  // ═══════════════════════════════════════════════════════════════
  //  AUTO-SCHEDULING (Feature 7)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Ejecuta auto-programación de órdenes pendientes
   */
  async autoSchedule(
    pendingOrders: Order[],
    vehicles: MockVehicle[],
    drivers: MockDriver[]
  ): Promise<{ assigned: number; failed: number; errors: string[] }> {
    if (!this.useMocks) {
      return apiClient.post<{ assigned: number; failed: number; errors: string[] }>(
        `${API_ENDPOINTS.operations.scheduling}/auto-schedule`,
        { orderIds: pendingOrders.map(o => o.id) }
      );
    }

    await this.delay(2000);
    return mockAutoSchedule(pendingOrders, vehicles, drivers);
  }

  // ═══════════════════════════════════════════════════════════════
  //  AUDIT LOG (Feature 9)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene el historial de cambios
   */
  async getAuditLogs(): Promise<ScheduleAuditLog[]> {
    if (!this.useMocks) {
      return apiClient.get<ScheduleAuditLog[]>(
        `${API_ENDPOINTS.operations.scheduling}/audit-logs`
      );
    }

    await this.delay(400);
    return generateMockAuditLogs();
  }

  // ═══════════════════════════════════════════════════════════════
  //  BLOCKED DAYS (Feature 10)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene los días bloqueados
   */
  async getBlockedDays(): Promise<BlockedDay[]> {
    if (!this.useMocks) {
      return apiClient.get<BlockedDay[]>(
        `${API_ENDPOINTS.operations.scheduling}/blocked-days`
      );
    }

    await this.delay(300);
    return generateMockBlockedDays();
  }

  /**
   * Bloquea un día
   */
  async blockDay(day: Omit<BlockedDay, 'id' | 'createdAt'>): Promise<BlockedDay> {
    if (!this.useMocks) {
      return apiClient.post<BlockedDay>(
        `${API_ENDPOINTS.operations.scheduling}/blocked-days`,
        day
      );
    }

    await this.delay(400);
    return {
      ...day,
      id: `block-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Desbloquea un día
   */
  async unblockDay(blockId: string): Promise<void> {
    if (!this.useMocks) {
      await apiClient.delete(`${API_ENDPOINTS.operations.scheduling}/blocked-days/${blockId}`);
      return;
    }

    await this.delay(300);
  }

  // ═══════════════════════════════════════════════════════════════
  //  NOTIFICATIONS (Feature 6)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene notificaciones del módulo
   */
  async getNotifications(): Promise<SchedulingNotification[]> {
    if (!this.useMocks) {
      return apiClient.get<SchedulingNotification[]>(
        `${API_ENDPOINTS.operations.scheduling}/notifications`
      );
    }

    await this.delay(300);
    return generateMockNotifications();
  }

  // ═══════════════════════════════════════════════════════════════
  //  GANTT (Feature 8)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene datos para la vista Gantt multi-día
   */
  async getGanttData(startDate: Date, days: number = 7): Promise<GanttResourceRow[]> {
    if (!this.useMocks) {
      return apiClient.get<GanttResourceRow[]>(
        `${API_ENDPOINTS.operations.scheduling}/gantt`,
        { params: { startDate: startDate.toISOString(), days } }
      );
    }

    await this.delay(500);
    return generateMockGanttData(startDate, days);
  }

  // ═══════════════════════════════════════════════════════════════
  //  EXPORT (Feature 5)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Genera CSV de la programación
   */
  generateScheduleCSV(orders: Order[]): string {
    const headers = [
      'Orden', 'Referencia', 'Cliente', 'Estado', 'Prioridad',
      'Vehículo', 'Conductor', 'Origen', 'Destino',
      'Fecha Prog.', 'Peso (kg)',
    ];

    const rows = orders.map(o => {
      const origin = o.milestones?.find(m => m.type === 'origin');
      const dest = o.milestones?.find(m => m.type === 'destination');
      return [
        o.orderNumber || '',
        o.reference || '',
        o.customer?.name || '',
        o.status || '',
        o.priority || '',
        o.vehicle?.plate || '',
        o.driver?.fullName || '',
        origin?.geofenceName || '',
        dest?.geofenceName || '',
        o.scheduledStartDate || '',
        String(o.cargo?.weightKg || 0),
      ].map(v => `"${v}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export const schedulingService = new SchedulingService();
