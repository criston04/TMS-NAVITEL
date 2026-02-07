/**
 * @fileoverview Tipos e interfaces para el módulo de Monitoreo
 * @module types/monitoring
 * @description Define todas las estructuras de datos para Retransmisión,
 * Torre de Control, Multiventana y Rastreo Histórico.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

// Vehicle, Order, and OrderMilestone types are used for documentation purposes
import type { Vehicle as _Vehicle } from "./models/vehicle";
import type { Order as _Order, OrderMilestone as _OrderMilestone } from "./order";

// ============================================================================
// TIPOS BASE
// ============================================================================

/**
 * Estado de movimiento del vehículo
 * @enum {string}
 */
export type MovementStatus = "moving" | "stopped";

/**
 * Estado de retransmisión GPS
 * @enum {string}
 */
export type RetransmissionStatus = "online" | "temporary_loss" | "disconnected";

/**
 * Estado de actividad de una orden
 * @enum {string}
 */
export type OrderActivityStatus = "active" | "inactive";

/**
 * Estado de seguimiento de un hito
 * @enum {string}
 */
export type MilestoneTrackingStatus = "completed" | "in_progress" | "pending";

/**
 * Velocidades de reproducción disponibles
 * @enum {number}
 */
export type PlaybackSpeed = 1 | 2 | 4 | 8 | 16 | 32;

// ============================================================================
// INTERFACES DE RETRANSMISIÓN
// ============================================================================

/**
 * Empresa proveedora de GPS
 * @interface GpsCompany
 */
export interface GpsCompany {
  /** Identificador único */
  id: string;
  /** Nombre de la empresa */
  name: string;
  /** Código corto de identificación */
  code: string;
  /** Email de contacto */
  contactEmail: string;
  /** Teléfono de contacto */
  contactPhone?: string;
  /** Si está activa */
  isActive: boolean;
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de actualización */
  updatedAt: string;
}

/**
 * Registro de retransmisión de un vehículo
 * @interface RetransmissionRecord
 */
export interface RetransmissionRecord {
  /** Identificador único del registro */
  id: string;
  /** ID del vehículo */
  vehicleId: string;
  /** Placa del vehículo */
  vehiclePlate: string;
  /** Nombre de la empresa/operador logístico */
  companyName: string;
  /** ID de la empresa GPS */
  gpsCompanyId: string;
  /** Nombre de la empresa GPS */
  gpsCompanyName: string;
  /** Última conexión registrada */
  lastConnection: string;
  /** Estado de movimiento */
  movementStatus: MovementStatus;
  /** Estado de retransmisión */
  retransmissionStatus: RetransmissionStatus;
  /** Duración sin conexión en segundos */
  disconnectedDuration: number;
  /** Comentarios del operador */
  comments?: string;
  /** Última ubicación conocida */
  lastLocation?: {
    lat: number;
    lng: number;
  };
  /** Velocidad actual en km/h */
  speed?: number;
  /** Fecha de creación del registro */
  createdAt: string;
  /** Fecha de actualización */
  updatedAt: string;
}

/**
 * Filtros para la tabla de retransmisión
 * @interface RetransmissionFilters
 */
export interface RetransmissionFilters {
  /** Búsqueda por placa de vehículo */
  vehicleSearch?: string;
  /** Filtrar por empresa/operador */
  companyId?: string;
  /** Filtrar por estado de movimiento */
  movementStatus?: MovementStatus | "all";
  /** Filtrar por estado de retransmisión */
  retransmissionStatus?: RetransmissionStatus | "all";
  /** Filtrar por empresa GPS */
  gpsCompanyId?: string;
  /** Fecha mínima de última conexión */
  lastConnectionFrom?: string;
  /** Fecha máxima de última conexión */
  lastConnectionTo?: string;
  /** Filtrar solo con comentarios */
  hasComments?: boolean;
}

