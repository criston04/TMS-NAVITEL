/**
 * Navigation Configuration - Configuración centralizada del menú
 * Estructura basada en grupos: OPERACIONES, FINANZAS, MAESTRO
 * Principio: Single Source of Truth
 */

import {
  Radio,
  Package,
  CalendarDays,
  FileText,
  DollarSign,
  Users,
  Box,
  UserCircle,
  Car,
  Building2,
  MapPinned,
} from "lucide-react";
import { NavGroup } from "@/types/navigation";

export const navigationConfig: NavGroup[] = [
  {
    groupTitle: "OPERACIONES",
    items: [
      { title: "Control Tower", href: "/", icon: Radio },
      { title: "Órdenes", href: "/orders", icon: Package },
      { title: "Programación", href: "/scheduling", icon: CalendarDays },
    ],
  },
  {
    groupTitle: "FINANZAS",
    items: [
      { title: "Facturas", href: "/invoices", icon: FileText },
      { title: "Tarifario", href: "/pricing", icon: DollarSign },
    ],
  },
  {
    groupTitle: "MAESTRO",
    items: [
      { title: "Clientes", href: "/master/customers", icon: Users },
      { title: "Conductores", href: "/master/drivers", icon: UserCircle },
      { title: "Vehículos", href: "/master/vehicles", icon: Car },
      { title: "Operadores Logísticos", href: "/master/operators", icon: Building2 },
      { title: "Productos", href: "/master/products", icon: Box },
      { title: "Geocercas", href: "/master/geofences", icon: MapPinned },
    ],
  },
];