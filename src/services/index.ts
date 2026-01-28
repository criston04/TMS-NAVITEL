/**
 * @fileoverview Re-export de todos los servicios
 * 
 * Facilita importaciones y mantiene bajo acoplamiento.
 * 
 * @module services
 * 
 * @example
 * import { customersService, driversService } from "@/services";
 */

// Servicios del módulo MAESTRO
export * from "./master";

// Base service para extensión
export { BaseService, BulkService } from "./base.service";
export type { IBaseService, IBulkService } from "./base.service";
