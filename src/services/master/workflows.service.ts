/**
 * @fileoverview Servicio para gestión de Workflows
 * @module services/master/workflows
 * @description Operaciones CRUD para workflows.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import type { Workflow, WorkflowStep, WorkflowStatus, CreateWorkflowDTO, UpdateWorkflowDTO } from '@/types/workflow';
import { mockWorkflows, mockGeofencesForMilestones, mockCustomersForWorkflow } from '@/mocks/master/workflows.mock';

// Simulamos un delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Estado local para persistir cambios durante la sesión
let workflowsState = [...mockWorkflows];

/**
 * Servicio de Workflows
 */
class WorkflowMasterService {
  /**
   * Obtener todos los workflows
   */
  async getAll(): Promise<Workflow[]> {
    await delay(300);
    return [...workflowsState];
  }

  /**
   * Obtener workflow por ID
   */
  async getById(id: string): Promise<Workflow | null> {
    await delay(200);
    return workflowsState.find(w => w.id === id) || null;
  }

  /**
   * Crear nuevo workflow
   */
  async create(data: CreateWorkflowDTO): Promise<Workflow> {
    await delay(400);
    
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      ...data,
      status: 'draft',
      version: 1,
      isDefault: data.isDefault ?? false,
      steps: data.steps.map((step, index) => ({
        ...step,
        id: `step-${Date.now()}-${index}`,
        sequence: index + 1,
        transitionConditions: [],
        notifications: [],
      })) as WorkflowStep[],
      escalationRules: [],
      createdAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    workflowsState = [...workflowsState, newWorkflow];
    return newWorkflow;
  }

  /**
   * Actualizar workflow existente
   */
  async update(id: string, data: UpdateWorkflowDTO): Promise<Workflow> {
    await delay(400);

    const index = workflowsState.findIndex(w => w.id === id);
    if (index === -1) {
      throw new Error('Workflow no encontrado');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedWorkflow: any = {
      ...workflowsState[index],
      ...data,
      steps: data.steps 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? data.steps.map((step: any, idx: number) => ({
            ...step,
            id: step.id || `step-${Date.now()}-${idx}`,
            sequence: idx + 1,
            transitionConditions: step.transitionConditions || [],
            notifications: step.notifications || [],
          }))
        : workflowsState[index].steps,
      version: workflowsState[index].version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    workflowsState = workflowsState.map(w => w.id === id ? updatedWorkflow : w);
    return updatedWorkflow as Workflow;
  }

  /**
   * Eliminar workflow
   */
  async delete(id: string): Promise<void> {
    await delay(300);
    workflowsState = workflowsState.filter(w => w.id !== id);
  }

  /**
   * Duplicar workflow como plantilla
   */
  async duplicate(id: string, newName: string): Promise<Workflow> {
    await delay(400);
    
    const original = workflowsState.find(w => w.id === id);
    if (!original) {
      throw new Error('Workflow no encontrado');
    }

    const duplicated: Workflow = {
      ...original,
      id: `wf-${Date.now()}`,
      name: newName,
      code: `${original.code}-COPY`,
      status: 'draft',
      version: 1,
      isDefault: false,
      steps: original.steps.map((step, index) => ({
        ...step,
        id: `step-${Date.now()}-${index}`,
      })),
      createdAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    workflowsState = [...workflowsState, duplicated];
    return duplicated;
  }

  /**
   * Cambiar estado del workflow
   */
  async changeStatus(id: string, status: WorkflowStatus): Promise<Workflow> {
    await delay(300);
    
    const index = workflowsState.findIndex(w => w.id === id);
    if (index === -1) {
      throw new Error('Workflow no encontrado');
    }

    const updatedWorkflow: Workflow = {
      ...workflowsState[index],
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    workflowsState = workflowsState.map(w => w.id === id ? updatedWorkflow : w);
    return updatedWorkflow;
  }

  /**
   * Obtener geocercas disponibles para hitos
   */
  async getAvailableGeofences(): Promise<typeof mockGeofencesForMilestones> {
    await delay(200);
    return mockGeofencesForMilestones;
  }

  /**
   * Obtener clientes disponibles
   */
  async getAvailableCustomers(): Promise<typeof mockCustomersForWorkflow> {
    await delay(200);
    return mockCustomersForWorkflow;
  }
}

export const workflowMasterService = new WorkflowMasterService();
export { WorkflowMasterService as WorkflowsService };
