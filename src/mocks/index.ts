/**
 * @fileoverview Barrel exports para datos mock
 * @module mocks
 */

// Datos compartidos centralizados (fuente única de verdad)
export {
  SHARED_CUSTOMERS,
  SHARED_VEHICLES,
  SHARED_DRIVERS,
  SHARED_CARRIERS,
  SHARED_GPS_OPERATORS,
  SHARED_LOCATIONS,
  SHARED_CARGO_TYPES,
  SHARED_ORDERS,
  findCustomerById,
  findVehicleById,
  findDriverById,
  findCarrierById,
  findLocationById,
  findOrderById,
  findOrderByNumber,
  getOrderStats,
  getFleetStats,
} from './shared-data';

export type {
  SharedCustomer,
  SharedVehicle,
  SharedDriver,
  SharedCarrier,
  SharedGPSOperator,
  SharedLocation,
  SharedCargoType,
  SharedOrder,
} from './shared-data';

// Módulo de scheduling (con sus propios tipos)
export {
  MOCK_VEHICLES,
  MOCK_DRIVERS,
  DEFAULT_KPIS,
  DEFAULT_SCHEDULING_CONFIG,
  getSchedulingKPIs,
  generateMockPendingOrders,
  generateMockTimelines,
  generateMockSuggestions,
} from './scheduling';

export type { MockVehicle, MockDriver } from './scheduling';

// Geofences mock
export * from './master/geofences.mock';