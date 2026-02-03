/**
 * @fileoverview Tipos e interfaces para vehículos
 * @module types/vehicle
 * @description Define las estructuras de datos relacionadas con vehículos.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

/**
 * Estado del vehículo
 * @enum {string}
 */
export type VehicleStatus =
  | 'available'     // Disponible
  | 'in_transit'    // En tránsito
  | 'loading'       // Cargando
  | 'unloading'     // Descargando
  | 'maintenance'   // En mantenimiento
  | 'out_of_service'; // Fuera de servicio

/**
 * Tipo de vehículo
 * @enum {string}
 */
export type VehicleType =
  | 'truck'         // Camión
  | 'trailer'       // Remolque
  | 'van'           // Furgoneta
  | 'pickup'        // Camioneta
  | 'flatbed'       // Plataforma
  | 'tanker'        // Tanque
  | 'refrigerated'; // Refrigerado

/**
 * Representa un vehículo en el sistema
 * @interface Vehicle
 */
export interface Vehicle {
  /** Identificador único del vehículo */
  id: string;
  /** Número de placa */
  plate: string;
  /** Número económico (identificador interno) */
  economicNumber: string;
  /** Tipo de vehículo */
  type: VehicleType;
  /** Marca */
  brand: string;
  /** Modelo */
  model: string;
  /** Año */
  year: number;
  /** Color */
  color?: string;
  /** VIN */
  vin?: string;
  /** Estado actual */
  status: VehicleStatus;
  /** Capacidad de carga en kg */
  capacityKg: number;
  /** Capacidad de volumen en m³ */
  capacityM3?: number;
  /** ID del conductor asignado */
  driverId?: string;
  /** Última ubicación conocida */
  lastLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  /** Nivel de combustible (%) */
  fuelLevel?: number;
  /** Odómetro (km) */
  odometer?: number;
  /** Fecha de última inspección */
  lastInspectionDate?: string;
  /** Fecha de próximo mantenimiento */
  nextMaintenanceDate?: string;
  /** Notas adicionales */
  notes?: string;
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de actualización */
  updatedAt: string;
  /** Vehículo activo */
  isActive: boolean;
}
