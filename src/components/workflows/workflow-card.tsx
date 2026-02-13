'use client';

import { type FC, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Play,
  Pause,
  Route,
  Clock,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Workflow } from '@/types/workflow';
import { workflowStatusConfig, workflowTypes } from '@/mocks/master/workflows.mock';

interface WorkflowCardProps {
  workflow: Workflow;
  onEdit: (workflow: Workflow) => void;
  onDuplicate: (workflow: Workflow) => void;
  onDelete: (workflow: Workflow) => void;
  onToggleStatus: (workflow: Workflow) => void;
  className?: string;
}

export const WorkflowCard: FC<WorkflowCardProps> = ({
  workflow,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus,
  className,
}) => {
  const statusConfig = workflowStatusConfig[workflow.status];
  const workflowType = workflowTypes.find(t => 
    workflow.applicableCargoTypes?.some(ct => ct.includes(t.value)) ||
    workflow.code.toLowerCase().includes(t.value.substring(0, 3))
  ) || workflowTypes[5]; // 'other' como fallback

  const handleEdit = useCallback(() => onEdit(workflow), [onEdit, workflow]);
  const handleDuplicate = useCallback(() => onDuplicate(workflow), [onDuplicate, workflow]);
  const handleDelete = useCallback(() => onDelete(workflow), [onDelete, workflow]);
  const handleToggleStatus = useCallback(() => onToggleStatus(workflow), [onToggleStatus, workflow]);

  const totalEstimatedTime = workflow.steps.reduce(
    (acc, step) => acc + (step.estimatedDurationMinutes || 0),
    0
  );

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700',
        'p-5 transition-all duration-200 hover:shadow-lg hover:border-primary/30',
        'cursor-pointer',
        className
      )}
      onClick={handleEdit}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${workflowType.color}15` }}
          >
            <Route className="h-5 w-5" style={{ color: workflowType.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {workflow.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">{workflow.code}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(); }}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(); }}>
              {workflow.status === 'active' ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Desactivar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Activar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-10">
        {workflow.description}
      </p>

      {/* Timeline Preview */}
      <div className="flex items-center gap-1 mb-4 overflow-hidden">
        {workflow.steps.slice(0, 5).map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: step.color || '#6b7280' }}
              title={step.name}
            >
              {index + 1}
            </div>
            {index < Math.min(workflow.steps.length - 1, 4) && (
              <div className="w-4 h-0.5 bg-gray-200 dark:bg-slate-700" />
            )}
          </div>
        ))}
        {workflow.steps.length > 5 && (
          <span className="text-xs text-muted-foreground ml-1">
            +{workflow.steps.length - 5}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{workflow.steps.length} hitos</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDuration(totalEstimatedTime)}</span>
        </div>
        {workflow.applicableCustomerIds && workflow.applicableCustomerIds.length > 0 && (
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{workflow.applicableCustomerIds.length}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-[10px] px-2 py-0.5"
            style={{
              backgroundColor: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            {statusConfig.label}
          </Badge>
          {workflow.isDefault && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              Por defecto
            </Badge>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">
          v{workflow.version}
        </span>
      </div>
    </div>
  );
};
