/**
 * @fileoverview Servicio principal para gestión de Órdenes
 * @module services/orders/OrderService
 * @description Implementa operaciones CRUD y lógica de negocio para órdenes.
 * Preparado para conectar con API REST.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import type {
  Order,
  OrderStatus,
  OrderFilters,
  OrdersResponse,
  CreateOrderDTO,
  UpdateOrderDTO,
  OrderClosureData,
  OrderMilestone,
  BulkSendPayload,
  BulkSendResult,
  OrderRealtimeEvent,
} from '@/types/order';
import {
  mockOrders,
  filterOrders,
  getOrderStatusCounts,
  getOrderCustomers,
  getOrderCarriers,
  getOrderGPSOperators,
} from '@/mocks/orders/orders.mock';
import { moduleConnectorService } from '@/services/integration';

/**
 * Configuración del servicio
 */
interface OrderServiceConfig {
  /** URL base de la API (cuando se conecte a backend real) */
  apiBaseUrl?: string;
  /** Usar datos mock */
  useMock: boolean;
  /** Timeout para peticiones en ms */
  timeout?: number;
}

/**
 * Configuración por defecto del servicio
 */
const defaultConfig: OrderServiceConfig = {
  useMock: true,
  timeout: 30000,
};

/**
 * Simula latencia de red para datos mock
 * @param ms - Milisegundos de delay
 */
