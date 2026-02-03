/**
 * @fileoverview Layout principal del módulo de programación
 * @module components/scheduling/SchedulingLayout
 * @description Orquesta todos los componentes del módulo de
 * programación con soporte para calendar y timeline views.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

'use client';

import { memo, useState, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Settings2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { Order } from '@/types/order';
import type { ScheduledOrder, CalendarViewType } from '@/types/scheduling';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { SchedulingSidebar } from './scheduling-sidebar';
import { SchedulingCalendar } from './scheduling-calendar';
import { SchedulingTimeline } from './scheduling-timeline';
import { SchedulingKPICompact } from './scheduling-kpi-bar';
import { AssignmentModal } from './assignment-modal';
import { useScheduling } from '@/hooks/use-scheduling';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

type MainView = 'calendar' | 'timeline';

interface SchedulingLayoutProps {
  /** Clase adicional */
  className?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const SchedulingLayout = memo(function SchedulingLayout({
  className,
}: SchedulingLayoutProps) {
  // Estado de vistas
  const [mainView, setMainView] = useState<MainView>('calendar');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hook principal de scheduling
  const {
    // Datos
    pendingOrders,
    calendarData,
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
    confirmAssignment,
    requestSuggestions,
    validateHOS,
  } = useScheduling();

  // ----------------------------------------
  // HANDLERS
  // ----------------------------------------
  const handleOrderDrop = useCallback((order: Order, date: Date) => {
    openAssignmentModal(order, date);
  }, [openAssignmentModal]);

  const handleTimelineOrderDrop = useCallback((order: Order, resourceId: string, hour: number) => {
    const date = new Date(currentMonth);
    date.setHours(hour, 0, 0, 0);
    
    // Determinar si es vehículo o conductor
    const timeline = timelines.find(t => t.resourceId === resourceId);
    if (timeline) {
      openAssignmentModal(order, date);
    }
  }, [currentMonth, timelines, openAssignmentModal]);

  const handleOrderClick = useCallback((order: ScheduledOrder) => {
    openAssignmentModal(order);
  }, [openAssignmentModal]);

  const handleAddOrder = useCallback((date: Date) => {
    setSelectedDate(date);
    // Podría abrir un selector de órdenes pendientes
  }, [setSelectedDate]);

  const handleTimeSlotClick = useCallback((resourceId: string, hour: number) => {
    const date = new Date(currentMonth);
    date.setHours(hour, 0, 0, 0);
    setSelectedDate(date);
  }, [currentMonth, setSelectedDate]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex flex-col h-full bg-background',
          isFullscreen && 'fixed inset-0 z-50',
          className
        )}
      >
        {/* Header con KPIs y controles */}
        <div className="flex items-center justify-between border-b bg-card">
          {/* KPIs */}
          <SchedulingKPICompact kpis={kpis} isLoading={isLoading} />

          {/* Controles */}
          <div className="flex items-center gap-2 px-4">
            {/* Selector de vista principal */}
            <Tabs
              value={mainView}
              onValueChange={(v) => setMainView(v as MainView)}
            >
              <TabsList className="h-8">
                <TabsTrigger value="calendar" className="h-7 px-3 text-xs gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Calendario
                </TabsTrigger>
                <TabsTrigger value="timeline" className="h-7 px-3 text-xs gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Timeline
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Botones de acción */}
            <div className="flex items-center gap-1 ml-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Configuración
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar de órdenes pendientes */}
          <SchedulingSidebar
            orders={pendingOrders}
            isLoading={isLoading}
            filters={pendingFilters}
            onFiltersChange={setPendingFilters}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onOrderClick={(order) => openAssignmentModal(order)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          />

          {/* Vista principal */}
          <div className="flex-1 p-4 overflow-hidden">
            {mainView === 'calendar' ? (
              <SchedulingCalendar
                calendarData={calendarData}
                currentMonth={currentMonth}
                view={calendarView}
                selectedDate={selectedDate}
                draggingOrder={draggingOrder}
                isLoading={isLoading}
                onMonthChange={setCurrentMonth}
                onViewChange={setCalendarView}
                onDateSelect={setSelectedDate}
                onOrderDrop={handleOrderDrop}
                onOrderClick={handleOrderClick}
                onAddOrder={handleAddOrder}
                className="h-full"
              />
            ) : (
              <SchedulingTimeline
                timelines={timelines}
                currentDate={selectedDate || currentMonth}
                isLoading={isLoading}
                onDateChange={setCurrentMonth}
                onTimeSlotClick={handleTimeSlotClick}
                onOrderDrop={handleTimelineOrderDrop}
                onOrderClick={handleOrderClick}
                className="h-full"
              />
            )}
          </div>
        </div>

        {/* Modal de asignación */}
        <AssignmentModal
          open={assignmentModal.isOpen}
          order={assignmentModal.order}
          proposedDate={assignmentModal.proposedDate}
          vehicles={vehicles}
          drivers={drivers}
          suggestions={suggestions}
          conflicts={conflicts}
          hosValidation={hosValidation}
          featureFlags={config}
          isLoading={isScheduling}
          isLoadingSuggestions={isLoadingSuggestions}
          onClose={closeAssignmentModal}
          onConfirm={confirmAssignment}
          onRequestSuggestions={requestSuggestions}
          onValidateHOS={validateHOS}
        />
      </div>
    </TooltipProvider>
  );
});
