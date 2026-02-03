/**
 * @fileoverview Re-export de todos los tipos
 * 
 * Principio DRY: Un solo punto de importación para todos los tipos.
 * 
 * @module types
 * 
 * @example
 * import { Customer, Vehicle, RetransmissionRecord } from "@/types";
 */

// Tipos comunes
export * from "./common";

// Navegación
export * from "./navigation";

// Modelos de datos (contiene Vehicle, Driver, Customer, etc.)
export * from "./models";

// Órdenes
export * from "./order";

// Incidentes
export * from "./incident";

// Programación
export * from "./scheduling";

// Workflows
export * from "./workflow";

// Monitoreo
export * from "./monitoring";

// Notificaciones
export * from "./notification";

// Eventos de Geocerca
export * from "./geofence-events";
export * from "./finance";
export * from "./report";
export * from "./settings";