const simulateDelay = (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Genera un nuevo ID de orden
 * @returns ID único de orden
 */
const generateOrderId = (): string => {
  const sequence = mockOrders.length + 1;
  return `ord-${String(sequence).padStart(5, '0')}`;
};

/**
 * Genera número de orden visible
 * @param index - Índice de la orden
 * @returns Número de orden formateado
 */
const generateOrderNumber = (index: number): string => {
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(index).padStart(5, '0')}`;
};

/**
 * Clase de servicio para gestión de órdenes
 * Implementa patrón Repository con soporte para mock y API real
 */
class OrderService {
  private readonly config: OrderServiceConfig;
  private orders: Order[] = [...mockOrders];
  private readonly eventListeners: Map<string, Set<(event: OrderRealtimeEvent) => void>> = new Map();

  /**
   * Crea una instancia del servicio de órdenes
   * @param config - Configuración del servicio
   */
  constructor(config: Partial<OrderServiceConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // ============================================
  // MÉTODOS DE LECTURA (READ)
  // ============================================

  /**
   * Obtiene órdenes con filtros y paginación
   * @param filters - Filtros a aplicar
   * @returns Promesa con respuesta paginada de órdenes
   * @example
   * ```typescript
   * const response = await orderService.getOrders({
   *   status: 'in_transit',
   *   page: 1,
   *   pageSize: 20
   * });
   * ```
   */
  async getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    await simulateDelay();

    if (this.config.useMock) {
      // Cargar órdenes generadas desde el route planner
      const routePlannerOrders = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('tms-generated-orders') || '[]')
        : [];
      
      // Combinar órdenes mock con las generadas desde el route planner
      const allOrders = [...this.orders, ...routePlannerOrders];
      
      const result = filterOrders({
        ...filters,
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? 10,
      }, allOrders);

      return {
        data: result.data,
        total: result.total,
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? 10,
        totalPages: Math.ceil(result.total / (filters.pageSize ?? 10)),
        statusCounts: result.statusCounts,
      };
    }

    // TODO: Implementar llamada a API real
    throw new Error('API not implemented');
  }

  /**
   * Obtiene una orden por su ID
   * @param id - ID de la orden
   * @returns Promesa con la orden o null si no existe
   * @throws Error si la orden no se encuentra
   */
  async getOrderById(id: string): Promise<Order | null> {
    await simulateDelay(200);

    if (this.config.useMock) {
      const order = this.orders.find(o => o.id === id);
      return order ?? null;
    }

    // TODO: Implementar llamada a API real
    throw new Error('API not implemented');
  }

  /**
   * Obtiene una orden por número de orden
   * @param orderNumber - Número de orden visible
   * @returns Promesa con la orden o null si no existe
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    await simulateDelay(200);

    if (this.config.useMock) {
      const order = this.orders.find(o => o.orderNumber === orderNumber);
      return order ?? null;
    }

    throw new Error('API not implemented');
  }

  /**
   * Obtiene los contadores por estado
   * @returns Promesa con contadores por estado
   */
  async getStatusCounts(): Promise<Record<OrderStatus, number>> {
    await simulateDelay(100);

    if (this.config.useMock) {
      return getOrderStatusCounts(this.orders);
    }

    throw new Error('API not implemented');
  }

  // ============================================
  // MÉTODOS DE ESCRITURA (CREATE/UPDATE/DELETE)
  // ============================================

  /**
   * Crea una nueva orden con auto-asignación de workflow
   * @param data - Datos para crear la orden
   * @returns Promesa con la orden creada
   */
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    await simulateDelay(500);

    if (this.config.useMock) {
      // =============================================
      // CONEXIÓN CON WORKFLOWS (AUTO-ASIGNACIÓN)
      // =============================================
      const { enrichedData, workflowAssignment, validationWarnings } = 
        await moduleConnectorService.prepareOrderWithConnections(data);
      
      // Log de conexión para debugging
      if (workflowAssignment.success) {
        console.info('[OrderService] Workflow asignado:', {
          workflowId: workflowAssignment.workflowId,
          workflowName: workflowAssignment.workflowName,
          reason: workflowAssignment.reason,
        });
      }
      if (validationWarnings.length > 0) {
        console.info('[OrderService] Advertencias:', validationWarnings);
      }
      // =============================================

      const id = generateOrderId();
      const orderNumber = generateOrderNumber(this.orders.length + 1);
      const now = new Date().toISOString();

      const newOrder: Order = {
        id,
        orderNumber,
        customerId: enrichedData.customerId,
        carrierId: enrichedData.carrierId,
        vehicleId: enrichedData.vehicleId,
        driverId: enrichedData.driverId,
        workflowId: enrichedData.workflowId, // ← Workflow conectado
        workflowName: workflowAssignment.workflowName || undefined, // ← Nombre del workflow
        status: 'draft',
        priority: enrichedData.priority,
        syncStatus: 'not_sent',
        cargo: enrichedData.cargo,
        milestones: enrichedData.milestones.map((m, index) => ({
          ...m,
          id: `${id}-ms-${index + 1}`,
          orderId: id,
          status: 'pending' as const,
        })),
        completionPercentage: 0,
        createdAt: now,
        createdBy: 'current-user', // TODO: obtener de contexto de auth
        updatedAt: now,
        scheduledStartDate: enrichedData.scheduledStartDate,
        scheduledEndDate: enrichedData.scheduledEndDate,
        statusHistory: [
          {
            id: `${id}-hist-1`,
            fromStatus: 'draft',
            toStatus: 'draft',
            changedAt: now,
            changedBy: 'current-user',
            changedByName: 'Usuario Actual',
            reason: 'Orden creada',
          },
        ],
        externalReference: enrichedData.externalReference,
        notes: enrichedData.notes,
        tags: enrichedData.tags,
      };

      this.orders.unshift(newOrder);
      this.emitEvent('status_change', newOrder);
      
      return newOrder;
    }

    throw new Error('API not implemented');
  }

  /**
   * Actualiza una orden existente
   * @param id - ID de la orden
   * @param data - Datos a actualizar
   * @returns Promesa con la orden actualizada
   */
  async updateOrder(id: string, data: UpdateOrderDTO): Promise<Order> {
    await simulateDelay(400);

    if (this.config.useMock) {
      const index = this.orders.findIndex(o => o.id === id);
      if (index === -1) {
        throw new Error(`Order ${id} not found`);
      }

      const currentOrder = this.orders[index];
      const now = new Date().toISOString();

      // Si hay cambio de estado, agregar al historial
      let statusHistory = currentOrder.statusHistory;
      if (data.status && data.status !== currentOrder.status) {
        statusHistory = [
          ...statusHistory,
          {
            id: `${id}-hist-${statusHistory.length + 1}`,
            fromStatus: currentOrder.status,
            toStatus: data.status,
            changedAt: now,
            changedBy: 'current-user',
            changedByName: 'Usuario Actual',
          },
        ];
      }

      const updatedOrder: Order = {
        ...currentOrder,
        ...data,
        updatedAt: now,
        statusHistory,
        milestones: data.milestones
          ? data.milestones.map((m, i) => ({
              ...m,
              id: `${id}-ms-${i + 1}`,
              orderId: id,
              status: 'pending' as const,
            })) as OrderMilestone[]
          : currentOrder.milestones,
      };

      this.orders[index] = updatedOrder;
      
      if (data.status && data.status !== currentOrder.status) {
        this.emitEvent('status_change', updatedOrder);
      }

      return updatedOrder;
    }

    throw new Error('API not implemented');
  }

  /**
   * Elimina una orden (solo si está en borrador)
   * @param id - ID de la orden
   * @returns Promesa que indica éxito
   */
  async deleteOrder(id: string): Promise<boolean> {
    await simulateDelay(300);

    if (this.config.useMock) {
      const index = this.orders.findIndex(o => o.id === id);
      if (index === -1) {
        throw new Error(`Order ${id} not found`);
      }

      const order = this.orders[index];
      if (order.status !== 'draft') {
        throw new Error('Only draft orders can be deleted');
      }

      this.orders.splice(index, 1);
      return true;
    }

    throw new Error('API not implemented');
  }

  // ============================================
  // MÉTODOS DE ESTADO Y WORKFLOW
  // ============================================

  /**
   * Cambia el estado de una orden
   * @param id - ID de la orden
   * @param newStatus - Nuevo estado
   * @param reason - Motivo del cambio (opcional)
   * @returns Promesa con la orden actualizada
   */
  async changeStatus(
    id: string,
    newStatus: OrderStatus,
    _reason?: string
  ): Promise<Order> {
    return this.updateOrder(id, { status: newStatus });
  }

  /**
   * Asigna vehículo y conductor a una orden
   * @param id - ID de la orden
   * @param vehicleId - ID del vehículo
   * @param driverId - ID del conductor
   * @returns Promesa con la orden actualizada
   */
  async assignVehicleAndDriver(
    id: string,
    vehicleId: string,
    driverId: string
  ): Promise<Order> {
    await simulateDelay(400);

    if (this.config.useMock) {
      const order = await this.getOrderById(id);
      if (!order) {
        throw new Error(`Order ${id} not found`);
      }

      if (order.status !== 'pending' && order.status !== 'draft') {
        throw new Error('Can only assign vehicle/driver to pending or draft orders');
      }

      return this.updateOrder(id, {
        vehicleId,
        driverId,
        status: 'assigned',
      });
    }

    throw new Error('API not implemented');
  }

  /**
   * Inicia el viaje de una orden
   * @param id - ID de la orden
   * @returns Promesa con la orden actualizada
   */
  async startTrip(id: string): Promise<Order> {
    await simulateDelay(300);

    if (this.config.useMock) {
      const order = await this.getOrderById(id);
      if (!order) {
        throw new Error(`Order ${id} not found`);
      }

      if (order.status !== 'assigned') {
        throw new Error('Can only start trip for assigned orders');
      }

      if (!order.vehicleId || !order.driverId) {
        throw new Error('Vehicle and driver must be assigned before starting trip');
      }

      return this.updateOrder(id, {
        status: 'in_transit',
      });
    }

    throw new Error('API not implemented');
  }

  // ============================================
  // MÉTODOS DE CIERRE DE ORDEN
  // ============================================

  /**
   * Verifica si una orden puede ser cerrada
   * @param id - ID de la orden
   * @returns Objeto con estado y razón
   */
  async canCloseOrder(id: string): Promise<{ canClose: boolean; reason?: string }> {
    await simulateDelay(100);

    const order = await this.getOrderById(id);
    if (!order) {
      return { canClose: false, reason: 'Orden no encontrada' };
    }

    if (order.status === 'closed') {
      return { canClose: false, reason: 'La orden ya está cerrada' };
    }

    if (order.status !== 'completed') {
      return { canClose: false, reason: 'La orden debe estar completada antes de cerrar' };
    }

    // Verificar que todos los hitos estén completados o saltados
    const pendingMilestones = order.milestones.filter(
      m => m.status !== 'completed' && m.status !== 'skipped'
    );

    if (pendingMilestones.length > 0) {
      return {
        canClose: false,
        reason: `Hay ${pendingMilestones.length} hito(s) pendiente(s)`,
      };
    }

    return { canClose: true };
  }

  /**
   * Cierra una orden manualmente
   * @param id - ID de la orden
   * @param closureData - Datos de cierre
   * @returns Promesa con la orden cerrada
   * @throws Error si la orden no puede ser cerrada
   */
  async closeOrder(id: string, closureData: Omit<OrderClosureData, 'closedAt'>): Promise<Order> {
    await simulateDelay(500);

    const canClose = await this.canCloseOrder(id);
    if (!canClose.canClose) {
      throw new Error(canClose.reason);
    }

    if (this.config.useMock) {
      const index = this.orders.findIndex(o => o.id === id);
      const now = new Date().toISOString();

      const closedOrder: Order = {
        ...this.orders[index],
        status: 'closed',
        actualEndDate: now,
        closureData: {
          ...closureData,
          closedAt: now,
        },
        updatedAt: now,
        statusHistory: [
          ...this.orders[index].statusHistory,
          {
            id: `${id}-hist-close`,
            fromStatus: this.orders[index].status,
            toStatus: 'closed',
            changedAt: now,
            changedBy: closureData.closedBy,
            changedByName: closureData.closedByName,
            reason: 'Cierre manual de orden',
          },
        ],
      };

      this.orders[index] = closedOrder;
      this.emitEvent('status_change', closedOrder);

      return closedOrder;
    }

    throw new Error('API not implemented');
  }

  // ============================================
  // MÉTODOS DE HITOS/MILESTONES
  // ============================================

  /**
   * Actualiza un hito de la orden
   * @param orderId - ID de la orden
   * @param milestoneId - ID del hito
   * @param data - Datos a actualizar
   * @returns Promesa con la orden actualizada
   */
  async updateMilestone(
    orderId: string,
    milestoneId: string,
    data: Partial<OrderMilestone>
  ): Promise<Order> {
    await simulateDelay(300);

    if (this.config.useMock) {
      const orderIndex = this.orders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) {
        throw new Error(`Order ${orderId} not found`);
      }

      const order = this.orders[orderIndex];
      const milestoneIndex = order.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIndex === -1) {
        throw new Error(`Milestone ${milestoneId} not found`);
      }

      const updatedMilestones = [...order.milestones];
      updatedMilestones[milestoneIndex] = {
        ...updatedMilestones[milestoneIndex],
        ...data,
      };

      // Recalcular porcentaje de cumplimiento
      const completedCount = updatedMilestones.filter(
        m => m.status === 'completed'
      ).length;
      const completionPercentage = Math.round(
        (completedCount / updatedMilestones.length) * 100
      );

      // Determinar nuevo estado de la orden basado en hitos
      let newStatus = order.status;
      const allCompleted = updatedMilestones.every(
        m => m.status === 'completed' || m.status === 'skipped'
      );
      const hasDelayed = updatedMilestones.some(m => m.status === 'delayed');
      const hasInProgress = updatedMilestones.some(m => m.status === 'in_progress');

      if (allCompleted && order.status !== 'closed') {
        newStatus = 'completed';
      } else if (hasDelayed) {
        newStatus = 'delayed';
      } else if (hasInProgress) {
        newStatus = 'at_milestone';
      }

      const updatedOrder: Order = {
        ...order,
        milestones: updatedMilestones,
        completionPercentage,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      this.orders[orderIndex] = updatedOrder;
      this.emitEvent('milestone_update', updatedOrder);

      return updatedOrder;
    }

    throw new Error('API not implemented');
  }

  /**
   * Registra entrada a un hito (geocerca)
   * @param orderId - ID de la orden
   * @param milestoneId - ID del hito
   * @returns Promesa con la orden actualizada
   */
  async enterMilestone(orderId: string, milestoneId: string): Promise<Order> {
    const now = new Date().toISOString();
    return this.updateMilestone(orderId, milestoneId, {
      status: 'in_progress',
      actualEntry: now,
    });
  }

  /**
   * Registra salida de un hito (geocerca)
   * @param orderId - ID de la orden
   * @param milestoneId - ID del hito
   * @returns Promesa con la orden actualizada
   */
  async exitMilestone(orderId: string, milestoneId: string): Promise<Order> {
    const now = new Date().toISOString();
    return this.updateMilestone(orderId, milestoneId, {
      status: 'completed',
      actualExit: now,
    });
  }

  // ============================================
  // MÉTODOS DE SINCRONIZACIÓN EXTERNA
  // ============================================

  /**
   * Envía una orden a sistema externo
   * @param id - ID de la orden
   * @returns Promesa con la orden actualizada
   */
  async sendToExternal(id: string): Promise<Order> {
    await simulateDelay(1000);

    if (this.config.useMock) {
      const index = this.orders.findIndex(o => o.id === id);
      if (index === -1) {
        throw new Error(`Order ${id} not found`);
      }

      // Simular éxito/error aleatorio (90% éxito)
      const success = Math.random() > 0.1;

      const updatedOrder: Order = {
        ...this.orders[index],
        syncStatus: success ? 'sent' : 'error',
        syncErrorMessage: success ? undefined : 'Error de conexión con sistema externo',
        lastSyncAttempt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.orders[index] = updatedOrder;
      this.emitEvent('sync_update', updatedOrder);

      return updatedOrder;
    }

    throw new Error('API not implemented');
  }

  /**
   * Envía múltiples órdenes a sistema externo
   * @param payload - Datos del envío masivo
   * @returns Promesa con resultado del envío
   */
  async bulkSendToExternal(payload: BulkSendPayload): Promise<BulkSendResult> {
    await simulateDelay(500);

    if (this.config.useMock) {
      const batchId = `batch-${Date.now()}`;
      const results: BulkSendResult['results'] = [];

      // Simular procesamiento
      for (const orderId of payload.orderIds) {
        await simulateDelay(200);
        const success = Math.random() > 0.15; // 85% éxito
        
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          this.orders[orderIndex] = {
            ...this.orders[orderIndex],
            syncStatus: success ? 'sent' : 'error',
            syncErrorMessage: success ? undefined : 'Error en envío masivo',
            lastSyncAttempt: new Date().toISOString(),
          };
        }

        results.push({
          orderId,
          status: success ? 'success' : 'error',
          message: success ? undefined : 'Error de conexión',
        });
      }

      return {
        batchId,
        totalOrders: payload.orderIds.length,
        status: 'completed',
        progress: 100,
        results,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    }

    throw new Error('API not implemented');
  }

  // ============================================
  // MÉTODOS DE DATOS AUXILIARES
  // ============================================

  /**
   * Obtiene lista de clientes para filtros
   * @returns Promesa con lista de clientes
   */
  async getCustomers(): Promise<Array<{ id: string; name: string; code: string }>> {
    await simulateDelay(100);
    return getOrderCustomers();
  }

  /**
   * Obtiene lista de transportistas para filtros
   * @returns Promesa con lista de transportistas
   */
  async getCarriers(): Promise<Array<{ id: string; name: string }>> {
    await simulateDelay(100);
    return getOrderCarriers();
  }

  /**
   * Obtiene lista de operadores GPS para filtros
   * @returns Promesa con lista de operadores GPS
   */
  async getGPSOperators(): Promise<Array<{ id: string; name: string }>> {
    await simulateDelay(100);
    return getOrderGPSOperators();
  }

  // ============================================
  // MÉTODOS DE EVENTOS EN TIEMPO REAL
  // ============================================

  /**
   * Suscribe a eventos de una orden
   * @param orderId - ID de la orden (o '*' para todas)
   * @param callback - Función a ejecutar cuando hay evento
   * @returns Función para cancelar suscripción
   */
  subscribe(
    orderId: string,
    callback: (event: OrderRealtimeEvent) => void
  ): () => void {
    if (!this.eventListeners.has(orderId)) {
      this.eventListeners.set(orderId, new Set());
    }
    
    this.eventListeners.get(orderId)!.add(callback);

    return () => {
      this.eventListeners.get(orderId)?.delete(callback);
    };
  }

  /**
   * Emite un evento a los suscriptores
   * @param type - Tipo de evento
   * @param order - Orden afectada
   */
  private emitEvent(type: OrderRealtimeEvent['type'], order: Order): void {
    const event: OrderRealtimeEvent = {
      type,
      orderId: order.id,
      payload: {
        current: order,
      },
      timestamp: new Date().toISOString(),
    };

    // Notificar a suscriptores específicos
    this.eventListeners.get(order.id)?.forEach(cb => cb(event));
    
    // Notificar a suscriptores globales
    this.eventListeners.get('*')?.forEach(cb => cb(event));
  }
}

/**
 * Instancia singleton del servicio de órdenes
 */
export const orderService = new OrderService();

/**
 * Exporta la clase para testing o instancias personalizadas
 */
export { OrderService };

/**
 * Tipo del servicio para inyección de dependencias
 */
export type IOrderService = InstanceType<typeof OrderService>;
