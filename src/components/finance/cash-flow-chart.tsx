/**
 * @fileoverview Gráfico de flujo de caja
 * @module components/finance/cash-flow-chart
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { CashFlowSummary } from "@/types/finance";

interface CashFlowChartProps {
  data: CashFlowSummary | null;
  variant?: "bar" | "pie";
}

// Colores para el gráfico de pie
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// Datos mock para distribución de costos
const costDistribution = [
  { name: "Combustible", value: 45000, color: "#f59e0b" },
  { name: "Peajes", value: 12000, color: "#3b82f6" },
  { name: "Mantenimiento", value: 18000, color: "#ef4444" },
  { name: "Seguros", value: 8000, color: "#10b981" },
  { name: "Mano de Obra", value: 25000, color: "#8b5cf6" },
  { name: "Otros", value: 7000, color: "#6b7280" },
];

export function CashFlowChart({ data, variant = "bar" }: CashFlowChartProps) {
  if (!data) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (variant === "pie") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={costDistribution}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {costDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`S/ ${Number(value).toLocaleString()}`, ""]}
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Datos para gráfico de barras
  const barData = [
    {
      name: "Ingresos",
      inflows: data.totalInflows,
      outflows: 0,
    },
    {
      name: "Egresos",
      inflows: 0,
      outflows: data.totalOutflows,
    },
    {
      name: "Neto",
      inflows: data.netCashFlow > 0 ? data.netCashFlow : 0,
      outflows: data.netCashFlow < 0 ? Math.abs(data.netCashFlow) : 0,
    },
  ];

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
          <Tooltip
            formatter={(value) => [`S/ ${Number(value).toLocaleString()}`, ""]}
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="inflows" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="outflows" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Saldo Inicial</p>
          <p className="text-lg font-semibold">
            S/ {data.openingBalance.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Flujo Neto</p>
          <p className={`text-lg font-semibold ${data.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
            {data.netCashFlow >= 0 ? "+" : ""}S/ {data.netCashFlow.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Saldo Final</p>
          <p className="text-lg font-semibold">
            S/ {data.closingBalance.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
