/**
 * @fileoverview Barra de navegación superior
 * @module components/layout/Navbar
 * @description Navbar con búsqueda, acciones rápidas y menú de usuario
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

'use client';

import { memo } from 'react';
import {
  Search,
  LayoutGrid,
  Bell,
  Settings,
  User,
  LogOut,
  Globe,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

// ============================================
// CONSTANTES
// ============================================

const NAVBAR_HEIGHT = 'h-14'; // 56px - compacto pero funcional

// ============================================
// COMPONENTE
// ============================================

export const Navbar = memo(function Navbar() {
  return (
    <header
      className={cn(
        // Layout
        'sticky top-0 z-40',
        'flex items-center justify-between',
        // Spacing
        'px-4 md:px-6',
        // Sizing
        NAVBAR_HEIGHT,
        // Visual
        'border-b bg-background/80 backdrop-blur-md'
      )}
    >
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar... ⌘K"
          className={cn(
            // Spacing
            'pl-8',
            // Sizing
            'h-8 w-full',
            // Visual
            'rounded-md bg-muted/50',
            // States
            'focus-visible:bg-background'
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Language */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Globe className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Grid Menu */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <LayoutGrid className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative ml-1 h-8 w-8 rounded-full">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">
                  admin@navitel.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-3.5 w-3.5" />
              <span className="text-sm">Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-3.5 w-3.5" />
              <span className="text-sm">Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              <span className="text-sm">Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});
