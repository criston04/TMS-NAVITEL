/**
 * @fileoverview Re-export de todos los hooks
 * 
 * @module hooks
 */

export * from "./use-navigation";
export * from "./use-service";
export * from "./useGeofences";
export * from "./useLeafletMap";
export * from "./useDrawingTools";
export * from "./useWorkflowIntegration";
export * from "./useOrders";
export * from "./useOrderImportExport";

// Hooks de Flota (Conductores y Vehículos)
export * from "./useDrivers";
export * from "./useVehicles";
export * from "./useCustomers";
export * from "./useDocumentAlerts";
export * from "./useDriverVehicleAssignment";
export * from "./useDriverOrderHistory";
export * from "./useVehicleMaintenance";
export * from "./useCustomerOperationalStats";

// Hooks de Notificaciones
export * from "./useNotifications";

// Hooks de Eventos de Geocerca
export * from "./useGeofenceEvents";

// Hooks de Finanzas
export * from "./useFinance";

// Hooks de Reportes
export * from "./useReports";

// Hooks de Configuración del Sistema
export * from "./useSettings";

// Hooks de Monitoreo
export * from "./monitoring";
