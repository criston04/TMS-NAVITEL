'use client';

import { type FC, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, LayoutGrid, List, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowCard } from './workflow-card';
import type { Workflow, WorkflowStatus } from '@/types/workflow';
import { workflowTypes, workflowStatusConfig } from '@/mocks/master/workflows.mock';

interface WorkflowListProps {
  workflows: Workflow[];
  onCreateNew: () => void;
  onEdit: (workflow: Workflow) => void;
  onDuplicate: (workflow: Workflow) => void;
  onDelete: (workflow: Workflow) => void;
  onToggleStatus: (workflow: Workflow) => void;
  isLoading?: boolean;
  className?: string;
}

type ViewMode = 'grid' | 'list';

interface ActiveFilters {
  search: string;
  status: WorkflowStatus | 'all';
  type: string;
}

export const WorkflowList: FC<WorkflowListProps> = ({
  workflows,
  onCreateNew,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus,
  isLoading = false,
  className,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<ActiveFilters>({
    search: '',
    status: 'all',
    type: 'all',
  });

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          workflow.name.toLowerCase().includes(searchLower) ||
          workflow.code.toLowerCase().includes(searchLower) ||
          workflow.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro por estado
      if (filters.status !== 'all' && workflow.status !== filters.status) {
        return false;
      }

      // Filtro por tipo (basado en applicableCargoTypes o código)
      if (filters.type !== 'all') {
        const hasType = workflow.applicableCargoTypes?.some(ct =>
          ct.toLowerCase().includes(filters.type.toLowerCase())
        ) || workflow.code.toLowerCase().includes(filters.type.substring(0, 3).toLowerCase());
        if (!hasType) return false;
      }

      return true;
    });
  }, [workflows, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.type !== 'all') count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({ search: '', status: 'all', type: 'all' });
  };

  const stats = useMemo(() => ({
    total: workflows.length,
    active: workflows.filter(w => w.status === 'active').length,
    inactive: workflows.filter(w => w.status === 'inactive').length,
    draft: workflows.filter(w => w.status === 'draft').length,
  }), [workflows]);

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Skeleton para header */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-64 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
        {/* Skeleton para cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Fixed Header Section */}
      <div className="flex-none p-6 pb-4 border-b space-y-4 bg-card/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Workflows</h2>
            <p className="text-sm text-muted-foreground mt-1">Gestión de procesos operativos</p>
          </div>
          
          {/* Stats Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <Badge variant="secondary" className="h-7">
              Total: {stats.total}
            </Badge>
            <div className="h-4 w-px bg-border mx-1" />
            <div className="flex gap-2">
               <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md">
                 <div className="w-1.5 h-1.5 rounded-full bg-current" />
                 Activos: {stats.active}
               </span>
               <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                 <div className="w-1.5 h-1.5 rounded-full bg-current" />
                 Inactivos: {stats.inactive}
               </span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
           <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
            {/* Búsqueda */}
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9 h-9"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar max-w-full">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as WorkflowStatus | 'all' }))}
              >
                <SelectTrigger className="w-[110px] h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(workflowStatusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {workflowTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                       {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 px-2 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View mode toggle */}
            <div className="flex items-center border rounded-md overflow-hidden bg-background">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-none bg-transparent hover:bg-muted data-[variant=secondary]:bg-muted"
                onClick={() => setViewMode('grid')}
                data-variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-none bg-transparent hover:bg-muted data-[variant=secondary]:bg-muted"
                onClick={() => setViewMode('list')}
                data-variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Create button */}
            <Button onClick={onCreateNew} className="h-9 gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Workflow</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-muted/5 p-6">
        {/* Results Info */}
        {(filters.search || filters.status !== 'all' || filters.type !== 'all') && (
          <div className="mb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Resultados: {filteredWorkflows.length}
          </div>
        )}

        {/* Empty State */}
        {filteredWorkflows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl bg-card/50">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron workflows</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              {activeFilterCount > 0
                ? 'Intenta ajustar los filtros de búsqueda para encontrar lo que necesitas.'
                : 'Comienza creando tu primer workflow operacional.'}
            </p>
            {activeFilterCount > 0 ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Workflow
              </Button>
            )}
          </div>
        ) : (
          /* Grid/List */
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col gap-3'
            )}
          >
            {filteredWorkflows.map(workflow => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                className={viewMode === 'list' ? 'flex-row' : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
