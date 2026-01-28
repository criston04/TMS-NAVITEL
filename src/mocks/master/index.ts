/**
 * @fileoverview Re-export de todos los mocks del módulo MAESTRO
 * 
 * @module mocks/master
 */

export * from "./customers.mock";
export * from "./drivers.mock";
export * from "./vehicles.mock";

// Mocks vacíos para otras entidades (se llenarán según necesidad)
import { Operator, Product, Geofence } from "@/types/models";

export const operatorsMock: Operator[] = [];
export const productsMock: Product[] = [];
export const geofencesMock: Geofence[] = [];
