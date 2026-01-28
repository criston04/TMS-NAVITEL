"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { VehicleOverview } from "@/components/dashboard/vehicle-overview";
import { ShipmentStatistics } from "@/components/dashboard/shipment-statistics";
import { OrdersByCountries } from "@/components/dashboard/orders-by-countries";
import { OnRouteVehicles } from "@/components/dashboard/on-route-vehicles";

import {
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in p-6 bg-slate-50/50 dark:bg-black/20 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-animation">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
        <StatCard
          title="Total Flota"
          value="156"
          icon={Truck}
          trend={{ value: 12, label: "vs mes anterior" }}
          data={[
            { value: 120 }, { value: 132 }, { value: 101 }, { value: 134 }, { value: 190 }, { value: 130 }, { value: 156 }
          ]}
          color="#3b82f6"
          className="shadow-sm border-0 border-l-0" // Clean styling
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
          title="Mantenimiento"
          value="8"
          icon={AlertTriangle}
          trend={{ value: -5, label: "vehículos activos" }}
          data={[
              { value: 12 }, { value: 10 }, { value: 14 }, { value: 8 }, { value: 5 }, { value: 9 }, { value: 8 }
          ]}
          color="#f59e0b"
          className="shadow-sm border-0"
        />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <StatCard
          title="Tiempo Promedio"
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

      {/* Middle Section: Overview, Stats, Orders */}
      <div className="grid gap-4 md:grid-cols-12 lg:grid-cols-12 h-auto lg:h-[400px]">
        {/* Vehicle Overview (Left) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 h-full animate-slide-up" style={{ animationDelay: '400ms' }}>
            <VehicleOverview />
        </div>

        {/* Shipment Statistics (Center) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-5 h-full animate-slide-up" style={{ animationDelay: '500ms' }}>
            <ShipmentStatistics />
        </div>

        {/* Orders by Countries (Right) */}
        <div className="col-span-12 md:col-span-12 lg:col-span-3 h-full animate-slide-up" style={{ animationDelay: '600ms' }}>
           <OrdersByCountries />
        </div>
      </div>

       {/* Bottom Section: Table */}
       <div className="grid gap-4 grid-cols-1 animate-slide-up" style={{ animationDelay: '700ms' }}>
          <OnRouteVehicles />
       </div>
    </div>
  );
}


