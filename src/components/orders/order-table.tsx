/**
 * @fileoverview Tabla de órdenes para vista densa
 * @module components/orders/OrderTable
 * @description Tabla de datos optimizada para operaciones logísticas.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

'use client';

import { memo } from 'react';
import {
  MoreHorizontal,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import type { Order } from '@/types/order';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG, PRIORITY_CONFIG } from './order-card';

// ============================================
// PROPS
// ============================================

interface OrderTableProps {
  orders: Order[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll?: (checked: boolean) => void;
  allSelected?: boolean;
  onClick: (order: Order) => void;
  className?: string;
}

// ============================================
// UTILS
// ============================================

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// ============================================
// COMPONENTE
// ============================================

function OrderTableComponent({
  orders,
  selectedIds,
  onSelect,
  onSelectAll,
  allSelected,
  onClick,
  className,
}: OrderTableProps) {
  return (
    <div className={cn('rounded-md border bg-card', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={allSelected ? true : selectedIds.size > 0 ? 'indeterminate' : false}
                onCheckedChange={(checked) => onSelectAll?.(!!checked)}
              />
            </TableHead>
            <TableHead className="w-[120px]">Orden</TableHead>
            <TableHead className="min-w-[140px]">Cliente</TableHead>
            <TableHead className="min-w-[200px]">Ruta</TableHead>
            <TableHead className="w-[120px]">Estado</TableHead>
            <TableHead className="w-[100px]">Prioridad</TableHead>
            <TableHead className="w-[140px]">Conductor/Vehículo</TableHead>
            <TableHead className="w-[140px] text-right">Creación</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status];
            const priorityConfig = PRIORITY_CONFIG[order.priority];
            const origin = order.milestones[0];
            const destination = order.milestones[order.milestones.length - 1];
            const isSelected = selectedIds.has(order.id);

            return (
              <TableRow 
                key={order.id}
                data-state={isSelected ? 'selected' : undefined}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onClick(order)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => onSelect(order.id)}
                  />
                </TableCell>
                
                {/* ID de Orden */}
                <TableCell className="font-medium font-mono">
                  {order.orderNumber}
                </TableCell>
                
                {/* Cliente */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="truncate font-medium text-sm">
                      {order.customer?.name ?? 'Sin cliente'}
                    </span>
                    {order.customer?.code && (
                      <span className="text-xs text-muted-foreground">
                        {order.customer.code}
                      </span>
                    )}
                  </div>
                </TableCell>
                
                {/* Ruta - Compacta */}
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      <span className="truncate max-w-[150px]">{origin?.geofenceName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span className="truncate max-w-[150px]">{destination?.geofenceName}</span>
                    </div>
                  </div>
                </TableCell>
                
                {/* Estado */}
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'whitespace-nowrap font-normal',
                      statusConfig.className.replace('bg-', 'border-').replace('text-', 'text-foreground ')
                    )}
                  >
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                
                {/* Prioridad */}
                <TableCell>
                  <div className={cn('flex items-center gap-1.5 text-xs font-medium', priorityConfig.className)}>
                    {order.priority === 'urgent' && <AlertTriangle className="w-3 h-3" />}
                    {priorityConfig.label}
                  </div>
                </TableCell>
                
                {/* Recursos */}
                <TableCell>
                  <div className="flex flex-col text-xs text-muted-foreground">
                    {order.driver && (
                      <span className="truncate">{order.driver.fullName}</span>
                    )}
                    {order.vehicle && (
                      <span className="truncate opacity-80">{order.vehicle.plate}</span>
                    )}
                    {!order.driver && !order.vehicle && (
                      <span className="italic opacity-50">Sin asignar</span>
                    )}
                  </div>
                </TableCell>
                
                {/* Fecha */}
                <TableCell className="text-right text-xs text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onClick(order)}>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar orden</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export const OrderTable = memo(OrderTableComponent);
