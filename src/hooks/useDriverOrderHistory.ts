/**
 * @fileoverview Hook para gestionar el historial de órdenes de un conductor
 * @module hooks/useDriverOrderHistory
 * @description Conecta la información del conductor con su historial de órdenes,
 * proporcionando datos estadísticos y filtrado temporal.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { orderService } from '@/services/orders';
import type { Order, OrderStatus } from '@/types/order';

/**
 * Estadísticas del historial de órdenes del conductor
 */
export interface DriverOrderStats {
  /** Total de órdenes asignadas */
  total: number;
  /** Órdenes completadas exitosamente */
  completed: number;
  /** Órdenes canceladas */
  cancelled: number;
  /** Órdenes en progreso actualmente */
  inProgress: number;
  /** Porcentaje de entregas a tiempo */
  onTimeDeliveryRate: number;
  /** Tiempo promedio de entrega en horas */
  avgDeliveryTime: number;
}

/**
 * Opciones de filtrado para el historial
 */
export interface DriverOrderHistoryFilters {
  /** Filtrar por estados específicos */
  status?: OrderStatus[];
  /** Fecha de inicio del rango */
  startDate?: string;
  /** Fecha de fin del rango */
  endDate?: string;
  /** Límite de resultados */
  limit?: number;
}

/**
 * Estado del hook
 */
interface UseDriverOrderHistoryState {
  orders: Order[];
  stats: DriverOrderStats;
  isLoading: boolean;
  error: string | null;
}

/**
 * Resultado del hook useDriverOrderHistory
 */
interface UseDriverOrderHistoryReturn extends UseDriverOrderHistoryState {
  /** Recargar datos */
  refresh: () => Promise<void>;
  /** Aplicar filtros */
  applyFilters: (filters: DriverOrderHistoryFilters) => void;
  /** Filtros actuales */
  filters: DriverOrderHistoryFilters;
  /** Órdenes completadas */
  completedOrders: Order[];
  /** Órdenes en progreso */
  activeOrders: Order[];
  /** Última orden */
  lastOrder: Order | null;
  /** Tiene órdenes activas */
  hasActiveOrders: boolean;
  /** Tasa de éxito (completadas / total - canceladas) */
  successRate: number;
}

const defaultStats: DriverOrderStats = {
  total: 0,
  completed: 0,
  cancelled: 0,
  inProgress: 0,
  onTimeDeliveryRate: 100,
  avgDeliveryTime: 0,
};

/**
 * Hook para gestionar el historial de órdenes de un conductor
 * 
 * @param driverId - ID del conductor
 * @param initialFilters - Filtros iniciales opcionales
 * @returns Estado y funciones para gestionar el historial
 * 
 * @example
 * ```tsx
 * function DriverOrderHistory({ driverId }: { driverId: string }) {
 *   const {
 *     orders,
 *     stats,
 *     isLoading,
 *     completedOrders,
 *     activeOrders,
 *     successRate,
 *     applyFilters
 *   } = useDriverOrderHistory(driverId);
 * 
 *   if (isLoading) return <Spinner />;
 * 
 *   return (
 *     <div>
 *       <p>Órdenes totales: {stats.total}</p>
 *       <p>Tasa de éxito: {successRate}%</p>
 *       <p>Entregas a tiempo: {stats.onTimeDeliveryRate}%</p>
 *       <OrderList orders={orders} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useDriverOrderHistory(
  driverId: string | undefined,
  initialFilters: DriverOrderHistoryFilters = {}
): UseDriverOrderHistoryReturn {
  const [state, setState] = useState<UseDriverOrderHistoryState>({
    orders: [],
    stats: defaultStats,
    isLoading: false,
    error: null,
  });

  const [filters, setFilters] = useState<DriverOrderHistoryFilters>(initialFilters);

  /**
   * Carga el historial de órdenes del conductor
   */
  const loadOrderHistory = useCallback(async () => {
    if (!driverId) {
      setState(prev => ({
        ...prev,
        orders: [],
        stats: defaultStats,
        isLoading: false,
        error: null,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await orderService.getOrdersByDriver(driverId, filters);
      
      setState({
        orders: result.orders,
        stats: result.stats,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar historial';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      console.error('[useDriverOrderHistory] Error:', err);
    }
  }, [driverId, filters]);

  // Cargar datos al montar o cuando cambien las dependencias
  useEffect(() => {
    loadOrderHistory();
  }, [loadOrderHistory]);

  /**
   * Aplica nuevos filtros
   */
  const applyFilters = useCallback((newFilters: DriverOrderHistoryFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Recarga los datos
   */
  const refresh = useCallback(async () => {
    await loadOrderHistory();
  }, [loadOrderHistory]);

  // Órdenes completadas
  const completedOrders = useMemo(() => {
    return state.orders.filter(o => o.status === 'completed' || o.status === 'closed');
  }, [state.orders]);

  // Órdenes activas (en progreso)
  const activeOrders = useMemo(() => {
    return state.orders.filter(o => 
      o.status === 'in_transit' || 
      o.status === 'at_milestone' || 
      o.status === 'assigned' ||
      o.status === 'pending'
    );
  }, [state.orders]);

  // Última orden
  const lastOrder = useMemo(() => {
    if (state.orders.length === 0) return null;
    return [...state.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [state.orders]);

  // Tiene órdenes activas
  const hasActiveOrders = useMemo(() => {
    return activeOrders.length > 0;
  }, [activeOrders]);

  // Tasa de éxito (completadas / (total - canceladas))
  const successRate = useMemo(() => {
    const { total, completed, cancelled } = state.stats;
    const relevantTotal = total - cancelled;
    if (relevantTotal === 0) return 100;
    return Math.round((completed / relevantTotal) * 100 * 10) / 10;
  }, [state.stats]);

  return {
    orders: state.orders,
    stats: state.stats,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
    applyFilters,
    filters,
    completedOrders,
    activeOrders,
    lastOrder,
    hasActiveOrders,
    successRate,
  };
}

export default useDriverOrderHistory;
