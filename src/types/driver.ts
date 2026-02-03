/**
 * @fileoverview Tipos e interfaces para conductores
 * @module types/driver
 * @description Define las estructuras de datos relacionadas con conductores.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

/**
 * Estado del conductor
 * @enum {string}
 */
export type DriverStatus =
  | 'available'     // Disponible
  | 'on_duty'       // En servicio
  | 'off_duty'      // Fuera de servicio
  | 'resting'       // Descansando
  | 'vacation'      // Vacaciones
  | 'inactive';     // Inactivo

/**
 * Información de licencia de conducir
 * @interface DriverLicense
 */
export interface DriverLicense {
  /** Número de licencia */
  number: string;
  /** Tipo de licencia */
  type: string;
  /** Fecha de vencimiento */
  expirationDate: string;
  /** Estado/país emisor */
  issuingState: string;
}

/**
 * Representa un conductor en el sistema
 * @interface Driver
 */
export interface Driver {
  /** Identificador único del conductor */
  id: string;
  /** Código de empleado */
  employeeCode: string;
  /** Nombre completo */
  fullName: string;
  /** Primer nombre */
  firstName: string;
  /** Apellido */
  lastName: string;
  /** Estado actual */
  status: DriverStatus;
  /** Teléfono */
  phone: string;
  /** Email */
  email?: string;
  /** Información de licencia */
  license: DriverLicense;
  /** ID del vehículo asignado */
  vehicleId?: string;
  /** Foto del conductor */
  photoUrl?: string;
  /** Fecha de contratación */
  hireDate: string;
  /** Notas adicionales */
  notes?: string;
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de actualización */
  updatedAt: string;
  /** Conductor activo */
  isActive: boolean;
}
