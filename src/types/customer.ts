/**
 * @fileoverview Tipos e interfaces para clientes
 * @module types/customer
 * @description Define las estructuras de datos relacionadas con clientes.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

/**
 * Información de contacto
 * @interface ContactInfo
 */
export interface ContactInfo {
  /** Nombre del contacto */
  name: string;
  /** Teléfono de contacto */
  phone: string;
  /** Email de contacto */
  email?: string;
  /** Cargo/posición */
  position?: string;
}

/**
 * Representa un cliente en el sistema
 * @interface Customer
 */
export interface Customer {
  /** Identificador único del cliente */
  id: string;
  /** Código interno del cliente */
  code: string;
  /** Nombre del cliente o empresa */
  name: string;
  /** RFC del cliente */
  rfc?: string;
  /** Dirección fiscal */
  address?: string;
  /** Ciudad */
  city?: string;
  /** Estado/Provincia */
  state?: string;
  /** País */
  country?: string;
  /** Código postal */
  postalCode?: string;
  /** Teléfono principal */
  phone?: string;
  /** Email principal */
  email?: string;
  /** Contactos del cliente */
  contacts?: ContactInfo[];
  /** Notas adicionales */
  notes?: string;
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de actualización */
  updatedAt: string;
  /** Cliente activo */
  isActive: boolean;
}