/**
 * Estadísticas de retransmisión
 * @interface RetransmissionStats
 */
export interface RetransmissionStats {
  /** Total de vehículos monitoreados */
  total: number;
  /** Cantidad en línea */
  online: number;
  /** Cantidad con pérdida temporal */
  temporaryLoss: number;
  /** Cantidad desconectados */
  disconnected: number;
  /** Porcentaje en línea */
  onlinePercentage: number;
  /** Porcentaje con pérdida temporal */
  temporaryLossPercentage: number;
  /** Porcentaje desconectados */
  disconnectedPercentage: number;
}

// ============================================================================
// INTERFACES DE TORRE DE CONTROL
// ============================================================================

/**
 * Posición geográfica de un vehículo
 * @interface VehiclePosition
 */
export interface VehiclePosition {
  /** Latitud */
  lat: number;
  /** Longitud */
  lng: number;
  /** Velocidad en km/h */
  speed: number;
  /** Dirección en grados (0-360) */
  heading: number;
  /** Timestamp de la posición */
  timestamp: string;
  /** Precisión GPS en metros */
  accuracy?: number;
  /** Altitud en metros */
  altitude?: number;
}

/**
 * Vehículo con posición en tiempo real
 * @interface TrackedVehicle
 */
export interface TrackedVehicle {
  /** Identificador único del vehículo */
  id: string;
  /** Placa del vehículo */
  plate: string;
  /** Número económico */
  economicNumber?: string;
  /** Tipo de vehículo */
  type: string;
  /** Posición actual */
  position: VehiclePosition;
  /** Estado de movimiento */
  movementStatus: MovementStatus;
  /** Estado de conexión */
  connectionStatus: RetransmissionStatus;
  /** ID del conductor asignado */
  driverId?: string;
  /** Nombre del conductor */
  driverName?: string;
  /** ID de la orden activa */
  activeOrderId?: string;
  /** Número de la orden activa */
  activeOrderNumber?: string;
  /** Empresa/operador logístico */
  companyName?: string;
  /** Última actualización */
  lastUpdate: string;
}

/**
 * Hito con estado de seguimiento
 * @interface TrackedMilestone
 */
export interface TrackedMilestone {
  /** ID del hito */
  id: string;
  /** Nombre del hito/geocerca */
  name: string;
  /** Tipo de hito */
  type: "origin" | "waypoint" | "destination";
  /** Secuencia en la ruta */
  sequence: number;
  /** Coordenadas */
  coordinates: {
    lat: number;
    lng: number;
  };
  /** Estado de tracking */
  trackingStatus: MilestoneTrackingStatus;
  /** Hora estimada de llegada */
  estimatedArrival?: string;
  /** Hora real de llegada */
  actualArrival?: string;
  /** Hora real de salida */
  actualDeparture?: string;
  /** Diferencia en minutos (+ = retraso) */
  delayMinutes?: number;
  /** Dirección */
  address?: string;
}

/**
 * Orden con información de tracking
 * @interface TrackedOrder
 */
export interface TrackedOrder {
  /** ID de la orden */
  id: string;
  /** Número de orden */
  orderNumber: string;
  /** ID del cliente */
  customerId: string;
  /** Nombre del cliente */
  customerName: string;
  /** Estado de la orden */
  status: string;
  /** Hitos de la orden */
  milestones: TrackedMilestone[];
  /** Índice del hito actual */
  currentMilestoneIndex: number;
  /** Progreso de la orden (0-100) */
  progress: number;
  /** Fecha de creación */
  createdAt: string;
}

/**
 * Filtros para Torre de Control
 * @interface ControlTowerFilters
 */
export interface ControlTowerFilters {
  /** Búsqueda por placa/unidad */
  unitSearch?: string;
  /** Filtrar por transportista/operador */
  carrierId?: string;
  /** Búsqueda por número de orden */
  orderNumber?: string;
  /** Filtrar por cliente */
  customerId?: string;
  /** Mostrar solo órdenes activas */
  activeOrdersOnly?: boolean;
  /** Filtrar por estado de conexión */
  connectionStatus?: RetransmissionStatus | "all";
}

