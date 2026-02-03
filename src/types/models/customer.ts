/**
 * @fileoverview Modelos del módulo MAESTRO - Clientes
 * 
 * @module types/models/customer
 */

import { BaseEntity, EntityStatus } from "@/types/common";

/**
 * Tipo de cliente
 */
export type CustomerType = "empresa" | "persona";

/**
 * Tipo de documento de identidad
 */
export type DocumentType = "RUC" | "DNI" | "CE" | "PASSPORT";

/**
 * Dirección de un cliente
 */
export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  reference?: string;
  isDefault: boolean;
}

/**
 * Contacto de un cliente
 */
export interface CustomerContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
  isPrimary: boolean;
}

/**
 * Entidad Cliente
 */
export interface Customer extends BaseEntity {
  /** Tipo de cliente */
  type: CustomerType;
  /** Tipo de documento */
  documentType: DocumentType;
  /** Número de documento (RUC, DNI, etc.) */
  documentNumber: string;
  /** Razón social o nombre completo */
  name: string;
  /** Nombre comercial (opcional) */
  tradeName?: string;
  /** Email principal */
  email: string;
  /** Teléfono principal */
  phone: string;
  /** Estado del cliente */
  status: EntityStatus;
  /** Direcciones del cliente */
  addresses: CustomerAddress[];
  /** Contactos del cliente */
  contacts: CustomerContact[];
  /** Crédito disponible */
  creditLimit?: number;
  /** Notas adicionales */
  notes?: string;
}

/**
 * Estadísticas de clientes
 */
export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}
