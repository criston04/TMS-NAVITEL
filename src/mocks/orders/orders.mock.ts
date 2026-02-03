/**
 * @fileoverview Mock data para órdenes de transporte
 * @module mocks/orders/orders
 * @description Genera datos de prueba realistas para el módulo de órdenes,
 * incluyendo hitos, historial de estados y datos de cierre.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import type {
  Order,
  OrderStatus,
  OrderPriority,
  OrderSyncStatus,
  OrderMilestone,
  MilestoneStatus,
  CargoType,
  OrderStatusHistory,
} from '@/types/order';

/**
 * Genera un ID único para elementos mock
 * @param prefix - Prefijo para el ID
 * @returns ID único con formato prefix-timestamp-random
 */
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Genera una fecha aleatoria dentro de un rango
 * @param start - Fecha de inicio
 * @param end - Fecha de fin
 * @returns Fecha ISO string
 */
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};

/**
 * Selecciona un elemento aleatorio de un array
 * @param arr - Array de elementos
 * @returns Elemento aleatorio
 */
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Lista de clientes mock para órdenes
 */
const mockCustomers = [
  { id: 'cust-001', name: 'Corporación Andina de Fomento', code: 'CAF', email: 'logistica@caf.com' },
  { id: 'cust-002', name: 'Minera Las Bambas', code: 'MLB', email: 'transporte@lasbambas.pe' },
  { id: 'cust-003', name: 'Alicorp S.A.A.', code: 'ALC', email: 'supply@alicorp.com.pe' },
  { id: 'cust-004', name: 'Gloria S.A.', code: 'GLO', email: 'logistica@gloria.com.pe' },
  { id: 'cust-005', name: 'Southern Peru Copper', code: 'SPC', email: 'logistics@southernperu.com' },
  { id: 'cust-006', name: 'Backus y Johnston', code: 'BKS', email: 'distribucion@backus.com.pe' },
  { id: 'cust-007', name: 'Cementos Pacasmayo', code: 'CPA', email: 'transporte@cementospacasmayo.com.pe' },
  { id: 'cust-008', name: 'Petroperú S.A.', code: 'PPE', email: 'logistica@petroperu.com.pe' },
];

/**
 * Lista de transportistas mock
 */
const mockCarriers = [
  { id: 'car-001', name: 'Transportes Cruz del Sur' },
  { id: 'car-002', name: 'Ransa Comercial S.A.' },
  { id: 'car-003', name: 'Transportes Línea S.A.' },
  { id: 'car-004', name: 'Oltursa Transportes' },
  { id: 'car-005', name: 'Neptunia S.A.' },
];

/**
 * Lista de operadores GPS mock
 */
const mockGPSOperators = [
  { id: 'gps-001', name: 'Wialon Pro' },
  { id: 'gps-002', name: 'GPS Tracker Plus' },
  { id: 'gps-003', name: 'Navitel Fleet' },
  { id: 'gps-004', name: 'Geotab Connect' },
];

/**
 * Lista de vehículos mock para órdenes
 */
const mockVehicles = [
  { id: 'veh-001', plate: 'ABC-123', brand: 'Volvo', model: 'FH16', type: 'truck' as const },
  { id: 'veh-002', plate: 'DEF-456', brand: 'Scania', model: 'R450', type: 'truck' as const },
  { id: 'veh-003', plate: 'GHI-789', brand: 'Mercedes-Benz', model: 'Actros', type: 'truck' as const },
  { id: 'veh-004', plate: 'JKL-012', brand: 'Kenworth', model: 'T680', type: 'truck' as const },
  { id: 'veh-005', plate: 'MNO-345', brand: 'Freightliner', model: 'Cascadia', type: 'truck' as const },
];

/**
 * Lista de conductores mock
 */