// ============================================================================
// INTERFACES DE MULTIVENTANA
// ============================================================================

/**
 * Panel individual de vehículo en multiventana
 * @interface VehiclePanel
 */
export interface VehiclePanel {
  /** Identificador único del panel */
  id: string;
  /** ID del vehículo */
  vehicleId: string;
  /** Placa del vehículo */
  vehiclePlate: string;
  /** Posición en el grid */
  position: PanelPosition;
  /** Si el panel está activo/visible */
  isActive: boolean;
  /** Fecha de agregado */
  addedAt: string;
}

/**
 * Posición de un panel en el grid
 * @interface PanelPosition
 */
export interface PanelPosition {
  /** Fila (0-based) */
  row: number;
  /** Columna (0-based) */
  col: number;
}

/**
 * Configuración del grid de multiventana
 * @interface MultiWindowGridConfig
 */
export interface MultiWindowGridConfig {
  /** Número de columnas */
  columns: number;
  /** Número de filas */
  rows: number;
  /** Layout mode */
  layout: "2x2" | "3x3" | "4x4" | "5x4" | "auto";
  /** Máximo de paneles permitidos */
  maxPanels: number;
}

// ============================================================================
// INTERFACES DE RASTREO HISTÓRICO
// ============================================================================

/**
 * Punto individual de una ruta histórica
 * @interface HistoricalRoutePoint
 */
export interface HistoricalRoutePoint {
  /** Índice del punto */
  index: number;
  /** Latitud */
  lat: number;
  /** Longitud */
  lng: number;
  /** Velocidad en km/h */
  speed: number;
  /** Dirección en grados */
  heading: number;
  /** Timestamp del punto */
  timestamp: string;
  /** Altitud en metros */
  altitude?: number;
  /** Si el vehículo estaba detenido */
  isStopped: boolean;
  /** Duración de la parada en segundos (si aplica) */
  stopDuration?: number;
  /** Distancia acumulada desde el inicio en km */
  distanceFromStart: number;
  /** Evento especial (entrada/salida geocerca, etc.) */
  event?: HistoricalRouteEvent;
}

/**
 * Tipos de eventos en la ruta histórica
 * @interface HistoricalRouteEvent
 */
export interface HistoricalRouteEvent {
  /** Tipo de evento */
  type: "geofence_enter" | "geofence_exit" | "stop_start" | "stop_end" | "speed_alert" | "ignition_on" | "ignition_off";
  /** Descripción del evento */
  description: string;
  /** Datos adicionales */
  data?: Record<string, unknown>;
}

/**
 * Ruta histórica completa
 * @interface HistoricalRoute
 */
export interface HistoricalRoute {
  /** ID de la ruta */
  id: string;
  /** ID del vehículo */
  vehicleId: string;
  /** Placa del vehículo */
  vehiclePlate: string;
  /** Fecha de inicio */
  startDate: string;
  /** Fecha de fin */
  endDate: string;
  /** Puntos de la ruta */
  points: HistoricalRoutePoint[];
  /** Estadísticas calculadas */
  stats: HistoricalRouteStats;
  /** Fecha de generación del reporte */
  generatedAt: string;
}

/**
 * Estadísticas de una ruta histórica
 * @interface HistoricalRouteStats
 */
