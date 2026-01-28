/**
 * @fileoverview Funciones de utilidad para Navitel TMS
 * 
 * Contiene funciones helper reutilizables en toda la aplicación.
 * 
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases de Tailwind CSS de forma inteligente
 * 
 * Utiliza clsx para combinar clases condicionales y tailwind-merge
 * para resolver conflictos entre clases de Tailwind.
 * 
 * @param {...ClassValue[]} inputs - Clases CSS a combinar
 * @returns {string} String con las clases combinadas y resueltas
 * 
 * @example
 * cn("px-4 py-2", isActive && "bg-primary", className)
 * // => "px-4 py-2 bg-primary"
 * 
 * cn("px-4", "px-8") // Resuelve conflicto
 * // => "px-8"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
