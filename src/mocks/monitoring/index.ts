/**
 * @fileoverview Barrel exports para mocks de Monitoreo
 * @module mocks/monitoring
 */

export { gpsCompaniesMock } from "./gps-companies.mock";
export { 
  retransmissionMock, 
  generateRetransmissionStats 
} from "./retransmission.mock";
export { 
  vehiclePositionsMock, 
  simulateVehicleMovement 
} from "./vehicle-positions.mock";
export { 
  historicalRoutesMock, 
  generateHistoricalRouteStats 
} from "./historical-routes.mock";