export interface HistoricalRouteStats {
  /** Distancia total en km */
  totalDistanceKm: number;
  /** Velocidad máxima alcanzada en km/h */
  maxSpeedKmh: number;
  /** Velocidad promedio en km/h */
  avgSpeedKmh: number;
  /** Tiempo total en movimiento en segundos */
  movingTimeSeconds: number;
  /** Tiempo total detenido en segundos */
  stoppedTimeSeconds: number;
  /** Tiempo total del recorrido en segundos */
  totalTimeSeconds: number;
  /** Cantidad total de puntos */
  totalPoints: number;
  /** Cantidad de paradas */
  totalStops: number;
  /** Coordenadas del punto inicial */
  startPoint: { lat: number; lng: number };
  /** Coordenadas del punto final */
  endPoint: { lat: number; lng: number };
}

/**
 * Parámetros para consulta de ruta histórica
 * @interface HistoricalRouteParams
 */
export interface HistoricalRouteParams {
  /** ID del vehículo */
  vehicleId: string;
  /** Fecha y hora de inicio */
  startDateTime: string;
  /** Fecha y hora de fin */
  endDateTime: string;
  /** Intervalo de muestreo en segundos (opcional) */
  sampleInterval?: number;
  /** Incluir eventos */
  includeEvents?: boolean;
}

/**
 * Estado de reproducción de ruta
 * @interface RoutePlaybackState
 */
export interface RoutePlaybackState {
  /** Si está reproduciendo */
  isPlaying: boolean;
  /** Si está pausado */
  isPaused: boolean;
  /** Índice del punto actual */
  currentIndex: number;
  /** Velocidad de reproducción */
  speed: PlaybackSpeed;
  /** Progreso (0-100) */
  progress: number;
  /** Punto actual */
  currentPoint: HistoricalRoutePoint | null;
}

// ============================================================================
// INTERFACES DE WEBSOCKET
// ============================================================================

/**
 * Mensaje de actualización de posición
 * @interface PositionUpdateMessage
 */
export interface PositionUpdateMessage {
  type: "position_update";
  vehicleId: string;
  position: VehiclePosition;
  movementStatus: MovementStatus;
  connectionStatus: RetransmissionStatus;
  timestamp: string;
}

/**
 * Mensaje de estado de conexión
 * @interface ConnectionStatusMessage
 */
export interface ConnectionStatusMessage {
  type: "connection_status";
  vehicleId: string;
  status: RetransmissionStatus;
  lastConnection: string;
}

/**
 * Mensaje de alerta
 * @interface AlertMessage
 */
export interface AlertMessage {
  type: "alert";
  vehicleId: string;
  alertType: "geofence_enter" | "geofence_exit" | "speed_limit" | "connection_lost" | "sos";
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

/**
 * Union type de todos los mensajes WebSocket
 * @type WebSocketMessage
 */
export type WebSocketMessage = 
  | PositionUpdateMessage 
  | ConnectionStatusMessage 
  | AlertMessage;

/**
 * Configuración de WebSocket
 * @interface WebSocketConfig
 */
export interface WebSocketConfig {
  /** URL del servidor WebSocket */
  url: string;
  /** Intentos máximos de reconexión */
  maxReconnectAttempts: number;
  /** Delay base para reconexión (ms) */
  reconnectBaseDelay: number;
  /** Factor de backoff exponencial */
  reconnectBackoffFactor: number;
  /** Delay máximo de reconexión (ms) */
  maxReconnectDelay: number;
  /** Intervalo de ping/heartbeat (ms) */
  heartbeatInterval: number;
  /** Timeout de conexión (ms) */
  connectionTimeout: number;
}

// ============================================================================
// TIPOS DE EXPORTACIÓN
// ============================================================================

/**
 * Formatos de exportación disponibles para rutas
 * @type RouteExportFormat
 */
export type RouteExportFormat = "csv" | "json" | "gpx";

/**
 * Opciones de exportación de ruta
 * @interface RouteExportOptions
 */
export interface RouteExportOptions {
  /** Formato de exportación */
  format: RouteExportFormat;
  /** Incluir estadísticas */
  includeStats?: boolean;
  /** Incluir eventos */
  includeEvents?: boolean;
  /** Nombre del archivo */
  filename?: string;
}
