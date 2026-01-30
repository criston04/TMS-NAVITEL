/**
 * @fileoverview Página de gestión de Workflows
 * @module app/(dashboard)/master/workflows/page
 * @description Permite crear, editar, duplicar y gestionar workflows
 * Conectado con: Geocercas, Órdenes, Programación
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { PageWrapper } from '@/components/page-wrapper';
import {
  WorkflowList,
  WorkflowForm,
} from '@/components/workflows';
import { FloatingPanel } from '@/components/ui/floating-panel';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import { unifiedWorkflowService } from '@/services/workflow.service';
import type { Workflow, CreateWorkflowDTO } from '@/types/workflow';

export default function WorkflowsPage() {
  const { success, error } = useToast();

  // State
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    workflow: Workflow | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    workflow: null,
    isDeleting: false,
  });

  // Available data for form - conectado con geocercas y clientes
  const [availableCustomers, setAvailableCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [availableGeofences, setAvailableGeofences] = useState<Array<{
    id: string;
    name: string;
    type: string;
    color: string;
  }>>([]);

  // Load workflows
  const loadWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await unifiedWorkflowService.getAll();
      setWorkflows(data);
    } catch (err) {
      console.error('Error loading workflows:', err);
      error('Error al cargar los workflows');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  // Load available data for form - geocercas del módulo de geocercas, clientes del maestro
  const loadFormData = useCallback(async () => {
    try {
      const [customers, geofences] = await Promise.all([
        unifiedWorkflowService.getAvailableCustomers(),
        unifiedWorkflowService.getAvailableGeofences(),
      ]);
      setAvailableCustomers(customers);
      // Mapear geocercas al formato esperado por el form
      setAvailableGeofences(geofences.map(g => ({
        id: g.id,
        name: g.name,
        type: g.category,
        color: g.color,
      })));
    } catch (err) {
      console.error('Error loading form data:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWorkflows();
    loadFormData();
  }, [loadWorkflows, loadFormData]);

  // Handlers
  const handleCreateNew = useCallback(() => {
    setSelectedWorkflow(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsFormOpen(true);
  }, []);

  const handleDuplicate = useCallback(async (workflow: Workflow) => {
    try {
      const duplicated = await unifiedWorkflowService.duplicate(workflow.id, `${workflow.name} (Copia)`);
      setWorkflows(prev => [duplicated, ...prev]);
      success('Workflow duplicado correctamente');
    } catch (err) {
      console.error('Error duplicating workflow:', err);
      error('Error al duplicar el workflow');
    }
  }, [success, error]);

  const handleDeleteRequest = useCallback((workflow: Workflow) => {
    setDeleteConfirm({
      isOpen: true,
      workflow,
      isDeleting: false,
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm.workflow) return;

    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    try {
      await unifiedWorkflowService.delete(deleteConfirm.workflow.id);
      setWorkflows(prev => prev.filter(w => w.id !== deleteConfirm.workflow?.id));
      success('Workflow eliminado correctamente');
    } catch (err) {
      console.error('Error deleting workflow:', err);
      error('Error al eliminar el workflow');
    } finally {
      setDeleteConfirm({ isOpen: false, workflow: null, isDeleting: false });
    }
  }, [deleteConfirm.workflow, success, error]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ isOpen: false, workflow: null, isDeleting: false });
  }, []);

  const handleToggleStatus = useCallback(async (workflow: Workflow) => {
    const newStatus = workflow.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await unifiedWorkflowService.changeStatus(workflow.id, newStatus);
      setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
      success(`Workflow ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`);
    } catch (err) {
      console.error('Error toggling workflow status:', err);
      error('Error al cambiar el estado del workflow');
    }
  }, [success, error]);

  const handleFormSave = useCallback(async (data: CreateWorkflowDTO) => {
    setIsSaving(true);
    try {
      if (selectedWorkflow) {
        // Update existing
        const updated = await unifiedWorkflowService.update(selectedWorkflow.id, data);
        setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
        success('Workflow actualizado correctamente');
      } else {
        // Create new
        const created = await unifiedWorkflowService.create(data);
        setWorkflows(prev => [created, ...prev]);
        success('Workflow creado correctamente');
      }
      setIsFormOpen(false);
      setSelectedWorkflow(null);
    } catch (err) {
      console.error('Error saving workflow:', err);
      error('Error al guardar el workflow');
      throw err; // Re-throw for form to handle
    } finally {
      setIsSaving(false);
    }
  }, [selectedWorkflow, success, error]);

  const handleFormCancel = useCallback(() => {
    setIsFormOpen(false);
    setSelectedWorkflow(null);
  }, []);

  return (
    <PageWrapper
      title="Workflows"
      description="Gestiona los flujos de trabajo para tus órdenes de transporte"
    >
      <div className="relative">
        {/* Main Content */}
        <WorkflowList
          workflows={workflows}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteRequest}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
        />

        {/* Form Panel */}
        {isFormOpen && (
          <FloatingPanel
            defaultPosition={{ x: 100, y: 50 }}
            className="w-175 h-[calc(100vh-120px)] max-h-200"
          >
            <WorkflowForm
              workflow={selectedWorkflow}
              availableCustomers={availableCustomers}
              availableGeofences={availableGeofences}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
              isLoading={isSaving}
            />
          </FloatingPanel>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteConfirm.isOpen}
          onOpenChange={(open) => {
            if (!open) handleDeleteCancel();
          }}
          title="Eliminar Workflow"
          description={
            deleteConfirm.workflow
              ? `¿Estás seguro de que deseas eliminar el workflow "${deleteConfirm.workflow.name}"? Esta acción no se puede deshacer y podría afectar órdenes que lo utilicen.`
              : ''
          }
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
          loading={deleteConfirm.isDeleting}
        />
      </div>
    </PageWrapper>
  );
}
