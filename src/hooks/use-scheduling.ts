/**
 * @fileoverview Hook principal para el módulo de Programación
 * @module hooks/use-scheduling
 * @description Maneja el estado y lógica del módulo de programación,
 * incluyendo calendario, órdenes pendientes y asignaciones.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ScheduledOrder,
  CalendarDayData,
  CalendarViewType,
  ResourceTimeline,
  ResourceSuggestion,
  SchedulingKPIs,
  ScheduleConflict,
  PendingOrdersFilters,
  SchedulingFeatureFlags,
  HOSValidationResult,
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

// ============================================
// TIPOS DEL HOOK
// ============================================

interface AssignmentModalState {
  isOpen: boolean;
  order: Order | ScheduledOrder | null;
  proposedDate: Date | null;
}

interface UseSchedulingReturn {
  // Datos
  pendingOrders: Order[];
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
  
  // Estado UI
  currentMonth: Date;
  calendarView: CalendarViewType;
  selectedDate: Date | null;
  isLoading: boolean;
  isScheduling: boolean;
  isLoadingSuggestions: boolean;
  
  // Modal
  assignmentModal: AssignmentModalState;
  
  // Filtros
  pendingFilters: PendingOrdersFilters;
  
  // Acciones de estado
  setCurrentMonth: (date: Date) => void;
  setCalendarView: (view: CalendarViewType) => void;
  setSelectedDate: (date: Date | null) => void;
  setPendingFilters: (filters: PendingOrdersFilters) => void;
  
  // Drag & Drop
  handleDragStart: (order: Order) => void;
  handleDragEnd: () => void;
  draggingOrder: Order | null;
  
  // Asignación
  openAssignmentModal: (order: Order | ScheduledOrder, date?: Date) => void;
  closeAssignmentModal: () => void;
  confirmAssignment: (data: AssignmentPayload) => void;
  requestSuggestions: (orderId: string, date: Date) => void;
  validateHOS: (driverId: string, date: Date, duration: number) => void;
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useScheduling(): UseSchedulingReturn {
  // ----------------------------------------
  // ESTADO DE CARGA
  // ----------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // ----------------------------------------
  // ESTADO DEL CALENDARIO
  // ----------------------------------------
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // ----------------------------------------
  // DATOS PRINCIPALES
  // ----------------------------------------
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
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
  // ESTADO DE ASIGNACIÓN
  // ----------------------------------------
  const [suggestions, setSuggestions] = useState<ResourceSuggestion[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [hosValidation, setHOSValidation] = useState<HOSValidationResult | null>(null);
  
  // ----------------------------------------
  // FILTROS
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
  
  // ----------------------------------------
  // CONFIGURACIÓN (inmutable en esta versión)
  // ----------------------------------------
  const config = useMemo(() => DEFAULT_SCHEDULING_CONFIG, []);

  // ----------------------------------------
  // DATOS ESTÁTICOS
  // ----------------------------------------
  const vehicles = useMemo(() => MOCK_VEHICLES, []);
  const drivers = useMemo(() => MOCK_DRIVERS, []);

  // ----------------------------------------
  // DATOS DEL CALENDARIO (derivado)
  // ----------------------------------------
  const calendarData = useMemo(() => {
    return schedulingService.generateCalendarDays(currentMonth, scheduledOrders);
  }, [currentMonth, scheduledOrders]);

  // ----------------------------------------
  // CARGA INICIAL DE DATOS
  // ----------------------------------------
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setIsLoading(true);
      
      try {
        const [ordersData, kpisData] = await Promise.all([
          schedulingService.getPendingOrders(),
          schedulingService.getKPIs(),
        ]);
        
        if (isMounted) {
          setPendingOrders(ordersData);
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

  // ----------------------------------------
  // RETURN
  // ----------------------------------------
  return {
    // Datos
    pendingOrders,
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
    
    // Estado UI
    currentMonth,
    calendarView,
    selectedDate,
    isLoading,
    isScheduling,
    isLoadingSuggestions,
    
    // Modal
    assignmentModal,
    
    // Filtros
    pendingFilters,
    
    // Acciones
    setCurrentMonth,
    setCalendarView,
    setSelectedDate,
    setPendingFilters,
    
    // Drag & Drop
    handleDragStart,
    handleDragEnd,
    draggingOrder,
    
    // Asignación
    openAssignmentModal,
    closeAssignmentModal,
    confirmAssignment: wrappedConfirmAssignment,
    requestSuggestions: wrappedRequestSuggestions,
    validateHOS: wrappedValidateHOS,
  };
}
