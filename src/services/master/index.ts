/**
 * @fileoverview Re-export de servicios del módulo MAESTRO
 * 
 * Principio DRY: Un solo punto de importación.
 * 
 * @module services/master
 * 
 * @example
 * import { customersService, driversService, operatorsService, productsService } from "@/services/master";
 */

export { customersService } from "./customers.service";
export { driversService } from "./drivers.service";
export { vehiclesService } from "./vehicles.service";
export { geofencesService } from "./geofences.service";
export { operatorsService, OperatorsService } from "./operators.service";
export type { OperatorFilters, CreateOperatorDTO, UpdateOperatorDTO, OperatorsResponse } from "./operators.service";
export { productsService, ProductsService } from "./products.service";
export type { ProductFilters, CreateProductDTO, UpdateProductDTO, ProductsResponse } from "./products.service";
