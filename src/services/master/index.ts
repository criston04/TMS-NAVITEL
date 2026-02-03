/**
 * @fileoverview Re-export de servicios del módulo MAESTRO
 * 
 * Principio DRY: Un solo punto de importación.
 * 
 * @module services/master
 * 
 * @example
 * import { customersService, driversService } from "@/services/master";
 */

export { customersService } from "./customers.service";
export { driversService } from "./drivers.service";
export { vehiclesService } from "./vehicles.service";
export { geofencesService } from "./geofences.service";

// TODO: Agregar cuando se implementen
// export { operatorsService } from "./operators.service";
// export { productsService } from "./products.service";
