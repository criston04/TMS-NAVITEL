"use client";

/**
 * @fileoverview Página de Vehículos - Módulo MAESTRO
 * 
 * Gestión de flota vehicular con checklist y tracking.
 * Consume datos desde vehiclesService.
 * 
 * @module app/(dashboard)/master/vehicles/page
 */

import { useEffect, useState } from "react";
import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Truck, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Wrench,
  MapPin,
  FileSpreadsheet,
  Shield,
  ShieldOff,
  Gauge,
  Package
} from "lucide-react";
import { vehiclesService } from "@/services/master";
import { useService } from "@/hooks/use-service";
import { Vehicle, VehicleStats } from "@/types/models";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Tarjeta de estadísticas
 */
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = "default" 
}: Readonly<{ 
  title: string; 
  value: number | string; 
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}>) {
  const variantStyles = {
    default: "bg-muted/50",
    success: "bg-green-500/10 text-green-600",
    warning: "bg-yellow-500/10 text-yellow-600",
    danger: "bg-red-500/10 text-red-600",
    info: "bg-[#34b7ff]/10 text-[#34b7ff]",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${variantStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Estado operacional del vehículo
 */
function OperationalBadge({ status }: Readonly<{ status: Vehicle["operationalStatus"] }>) {
  const config: Record<Vehicle["operationalStatus"], { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof CheckCircle }> = {
    "available": { label: "Disponible", variant: "default", icon: CheckCircle },
    "on-route": { label: "En Ruta", variant: "secondary", icon: MapPin },
    "maintenance": { label: "Mantenimiento", variant: "outline", icon: Wrench },
    "repair": { label: "En Reparación", variant: "outline", icon: Wrench },
    "inactive": { label: "Inactivo", variant: "destructive", icon: XCircle },
  };

  const statusConfig = config[status] || config["inactive"];
  const { label, variant, icon: Icon } = statusConfig;

  return (
    <Badge variant={variant}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}

/**
 * Tarjeta de vehículo
 */
function VehicleCard({ vehicle }: Readonly<{ vehicle: Vehicle }>) {
  const checklistProgress = vehicle.checklist.completionPercentage;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-medium">{vehicle.plate}</p>
              <p className="text-sm text-muted-foreground">
                {vehicle.specs.brand} {vehicle.specs.model} ({vehicle.specs.year})
              </p>
            </div>
          </div>
          <OperationalBadge status={vehicle.operationalStatus} />
        </div>

        {/* Especificaciones */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{vehicle.capacity.maxWeight.toLocaleString()} kg</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>{vehicle.currentMileage?.toLocaleString() || 0} km</span>
          </div>
        </div>

        {/* Checklist Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Documentación</span>
            <span className={checklistProgress === 100 ? "text-green-600" : "text-yellow-600"}>
              {checklistProgress}%
            </span>
          </div>
          <Progress value={checklistProgress} className="h-2" />
        </div>

        {/* Status y Acciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {vehicle.isEnabled ? (
              <Badge variant="default" className="bg-green-500">
                <Shield className="h-3 w-3 mr-1" />
                Habilitado
              </Badge>
            ) : (
              <Badge variant="destructive">
                <ShieldOff className="h-3 w-3 mr-1" />
                Bloqueado
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">Ver</Button>
            <Button variant="ghost" size="sm">Editar</Button>
          </div>
        </div>

        {/* Alertas */}
        {vehicle.documents.some(doc => {
          if (!doc.expirationDate) return false;
          const expiry = new Date(doc.expirationDate);
          const thirtyDays = new Date();
          thirtyDays.setDate(thirtyDays.getDate() + 30);
          return expiry <= thirtyDays && expiry > new Date();
        }) && (
          <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg flex items-center gap-2 text-sm text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            Documentos por vencer
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const CARD_SKELETON_KEYS = ['card-1', 'card-2', 'card-3', 'card-4', 'card-5', 'card-6'] as const;

/**
 * Skeleton de carga
 */
function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {CARD_SKELETON_KEYS.map((key) => (
        <Card key={key}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-37.5" />
                <Skeleton className="h-3 w-25" />
              </div>
            </div>
            <Skeleton className="h-2 w-full mb-4" />
            <Skeleton className="h-8 w-25" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const STATS_SKELETON_KEYS = ['stat-1', 'stat-2', 'stat-3', 'stat-4', 'stat-5', 'stat-6', 'stat-7'] as const;

/**
 * Helper function for rendering stats section
 */
function renderStatsSection(statsLoading: boolean, stats: VehicleStats | null) {
  if (statsLoading) {
    return STATS_SKELETON_KEYS.map((key) => (
      <Card key={key}>
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    ));
  }
  
  if (!stats) return null;
  
  return (
    <>
      <StatCard 
        title="Total" 
        value={stats.total} 
        icon={Truck}
      />
      <StatCard 
        title="Habilitados" 
        value={stats.enabled} 
        icon={Shield}
        variant="success"
      />
      <StatCard 
        title="Bloqueados" 
        value={stats.blocked} 
        icon={ShieldOff}
        variant="danger"
      />
      <StatCard 
        title="Disponibles" 
        value={stats.available} 
        icon={CheckCircle}
        variant="info"
      />
      <StatCard 
        title="En Ruta" 
        value={stats.onRoute} 
        icon={MapPin}
        variant="warning"
      />
      <StatCard 
        title="Mantenimiento" 
        value={stats.inMaintenance} 
        icon={Wrench}
        variant="warning"
      />
      <StatCard 
        title="Docs por vencer" 
        value={stats.expiringSoon} 
        icon={AlertTriangle}
        variant="danger"
      />
    </>
  );
}

/**
 * Helper function for rendering vehicles list
 */
function renderVehiclesList(
  vehiclesLoading: boolean,
  vehicles: Vehicle[] | null,
  search: string
) {
  if (vehiclesLoading) {
    return <CardsSkeleton />;
  }
  
  if (vehicles && vehicles.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay vehículos</h3>
        <p className="text-muted-foreground mb-4">
          {search ? "No se encontraron resultados" : "Comienza agregando tu primer vehículo"}
        </p>
        {!search && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Vehículo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Página principal de Vehículos
 */
export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  
  // Cargar estadísticas
  const { 
    data: stats, 
    loading: statsLoading 
  } = useService<VehicleStats>(
    () => vehiclesService.getStats(),
    { immediate: true }
  );

  // Cargar lista de vehículos
  const { 
    data: vehicles, 
    loading: vehiclesLoading,
    execute: refreshVehicles 
  } = useService<Vehicle[]>(
    () => vehiclesService.getAll({ search }).then(res => res.items),
    { immediate: true }
  );

  // Re-fetch cuando cambia la búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      refreshVehicles();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, refreshVehicles]);

  return (
    <PageWrapper title="Vehículos">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6" />
            Gestión de Vehículos
          </h1>
          <p className="text-muted-foreground">
            Administra tu flota vehicular
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Vehículo
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        {renderStatsSection(statsLoading, stats)}
      </div>

      {/* Búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vehículo (placa, marca)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de vehículos */}
      {renderVehiclesList(vehiclesLoading, vehicles, search)}
    </PageWrapper>
  );
}
