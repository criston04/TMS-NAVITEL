/**
 * @fileoverview Proveedor de tema para Navitel TMS
 * 
 * Wrapper del ThemeProvider de next-themes que habilita
 * el soporte de tema claro/oscuro/sistema en toda la aplicación.
 * 
 * @module components/theme-provider
 * @requires react
 * @requires next-themes
 * 
 * @example
 * // En el layout raíz
 * <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 *   <App />
 * </ThemeProvider>
 */

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = Readonly<React.ComponentProps<typeof NextThemesProvider>>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
