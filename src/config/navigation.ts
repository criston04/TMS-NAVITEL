/**
 * Navigation Configuration - Configuracion centralizada del menu
 */

import type { NavGroup } from "@/types/navigation";
import {
  LayoutDashboard,
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
  Route,
  Satellite,
  LayoutGrid,
  History,
  TowerControl,
  Wallet,
  BarChart3,
  Navigation,
  Wrench,
} from "lucide-react";

export const navigationConfig: NavGroup[] = [
  {
    groupTitle: "OPERACIONES",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Ordenes", href: "/orders", icon: Package },
      { title: "Programacion", href: "/scheduling", icon: CalendarDays },
      { title: "Planificador de Rutas", href: "/route-planner", icon: Navigation },
    ],
  },
  {
    groupTitle: "MONITOREO",
    items: [
      { title: "Torre de Control", href: "/monitoring/control-tower", icon: TowerControl },
      { title: "Retransmision", href: "/monitoring/retransmission", icon: Satellite },
      { title: "Multiventana", href: "/monitoring/multi-window", icon: LayoutGrid },
      { title: "Rastreo Historico", href: "/monitoring/historical", icon: History },
    ],
  },
  {
    groupTitle: "FINANZAS",
    items: [
      { title: "Centro Financiero", href: "/finance", icon: Wallet },
      { title: "Facturas", href: "/invoices", icon: FileText },
      { title: "Tarifario", href: "/pricing", icon: DollarSign },
    ],
  },
  {
    groupTitle: "REPORTES",
    items: [
      { title: "Centro de Reportes", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    groupTitle: "MANTENIMIENTO",
    items: [
      { title: "Mantenimiento", href: "/maintenance", icon: Wrench },
    ],
  },
  {
    groupTitle: "MAESTRO",
    items: [
      { title: "Clientes", href: "/master/customers", icon: Users },
      { title: "Conductores", href: "/master/drivers", icon: UserCircle },
      { title: "Vehiculos", href: "/master/vehicles", icon: Car },
      { title: "Operadores Logisticos", href: "/master/operators", icon: Building2 },
      { title: "Productos", href: "/master/products", icon: Box },
      { title: "Geocercas", href: "/master/geofences", icon: MapPinned },
      { title: "Workflows", href: "/master/workflows", icon: Route },
    ],
  },
];