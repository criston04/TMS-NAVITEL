/**
 * @fileoverview Componentes de estadísticas de órdenes
 * @module components/orders/OrderStats
 * @description Cards y widgets de estadísticas de órdenes.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

'use client';

import { memo, useMemo } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import type { OrderStatus } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

/**
 * Props del componente OrderStatsCards
 */
interface OrderStatsCardsProps {
  /** Contadores por estado */
  statusCounts: Record<OrderStatus, number>;
  /** Callback al hacer click en un estado */
  onStatusClick?: (status: OrderStatus) => void;
  /** Estado activo/seleccionado */
  activeStatus?: OrderStatus;
  /** Clase adicional */
  className?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Grid de cards de estadísticas esenciales
 * @param props - Props del componente
 * @returns Componente de estadísticas simplificado
 */
function OrderStatsCardsComponent({
  statusCounts,
  onStatusClick,
  activeStatus,
  className,
}: Readonly<OrderStatsCardsProps>) {
  // Calcular totales
  const totals = useMemo(() => {
    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const inProgress = statusCounts.in_transit + statusCounts.at_milestone;
    return { total, inProgress };
  }, [statusCounts]);

  // Solo 4 cards esenciales
  const essentialStats = [
    {
      key: 'total',
      title: 'Total',
      value: totals.total,
      icon: Package,
      iconClassName: 'text-primary',
      bgClassName: 'bg-primary/10',
      status: undefined as OrderStatus | undefined,
    },
    {
      key: 'in_transit',
      title: 'En Tránsito',
      value: totals.inProgress,
      icon: Truck,
      iconClassName: 'text-blue-500',
      bgClassName: 'bg-blue-50 dark:bg-blue-900/20',
      status: 'in_transit' as OrderStatus,
    },
    {
      key: 'delayed',
      title: 'Retrasadas',
      value: statusCounts.delayed,
      icon: AlertTriangle,
      iconClassName: 'text-orange-500',
      bgClassName: 'bg-orange-50 dark:bg-orange-900/20',
      status: 'delayed' as OrderStatus,
    },
    {
      key: 'completed',
      title: 'Completadas',
      value: statusCounts.completed + statusCounts.closed,
      icon: CheckCircle,
      iconClassName: 'text-green-500',
      bgClassName: 'bg-green-50 dark:bg-green-900/20',
      status: 'completed' as OrderStatus,
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {essentialStats.map((stat) => (
        <Card
          key={stat.key}
          className={cn(
            'transition-all duration-200 hover:shadow-md',
            stat.status && 'cursor-pointer hover:scale-[1.01]',
            activeStatus === stat.status && 'ring-2 ring-primary',
          )}
          onClick={() => stat.status && onStatusClick?.(stat.status)}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', stat.bgClassName)}>
                <stat.icon className={cn('w-5 h-5', stat.iconClassName)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                <span className="text-xl font-bold">{stat.value.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Exportación memoizada
 */
export const OrderStatsCards = memo(OrderStatsCardsComponent);

// ============================================
// COMPONENTE MINI STATS
// ============================================

/**
 * Props del componente MiniStats
 */
interface OrderMiniStatsProps {
  /** Contadores por estado */
  statusCounts: Record<OrderStatus, number>;
  /** Clase adicional */
  className?: string;
}

/**
 * Versión compacta de estadísticas para header
 */
function OrderMiniStatsComponent({ statusCounts, className }: OrderMiniStatsProps) {
  const stats = [
    { status: 'pending' as OrderStatus, label: 'Pendientes', color: 'text-yellow-500' },
    { status: 'in_transit' as OrderStatus, label: 'En tránsito', color: 'text-indigo-500' },
    { status: 'delayed' as OrderStatus, label: 'Retrasadas', color: 'text-orange-500' },
  ];

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {stats.map(({ status, label, color }) => (
        <div key={status} className="flex items-center gap-1.5">
          <span className={cn('text-lg font-bold', color)}>
            {statusCounts[status]}
          </span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Exportación memoizada
 */
export const OrderMiniStats = memo(OrderMiniStatsComponent);
