/**
 * @fileoverview Re-export de todos los servicios
 * 
 * Facilita importaciones y mantiene bajo acoplamiento.
 * 
 * @module services
 * 
 * @example
 * import { customersService, driversService, unifiedWorkflowService } from "@/services";
 */

// Servicios del módulo MAESTRO
export * from "./master";

// Servicio unificado de Workflows (conectado con geocercas, órdenes, programación)
export { 
  unifiedWorkflowService, 
  UnifiedWorkflowService,
  WorkflowsService,
  type WorkflowGeofence,
  type WorkflowCustomer,
  type ApplyWorkflowResult,
  type OrderWorkflowProgress,
} from "./workflow.service";

// Base service para extensión
export { BaseService, BulkService } from "./base.service";
export type { IBaseService, IBulkService } from "./base.service";
