/**
 * @fileoverview Modelos del módulo MAESTRO - Operadores Logísticos
 * 
 * @module types/models/operator
 */

import { ActivatableEntity, RequiredDocument, ValidationChecklist } from "@/types/common";

/**
 * Tipo de operador
 */
export type OperatorType = "propio" | "tercero" | "asociado";

/**
 * Contacto del operador
 */
export interface OperatorContact {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

/**
 * Entidad Operador Logístico
 */
export interface Operator extends ActivatableEntity {
  /** Código interno */
  code: string;
  /** RUC */
  ruc: string;
  /** Razón social */
  businessName: string;
  /** Nombre comercial */
  tradeName?: string;
  /** Tipo de operador */
  type: OperatorType;
  /** Email */
  email: string;
  /** Teléfono */
  phone: string;
  /** Dirección fiscal */
  fiscalAddress: string;
  /** Contactos */
  contacts: OperatorContact[];
  /** Checklist de validación */
  checklist: ValidationChecklist;
  /** Documentos */
  documents: RequiredDocument[];
  /** Cantidad de conductores asociados */
  driversCount: number;
  /** Cantidad de vehículos asociados */
  vehiclesCount: number;
  /** Fecha de inicio de contrato */
  contractStartDate?: string;
  /** Fecha de fin de contrato */
  contractEndDate?: string;
  /** Notas */
  notes?: string;
}

/**
 * Estadísticas de operadores
 */
export interface OperatorStats {
  total: number;
  enabled: number;
  blocked: number;
  pendingValidation: number;
  propios: number;
  terceros: number;
}
