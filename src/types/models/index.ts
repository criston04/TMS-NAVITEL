/**
 * @fileoverview Re-export de todos los modelos
 * 
 * Principio DRY: Un solo punto de importación para todos los modelos.
 * 
 * @module types/models
 * 
 * @example
 * import { Customer, Driver, Vehicle } from "@/types/models";
 */

// Clientes
export * from "./customer";

// Conductores
export * from "./driver";

// Vehículos
export * from "./vehicle";

// Operadores Logísticos
export * from "./operator";

// Productos
export * from "./product";

// Geocercas
export * from "./geofence";
