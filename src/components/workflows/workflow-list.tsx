/**
 * @fileoverview Lista de workflows con filtros
 * @module components/workflows/workflow-list
 */

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
    <div className={cn('space-y-6', className)}>
      {/* Stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <Badge variant="outline" className="bg-white dark:bg-slate-900">
          Total: <strong className="ml-1">{stats.total}</strong>
        </Badge>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          Activos: <strong className="ml-1">{stats.active}</strong>
        </Badge>
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Inactivos: <strong className="ml-1">{stats.inactive}</strong>
        </Badge>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Borradores: <strong className="ml-1">{stats.draft}</strong>
        </Badge>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-50 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar workflows..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9 bg-white dark:bg-slate-900"
            />
          </div>

          {/* Filtro por estado */}
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as WorkflowStatus | 'all' }))}
          >
            <SelectTrigger className="w-36 bg-white dark:bg-slate-900">
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

          {/* Filtro por tipo */}
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger className="w-40 bg-white dark:bg-slate-900">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {workflowTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    {type.label}
                  </div>
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
              className="h-9 px-2 text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar ({activeFilterCount})
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Create button */}
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Workflow
          </Button>
        </div>
      </div>

      {/* Results count */}
      {filters.search || filters.status !== 'all' || filters.type !== 'all' ? (
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredWorkflows.length} de {workflows.length} workflows
        </p>
      ) : null}

      {/* Workflow grid/list */}
      {filteredWorkflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            No se encontraron workflows
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {activeFilterCount > 0
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando tu primer workflow'}
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
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
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
  );
};
