/**
 * @fileoverview Tipos e interfaces para el módulo de Órdenes
 * @module types/order
 * @description Define todas las estructuras de datos relacionadas con órdenes,
 * incluyendo estados, hitos, filtros y datos de cierre.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import type { Customer } from './customer';
import type { Driver } from './driver';
import type { Vehicle } from './vehicle';

/**
 * Estados posibles de una orden en el sistema
 * @enum {string}
 */
export type OrderStatus =
  | 'draft'           // Borrador - orden creada pero no confirmada
  | 'pending'         // Pendiente - esperando asignación
  | 'assigned'        // Asignada - vehículo y conductor asignados
  | 'in_transit'      // En tránsito - viaje iniciado
  | 'at_milestone'    // En hito - vehículo en una geocerca
  | 'delayed'         // Retrasada - fuera de tiempo estimado
  | 'completed'       // Completada - todos los hitos cumplidos
  | 'closed'          // Cerrada - cierre manual realizado
  | 'cancelled';      // Cancelada - orden anulada

/**
 * Estados de envío a sistemas externos
 * @enum {string}
 */
export type OrderSyncStatus =
  | 'not_sent'        // No enviada
  | 'pending'         // Pendiente de envío
  | 'sending'         // Enviando
  | 'sent'            // Enviada exitosamente
  | 'error'           // Error en el envío
  | 'retry';          // Reintentando

/**
 * Estados de un hito/milestone
 * @enum {string}
 */
export type MilestoneStatus =
  | 'pending'         // Pendiente - aún no alcanzado
  | 'approaching'     // Aproximándose - cerca de la geocerca
  | 'arrived'         // Llegó - entrada a geocerca
  | 'in_progress'     // En progreso - dentro de la geocerca
  | 'completed'       // Completado - salió de la geocerca
  | 'skipped'         // Saltado - no se visitó
  | 'delayed';        // Retrasado - llegó tarde

/**
 * Prioridades de una orden
 * @enum {string}
 */
export type OrderPriority =
  | 'low'             // Baja
  | 'normal'          // Normal
  | 'high'            // Alta
  | 'urgent';         // Urgente

/**
 * Tipos de carga
 * @enum {string}
 */
export type CargoType =
  | 'general'         // Carga general
  | 'refrigerated'    // Refrigerada
  | 'hazardous'       // Peligrosa
  | 'fragile'         // Frágil
  | 'oversized'       // Sobredimensionada
  | 'liquid'          // Líquidos
  | 'bulk';           // Granel

/**
 * Representa un hito/punto de control en la ruta de una orden
 * @interface OrderMilestone
 */
export interface OrderMilestone {
  /** Identificador único del hito */
  id: string;
  /** ID de la orden a la que pertenece */
  orderId: string;
  /** ID de la geocerca asociada */
  geofenceId: string;
  /** Nombre de la geocerca/hito */
  geofenceName: string;
  /** Tipo de hito */
  type: 'origin' | 'waypoint' | 'destination';
  /** Orden de secuencia en la ruta */
  sequence: number;
  /** Dirección del hito */
  address: string;
  /** Coordenadas geográficas */
  coordinates: {
    lat: number;
    lng: number;
  };
  /** Hora estimada de llegada */
  estimatedArrival: string;
  /** Hora estimada de salida */
  estimatedDeparture?: string;
  /** Hora real de entrada a la geocerca */
  actualEntry?: string;
  /** Hora real de salida de la geocerca */
  actualExit?: string;
  /** Estado actual del hito */
  status: MilestoneStatus;
  /** Diferencia en minutos respecto a lo estimado (+ = retraso, - = adelanto) */
  delayMinutes?: number;
  /** Notas o instrucciones específicas del hito */
  notes?: string;
  /** Contacto en el punto */
  contact?: {
    name: string;
    phone: string;
    email?: string;
  };
}

/**
 * Información de la carga transportada
 * @interface OrderCargo
 */
