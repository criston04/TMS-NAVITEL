'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ScheduledOrder,
  CalendarDayData,
  CalendarViewType,
  CalendarFilters,
  ResourceTimeline,
  ResourceSuggestion,
  SchedulingKPIs,
  ScheduleConflict,
  PendingOrdersFilters,
  SchedulingFeatureFlags,
  HOSValidationResult,
  ScheduleAuditLog,
  BlockedDay,
  SchedulingNotification,
  BulkAssignmentResult,
  GanttResourceRow,
} from '@/types/scheduling';
import type { Order } from '@/types/order';
import { schedulingService, type AssignmentPayload } from '@/services/scheduling-service';
import {
  MOCK_VEHICLES,
  MOCK_DRIVERS,
  DEFAULT_SCHEDULING_CONFIG,
  generateMockTimelines,
  type MockVehicle,
  type MockDriver,
} from '@/mocks/scheduling';

/** Filtro de estado para vista de lista */
export type OrderStateFilter = 'all' | 'in_execution' | 'assigned' | 'unassigned';

interface AssignmentModalState {
  isOpen: boolean;
  order: Order | ScheduledOrder | null;
  proposedDate: Date | null;
}

interface UseSchedulingReturn {
  pendingOrders: Order[];
  allOrders: Order[];
  filteredAllOrders: Order[];
  calendarData: CalendarDayData[];
  scheduledOrders: ScheduledOrder[];
  timelines: ResourceTimeline[];
  kpis: SchedulingKPIs;
  vehicles: MockVehicle[];
  drivers: MockDriver[];
  suggestions: ResourceSuggestion[];
  conflicts: ScheduleConflict[];
  hosValidation: HOSValidationResult | null;
  config: SchedulingFeatureFlags;
  
  currentMonth: Date;
  calendarView: CalendarViewType;
  selectedDate: Date | null;
  isLoading: boolean;
  isScheduling: boolean;
  isLoadingSuggestions: boolean;
  
  // Modal
  assignmentModal: AssignmentModalState;
  
  pendingFilters: PendingOrdersFilters;
  stateFilter: OrderStateFilter;
  listSearch: string;
  
  setCurrentMonth: (date: Date) => void;
  setCalendarView: (view: CalendarViewType) => void;
  setSelectedDate: (date: Date | null) => void;
  setPendingFilters: (filters: PendingOrdersFilters) => void;
  setStateFilter: (filter: OrderStateFilter) => void;
  setListSearch: (search: string) => void;
  
  // Drag & Drop
  handleDragStart: (order: Order) => void;
  handleDragEnd: () => void;
  draggingOrder: Order | null;
  
  openAssignmentModal: (order: Order | ScheduledOrder, date?: Date) => void;
  closeAssignmentModal: () => void;
  confirmAssignment: (data: AssignmentPayload) => void;
  requestSuggestions: (orderId: string, date: Date) => void;
  validateHOS: (driverId: string, date: Date, duration: number) => void;

  // ═══════ Feature 1: Bulk Assignment ═══════
  selectedOrderIds: string[];
  setSelectedOrderIds: (ids: string[]) => void;
  isBulkModalOpen: boolean;
  openBulkModal: () => void;
  closeBulkModal: () => void;
  bulkAssignResult: BulkAssignmentResult | null;
  isBulkAssigning: boolean;
  confirmBulkAssignment: (
    orderIds: string[],
    vehicleId: string,
    driverId: string,
    date: Date,
    notes?: string
  ) => void;

  // ═══════ Feature 2: Order Detail ═══════
  detailOrder: Order | ScheduledOrder | null;
  isDetailOpen: boolean;
  openOrderDetail: (order: Order | ScheduledOrder) => void;
  closeOrderDetail: () => void;

  // ═══════ Feature 4: Calendar Filters ═══════
  calendarFilters: CalendarFilters;
  setCalendarFilters: (filters: CalendarFilters) => void;

  // ═══════ Feature 5: Export ═══════
  exportOrders: Order[];

