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
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  TrendingUp,
  TrendingDown,
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

/**
 * Props para una card individual de stat
 */
interface StatCardProps {
  /** Título */
  title: string;
  /** Valor numérico */
  value: number;
  /** Icono */
  icon: typeof Package;
  /** Color del icono */
  iconClassName: string;
  /** Color de fondo */
  bgClassName: string;
  /** Si está activo */
  isActive?: boolean;
  /** Callback al click */
  onClick?: () => void;
  /** Tendencia (positivo = up, negativo = down) */
  trend?: number;
}

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Configuración de cards por estado
 */
const STATUS_CARD_CONFIG: Record<OrderStatus, {
  title: string;
  icon: typeof Package;
  iconClassName: string;
  bgClassName: string;
}> = {
  draft: {
    title: 'Borradores',
    icon: FileText,
    iconClassName: 'text-gray-500',
    bgClassName: 'bg-gray-100 dark:bg-gray-800',
  },
  pending: {
    title: 'Pendientes',
    icon: Clock,
    iconClassName: 'text-yellow-500',
    bgClassName: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  assigned: {
    title: 'Asignadas',
    icon: Package,
    iconClassName: 'text-blue-500',
    bgClassName: 'bg-blue-50 dark:bg-blue-900/20',
  },
  in_transit: {
    title: 'En tránsito',
    icon: Truck,
    iconClassName: 'text-indigo-500',
    bgClassName: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  at_milestone: {
    title: 'En hito',
    icon: Package,
    iconClassName: 'text-purple-500',
    bgClassName: 'bg-purple-50 dark:bg-purple-900/20',
  },
  delayed: {
    title: 'Retrasadas',
    icon: AlertTriangle,
    iconClassName: 'text-orange-500',
    bgClassName: 'bg-orange-50 dark:bg-orange-900/20',
  },
  completed: {
    title: 'Completadas',
    icon: CheckCircle,
    iconClassName: 'text-green-500',
    bgClassName: 'bg-green-50 dark:bg-green-900/20',
  },
  closed: {
    title: 'Cerradas',
    icon: CheckCircle,
    iconClassName: 'text-emerald-500',
    bgClassName: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  cancelled: {
    title: 'Canceladas',
    icon: XCircle,
    iconClassName: 'text-red-500',
    bgClassName: 'bg-red-50 dark:bg-red-900/20',
  },
};

// ============================================
// COMPONENTE STAT CARD
// ============================================

/**
 * Card individual de estadística
 */
function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  bgClassName,
  isActive,
  onClick,
  trend,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isActive && 'ring-2 ring-primary',
        onClick && 'hover:scale-[1.02]',
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">{value.toLocaleString()}</span>
              {trend !== undefined && trend !== 0 && (
                <span
                  className={cn(
                    'flex items-center text-xs',
                    trend > 0 ? 'text-green-500' : 'text-red-500',
                  )}
                >
                  {trend > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
          </div>
          <div className={cn('p-3 rounded-full', bgClassName)}>
            <Icon className={cn('w-6 h-6', iconClassName)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Grid de cards de estadísticas por estado
 * @param props - Props del componente
 * @returns Componente de estadísticas
 */
function OrderStatsCardsComponent({
  statusCounts,
  onStatusClick,
  activeStatus,
  className,
}: OrderStatsCardsProps) {
  // Calcular totales
  const totals = useMemo(() => {
    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const active = statusCounts.in_transit + statusCounts.at_milestone + statusCounts.assigned;
    const attention = statusCounts.delayed + statusCounts.pending;
    return { total, active, attention };
  }, [statusCounts]);

  // Estados a mostrar (los más relevantes primero)
  const primaryStatuses: OrderStatus[] = ['pending', 'in_transit', 'delayed', 'completed'];
  const secondaryStatuses: OrderStatus[] = ['assigned', 'at_milestone', 'closed', 'cancelled', 'draft'];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total órdenes</p>
                <span className="text-3xl font-bold">{totals.total.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Package className="w-8 h-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En curso</p>
                <span className="text-3xl font-bold text-indigo-500">
                  {totals.active.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/20">
                <Truck className="w-8 h-8 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requieren atención</p>
                <span className="text-3xl font-bold text-orange-500">
                  {totals.attention.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estados principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {primaryStatuses.map((status) => {
          const config = STATUS_CARD_CONFIG[status];
          return (
            <StatCard
              key={status}
              title={config.title}
              value={statusCounts[status]}
              icon={config.icon}
              iconClassName={config.iconClassName}
              bgClassName={config.bgClassName}
              isActive={activeStatus === status}
              onClick={() => onStatusClick?.(status)}
            />
          );
        })}
      </div>

      {/* Estados secundarios (colapsables en mobile) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {secondaryStatuses.map((status) => {
          const config = STATUS_CARD_CONFIG[status];
          return (
            <Card
              key={status}
              className={cn(
                'cursor-pointer transition-all hover:bg-muted/50',
                activeStatus === status && 'ring-2 ring-primary',
              )}
              onClick={() => onStatusClick?.(status)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <config.icon className={cn('w-4 h-4', config.iconClassName)} />
                  <span className="text-sm">{config.title}</span>
                  <span className="ml-auto font-semibold">{statusCounts[status]}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
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
