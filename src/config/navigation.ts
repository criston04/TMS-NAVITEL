/**
 * Navigation Configuration - Configuración centralizada del menú
 * Principio: Single Source of Truth
 */

import {
  LayoutDashboard,
  Truck,
  Package,
  MapPin,
  Route,
  FileText,
  Users,
  Warehouse,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import { NavItem } from "@/types/navigation";

export const navigationConfig: NavItem[] = [
  {
    title: "Logística",
    href: "#",
    icon: Package,
    children: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Flota", href: "/fleet", icon: Truck },
    ],
  },
  {
    title: "Envíos",
    href: "#",
    icon: ClipboardList,
    children: [
      { title: "Todos los envíos", href: "/shipments", icon: Package },
      { title: "En tránsito", href: "/shipments/transit", icon: MapPin },
      { title: "Rutas", href: "/routes", icon: Route },
    ],
  },
  {
    title: "Almacén",
    href: "/warehouse",
    icon: Warehouse,
  },
  {
    title: "Reportes",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Facturación",
    href: "/invoices",
    icon: FileText,
    badge: "3",
  },
  {
    title: "Usuarios",
    href: "/users",
    icon: Users,
  },
];
