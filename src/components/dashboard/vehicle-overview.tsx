"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, PackageOpen, Package, Clock } from "lucide-react";

export function VehicleOverview() {
  return (
    <Card className="h-full rounded-2xl border-none shadow-sm bg-white dark:bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Resumen de Flota</CardTitle>
        <div className="text-muted-foreground">
             {/* Icon placeholder if needed */}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Labels Row */}
        <div className="grid grid-cols-4 text-xs text-muted-foreground gap-1">
            <span>En ruta</span>
            <span>Descargando</span>
            <span>Cargando</span>
            <span className="text-right">En espera</span>
        </div>

        {/* Custom Stacked Bar similar to image */}
        <div className="flex h-12 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
            {/* En ruta - Gray/Whiteish */}
            <div className="flex h-full items-center justify-center bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200" style={{ width: '39.7%' }}>
                39.7%
            </div>
            {/* Descargando - Purple */}
            <div className="flex h-full items-center justify-center bg-[#6366f1] text-xs font-semibold text-white" style={{ width: '28.3%' }}>
                28.3%
            </div>
            {/* Cargando - Blue */}
            <div className="flex h-full items-center justify-center bg-[#0ea5e9] text-xs font-semibold text-white" style={{ width: '17.4%' }}>
                17.4%
            </div>
            {/* En espera - Dark */}
            <div className="flex h-full items-center justify-center bg-[#1e293b] text-xs font-semibold text-white" style={{ width: '14.6%' }}>
                14.6%
            </div>
        </div>

        {/* Stats List */}
        <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <Truck className="h-5 w-5 text-slate-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">En ruta</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">2hr 10min</span>
                    <span className="text-sm text-muted-foreground w-10 text-right">39.7%</span>
                </div>
            </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <PackageOpen className="h-5 w-5 text-slate-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">Descargando</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">3hr 15min</span>
                    <span className="text-sm text-muted-foreground w-10 text-right">28.3%</span>
                </div>
            </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <Package className="h-5 w-5 text-slate-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">Cargando</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">1hr 24min</span>
                    <span className="text-sm text-muted-foreground w-10 text-right">17.4%</span>
                </div>
            </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <Clock className="h-5 w-5 text-slate-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">En espera</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">5hr 19min</span>
                    <span className="text-sm text-muted-foreground w-10 text-right">14.6%</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
