/**
 * @fileoverview Servicio de programación de órdenes
 * @module services/scheduling-service
 * @description Encapsula toda la lógica de negocio y operaciones
 * relacionadas con la programación de órdenes.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import type { Order } from '@/types/order';
import type {
  ScheduledOrder,
  CalendarDayData,
  ScheduleConflict,
  ResourceSuggestion,
  HOSValidationResult,
  SchedulingKPIs,
} from '@/types/scheduling';
import {
  MOCK_VEHICLES,
  MOCK_DRIVERS,
  generateMockPendingOrders,
  generateMockSuggestions,
  findVehicleById,
  findDriverById,
  DEFAULT_KPIS,
  type MockVehicle,
  type MockDriver,
} from '@/mocks/scheduling';

// ============================================
// TIPOS
// ============================================

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

// ============================================
// SERVICIO DE PROGRAMACIÓN
// ============================================

class SchedulingService {
  private readonly simulateDelay = 500;

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
    await this.delay();
    return generateMockPendingOrders(12);
  }

  /**
   * Obtiene los vehículos disponibles
   */
  async getVehicles(): Promise<MockVehicle[]> {
    await this.delay(200);
    return MOCK_VEHICLES;
  }

  /**
   * Obtiene los conductores disponibles
   */
  async getDrivers(): Promise<MockDriver[]> {
    await this.delay(200);
    return MOCK_DRIVERS;
  }

  /**
   * Obtiene los KPIs del módulo
   */
  async getKPIs(): Promise<SchedulingKPIs> {
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
   * Asigna recursos a una orden
   */
  async assignOrder(payload: AssignmentPayload): Promise<SchedulingServiceResult<ScheduledOrder>> {
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
   * Obtiene sugerencias de recursos para una orden
   */
  async getSuggestions(orderId: string, date: Date): Promise<ResourceSuggestion[]> {
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
}

// Exportar instancia singleton
export const schedulingService = new SchedulingService();