export interface OrderCargo {
  /** Descripción de la carga */
  description: string;
  /** Tipo de carga */
  type: CargoType;
  /** Peso en kilogramos */
  weightKg: number;
  /** Volumen en metros cúbicos */
  volumeM3?: number;
  /** Cantidad de unidades/bultos */
  quantity: number;
  /** Valor declarado en USD */
  declaredValue?: number;
  /** Requiere temperatura controlada */
  temperatureControlled?: boolean;
  /** Rango de temperatura si aplica */
  temperatureRange?: {
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
  };
  /** Instrucciones especiales de manejo */
  handlingInstructions?: string;
}

/**
 * Datos para el cierre de una orden
 * @interface OrderClosureData
 */
export interface OrderClosureData {
  /** Observaciones generales del viaje */
  observations: string;
  /** Lista de incidencias ocurridas */
  incidents: OrderIncidentRecord[];
  /** Motivos de desviación si los hubo */
  deviationReasons: DeviationReason[];
  /** ID del usuario que cerró la orden */
  closedBy: string;
  /** Nombre del usuario que cerró */
  closedByName: string;
  /** Fecha y hora del cierre */
  closedAt: string;
  /** Firma digital o confirmación */
  signature?: string;
  /** Documentos adjuntos al cierre */
  attachments?: OrderAttachment[];
}

/**
 * Registro de una incidencia en la orden
 * @interface OrderIncidentRecord
 */
export interface OrderIncidentRecord {
  /** ID único del registro */
  id: string;
  /** ID del catálogo de incidencias (si aplica) */
  incidentCatalogId?: string;
  /** Nombre de la incidencia del catálogo */
  incidentName?: string;
  /** Descripción libre de la incidencia */
  freeDescription?: string;
  /** Severidad de la incidencia */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Fecha y hora de ocurrencia */
  occurredAt: string;
  /** Hito donde ocurrió (opcional) */
  milestoneId?: string;
  /** Acción tomada */
  actionTaken?: string;
  /** Evidencias adjuntas */
  evidence?: OrderAttachment[];
}

/**
 * Motivo de desviación de la ruta o tiempo
 * @interface DeviationReason
 */
export interface DeviationReason {
  /** ID único */
  id: string;
  /** Tipo de desviación */
  type: 'route' | 'time' | 'cargo' | 'other';
  /** Descripción del motivo */
  description: string;
  /** Impacto en minutos o kilómetros */
  impact?: {
    value: number;
    unit: 'minutes' | 'hours' | 'kilometers';
  };
  /** Documentación de respaldo */
  documentation?: string;
}

/**
 * Archivo adjunto a una orden
 * @interface OrderAttachment
 */
export interface OrderAttachment {
  /** ID único */
  id: string;
  /** Nombre del archivo */
  fileName: string;
  /** Tipo MIME */
  mimeType: string;
  /** Tamaño en bytes */
  sizeBytes: number;
  /** URL de acceso */
  url: string;
  /** Fecha de subida */
  uploadedAt: string;
  /** Usuario que subió */
  uploadedBy: string;
  /** Categoría del documento */
  category?: 'pod' | 'invoice' | 'photo' | 'document' | 'other';
}

/**
 * Historial de cambios de estado de la orden
 * @interface OrderStatusHistory
 */
export interface OrderStatusHistory {
  /** ID único del registro */
  id: string;
  /** Estado anterior */
  fromStatus: OrderStatus;
  /** Estado nuevo */
  toStatus: OrderStatus;
  /** Fecha del cambio */
  changedAt: string;
  /** Usuario que realizó el cambio */
  changedBy: string;
  /** Nombre del usuario */
  changedByName: string;
  /** Motivo del cambio (opcional) */
  reason?: string;
}

/**
 * Representa una orden de transporte completa
 * @interface Order
 */
