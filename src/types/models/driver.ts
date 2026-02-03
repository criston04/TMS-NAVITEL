/**
 * @fileoverview Modelos del módulo MAESTRO - Conductores
 * 
 * @module types/models/driver
 */

import { ActivatableEntity, RequiredDocument, ValidationChecklist } from "@/types/common";

/**
 * Tipo de licencia de conducir
 */
export type LicenseCategory = "A-I" | "A-IIa" | "A-IIb" | "A-IIIa" | "A-IIIb" | "A-IIIc";

/**
 * Estado de disponibilidad del conductor
 */
export type DriverAvailability = "available" | "on-route" | "resting" | "vacation" | "unavailable";

/**
 * Contacto de emergencia
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

/**
 * Entidad Conductor
 */
export interface Driver extends ActivatableEntity {
  /** Código interno del conductor */
  code: string;
  /** Tipo de documento */
  documentType: "DNI" | "CE" | "PASSPORT";
  /** Número de documento */
  documentNumber: string;
  /** Nombres */
  firstName: string;
  /** Apellidos */
  lastName: string;
  /** Nombre completo (computed) */
  fullName: string;
  /** Email */
  email: string;
  /** Teléfono */
  phone: string;
  /** Fecha de nacimiento */
  birthDate: string;
  /** Dirección */
  address: string;
  /** Número de licencia */
  licenseNumber: string;
  /** Categoría de licencia */
  licenseCategory: LicenseCategory;
  /** Fecha de vencimiento de licencia */
  licenseExpiry: string;
  /** Disponibilidad actual */
  availability: DriverAvailability;
  /** Contacto de emergencia */
  emergencyContact: EmergencyContact;
  /** Foto del conductor */
  photoUrl?: string;
  /** Checklist de documentos requeridos */
  checklist: ValidationChecklist;
  /** Documentos cargados */
  documents: RequiredDocument[];
  /** Operador logístico asignado (si aplica) */
  operatorId?: string;
  /** Notas */
  notes?: string;
}

/**
 * Estadísticas de conductores
 */
export interface DriverStats {
  total: number;
  enabled: number;
  blocked: number;
  expiringSoon: number; // Documentos por vencer en 30 días
  available: number;
  onRoute: number;
}
