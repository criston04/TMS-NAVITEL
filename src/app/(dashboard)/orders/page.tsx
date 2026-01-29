/**
 * @fileoverview Página principal de órdenes
 * @module app/(dashboard)/orders/page
 * @description Lista de órdenes con filtros, estadísticas y acciones masivas.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Upload,
  Download,
  RefreshCw,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types/order';

// Hooks
import { useOrders, useOrderFilters } from '@/hooks/useOrders';
import { useOrderExport, useBulkActions } from '@/hooks/useOrderImportExport';

// Componentes
import { PageWrapper } from '@/components/page-wrapper';
import { Button } from '@/components/ui/button';
import {
  OrderStatsCards,
  OrderFilters,
  OrderList,
  OrderBulkActions,
} from '@/components/orders';

// ============================================
// TIPOS
// ============================================

/**
 * Vista disponible
 */
type ViewMode = 'list' | 'grid';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Página principal del módulo de órdenes
 * @returns Página de órdenes
 */
export default function OrdersPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Hook de filtros
  const {
    filters,
    setFilters,
    clearFilters,
    activeFilterCount,
    filterOptions,
    isLoadingOptions,
  } = useOrderFilters();

  // Hook principal de órdenes
  const {
    orders,
    total,
    page,
    totalPages,
    statusCounts,
    isLoading,
    error,
    setPage,
    refresh,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
  } = useOrders({
    initialFilters: filters,
    pageSize: 10,
    autoFetch: true,
  });

  // Hook de exportación
  const { exportOrders, isExporting } = useOrderExport();

  // Hook de acciones masivas
  const { state: bulkState, executeAction } = useBulkActions();

  // Sincronizar filtros con el hook de órdenes
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, [setFilters]);

  // Navegar a detalle de orden
  const handleOrderClick = useCallback((order: Order) => {
    router.push(`/orders/${order.id}`);
  }, [router]);

  // Navegar a nueva orden
  const handleNewOrder = useCallback(() => {
    router.push('/orders/new');
  }, [router]);

  // Navegar a importación
  const handleImport = useCallback(() => {
    router.push('/orders/import');
  }, [router]);

  // Exportar seleccionadas
  const handleExport = useCallback(async () => {
    const selectedOrders = orders.filter(o => selectedIds.has(o.id));
    if (selectedOrders.length > 0) {
      await exportOrders(selectedOrders);
    }
  }, [orders, selectedIds, exportOrders]);

  // Filtrar por estado desde las cards
  const handleStatusClick = useCallback((status: OrderStatus) => {
    const currentStatus = filters.status;
    const currentArray = Array.isArray(currentStatus) ? currentStatus : currentStatus ? [currentStatus] : [];
    
    if (currentArray.includes(status)) {
      // Quitar el filtro si ya está activo
      const newArray = currentArray.filter(s => s !== status);
      setFilters({
        ...filters,
        status: newArray.length > 0 ? newArray : undefined,
      });
    } else {
      // Agregar el filtro
      setFilters({
        ...filters,
        status: [status],
      });
    }
  }, [filters, setFilters]);

  // Ejecutar acción masiva
  const handleBulkAction = useCallback(async (action: 'send_to_carrier' | 'send_to_gps' | 'export' | 'delete') => {
    if (action === 'export') {
      await handleExport();
    } else {
      await executeAction(action, Array.from(selectedIds));
      if (action === 'delete') {
        clearSelection();
        await refresh();
      }
    }
  }, [selectedIds, executeAction, handleExport, clearSelection, refresh]);

  // Estado activo seleccionado (para highlight en cards)
  const activeStatus = useMemo(() => {
    const currentStatus = filters.status;
    const currentArray = Array.isArray(currentStatus) ? currentStatus : currentStatus ? [currentStatus] : [];
    if (currentArray.length === 1) {
      return currentArray[0];
    }
    return undefined;
  }, [filters.status]);

  // Resultados para el componente de bulk actions
  const bulkResults = useMemo(() => {
    if (bulkState.results.success.length > 0 || bulkState.results.failed.length > 0) {
      return {
        success: bulkState.results.success.length,
        failed: bulkState.results.failed.length,
      };
    }
    return undefined;
  }, [bulkState.results]);

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Órdenes</h1>
            <p className="text-muted-foreground">
              Gestiona las órdenes de transporte
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <Button
              variant="outline"
              size="icon"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Importar */}
            <Button variant="outline" className="gap-2" onClick={handleImport}>
              <Upload className="w-4 h-4" />
              Importar
            </Button>

            {/* Exportar todas */}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => exportOrders(orders)}
              disabled={isExporting || orders.length === 0}
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>

            {/* Nueva orden */}
            <Button className="gap-2" onClick={handleNewOrder}>
              <Plus className="w-4 h-4" />
              Nueva orden
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <OrderStatsCards
          statusCounts={statusCounts}
          onStatusClick={handleStatusClick}
          activeStatus={activeStatus}
        />

        {/* Filtros */}
        <OrderFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={clearFilters}
          filterOptions={filterOptions}
          activeFilterCount={activeFilterCount}
          isLoading={isLoadingOptions}
        />

        {/* Lista de órdenes */}
        <OrderList
          orders={orders}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          total={total}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onPageChange={setPage}
          onOrderClick={handleOrderClick}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Barra de acciones masivas */}
        <OrderBulkActions
          selectedCount={selectedIds.size}
          onAction={handleBulkAction}
          onClearSelection={clearSelection}
          isExecuting={bulkState.isExecuting}
          currentAction={bulkState.action === 'change_status' ? null : bulkState.action}
          progress={bulkState.progress}
          results={bulkResults}
        />

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-4">
            <p className="font-medium">Error al cargar órdenes</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