  // ═══════ Feature 6: Notifications ═══════
  notifications: SchedulingNotification[];
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (n: Omit<SchedulingNotification, 'id' | 'timestamp' | 'isRead' | 'isDismissed'>) => void;

  // ═══════ Feature 7: Auto-Scheduling ═══════
  isAutoScheduleOpen: boolean;
  openAutoSchedule: () => void;
  closeAutoSchedule: () => void;
  isAutoScheduling: boolean;
  autoScheduleResult: { assigned: number; failed: number; errors: string[] } | null;
  confirmAutoSchedule: () => void;

  // ═══════ Feature 8: Gantt ═══════
  ganttData: GanttResourceRow[];
  ganttStartDate: Date;
  setGanttStartDate: (date: Date) => void;
  isLoadingGantt: boolean;

  // ═══════ Feature 9: Audit Log ═══════
  auditLogs: ScheduleAuditLog[];
  isAuditLogOpen: boolean;
  openAuditLog: () => void;
  closeAuditLog: () => void;
  isLoadingAuditLogs: boolean;

  // ═══════ Feature 10: Day Blocking ═══════
  blockedDays: BlockedDay[];
  isBlockDayOpen: boolean;
  blockDayPreselectedDate: Date | null;
  openBlockDay: (date?: Date) => void;
  closeBlockDay: () => void;
  confirmBlockDay: (data: Omit<BlockedDay, 'id' | 'createdAt'>) => void;
  confirmUnblockDay: (blockId: string) => void;
  isBlockingDay: boolean;
}

