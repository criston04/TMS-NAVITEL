/**
 * @fileoverview Configuración centralizada de API
 * 
 * Single Source of Truth para URLs, timeouts y configuración HTTP.
 * Facilita el cambio entre entornos (dev, staging, prod).
 * 
 * @module config/api
 */

/** Entornos disponibles */
type Environment = "development" | "staging" | "production";

/** Configuración por entorno */
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  useMocks: boolean;
}

/**
 * Determina si usar mocks basado en variables de entorno
 * NEXT_PUBLIC_USE_MOCKS=true fuerza mocks en cualquier entorno (útil para demos)
 */
const shouldUseMocks = (envDefault: boolean): boolean => {
  const forcesMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
  const forcesApi = process.env.NEXT_PUBLIC_USE_MOCKS === 'false';
  
  if (forcesMocks) return true;
  if (forcesApi) return false;
  return envDefault;
};

const configs: Record<Environment, ApiConfig> = {
  development: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    timeout: 30000,
    useMocks: shouldUseMocks(true), // Usar mocks en desarrollo por defecto
  },
  staging: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://staging-api.navitel.com/api",
    timeout: 30000,
    useMocks: shouldUseMocks(false),
  },
  production: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.navitel.com/api",
    timeout: 15000,
    useMocks: shouldUseMocks(true), // Usar mocks por defecto en producción para demo
  },
};

/** Entorno actual basado en NODE_ENV */
const currentEnv = (process.env.NODE_ENV as Environment) || "development";

/** Configuración activa */
export const apiConfig = configs[currentEnv];

/**
 * Endpoints de la API organizados por módulo
 * Facilita agregar nuevos módulos sin modificar código existente (OCP)
 */
export const API_ENDPOINTS = {
  // Módulo MAESTRO
  master: {
    customers: "/master/customers",
    drivers: "/master/drivers",
    vehicles: "/master/vehicles",
    operators: "/master/operators",
    products: "/master/products",
    geofences: "/master/geofences",
  },
  // Módulo OPERACIONES
  operations: {
    controlTower: "/operations/control-tower",
    orders: "/operations/orders",
    scheduling: "/operations/scheduling",
  },
  // Módulo FINANZAS
  finance: {
    invoices: "/finance/invoices",
    pricing: "/finance/pricing",
  },
  // Auth
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
} as const;

/** Tipo para los endpoints (útil para autocompletado) */
export type ApiEndpoints = typeof API_ENDPOINTS;