export interface Order {
  /** Identificador único de la orden */
  id: string;
  /** Número de orden (visible al usuario) */
  orderNumber: string;
  /** ID del cliente */
  customerId: string;
  /** Datos del cliente (populated) */
  customer?: Pick<Customer, 'id' | 'name' | 'code' | 'email'>;
  /** ID del transportista asignado */
  carrierId?: string;
  /** Nombre del transportista */
  carrierName?: string;
  /** ID del vehículo asignado */
  vehicleId?: string;
  /** Datos del vehículo (populated) */
  vehicle?: Pick<Vehicle, 'id' | 'plate' | 'brand' | 'model' | 'type'>;
  /** ID del conductor asignado */
  driverId?: string;
  /** Datos del conductor (populated) */
  driver?: Pick<Driver, 'id' | 'fullName' | 'phone'>;
  /** ID del operador GPS */
  gpsOperatorId?: string;
  /** Nombre del operador GPS */
  gpsOperatorName?: string;
  /** ID del workflow asignado */
  workflowId?: string;
  /** Nombre del workflow */
  workflowName?: string;
  /** Estado actual de la orden */
  status: OrderStatus;
  /** Prioridad de la orden */
  priority: OrderPriority;
  /** Estado de sincronización externa */
  syncStatus: OrderSyncStatus;
  /** Mensaje de error de sincronización */
  syncErrorMessage?: string;
  /** Último intento de sincronización */
  lastSyncAttempt?: string;
  /** Información de la carga */
  cargo: OrderCargo;
  /** Lista de hitos/puntos de control */
  milestones: OrderMilestone[];
  /** Porcentaje de cumplimiento del viaje */
  completionPercentage: number;
  /** Fecha de creación */
  createdAt: string;
  /** Usuario que creó la orden */
  createdBy: string;
  /** Fecha de última actualización */
  updatedAt: string;
  /** Fecha programada de inicio */
  scheduledStartDate: string;
  /** Fecha programada de finalización */
  scheduledEndDate: string;
  /** Fecha real de inicio */
  actualStartDate?: string;
  /** Fecha real de finalización */
  actualEndDate?: string;
  /** Datos del cierre (solo si está cerrada) */
  closureData?: OrderClosureData;
  /** Historial de estados */
  statusHistory: OrderStatusHistory[];
  /** Referencia externa (del sistema del cliente) */
  externalReference?: string;
  /** Notas generales */
  notes?: string;
  /** Etiquetas para clasificación */
  tags?: string[];
  /** Metadatos adicionales */
  metadata?: Record<string, unknown>;
}

/**
 * Datos para crear una nueva orden
 * @interface CreateOrderDTO
 */
export interface CreateOrderDTO {
  customerId: string;
  carrierId?: string;
  vehicleId?: string;
  driverId?: string;
  workflowId?: string;
  priority: OrderPriority;
  cargo: OrderCargo;
  milestones: Omit<OrderMilestone, 'id' | 'orderId' | 'status' | 'actualEntry' | 'actualExit' | 'delayMinutes'>[];
  scheduledStartDate: string;
  scheduledEndDate: string;
  externalReference?: string;
  notes?: string;
  tags?: string[];
}

/**
 * Datos para actualizar una orden existente
 * @interface UpdateOrderDTO
 */
export interface UpdateOrderDTO extends Partial<CreateOrderDTO> {
  status?: OrderStatus;
}

/**
 * Filtros para búsqueda de órdenes
 * @interface OrderFilters
 */
export interface OrderFilters {
  /** Búsqueda por número de orden */
  search?: string;
  /** Filtrar por cliente */
  customerId?: string;
  /** Filtrar por transportista */
  carrierId?: string;
  /** Filtrar por operador GPS */
  gpsOperatorId?: string;
  /** Filtrar por estado */
  status?: OrderStatus | OrderStatus[];
  /** Filtrar por prioridad */
  priority?: OrderPriority | OrderPriority[];
  /** Filtrar por estado de sincronización */
  syncStatus?: OrderSyncStatus;
  /** Fecha de inicio del rango */
  dateFrom?: string;
  /** Fecha de fin del rango */
  dateTo?: string;
  /** Filtrar por etiquetas */
  tags?: string[];
  /** Ordenar por campo */
  sortBy?: keyof Order;
  /** Dirección del ordenamiento */
  sortOrder?: 'asc' | 'desc';
  /** Página actual (paginación) */
  page?: number;
  /** Elementos por página */
  pageSize?: number;
}