export function useScheduling(): UseSchedulingReturn {
  // ----------------------------------------
  // ----------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // ----------------------------------------
  // ----------------------------------------
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // ----------------------------------------
  // ----------------------------------------
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [scheduledOrders, setScheduledOrders] = useState<ScheduledOrder[]>([]);
  const [timelines, setTimelines] = useState<ResourceTimeline[]>([]);
  const [kpis, setSchedulingKpis] = useState<SchedulingKPIs>({
    pendingOrders: 0,
    scheduledToday: 0,
    atRiskOrders: 0,
    fleetUtilization: 0,
    driverUtilization: 0,
    onTimeDeliveryRate: 0,
    averageLeadTime: 0,
    weeklyTrend: 0,
  });
  
  // ----------------------------------------
  // FILTROS DE VISTA LISTA
  // ----------------------------------------
  const [stateFilter, setStateFilter] = useState<OrderStateFilter>('all');
  const [listSearch, setListSearch] = useState('');
  
  // ----------------------------------------
  // ----------------------------------------
  const [suggestions, setSuggestions] = useState<ResourceSuggestion[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [hosValidation, setHOSValidation] = useState<HOSValidationResult | null>(null);
  
  // ----------------------------------------
  // ----------------------------------------
  const [pendingFilters, setPendingFilters] = useState<PendingOrdersFilters>({});
  
  // ----------------------------------------
  // DRAG & DROP
  // ----------------------------------------
  const [draggingOrder, setDraggingOrder] = useState<Order | null>(null);
  
  // ----------------------------------------
  // MODAL DE ASIGNACIÓN
  // ----------------------------------------
  const [assignmentModal, setAssignmentModal] = useState<AssignmentModalState>({
    isOpen: false,
    order: null,
    proposedDate: null,
  });

  // ═══════════════════════════════════
  // FEATURE 1: BULK ASSIGNMENT
  // ═══════════════════════════════════
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAssignResult, setBulkAssignResult] = useState<BulkAssignmentResult | null>(null);
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  // ═══════════════════════════════════
  // FEATURE 2: ORDER DETAIL
  // ═══════════════════════════════════
  const [detailOrder, setDetailOrder] = useState<Order | ScheduledOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ═══════════════════════════════════
  // FEATURE 4: CALENDAR FILTERS
  // ═══════════════════════════════════
  const [calendarFilters, setCalendarFilters] = useState<CalendarFilters>({});

  // ═══════════════════════════════════
  // FEATURE 6: NOTIFICATIONS
  // ═══════════════════════════════════
  const [notifications, setNotifications] = useState<SchedulingNotification[]>([]);

  // ═══════════════════════════════════
  // FEATURE 7: AUTO-SCHEDULING
  // ═══════════════════════════════════
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [autoScheduleResult, setAutoScheduleResult] = useState<{
    assigned: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // ═══════════════════════════════════
  // FEATURE 8: GANTT
  // ═══════════════════════════════════
  const [ganttData, setGanttData] = useState<GanttResourceRow[]>([]);
  const [ganttStartDate, setGanttStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    return d;
  });
  const [isLoadingGantt, setIsLoadingGantt] = useState(false);

  // ═══════════════════════════════════
  // FEATURE 9: AUDIT LOG
  // ═══════════════════════════════════
  const [auditLogs, setAuditLogs] = useState<ScheduleAuditLog[]>([]);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);

  // ═══════════════════════════════════
  // FEATURE 10: BLOCK DAY
  // ═══════════════════════════════════
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [isBlockDayOpen, setIsBlockDayOpen] = useState(false);
  const [blockDayPreselectedDate, setBlockDayPreselectedDate] = useState<Date | null>(null);
  const [isBlockingDay, setIsBlockingDay] = useState(false);
  
  // ----------------------------------------
  // ----------------------------------------
  const config = useMemo(() => DEFAULT_SCHEDULING_CONFIG, []);

  // ----------------------------------------
  // ----------------------------------------
  const vehicles = useMemo(() => MOCK_VEHICLES, []);
  const drivers = useMemo(() => MOCK_DRIVERS, []);

  // ----------------------------------------
  // CALENDAR DATA (with filter support)
  // ----------------------------------------
  const calendarData = useMemo(() => {
    const base = schedulingService.generateCalendarDays(currentMonth, scheduledOrders);
    // Apply calendar filters
    if (!calendarFilters.vehicleId && !calendarFilters.driverId && !calendarFilters.statuses?.length && !calendarFilters.onlyWithConflicts) {
      return base;
    }
    return base.map(day => ({
      ...day,
      orders: day.orders.filter(o => {
        if (calendarFilters.vehicleId && o.vehicleId !== calendarFilters.vehicleId) return false;
        if (calendarFilters.driverId && o.driverId !== calendarFilters.driverId) return false;
        if (calendarFilters.statuses?.length && !calendarFilters.statuses.includes(o.status as import('@/types/scheduling').ScheduleStatus)) return false;
        if (calendarFilters.onlyWithConflicts && (!o.conflicts || o.conflicts.length === 0)) return false;
        return true;
      }),
    }));
  }, [currentMonth, scheduledOrders, calendarFilters]);

  // ----------------------------------------
  // EXPORT ORDERS (all for export component)
  // ----------------------------------------
  const exportOrders = useMemo(() => allOrders, [allOrders]);

  // ----------------------------------------
  // FILTRADO DE ÓRDENES PARA VISTA LISTA
  // ----------------------------------------
  const filteredAllOrders = useMemo(() => {
    let result = [...allOrders];

    // Filtro por estado
    switch (stateFilter) {
      case 'in_execution':
        result = result.filter(o => o.status === 'in_transit');
        break;
      case 'assigned':
        result = result.filter(o => o.vehicleId || o.driverId);
        break;
      case 'unassigned':
        result = result.filter(o => !o.vehicleId && !o.driverId);
        break;
      // 'all' no filtra
    }

    // Filtro por búsqueda
    if (listSearch) {
      const search = listSearch.toLowerCase();
      result = result.filter(
        o =>
          o.orderNumber?.toLowerCase().includes(search) ||
          o.customer?.name?.toLowerCase().includes(search) ||
          o.reference?.toLowerCase().includes(search) ||
          o.externalReference?.toLowerCase().includes(search) ||
          o.vehicle?.plate?.toLowerCase().includes(search) ||
          o.driver?.fullName?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [allOrders, stateFilter, listSearch]);

  // ----------------------------------------
  // CARGA INICIAL DE DATOS
  // ----------------------------------------
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setIsLoading(true);
      
      try {
        const [ordersData, kpisData, allOrdersData] = await Promise.all([
          schedulingService.getPendingOrders(),
          schedulingService.getKPIs(),
          schedulingService.getAllOrders(),
        ]);
        
        if (isMounted) {
          setPendingOrders(ordersData);
          setAllOrders(allOrdersData);
          setSchedulingKpis(kpisData);
          setTimelines(generateMockTimelines());
        }
      } catch (error) {
        console.error('Error cargando datos de programación:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // ========================================
  // CARGA SECUNDARIA: Notifications, Audit, Blocked, Gantt
  // ========================================
  useEffect(() => {
    let isMounted = true;

    const loadSecondaryData = async () => {
      try {
        const [notifs, logs, blocked] = await Promise.all([
          schedulingService.getNotifications(),
          schedulingService.getAuditLogs(),
          schedulingService.getBlockedDays(),
        ]);
        if (isMounted) {
          setNotifications(notifs);
          setAuditLogs(logs);
          setBlockedDays(blocked);
        }
      } catch (error) {
        console.error('Error cargando datos secundarios:', error);
      }
    };

    loadSecondaryData();
    return () => { isMounted = false; };
  }, []);

  // Gantt data — reloads when startDate changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingGantt(true);

    schedulingService.getGanttData(ganttStartDate, 7)
      .then(data => { if (isMounted) setGanttData(data); })
      .catch(console.error)
      .finally(() => { if (isMounted) setIsLoadingGantt(false); });

    return () => { isMounted = false; };
  }, [ganttStartDate]);

  // ----------------------------------------
  // HANDLERS DE DRAG & DROP
  // ----------------------------------------
  const handleDragStart = useCallback((order: Order) => {
    setDraggingOrder(order);
  }, []);
  
  const handleDragEnd = useCallback(() => {
    setDraggingOrder(null);
  }, []);

  // ----------------------------------------
  // HANDLERS DEL MODAL
  // ----------------------------------------
  const openAssignmentModal = useCallback((order: Order | ScheduledOrder, date?: Date) => {
    // Determinar la fecha a usar: la propuesta, la de la orden programada, o la actual
    const effectiveDate = date || 
      ('scheduledDate' in order && order.scheduledDate 
        ? new Date(order.scheduledDate) 
        : new Date());
    
    setAssignmentModal({
      isOpen: true,
      order,
      proposedDate: effectiveDate,
    });
    
    // Limpiar estado previo
    setSuggestions([]);
    setConflicts([]);
    setHOSValidation(null);
    
    // Nota: Las sugerencias se cargarán automáticamente desde el useEffect del modal
    // a través de requestSuggestions para mantener el estado isLoadingSuggestions sincronizado
  }, []);
  
  const closeAssignmentModal = useCallback(() => {
    setAssignmentModal({
      isOpen: false,
      order: null,
      proposedDate: null,
    });
    setSuggestions([]);
    setConflicts([]);
    setHOSValidation(null);
  }, []);

  // ----------------------------------------
  // CONFIRMACIÓN DE ASIGNACIÓN
  // ----------------------------------------
  const confirmAssignment = useCallback(async (payload: AssignmentPayload) => {
    const { order } = assignmentModal;
    if (!order) return;
    
    setIsScheduling(true);
    
    try {
      // Detectar conflictos si está habilitado
      if (config.enableRealtimeConflictCheck) {
        const detectedConflicts = await schedulingService.detectConflicts(
          payload.orderId,
          payload.vehicleId,
          payload.driverId,
          payload.scheduledDate,
          scheduledOrders
        );
        
        if (detectedConflicts.length > 0) {
          setConflicts(detectedConflicts);
        }
      }
      
      // Simular llamada al servicio
      const result = await schedulingService.assignOrder(payload);
      
      if (!result.success) {
        console.error('Error en asignación:', result.error);
        return;
      }
      
      // Crear la orden programada
      const scheduledOrder = schedulingService.createScheduledOrder(order, payload);
      
      // Actualizar estado: mover de pendientes a programadas
      setPendingOrders(prev => prev.filter(o => o.id !== payload.orderId));
      setScheduledOrders(prev => [...prev, scheduledOrder]);
      
      // Actualizar KPIs
      setSchedulingKpis(prev => schedulingService.updateKPIsAfterAssignment(prev));
      
      // Actualizar timelines si hay asignación de vehículo o conductor
      setTimelines(prev => prev.map(timeline => {
        if (timeline.resourceId === payload.vehicleId || timeline.resourceId === payload.driverId) {
          return {
            ...timeline,
            utilization: Math.min(100, timeline.utilization + 15),
            assignments: [...timeline.assignments, scheduledOrder],
          };
        }
        return timeline;
      }));
      
      // Cerrar modal
      closeAssignmentModal();
      
    } catch (error) {
      console.error('Error al confirmar asignación:', error);
    } finally {
      setIsScheduling(false);
    }
  }, [assignmentModal, scheduledOrders, config.enableRealtimeConflictCheck, closeAssignmentModal]);

  // ----------------------------------------
  // SOLICITAR SUGERENCIAS
  // ----------------------------------------
  const requestSuggestions = useCallback(async (orderId: string, date: Date) => {
    if (!config.enableAutoSuggestion) {
      return;
    }
    
    setIsLoadingSuggestions(true);
    
    try {
      const newSuggestions = await schedulingService.getSuggestions(orderId, date);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('[useScheduling] Error obteniendo sugerencias:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [config.enableAutoSuggestion]);

  // ----------------------------------------
  // VALIDAR HOS
  // ----------------------------------------
  const validateHOS = useCallback(async (driverId: string, date: Date, duration: number) => {
    if (!config.enableHOSValidation) return;
    
    try {
      const validation = await schedulingService.validateHOS(driverId, date, duration);
      setHOSValidation(validation);
    } catch (error) {
      console.error('Error validando HOS:', error);
    }
  }, [config.enableHOSValidation]);

  // ----------------------------------------
  // WRAPPERS CON MANEJO DE ERRORES (estables)
  // ----------------------------------------
  const wrappedConfirmAssignment = useCallback((data: AssignmentPayload) => {
    confirmAssignment(data).catch(console.error);
  }, [confirmAssignment]);

  const wrappedRequestSuggestions = useCallback((orderId: string, date: Date) => {
    requestSuggestions(orderId, date).catch(console.error);
  }, [requestSuggestions]);

  const wrappedValidateHOS = useCallback((driverId: string, date: Date, duration: number) => {
    validateHOS(driverId, date, duration).catch(console.error);
  }, [validateHOS]);

  // ═══════════════════════════════════════
  // FEATURE 1: BULK ASSIGNMENT HANDLERS
  // ═══════════════════════════════════════
  const openBulkModal = useCallback(() => {
    setBulkAssignResult(null);
    setIsBulkModalOpen(true);
  }, []);

  const closeBulkModal = useCallback(() => {
    setIsBulkModalOpen(false);
    setBulkAssignResult(null);
    setSelectedOrderIds([]);
  }, []);

  const confirmBulkAssignment = useCallback(
    async (
      orderIds: string[],
      vehicleId: string,
      driverId: string,
      date: Date,
      notes?: string
    ) => {
      setIsBulkAssigning(true);
      try {
        const result = await schedulingService.bulkAssign(orderIds, vehicleId, driverId, date, notes);
        setBulkAssignResult(result);

        if (result.success > 0) {
          // Remove successfully assigned orders from pending
          const successIds = new Set(orderIds.slice(0, result.success));
          setPendingOrders(prev => prev.filter(o => !successIds.has(o.id)));
          // Reload KPIs
          const newKpis = await schedulingService.getKPIs();
          setSchedulingKpis(newKpis);
          // Add success notification
          addNotificationInternal({
            type: 'bulk_assignment',
            severity: 'success',
            title: 'Asignación masiva completada',
            message: `${result.success} de ${result.total} órdenes asignadas exitosamente`,
          });
        }
      } catch (error) {
        console.error('Error en asignación masiva:', error);
      } finally {
        setIsBulkAssigning(false);
      }
    },
    []
  );

  // ═══════════════════════════════════════
  // FEATURE 2: ORDER DETAIL HANDLERS
  // ═══════════════════════════════════════
  const openOrderDetail = useCallback((order: Order | ScheduledOrder) => {
    setIsAuditLogOpen(false); // Close audit log to prevent panel overlap
    setDetailOrder(order);
    setIsDetailOpen(true);
  }, []);

  const closeOrderDetail = useCallback(() => {
    setIsDetailOpen(false);
    setDetailOrder(null);
  }, []);

  // ═══════════════════════════════════════
  // FEATURE 6: NOTIFICATION HANDLERS
  // ═══════════════════════════════════════
  const addNotificationInternal = useCallback(
    (data: Omit<SchedulingNotification, 'id' | 'timestamp' | 'isRead' | 'isDismissed'>) => {
      const n: SchedulingNotification = {
        ...data,
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        isDismissed: false,
      };
      setNotifications(prev => [n, ...prev]);
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isDismissed: true } : n))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, isDismissed: true }))
    );
  }, []);

  const addNotification = useCallback(
    (data: Omit<SchedulingNotification, 'id' | 'timestamp' | 'isRead' | 'isDismissed'>) => {
      addNotificationInternal(data);
    },
    [addNotificationInternal]
  );

  // ═══════════════════════════════════════
  // FEATURE 7: AUTO-SCHEDULE HANDLERS
  // ═══════════════════════════════════════
  const openAutoSchedule = useCallback(() => {
    setAutoScheduleResult(null);
    setIsAutoScheduleOpen(true);
  }, []);

  const closeAutoSchedule = useCallback(() => {
    setIsAutoScheduleOpen(false);
    setAutoScheduleResult(null);
  }, []);

  const confirmAutoSchedule = useCallback(async () => {
    setIsAutoScheduling(true);
    try {
      const result = await schedulingService.autoSchedule(pendingOrders, vehicles, drivers);
      setAutoScheduleResult(result);

      if (result.assigned > 0) {
        // Reload orders
        const [newPending, newKpis] = await Promise.all([
          schedulingService.getPendingOrders(),
          schedulingService.getKPIs(),
        ]);
        setPendingOrders(newPending);
        setSchedulingKpis(newKpis);

        addNotificationInternal({
          type: 'auto_schedule',
          severity: 'success',
          title: 'Auto-programación completada',
          message: `${result.assigned} órdenes asignadas automáticamente`,
        });
      }
    } catch (error) {
      console.error('Error en auto-programación:', error);
    } finally {
      setIsAutoScheduling(false);
    }
  }, [pendingOrders, vehicles, drivers, addNotificationInternal]);

  // ═══════════════════════════════════════
  // FEATURE 9: AUDIT LOG HANDLERS
  // ═══════════════════════════════════════
  const openAuditLog = useCallback(() => {
    setIsDetailOpen(false); // Close order detail to prevent panel overlap
    setDetailOrder(null);
    setIsAuditLogOpen(true);
    // Refresh logs
    setIsLoadingAuditLogs(true);
    schedulingService
      .getAuditLogs()
      .then(logs => setAuditLogs(logs))
      .catch(console.error)
      .finally(() => setIsLoadingAuditLogs(false));
  }, []);

  const closeAuditLog = useCallback(() => {
    setIsAuditLogOpen(false);
  }, []);

  // ═══════════════════════════════════════
  // FEATURE 10: BLOCK DAY HANDLERS
  // ═══════════════════════════════════════
  const openBlockDay = useCallback((date?: Date) => {
    setBlockDayPreselectedDate(date ?? null);
    setIsBlockDayOpen(true);
  }, []);

  const closeBlockDay = useCallback(() => {
    setIsBlockDayOpen(false);
    setBlockDayPreselectedDate(null);
  }, []);

  const confirmBlockDay = useCallback(
    async (data: Omit<BlockedDay, 'id' | 'createdAt'>) => {
      setIsBlockingDay(true);
      try {
        const created = await schedulingService.blockDay(data as BlockedDay);
        setBlockedDays(prev => [...prev, created]);
        addNotificationInternal({
          type: 'day_blocked',
          severity: 'info',
          title: 'Día bloqueado',
          message: `Se bloqueó ${new Date(data.date).toLocaleDateString()}: ${data.reason}`,
        });
      } catch (error) {
        console.error('Error bloqueando día:', error);
      } finally {
        setIsBlockingDay(false);
      }
    },
    [addNotificationInternal]
  );

  const confirmUnblockDay = useCallback(async (blockId: string) => {
    try {
      await schedulingService.unblockDay(blockId);
      setBlockedDays(prev => prev.filter(b => b.id !== blockId));
    } catch (error) {
      console.error('Error desbloqueando día:', error);
    }
  }, []);

  // ----------------------------------------
  // ----------------------------------------
  return {
    pendingOrders,
    allOrders,
    filteredAllOrders,
    calendarData,
    scheduledOrders,
    timelines,
    kpis,
    vehicles,
    drivers,
    suggestions,
    conflicts,
    hosValidation,
    config,
    
    currentMonth,
    calendarView,
    selectedDate,
    isLoading,
    isScheduling,
    isLoadingSuggestions,
    
    // Modal
    assignmentModal,
    
    pendingFilters,
    stateFilter,
    listSearch,
    
    setCurrentMonth,
    setCalendarView,
    setSelectedDate,
    setPendingFilters,
    setStateFilter,
    setListSearch,
    
    // Drag & Drop
    handleDragStart,
    handleDragEnd,
    draggingOrder,
    
    openAssignmentModal,
    closeAssignmentModal,
    confirmAssignment: wrappedConfirmAssignment,
    requestSuggestions: wrappedRequestSuggestions,
    validateHOS: wrappedValidateHOS,

    // Feature 1: Bulk Assignment
    selectedOrderIds,
    setSelectedOrderIds,
    isBulkModalOpen,
    openBulkModal,
    closeBulkModal,
    bulkAssignResult,
    isBulkAssigning,
    confirmBulkAssignment: (...args: Parameters<typeof confirmBulkAssignment>) => {
      confirmBulkAssignment(...args).catch(console.error);
    },

    // Feature 2: Order Detail
    detailOrder,
    isDetailOpen,
    openOrderDetail,
    closeOrderDetail,

    // Feature 4: Calendar Filters
    calendarFilters,
    setCalendarFilters,

    // Feature 5: Export
    exportOrders,

    // Feature 6: Notifications
    notifications,
    markNotificationRead,
    dismissNotification,
    clearAllNotifications,
    addNotification,

    // Feature 7: Auto-Scheduling
    isAutoScheduleOpen,
    openAutoSchedule,
    closeAutoSchedule,
    isAutoScheduling,
    autoScheduleResult,
    confirmAutoSchedule: () => {
      confirmAutoSchedule().catch(console.error);
    },

    // Feature 8: Gantt
    ganttData,
    ganttStartDate,
    setGanttStartDate,
    isLoadingGantt,

    // Feature 9: Audit Log
    auditLogs,
    isAuditLogOpen,
    openAuditLog,
    closeAuditLog,
    isLoadingAuditLogs,

    // Feature 10: Block Day
    blockedDays,
    isBlockDayOpen,
    blockDayPreselectedDate,
    openBlockDay,
    closeBlockDay,
    confirmBlockDay: (...args: Parameters<typeof confirmBlockDay>) => {
      confirmBlockDay(...args).catch(console.error);
    },
    confirmUnblockDay: (...args: Parameters<typeof confirmUnblockDay>) => {
      confirmUnblockDay(...args).catch(console.error);
    },
    isBlockingDay,
  };
}