const mockDrivers = [
  { id: 'drv-001', fullName: 'Carlos Mendoza Ríos', phone: '+51 987 654 321', licenseNumber: 'A-III-C-12345' },
  { id: 'drv-002', fullName: 'Juan Pérez García', phone: '+51 987 654 322', licenseNumber: 'A-III-C-12346' },
  { id: 'drv-003', fullName: 'Miguel Sánchez Torres', phone: '+51 987 654 323', licenseNumber: 'A-III-C-12347' },
  { id: 'drv-004', fullName: 'Roberto Díaz Vargas', phone: '+51 987 654 324', licenseNumber: 'A-III-C-12348' },
  { id: 'drv-005', fullName: 'Luis Castro Medina', phone: '+51 987 654 325', licenseNumber: 'A-III-C-12349' },
];

/**
 * Ubicaciones predefinidas para hitos
 */
const mockLocations = [
  { name: 'Almacén Central Lima', address: 'Av. Argentina 1234, Callao', lat: -12.0464, lng: -77.0428 },
  { name: 'Centro Distribución Arequipa', address: 'Parque Industrial Río Seco', lat: -16.4090, lng: -71.5375 },
  { name: 'Terminal Matarani', address: 'Puerto Matarani, Islay', lat: -17.0000, lng: -72.1000 },
  { name: 'Planta Procesadora Cusco', address: 'Zona Industrial Wanchaq', lat: -13.5320, lng: -71.9675 },
  { name: 'Depósito Trujillo', address: 'Panamericana Norte Km 562', lat: -8.1116, lng: -79.0288 },
  { name: 'Almacén Piura', address: 'Zona Industrial Sullana', lat: -5.1945, lng: -80.6328 },
  { name: 'Centro Logístico Chiclayo', address: 'Carretera Lambayeque Km 8', lat: -6.7714, lng: -79.8409 },
  { name: 'Terminal Ilo', address: 'Puerto de Ilo, Moquegua', lat: -17.6394, lng: -71.3375 },
  { name: 'Planta Huancayo', address: 'Zona Industrial El Tambo', lat: -12.0651, lng: -75.2049 },
  { name: 'Depósito Pucallpa', address: 'Carretera Federico Basadre Km 5', lat: -8.3791, lng: -74.5539 },
];

/**
 * Genera hitos para una orden
 * @param orderId - ID de la orden
 * @param count - Cantidad de hitos (mínimo 2: origen y destino)
 * @param status - Estado de la orden para determinar progreso de hitos
 * @returns Array de hitos
 */
