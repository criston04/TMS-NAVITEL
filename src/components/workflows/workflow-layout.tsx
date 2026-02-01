/**
 * @fileoverview Layout principal del módulo de Workflows
 * @module components/workflows/WorkflowLayout
 * @description Layout Master-Detail para gestión de workflows
 * @author TMS-NAVITEL
 * @version 1.1.0
 */

'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import type { Workflow, CreateWorkflowDTO } from '@/types/workflow';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { WorkflowList } from './workflow-list';
import { WorkflowDetailPanel } from './workflow-detail-panel';
import { unifiedWorkflowService } from '@/services/workflow.service';
import { cn } from '@/lib/utils';


interface WorkflowLayoutProps {
  className?: string;
}

export const WorkflowLayout = memo(function WorkflowLayout({
  className,
}: WorkflowLayoutProps) {
  const { success, error } = useToast();

  // Data State
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [availableGeofences, setAvailableGeofences] = useState<Array<{
    id: string;
    name: string;
    type: string;
    color: string;
  }>>([]);

  // UI State
  // View Mode: 'list' (grid) or 'detail' (editor)
  const [activeView, setActiveView] = useState<'list' | 'detail'>('list');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation
  const [deleteData, setDeleteData] = useState<{
    isOpen: boolean;
    workflow: Workflow | null;
    loading: boolean;
  }>({
    isOpen: false,
    workflow: null,
    loading: false
  });

  // Navigation Confirmation
  const [navConfirmOpen, setNavConfirmOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // ----------------------------------------
  // DATA LOADING
  // ----------------------------------------
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allWorkflows, customers, geofences] = await Promise.all([
        unifiedWorkflowService.getAll(),
        unifiedWorkflowService.getAvailableCustomers(),
        unifiedWorkflowService.getAvailableGeofences()
      ]);

      setWorkflows(allWorkflows);
      setAvailableCustomers(customers);
      setAvailableGeofences(geofences.map(g => ({
        id: g.id,
        name: g.name,
        type: g.category,
        color: g.color || '#3b82f6'
      })));
    } catch (err) {
      console.error('Error loading workflow data:', err);
      error('Error al cargar datos del módulo');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ----------------------------------------
  // HANDLERS
  // ----------------------------------------

  const handleSelectWorkflow = useCallback((workflow: Workflow) => {
    // Navigate to detail view
    setSelectedWorkflow(workflow);
    setIsEditing(false); // View mode initially
    setActiveView('detail');
  }, []);

  const handleCreateNew = useCallback(() => {
    setSelectedWorkflow(null); // Deseleccionar para modo "nuevo"
    setIsEditing(true); // Activa modo edición vacío = Crear
    setActiveView('detail'); // Navigate to detail view
  }, []);

  const handleEdit = useCallback((workflow?: Workflow) => {
    // If called from List with a specific workflow
    if (workflow) {
      setSelectedWorkflow(workflow);
    }
    setIsEditing(true);
    setActiveView('detail');
  }, []);

  const handleBackToList = useCallback(() => {
    if (isEditing) {
       setPendingNavigation(() => () => {
         setActiveView('list');
         setIsEditing(false);
         setSelectedWorkflow(null);
       });
       setNavConfirmOpen(true);
       return;
    }
    setActiveView('list');
    setIsEditing(false);
    setSelectedWorkflow(null);
  }, [isEditing]);

  const handleCancelEdit = useCallback(() => {
    setPendingNavigation(() => () => {
      // Si hay un workflow seleccionado, volvemos al modo "ver", sino lista
      if (selectedWorkflow) {
        setIsEditing(false);
      } else {
        setActiveView('list');
        setIsEditing(false);
      }
    });
    setNavConfirmOpen(true);
  }, [selectedWorkflow]);

  const handleSave = useCallback(async (data: CreateWorkflowDTO) => {
    setIsSaving(true);
    try {
      if (selectedWorkflow) {
        // Update
        const updated = await unifiedWorkflowService.update(selectedWorkflow.id, data);
        setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
        setSelectedWorkflow(updated);
        success('Workflow actualizado correctamente');
      } else {
        // Create
        const created = await unifiedWorkflowService.create(data);
        setWorkflows(prev => [created, ...prev]);
        setSelectedWorkflow(created);
        success('Workflow creado correctamente');
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving:', err);
      error('No se pudo guardar el workflow');
    } finally {
      setIsSaving(false);
    }
  }, [selectedWorkflow, success, error]);

  const handleDuplicate = useCallback(async (workflow: Workflow) => {
    try {
      const copy = await unifiedWorkflowService.duplicate(workflow.id, `${workflow.name} (Copia)`);
      setWorkflows(prev => [copy, ...prev]);
      // Stay in list or go to detail? Let's stay in list but refresh
      success('Copia creada correctamente');
    } catch (err) {
      error('Error duplicando workflow');
    }
  }, [success, error]);

  const handleDeleteRequest = useCallback((workflow: Workflow) => {
    setDeleteData({ isOpen: true, workflow, loading: false });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteData.workflow) return;
    setDeleteData(prev => ({ ...prev, loading: true }));
    try {
      await unifiedWorkflowService.delete(deleteData.workflow.id);
      setWorkflows(prev => prev.filter(w => w.id !== deleteData.workflow?.id));
      if (selectedWorkflow?.id === deleteData.workflow.id) {
        setSelectedWorkflow(null);
        setIsEditing(false);
        setActiveView('list'); // Force back to list if deleted the active one
      }
      success('Workflow eliminado');
    } catch (err) {
      error('Error eliminando workflow');
    } finally {
      setDeleteData({ isOpen: false, workflow: null, loading: false });
    }
  }, [deleteData.workflow, selectedWorkflow, success, error]);

  const handleToggleStatus = useCallback(async (workflow: Workflow) => {
    try {
      const newStatus = workflow.status === 'active' ? 'inactive' : 'active';
      const updated = await unifiedWorkflowService.changeStatus(workflow.id, newStatus);
      setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
      if (selectedWorkflow?.id === updated.id) {
        setSelectedWorkflow(updated);
      }
      success(`Estado cambiado a ${newStatus}`);
    } catch (err) {
      error('Error cambiando estado');
    }
  }, [selectedWorkflow, success, error]);

  return (
    <div className={cn("h-full w-full bg-background relative overflow-hidden", className)}>
      
      {/* View: List */}
      {activeView === 'list' && (
        <div className="h-full animate-in fade-in slide-in-from-left-4 duration-300">
           <WorkflowList
              workflows={workflows}
              isLoading={isLoading}
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDeleteRequest}
              onToggleStatus={handleToggleStatus}
              className="h-full"
           />
        </div>
      )}

      {/* View: Detail/Editor */}
      {activeView === 'detail' && (
        <div className="h-full absolute inset-0 bg-background z-10 animate-in fade-in slide-in-from-right-4 duration-300">
          <WorkflowDetailPanel 
             workflow={selectedWorkflow}
             isEditing={isEditing}
             isSaving={isSaving}
             availableCustomers={availableCustomers}
             availableGeofences={availableGeofences}
             onEdit={() => setIsEditing(true)}
             onSave={handleSave}
             onCancel={isEditing && selectedWorkflow ? handleCancelEdit : handleBackToList} // Smart cancel behavior
             onDuplicate={handleDuplicate}
             onDelete={handleDeleteRequest}
             onToggleStatus={handleToggleStatus}
          />
        </div>
      )}

      <ConfirmDialog 
        open={deleteData.isOpen}
        onOpenChange={(open) => !open && setDeleteData(prev => ({ ...prev, isOpen: false }))}
        title="Eliminar Workflow"
        description="Esta acción es irreversible. ¿Deseas continuar?"
        onConfirm={handleDeleteConfirm}
        loading={deleteData.loading}
        variant="destructive"
      />

      <ConfirmDialog
        open={navConfirmOpen}
        onOpenChange={setNavConfirmOpen}
        title="¿Descartar cambios?"
        description="Tienes cambios sin guardar. Si sales ahora, se perderán todos los cambios."
        confirmText="Descartar"
        cancelText="Seguir editando"
        variant="destructive"
        onConfirm={() => {
          if (pendingNavigation) pendingNavigation();
          setNavConfirmOpen(false);
          setPendingNavigation(null);
        }}
      />
    </div>
  );
});