/**
 * Resultado paginado de órdenes
 * @interface OrdersResponse
 */
export interface OrdersResponse {
  /** Lista de órdenes */
  data: Order[];
  /** Total de registros */
  total: number;
  /** Página actual */
  page: number;
  /** Tamaño de página */
  pageSize: number;
  /** Total de páginas */
  totalPages: number;
  /** Contadores por estado */
  statusCounts: Record<OrderStatus, number>;
}

/**
 * Datos para importación masiva desde Excel
 * @interface OrderImportRow
 */
export interface OrderImportRow {
  /** Número de fila en el Excel */
  rowNumber: number;
  /** Datos parseados */
  data: Partial<CreateOrderDTO>;
  /** Errores de validación */
  errors: string[];
  /** Advertencias */
  warnings: string[];
  /** Estado de la fila */
  status: 'valid' | 'invalid' | 'warning';
}

/**
 * Resultado de importación masiva
 * @interface OrderImportResult
 */
export interface OrderImportResult {
  /** Total de filas procesadas */
  totalRows: number;
  /** Filas válidas */
  validRows: number;
  /** Filas con errores */
  errorRows: number;
  /** Filas con advertencias */
  warningRows: number;
  /** Detalle por fila */
  rows: OrderImportRow[];
  /** Órdenes creadas exitosamente */
  createdOrders?: Order[];
}

/**
 * Datos para exportación a Excel
 * @interface OrderExportOptions
 */
export interface OrderExportOptions {
  /** Filtros a aplicar */
  filters: OrderFilters;
  /** IDs específicos a exportar (si no se usan filtros) */
  orderIds?: string[];
  /** Incluir hitos detallados */
  includeMilestones: boolean;
  /** Incluir historial de estados */
  includeStatusHistory: boolean;
  /** Incluir datos de cierre */
  includeClosureData: boolean;
  /** Formato de fechas */
  dateFormat?: string;
  /** Zona horaria */
  timezone?: string;
}

/**
 * Payload para envío masivo a sistemas externos
 * @interface BulkSendPayload
 */
export interface BulkSendPayload {
  /** IDs de órdenes a enviar */
  orderIds: string[];
  /** Sistema destino */
  targetSystem: string;
  /** Forzar reenvío aunque ya se haya enviado */
  forceResend?: boolean;
  /** Callback URL para notificaciones */
  callbackUrl?: string;
}

/**
 * Resultado de envío masivo
 * @interface BulkSendResult
 */
export interface BulkSendResult {
  /** ID del batch job */
  batchId: string;
  /** Total de órdenes en el batch */
  totalOrders: number;
  /** Estado del batch */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  /** Progreso (0-100) */
  progress: number;
  /** Resultados por orden */
  results: Array<{
    orderId: string;
    status: 'success' | 'error';
    message?: string;
  }>;
  /** Fecha de inicio */
  startedAt: string;
  /** Fecha de finalización */
  completedAt?: string;
}

/**
 * Evento de actualización en tiempo real
 * @interface OrderRealtimeEvent
 */
export interface OrderRealtimeEvent {
  /** Tipo de evento */
  type: 'status_change' | 'milestone_update' | 'location_update' | 'sync_update';
  /** ID de la orden afectada */
  orderId: string;
  /** Datos del evento */
  payload: {
    /** Datos anteriores */
    previous?: Partial<Order>;
    /** Datos actuales */
    current: Partial<Order>;
  };
  /** Timestamp del evento */
  timestamp: string;
}