const generateMilestones = (
  orderId: string,
  count: number,
  status: OrderStatus
): OrderMilestone[] => {
  const locations = [...mockLocations].sort(() => Math.random() - 0.5).slice(0, count);
  const baseDate = new Date();
  
  return locations.map((loc, index) => {
    const isFirst = index === 0;
    const isLast = index === locations.length - 1;
    
    // Determinar estado del hito basado en el estado de la orden y posición
    let milestoneStatus: MilestoneStatus = 'pending';
    let actualEntry: string | undefined;
    let actualExit: string | undefined;
    let delayMinutes: number | undefined;
    
    if (status === 'completed' || status === 'closed') {
      milestoneStatus = 'completed';
      actualEntry = randomDate(new Date(baseDate.getTime() - 86400000), baseDate);
      actualExit = randomDate(new Date(actualEntry), baseDate);
      delayMinutes = Math.floor(Math.random() * 60) - 20;
    } else if (status === 'in_transit' || status === 'at_milestone') {
      if (index < Math.floor(count / 2)) {
        milestoneStatus = 'completed';
        actualEntry = randomDate(new Date(baseDate.getTime() - 86400000), baseDate);
        actualExit = randomDate(new Date(actualEntry), baseDate);
      } else if (index === Math.floor(count / 2)) {
        milestoneStatus = status === 'at_milestone' ? 'in_progress' : 'approaching';
        if (milestoneStatus === 'in_progress') {
          actualEntry = new Date().toISOString();
        }
      }
    } else if (status === 'delayed') {
      if (index < Math.floor(count / 2)) {
        milestoneStatus = 'completed';
        actualEntry = randomDate(new Date(baseDate.getTime() - 86400000), baseDate);
        actualExit = randomDate(new Date(actualEntry), baseDate);
        delayMinutes = Math.floor(Math.random() * 120) + 30;
      } else if (index === Math.floor(count / 2)) {
        milestoneStatus = 'delayed';
        delayMinutes = Math.floor(Math.random() * 180) + 60;
      }
    }
    
    const estimatedArrival = new Date(baseDate.getTime() + (index * 8 * 3600000));
    const estimatedDeparture = new Date(estimatedArrival.getTime() + 2 * 3600000);
    
    return {
      id: `${orderId}-ms-${index + 1}`,
      orderId,
      geofenceId: `geo-${loc.name.toLowerCase().replace(/\s/g, '-')}`,
      geofenceName: loc.name,
      type: isFirst ? 'origin' : isLast ? 'destination' : 'waypoint',
      sequence: index + 1,
      address: loc.address,
      coordinates: { lat: loc.lat, lng: loc.lng },
      estimatedArrival: estimatedArrival.toISOString(),
      estimatedDeparture: estimatedDeparture.toISOString(),
      actualEntry,
      actualExit,
      status: milestoneStatus,
      delayMinutes,
      notes: index === 0 ? 'Punto de carga inicial' : isLast ? 'Punto de entrega final' : undefined,
      contact: {
        name: `Contacto ${loc.name}`,
        phone: `+51 9${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        email: `contacto@${loc.name.toLowerCase().replace(/\s/g, '')}.com`,
      },
    };
  });
};

/**
 * Genera historial de estados para una orden
 * @param status - Estado actual de la orden
 * @returns Array de historial de estados
 */
const generateStatusHistory = (status: OrderStatus): OrderStatusHistory[] => {
  const history: OrderStatusHistory[] = [];
  const statuses: OrderStatus[] = ['draft', 'pending', 'assigned'];
  
  if (['in_transit', 'at_milestone', 'delayed', 'completed', 'closed'].includes(status)) {
    statuses.push('in_transit');
  }
  if (['at_milestone', 'delayed', 'completed', 'closed'].includes(status)) {
    statuses.push('at_milestone');
  }
  if (status === 'delayed') {
    statuses.push('delayed');
  }
  if (['completed', 'closed'].includes(status)) {
    statuses.push('completed');
  }
  if (status === 'closed') {
    statuses.push('closed');
  }
  
  const users = ['admin@navitel.com', 'operador@navitel.com', 'supervisor@navitel.com'];
  const userNames = ['Administrador Sistema', 'Juan Operador', 'María Supervisora'];
  const baseDate = new Date();
  
  for (let i = 1; i < statuses.length; i++) {
    const userIndex = Math.floor(Math.random() * users.length);
    history.push({
      id: generateId('hist'),
      fromStatus: statuses[i - 1],
      toStatus: statuses[i],
      changedAt: new Date(baseDate.getTime() - (statuses.length - i) * 3600000).toISOString(),
      changedBy: users[userIndex],
      changedByName: userNames[userIndex],
      reason: i === statuses.length - 1 ? 'Actualización automática del sistema' : undefined,
    });
  }
  
  return history;
};

/**
 * Calcula el porcentaje de cumplimiento basado en hitos
 * @param milestones - Array de hitos
 * @returns Porcentaje de 0 a 100
 */
const calculateCompletion = (milestones: OrderMilestone[]): number => {
  const completed = milestones.filter(m => m.status === 'completed').length;
  return Math.round((completed / milestones.length) * 100);
};

/**
 * Tipos de carga para mock
 */
const cargoTypes: CargoType[] = ['general', 'refrigerated', 'hazardous', 'fragile', 'oversized', 'liquid', 'bulk'];

/**
 * Prioridades para mock
 */
const priorities: OrderPriority[] = ['low', 'normal', 'high', 'urgent'];

/**
 * Estados para distribución realista
 */
const orderStatuses: OrderStatus[] = [
  'pending', 'pending',
  'assigned', 'assigned',
  'in_transit', 'in_transit', 'in_transit',
  'at_milestone',
  'delayed',
  'completed', 'completed',
  'closed',
];

/**
 * Estados de sincronización
 */
const syncStatuses: OrderSyncStatus[] = ['not_sent', 'pending', 'sent', 'sent', 'sent', 'error'];

/**
 * Genera una orden completa mock
 * @param index - Índice para generar número de orden único
 * @returns Orden completa
 */
const generateOrder = (index: number): Order => {
  const status = randomItem(orderStatuses);
  const customer = randomItem(mockCustomers);
  const carrier = randomItem(mockCarriers);
  const vehicle = randomItem(mockVehicles);
  const driver = randomItem(mockDrivers);
  const gpsOperator = randomItem(mockGPSOperators);
  const milestonesCount = Math.floor(Math.random() * 4) + 2; // 2-5 hitos
  const milestones = generateMilestones(`ord-${String(index).padStart(5, '0')}`, milestonesCount, status);
  const cargoType = randomItem(cargoTypes);
  
  const baseDate = new Date();
  const createdAt = randomDate(new Date(baseDate.getTime() - 30 * 24 * 3600000), baseDate);
  const scheduledStart = new Date(new Date(createdAt).getTime() + 24 * 3600000);
  const scheduledEnd = new Date(scheduledStart.getTime() + (milestonesCount * 8 + 24) * 3600000);
  
  const orderId = `ord-${String(index).padStart(5, '0')}`;
  const syncStatus = randomItem(syncStatuses);
  
  const order: Order = {
    id: orderId,
    orderNumber: `ORD-${new Date().getFullYear()}-${String(index).padStart(5, '0')}`,
    customerId: customer.id,
    customer: customer,
    carrierId: carrier.id,
    carrierName: carrier.name,
    vehicleId: status !== 'pending' ? vehicle.id : undefined,
    vehicle: status !== 'pending' ? vehicle : undefined,
    driverId: status !== 'pending' ? driver.id : undefined,
    driver: status !== 'pending' ? driver : undefined,
    gpsOperatorId: gpsOperator.id,
    gpsOperatorName: gpsOperator.name,
    workflowId: `wf-00${Math.floor(Math.random() * 3) + 1}`,
    workflowName: ['Importación Marítima Standard', 'Exportación Aérea Express', 'Distribución Urbana Lima'][Math.floor(Math.random() * 3)],
    status,
    priority: randomItem(priorities),
    syncStatus,
    syncErrorMessage: syncStatus === 'error' ? 'Error de conexión con sistema externo' : undefined,
    lastSyncAttempt: syncStatus !== 'not_sent' ? new Date().toISOString() : undefined,
    cargo: {
      description: `Carga de ${cargoType} - Lote ${Math.floor(Math.random() * 1000)}`,
      type: cargoType,
      weightKg: Math.floor(Math.random() * 20000) + 1000,
      volumeM3: Math.floor(Math.random() * 50) + 5,
      quantity: Math.floor(Math.random() * 100) + 1,
      declaredValue: Math.floor(Math.random() * 100000) + 5000,
      temperatureControlled: cargoType === 'refrigerated',
      temperatureRange: cargoType === 'refrigerated' ? { min: 2, max: 8, unit: 'celsius' } : undefined,
      handlingInstructions: cargoType === 'fragile' ? 'Manipular con cuidado. No apilar más de 3 niveles.' : undefined,
    },
    milestones,
    completionPercentage: calculateCompletion(milestones),
    createdAt,
    createdBy: 'admin@navitel.com',
    updatedAt: new Date().toISOString(),
    scheduledStartDate: scheduledStart.toISOString(),
    scheduledEndDate: scheduledEnd.toISOString(),
    actualStartDate: ['in_transit', 'at_milestone', 'delayed', 'completed', 'closed'].includes(status)
      ? new Date(scheduledStart.getTime() + Math.random() * 3600000).toISOString()
      : undefined,
    actualEndDate: ['completed', 'closed'].includes(status)
      ? new Date(scheduledEnd.getTime() + (Math.random() - 0.5) * 2 * 3600000).toISOString()
      : undefined,
    closureData: status === 'closed' ? {
      observations: 'Viaje completado sin novedades mayores. Entrega realizada según lo programado.',
      incidents: [],
      deviationReasons: Math.random() > 0.7 ? [{
        id: generateId('dev'),
        type: 'time',
        description: 'Retraso por tráfico en zona urbana',
        impact: { value: 45, unit: 'minutes' },
      }] : [],
      closedBy: 'admin@navitel.com',
      closedByName: 'Administrador Sistema',
      closedAt: new Date().toISOString(),
    } : undefined,
    statusHistory: generateStatusHistory(status),
    externalReference: Math.random() > 0.5 ? `EXT-${Math.floor(Math.random() * 100000)}` : undefined,
    notes: Math.random() > 0.7 ? 'Cliente requiere notificación de llegada con 2 horas de anticipación.' : undefined,
    tags: Math.random() > 0.5 ? [randomItem(['prioritario', 'fragil', 'urgente', 'vip', 'nuevo-cliente'])] : undefined,
  };
  
  return order;
};

/**
 * Base de datos mock de órdenes
 * Genera 50 órdenes con datos realistas
 */
export const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => generateOrder(i + 1));

/**
 * Obtiene contadores por estado de las órdenes
 * @param orders - Array de órdenes
 * @returns Record con conteo por estado
 */
export const getOrderStatusCounts = (orders: Order[]): Record<OrderStatus, number> => {
  const counts: Record<OrderStatus, number> = {
    draft: 0,
    pending: 0,
    assigned: 0,
    in_transit: 0,
    at_milestone: 0,
    delayed: 0,
    completed: 0,
    closed: 0,
    cancelled: 0,
  };
  
  orders.forEach(order => {
    counts[order.status]++;
  });
  
  return counts;
};

/**
 * Filtra órdenes según criterios
 * @param filters - Criterios de filtrado
 * @returns Órdenes filtradas con paginación
 */
export const filterOrders = (filters: {
  search?: string;
  customerId?: string;
  carrierId?: string;
  gpsOperatorId?: string;
  status?: OrderStatus | OrderStatus[];
  priority?: OrderPriority | OrderPriority[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Order;
  sortOrder?: 'asc' | 'desc';
}): { data: Order[]; total: number; statusCounts: Record<OrderStatus, number> } => {
  let filtered = [...mockOrders];
  
  // Búsqueda por número de orden
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(o =>
      o.orderNumber.toLowerCase().includes(searchLower) ||
      o.customer?.name.toLowerCase().includes(searchLower) ||
      o.externalReference?.toLowerCase().includes(searchLower)
    );
  }
  
  // Filtro por cliente
  if (filters.customerId) {
    filtered = filtered.filter(o => o.customerId === filters.customerId);
  }
  
  // Filtro por transportista
  if (filters.carrierId) {
    filtered = filtered.filter(o => o.carrierId === filters.carrierId);
  }
  
  // Filtro por operador GPS
  if (filters.gpsOperatorId) {
    filtered = filtered.filter(o => o.gpsOperatorId === filters.gpsOperatorId);
  }
  
  // Filtro por estado
  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    filtered = filtered.filter(o => statuses.includes(o.status));
  }
  
  // Filtro por prioridad
  if (filters.priority) {
    const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
    filtered = filtered.filter(o => priorities.includes(o.priority));
  }
  
  // Filtro por rango de fechas
  if (filters.dateFrom) {
    filtered = filtered.filter(o => new Date(o.scheduledStartDate) >= new Date(filters.dateFrom!));
  }
  if (filters.dateTo) {
    filtered = filtered.filter(o => new Date(o.scheduledStartDate) <= new Date(filters.dateTo!));
  }
  
  // Ordenamiento
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy!];
      const bVal = b[filters.sortBy!];
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
  }
  
  const total = filtered.length;
  const statusCounts = getOrderStatusCounts(filtered);
  
  // Paginación
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  
  return { data, total, statusCounts };
};

/**
 * Obtiene una orden por ID
 * @param id - ID de la orden
 * @returns Orden o undefined
 */
export const getOrderById = (id: string): Order | undefined => {
  return mockOrders.find(o => o.id === id);
};

/**
 * Obtiene lista de clientes únicos de las órdenes
 */
export const getOrderCustomers = () => mockCustomers;

/**
 * Obtiene lista de transportistas únicos
 */
export const getOrderCarriers = () => mockCarriers;

/**
 * Obtiene lista de operadores GPS
 */
export const getOrderGPSOperators = () => mockGPSOperators;
