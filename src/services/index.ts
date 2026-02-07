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

// Servicios de Órdenes
export * from "./orders";

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

// Servicios de Monitoreo
export * from "./monitoring";

// Servicios de Integración
export * from "./integration";

// Base service para extensión
export { BaseService, BulkService } from "./base.service";
export type { IBaseService, IBulkService } from "./base.service";
