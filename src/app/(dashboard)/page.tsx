"use client";

import { useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { VehicleOverview } from "@/components/dashboard/vehicle-overview";
import { ShipmentStatistics } from "@/components/dashboard/shipment-statistics";
import { OnRouteVehicles } from "@/components/dashboard/on-route-vehicles";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  MapPin,
  Shield,
  FileWarning,
  Users,
  Gauge,
  Radio,
  ShieldAlert,
  CalendarDays,
} from "lucide-react";

export default function DashboardPage() {
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  return (
    <div className="space-y-6 animate-fade-in p-6 bg-slate-50/50 dark:bg-black/20 min-h-screen">
      {/* Header con filtro de fecha */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h2>
          <p className="text-muted-foreground">
            Resumen operativo del día
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* ========== SECCIÓN 1: OPERATIVOS ========== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-sm font-semibold px-3 py-1 border-blue-300 text-blue-700 dark:text-blue-300">
            <Package className="h-3.5 w-3.5 mr-1.5" />
            Indicadores Operativos
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-animation">
          <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <StatCard
              title="Flota Total"
              value="156"
              icon={Truck}
              trend={{ value: 12, label: "vs mes anterior" }}
              data={[
                { value: 120 }, { value: 132 }, { value: 101 }, { value: 134 }, { value: 190 }, { value: 130 }, { value: 156 }
              ]}
              color="#3b82f6"
              className="shadow-sm border-0"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <StatCard
              title="Entregas a Tiempo"
              value="98.5%"
              icon={CheckCircle2}
              trend={{ value: 2.1, label: "vs semana pasada" }}
              data={[
                { value: 92 }, { value: 95 }, { value: 94 }, { value: 98 }, { value: 97 }, { value: 99 }, { value: 98.5 }
              ]}
              color="#10b981"
              className="shadow-sm border-0"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <StatCard
              title="Órdenes del Día"
              value="87"
              icon={Package}
              trend={{ value: 15, label: "vs promedio" }}
              data={[
                { value: 65 }, { value: 72 }, { value: 80 }, { value: 75 }, { value: 82 }, { value: 78 }, { value: 87 }
              ]}
              color="#8b5cf6"
              className="shadow-sm border-0"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <StatCard
              title="Tiempo Promedio Entrega"
              value="45m"
              icon={Clock}
              trend={{ value: -12, label: "mejora eficiencia" }}
              data={[
                { value: 60 }, { value: 55 }, { value: 50 }, { value: 48 }, { value: 45 }, { value: 42 }, { value: 45 }
              ]}
              color="#6366f1"
              className="shadow-sm border-0"
            />
          </div>
        </div>
      </div>

      {/* ========== SECCIÓN 2: MONITOREO ========== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-sm font-semibold px-3 py-1 border-emerald-300 text-emerald-700 dark:text-emerald-300">
            <Radio className="h-3.5 w-3.5 mr-1.5" />
            Monitoreo en Tiempo Real
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-animation">
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <StatCard
              title="Vehículos en Ruta"
              value="94"
              icon={MapPin}
              trend={{ value: 8, label: "en tránsito" }}
              data={[
                { value: 78 }, { value: 82 }, { value: 88 }, { value: 90 }, { value: 85 }, { value: 92 }, { value: 94 }
              ]}
              color="#10b981"
              className="shadow-sm border-0"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <StatCard
              title="Conductores Activos"
              value="112"
              icon={Users}
              trend={{ value: 5, label: "disponibles" }}
              data={[
                { value: 98 }, { value: 102 }, { value: 108 }, { value: 105 }, { value: 110 }, { value: 115 }, { value: 112 }
              ]}
              color="#06b6d4"
              className="shadow-sm border-0"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <StatCard
              title="Velocidad Prom."
              value="62 km/h"
              icon={Gauge}
              trend={{ value: -3, label: "bajo límite" }}
              data={[
                { value: 58 }, { value: 65 }, { value: 62 }, { value: 60 }, { value: 64 }, { value: 61 }, { value: 62 }
              ]}
              color="#f59e0b"
              className="shadow-sm border-0"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <StatCard
              title="En Mantenimiento"
              value="8"
              icon={AlertTriangle}
              trend={{ value: -5, label: "vs. sem. pasada" }}
              data={[
                { value: 12 }, { value: 10 }, { value: 14 }, { value: 8 }, { value: 5 }, { value: 9 }, { value: 8 }
              ]}
              color="#ef4444"
              className="shadow-sm border-0"
            />
          </div>
        </div>
      </div>

      {/* ========== SECCIÓN 3: SEGURIDAD Y DOCUMENTACIÓN ========== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-sm font-semibold px-3 py-1 border-amber-300 text-amber-700 dark:text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
            Seguridad y Documentación
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-animation">
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <StatCard
              title="Docs por Vencer"
              value="12"
              icon={FileWarning}
              trend={{ value: -3, label: "próximos 30 días" }}
              data={[
                { value: 18 }, { value: 15 }, { value: 14 }, { value: 13 }, { value: 16 }, { value: 14 }, { value: 12 }
              ]}
              color="#f59e0b"
              className="shadow-sm border-0"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <StatCard
              title="Vehículos Habilitados"
              value="142"
              icon={Shield}
              trend={{ value: 3, label: "del total flota" }}
              data={[
                { value: 130 }, { value: 135 }, { value: 138 }, { value: 140 }, { value: 139 }, { value: 141 }, { value: 142 }
              ]}
              color="#22c55e"
              className="shadow-sm border-0"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <StatCard
              title="Incidentes del Día"
              value="2"
              icon={AlertTriangle}
              trend={{ value: -40, label: "vs promedio" }}
              data={[
                { value: 5 }, { value: 3 }, { value: 4 }, { value: 2 }, { value: 3 }, { value: 1 }, { value: 2 }
              ]}
              color="#ef4444"
              className="shadow-sm border-0"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <StatCard
              title="Cumplimiento GPS"
              value="99.2%"
              icon={Radio}
              trend={{ value: 0.5, label: "homologación" }}
              data={[
                { value: 98 }, { value: 98.5 }, { value: 99 }, { value: 98.8 }, { value: 99.1 }, { value: 99 }, { value: 99.2 }
              ]}
              color="#3b82f6"
              className="shadow-sm border-0"
            />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-12 lg:grid-cols-12">
        <div className="col-span-12 md:col-span-6 lg:col-span-5 min-h-[420px] animate-slide-up" style={{ animationDelay: '500ms' }}>
          <VehicleOverview />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-7 min-h-[420px] animate-slide-up" style={{ animationDelay: '600ms' }}>
          <ShipmentStatistics />
        </div>
      </div>

      {/* Tabla de vehículos en ruta */}
      <div className="grid gap-4 grid-cols-1 animate-slide-up" style={{ animationDelay: '700ms' }}>
        <OnRouteVehicles />
      </div>
    </div>
  );
}