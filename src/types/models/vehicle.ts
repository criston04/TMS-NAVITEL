/**
 * @fileoverview Modelos del módulo MAESTRO - Vehículos
 * 
 * @module types/models/vehicle
 */

import { ActivatableEntity, RequiredDocument, ValidationChecklist } from "@/types/common";

/**
 * Tipo de vehículo
 */
export type VehicleType = 
  | "camion" 
  | "tractocamion" 
  | "remolque" 
  | "semiremolque" 
  | "furgoneta" 
  | "pickup";

/**
 * Tipo de carrocería
 */
export type BodyType = 
  | "furgon" 
  | "plataforma" 
  | "cisterna" 
  | "frigorifico" 
  | "volquete" 
  | "portacontenedor";

/**
 * Estado operativo del vehículo
 */
export type VehicleOperationalStatus = 
  | "available" 
  | "on-route" 
  | "maintenance" 
  | "repair" 
  | "inactive";

/**
 * Especificaciones técnicas
 */
export interface VehicleSpecs {
  brand: string;
  model: string;
  year: number;
  color: string;
  engineNumber?: string;
  chassisNumber: string;
  axles: number;
  fuelType: "diesel" | "gasoline" | "gas" | "electric" | "hybrid";
}

/**
 * Capacidad de carga
 */
export interface VehicleCapacity {
  maxWeight: number; // kg
  maxVolume?: number; // m3
  palletCapacity?: number;
}

/**
 * Entidad Vehículo
 */
export interface Vehicle extends ActivatableEntity {
  /** Código interno */
  code: string;
  /** Placa */
  plate: string;
  /** Tipo de vehículo */
  type: VehicleType;
  /** Tipo de carrocería */
  bodyType: BodyType;
  /** Especificaciones técnicas */
  specs: VehicleSpecs;
  /** Capacidad */
  capacity: VehicleCapacity;
  /** Estado operativo */
  operationalStatus: VehicleOperationalStatus;
  /** Checklist de documentos */
  checklist: ValidationChecklist;
  /** Documentos */
  documents: RequiredDocument[];
  /** Operador logístico propietario */
  operatorId?: string;
  /** Conductor asignado actualmente */
  currentDriverId?: string;
  /** GPS ID para tracking */
  gpsDeviceId?: string;
  /** Última ubicación conocida */
  lastLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  /** Kilometraje actual */
  currentMileage: number;
  /** Fecha de próximo mantenimiento */
  nextMaintenanceDate?: string;
  /** Notas */
  notes?: string;
}

/**
 * Estadísticas de vehículos
 */
export interface VehicleStats {
  total: number;
  enabled: number;
  blocked: number;
  expiringSoon: number;
  available: number;
  onRoute: number;
  inMaintenance: number;
}
