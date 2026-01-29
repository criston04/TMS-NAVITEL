/**
 * @fileoverview Componente de filtros para órdenes
 * @module components/orders/OrderFilters
 * @description Panel de filtros avanzados para la lista de órdenes.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

'use client';

import { memo, useState, useCallback } from 'react';
import {
  Filter,
  X,
  Search,
  Calendar,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import type { OrderFilters as OrderFiltersType, OrderStatus } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

/**
 * Props del componente OrderFilters
 */
interface OrderFiltersProps {
  /** Filtros actuales */
  filters: OrderFiltersType;
  /** Callback al cambiar filtros */
  onFiltersChange: (filters: OrderFiltersType) => void;
  /** Callback al limpiar filtros */
  onClear: () => void;
  /** Opciones de filtros */
  filterOptions: {
    customers: Array<{ id: string; name: string; code: string }>;
    carriers: Array<{ id: string; name: string }>;
    gpsOperators: Array<{ id: string; name: string }>;
    statuses: Array<{ value: string; label: string }>;
    priorities: Array<{ value: string; label: string }>;
  };
  /** Número de filtros activos */
  activeFilterCount: number;
  /** Está cargando opciones */
  isLoading?: boolean;
  /** Clase adicional */
  className?: string;
}

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Colores de estados para badges
 */
const STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-indigo-100 text-indigo-700',
  at_milestone: 'bg-purple-100 text-purple-700',
  delayed: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  closed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ============================================
// COMPONENTE
// ============================================

/**
 * Panel de filtros para órdenes
 * @param props - Props del componente
 * @returns Componente de filtros
 */
function OrderFiltersComponent({
  filters,
  onFiltersChange,
  onClear,
  filterOptions,
  activeFilterCount,
  isLoading = false,
  className,
}: OrderFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  /**
   * Actualiza un filtro específico
   */
  const updateFilter = useCallback(<K extends keyof OrderFiltersType>(
    key: K,
    value: OrderFiltersType[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }, [filters, onFiltersChange]);

  /**
   * Maneja el cambio de búsqueda
   */
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  /**
   * Aplica la búsqueda
   */
  const applySearch = useCallback(() => {
    updateFilter('search', searchTerm || undefined);
  }, [searchTerm, updateFilter]);

  /**
   * Maneja Enter en el campo de búsqueda
   */
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applySearch();
    }
  }, [applySearch]);

  /**
   * Toggle de estado en los filtros
   */
  const toggleStatus = useCallback((status: OrderStatus) => {
    const currentStatuses = Array.isArray(filters.status) ? filters.status : (filters.status ? [filters.status] : []);
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s: OrderStatus) => s !== status)
      : [...currentStatuses, status];
    
    updateFilter('status', newStatuses.length > 0 ? newStatuses : undefined);
  }, [filters.status, updateFilter]);

  /**
   * Obtiene label de estado
   */
  const getStatusLabel = (status: OrderStatus): string => {
    return filterOptions.statuses.find(s => s.value === status)?.label || status;
  };

  /**
   * Obtiene los estados actuales como array
   */
  const currentStatusArray = Array.isArray(filters.status) ? filters.status : (filters.status ? [filters.status] : []);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Barra principal de filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar orden, cliente..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={applySearch}
            className="pl-9 pr-4"
          />
        </div>

        {/* Filtro de estado */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Estado
              {currentStatusArray.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {currentStatusArray.length}
                </Badge>
              )}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {filterOptions.statuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status.value}
                checked={currentStatusArray.includes(status.value as OrderStatus)}
                onCheckedChange={() => toggleStatus(status.value as OrderStatus)}
              >
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs mr-2',
                  STATUS_COLORS[status.value as OrderStatus]
                )}>
                  {status.label}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => updateFilter('status', undefined)}>
              Limpiar selección
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filtro de prioridad */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Prioridad
              {filters.priority && (
                <Badge variant="secondary" className="ml-1">1</Badge>
              )}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {filterOptions.priorities.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority.value}
                checked={filters.priority === priority.value}
                onCheckedChange={(checked) => 
                  updateFilter('priority', checked ? priority.value as OrderFiltersType['priority'] : undefined)
                }
              >
                {priority.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filtro de cliente */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Cliente
              {filters.customerId && (
                <Badge variant="secondary" className="ml-1">1</Badge>
              )}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 max-h-64 overflow-y-auto">
            {isLoading ? (
              <DropdownMenuItem disabled>Cargando...</DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => updateFilter('customerId', undefined)}>
                  Todos los clientes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {filterOptions.customers.map((customer) => (
                  <DropdownMenuCheckboxItem
                    key={customer.id}
                    checked={filters.customerId === customer.id}
                    onCheckedChange={(checked) => 
                      updateFilter('customerId', checked ? customer.id : undefined)
                    }
                  >
                    <span className="truncate">{customer.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {customer.code}
                    </span>
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Botón de más filtros */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Más filtros
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </Button>

        {/* Botón limpiar */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={onClear} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Panel expandido de filtros */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          {/* Filtro de transportista */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Transportista</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="truncate">
                    {filters.carrierId 
                      ? filterOptions.carriers.find(c => c.id === filters.carrierId)?.name 
                      : 'Seleccionar...'}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => updateFilter('carrierId', undefined)}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {filterOptions.carriers.map((carrier) => (
                  <DropdownMenuItem
                    key={carrier.id}
                    onClick={() => updateFilter('carrierId', carrier.id)}
                  >
                    {carrier.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filtro de operador GPS */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Operador GPS</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="truncate">
                    {filters.gpsOperatorId 
                      ? filterOptions.gpsOperators.find(g => g.id === filters.gpsOperatorId)?.name 
                      : 'Seleccionar...'}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => updateFilter('gpsOperatorId', undefined)}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {filterOptions.gpsOperators.map((gps) => (
                  <DropdownMenuItem
                    key={gps.id}
                    onClick={() => updateFilter('gpsOperatorId', gps.id)}
                  >
                    {gps.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Fecha desde */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha desde</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Fecha hasta */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha hasta</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={filters.dateTo ? filters.dateTo.split('T')[0] : ''}
                onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      )}

      {/* Chips de filtros activos */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          
          {currentStatusArray.map((status: OrderStatus) => (
            <Badge
              key={status}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => toggleStatus(status)}
            >
              {getStatusLabel(status)}
              <X className="w-3 h-3" />
            </Badge>
          ))}

          {filters.priority && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilter('priority', undefined)}
            >
              Prioridad: {filterOptions.priorities.find(p => p.value === filters.priority)?.label}
              <X className="w-3 h-3" />
            </Badge>
          )}

          {filters.customerId && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilter('customerId', undefined)}
            >
              Cliente: {filterOptions.customers.find(c => c.id === filters.customerId)?.name}
              <X className="w-3 h-3" />
            </Badge>
          )}

          {filters.search && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => {
                setSearchTerm('');
                updateFilter('search', undefined);
              }}
            >
              Búsqueda: &ldquo;{filters.search}&rdquo;
              <X className="w-3 h-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Exportación memoizada
 */
export const OrderFilters = memo(OrderFiltersComponent);
