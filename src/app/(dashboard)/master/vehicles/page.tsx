"use client";

/**
 * @fileoverview Página de Vehículos - Módulo MAESTRO
 * 
 * Gestión de flota vehicular con checklist, tracking,
 * CRUD completo con modales y drawer de detalles.
 * Incluye: paginación, vista tabla/tarjetas, selección múltiple.
 * 
 * @module app/(dashboard)/master/vehicles/page
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Truck, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Wrench,
  MapPin,
  Shield,
  ShieldOff,
  Gauge,
  Package,
  Clock,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Filter,
  X,
  MoreHorizontal,
  Download,
  Upload,
  UserCircle,
} from "lucide-react";
import { Pagination, ViewToggle, BulkDeleteDialog, DriverVehicleAssignmentModal, ImportModal, type ViewMode } from "@/components/shared";
import { vehiclesService, driversService } from "@/services/master";
import { useService } from "@/hooks/use-service";
import { Vehicle, VehicleStats, VehicleStatus, VehicleOperationalStatus, VehicleType, Driver, FuelType } from "@/types/models";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { exportToExcel, EXPORT_CONFIGS } from "@/lib/excel-utils";

// Componentes locales
import { VehicleFormModal, type VehicleFormData } from "./components/vehicle-form-modal";
import { VehicleDetailDrawer } from "./components/vehicle-detail-drawer";

/**
 * Opciones de filtro para estado administrativo
 */
const STATUS_OPTIONS: { value: VehicleStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "retired", label: "Dado de baja" },
];

/**
 * Opciones de filtro para estado operacional
 */
const OPERATIONAL_OPTIONS: { value: VehicleOperationalStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos los estados operacionales" },
  { value: "available", label: "Disponible" },
  { value: "on-route", label: "En Ruta" },
  { value: "loading", label: "Cargando" },
  { value: "unloading", label: "Descargando" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "repair", label: "En Reparación" },
  { value: "inspection", label: "En Inspección" },
  { value: "standby", label: "En Espera" },
  { value: "inactive", label: "Inactivo" },
];

/**
 * Opciones de filtro para tipo de vehículo
 */
const TYPE_OPTIONS: { value: VehicleType | "all"; label: string }[] = [
  { value: "all", label: "Todos los tipos" },
  { value: "camion", label: "Camión" },
  { value: "tractocamion", label: "Tractocamión" },
  { value: "remolque", label: "Remolque" },
  { value: "semiremolque", label: "Semirremolque" },
  { value: "furgoneta", label: "Furgoneta" },
  { value: "pickup", label: "Pickup" },
  { value: "minivan", label: "Minivan" },
  { value: "cisterna", label: "Cisterna" },
  { value: "volquete", label: "Volquete" },
];

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
    "loading": { label: "Cargando", variant: "secondary", icon: Clock },
    "unloading": { label: "Descargando", variant: "secondary", icon: Clock },
    "maintenance": { label: "Mantenimiento", variant: "outline", icon: Wrench },
    "repair": { label: "En Reparación", variant: "outline", icon: Wrench },
    "inspection": { label: "En Inspección", variant: "outline", icon: Clock },
    "standby": { label: "En Espera", variant: "outline", icon: Clock },
    "inactive": { label: "Inactivo", variant: "destructive", icon: XCircle },
    "operational": { label: "Operativo", variant: "default", icon: CheckCircle },
    "in_transit": { label: "En Tránsito", variant: "secondary", icon: MapPin },
    "parked": { label: "Estacionado", variant: "outline", icon: Clock },
    "in_maintenance": { label: "Mantenimiento", variant: "outline", icon: Wrench },
    "out_of_service": { label: "Fuera de Servicio", variant: "destructive", icon: XCircle },
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
 * Tarjeta de vehículo con acciones y checkbox
 */
function VehicleCard({ 
  vehicle,
  onView,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
}: Readonly<{ 
  vehicle: Vehicle;
  onView: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string, selected: boolean) => void;
}>) {
  const checklistProgress = vehicle.checklist?.completionPercentage ?? 0;

  return (
    <Card className={`hover:shadow-md transition-shadow ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {onToggleSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onToggleSelect(vehicle.id, !!checked)}
              />
            )}
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-medium">{vehicle.plate}</p>
              <p className="text-sm text-muted-foreground">{vehicle.specs?.brand} {vehicle.specs?.model}</p>
            </div>
          </div>
          <OperationalBadge status={vehicle.operationalStatus} />
        </div>

        {/* Info adicional */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>{vehicle.currentMileage?.toLocaleString() ?? 0} km</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{((vehicle.capacity?.maxPayload ?? 0) / 1000).toFixed(1)} ton</span>
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
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onView(vehicle)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(vehicle)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(vehicle)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Documentos/Mantenimiento por vencer */}
        {vehicle.documents?.some(doc => {
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
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-2 w-full mb-4" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const STATS_SKELETON_KEYS = ['stat-1', 'stat-2', 'stat-3', 'stat-4', 'stat-5', 'stat-6', 'stat-7'] as const;

/**
 * Página principal de Vehículos
 */
export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">("all");
  const [operationalFilter, setOperationalFilter] = useState<VehicleOperationalStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<VehicleType | "all">("all");
  
  // Estados para paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // Estado para modo de vista
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  
  // Estados para selección múltiple
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  
  // Estados para modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Verificar si hay filtros activos
  const hasActiveFilters = statusFilter !== "all" || operationalFilter !== "all" || typeFilter !== "all";
  
  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setOperationalFilter("all");
    setTypeFilter("all");
    setSearch("");
  }, []);
  
  // Cargar estadísticas
  const { 
    data: stats, 
    loading: statsLoading,
    execute: refreshStats,
  } = useService<VehicleStats>(
    () => vehiclesService.getStats(),
    { immediate: true }
  );

  // Cargar lista de vehículos
  const { 
    data: vehiclesRaw, 
    loading: vehiclesLoading,
    execute: refreshVehicles 
  } = useService<Vehicle[]>(
    () => vehiclesService.getAll({ search }).then(res => res.items),
    { immediate: true }
  );

  // Filtrar vehículos localmente
  const filteredVehicles = useMemo(() => {
    return vehiclesRaw?.filter(vehicle => {
      if (statusFilter !== "all" && vehicle.status !== statusFilter) return false;
      if (operationalFilter !== "all" && vehicle.operationalStatus !== operationalFilter) return false;
      if (typeFilter !== "all" && vehicle.type !== typeFilter) return false;
      return true;
    }) ?? [];
  }, [vehiclesRaw, statusFilter, operationalFilter, typeFilter]);

  // Calcular paginación
  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Aplicar paginación
  const paginatedVehicles = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredVehicles.slice(start, end);
  }, [filteredVehicles, page, pageSize]);

  // Alias para compatibilidad
  const vehicles = paginatedVehicles;

  // Reset página cuando cambian filtros
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [statusFilter, operationalFilter, typeFilter, search]);

  // Handlers de selección
  const handleToggleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(paginatedVehicles.map(v => v.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [paginatedVehicles]);

  const isAllSelected = paginatedVehicles.length > 0 && 
    paginatedVehicles.every(v => selectedIds.has(v.id));
  const isPartialSelected = selectedIds.size > 0 && !isAllSelected;

  // Re-fetch cuando cambia la búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      refreshVehicles();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, refreshVehicles]);

  // Handlers
  const handleOpenCreate = useCallback(() => {
    setSelectedVehicle(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormModalOpen(true);
    setIsDetailDrawerOpen(false);
  }, []);

  const handleOpenView = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailDrawerOpen(true);
  }, []);

  const handleOpenDelete = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
    setIsDetailDrawerOpen(false);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshVehicles();
    refreshStats();
  }, [refreshVehicles, refreshStats]);

  const handleFormSubmit = useCallback(async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedVehicle) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await vehiclesService.update(selectedVehicle.id, data as any);
        toast.success("Vehículo actualizado correctamente");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await vehiclesService.create(data as any);
        toast.success("Vehículo creado correctamente");
      }
      setIsFormModalOpen(false);
      setSelectedVehicle(null);
      handleRefresh();
    } catch {
      toast.error("Error al guardar vehículo");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedVehicle, handleRefresh]);

  const handleDelete = useCallback(async () => {
    if (!selectedVehicle) return;
    setIsSubmitting(true);
    try {
      await vehiclesService.delete(selectedVehicle.id);
      toast.success("Vehículo eliminado correctamente");
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
      handleRefresh();
    } catch {
      toast.error("Error al eliminar vehículo");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedVehicle, handleRefresh]);

  // Handler de eliminación masiva
  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsSubmitting(true);
    try {
      await vehiclesService.bulkDelete(Array.from(selectedIds));
      toast.success(`${selectedIds.size} vehículo(s) eliminado(s)`);
      setIsBulkDeleteOpen(false);
      setSelectedIds(new Set());
      handleRefresh();
    } catch {
      toast.error("Error al eliminar vehículos");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedIds, handleRefresh]);

  // Cargar conductores para asignación
  const { data: driversForAssignment } = useService<Driver[]>(
    () => driversService.getAll().then(res => res.items),
    { immediate: true }
  );

  // Handler de exportación Excel
  const handleExport = useCallback(() => {
    if (!filteredVehicles || filteredVehicles.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    try {
      exportToExcel(filteredVehicles, EXPORT_CONFIGS.vehicles);
      toast.success(`${filteredVehicles.length} vehículos exportados`);
    } catch {
      toast.error("Error al exportar datos");
    }
  }, [filteredVehicles]);

  // Handler de asignación vehículo-conductor
  const handleOpenAssignment = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsAssignmentModalOpen(true);
  }, []);

  const handleAssign = useCallback(async (driverId: string, vehicleId: string) => {
    try {
      await vehiclesService.assignDriver(vehicleId, driverId);
      toast.success("Conductor asignado correctamente");
      handleRefresh();
    } catch {
      toast.error("Error al asignar conductor");
    }
  }, [handleRefresh]);

  const handleUnassign = useCallback(async (driverId: string, vehicleId: string) => {
    try {
      await vehiclesService.unassignDriver(vehicleId, driverId);
      toast.success("Conductor desasignado correctamente");
      handleRefresh();
    } catch {
      toast.error("Error al desasignar conductor");
    }
  }, [handleRefresh]);

  // Handler de importación desde Excel
  const handleImport = useCallback(async (data: Record<string, unknown>[]) => {
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ row: number; field: string; message: string; value?: string }> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        await vehiclesService.create({
          plate: String(row.plate || ""),
          type: (row.type as VehicleType) || "camion",
          specs: {
            brand: String(row.brand || ""),
            model: String(row.model || ""),
            year: Number(row.year) || new Date().getFullYear(),
            engineNumber: String(row.engineNumber || ""),
            chassisNumber: String(row.chassisNumber || ""),
            color: String(row.color || ""),
            fuelType: (row.fuelType as FuelType) || "diesel",
          },
          capacity: {
            grossWeight: Number(row.capacityWeight) || 0,
            tareWeight: 0,
            maxPayload: Number(row.capacityWeight) || 0,
            maxVolume: Number(row.capacityVolume) || 0,
            palletCapacity: Number(row.capacityPallets) || 0,
          },
          status: "active",
          operationalStatus: "available",
          isEnabled: true,
          currentMileage: Number(row.mileage) || 0,
        } as unknown as Parameters<typeof vehiclesService.create>[0]);
        successCount++;
      } catch {
        errorCount++;
        errors.push({
          row: i + 2, // +2 porque la fila 1 es el header
          field: "general",
          message: "Error al crear el vehículo",
        });
      }
    }

    handleRefresh();
    return {
      totalRows: data.length,
      successCount,
      errorCount,
      errors,
    };
  }, [handleRefresh]);

  // Configuración del importador de vehículos
  const importColumnMapping = [
    { excelHeader: "Placa", fieldKey: "plate", required: true },
    { excelHeader: "Tipo", fieldKey: "type", required: true },
    { excelHeader: "Marca", fieldKey: "brand", required: true },
    { excelHeader: "Modelo", fieldKey: "model", required: true },
    { excelHeader: "Año", fieldKey: "year", required: true },
    { excelHeader: "Nro. Motor", fieldKey: "engineNumber" },
    { excelHeader: "Nro. Chasis", fieldKey: "chassisNumber" },
    { excelHeader: "Color", fieldKey: "color" },
    { excelHeader: "Combustible", fieldKey: "fuelType" },
    { excelHeader: "Capacidad (Kg)", fieldKey: "capacityWeight" },
    { excelHeader: "Capacidad (m³)", fieldKey: "capacityVolume" },
    { excelHeader: "Capacidad (Pallets)", fieldKey: "capacityPallets" },
    { excelHeader: "Kilometraje", fieldKey: "mileage" },
  ];

  const importTemplateConfig = {
    filename: "plantilla_vehiculos",
    columns: [
      { header: "Placa", example: "ABC-123" },
      { header: "Tipo", example: "camion" },
      { header: "Marca", example: "Volvo" },
      { header: "Modelo", example: "FH16" },
      { header: "Año", example: "2023" },
      { header: "Nro. Motor", example: "MOT12345678" },
      { header: "Nro. Chasis", example: "CHS12345678" },
      { header: "Color", example: "Blanco" },
      { header: "Combustible", example: "diesel" },
      { header: "Capacidad (Kg)", example: "25000" },
      { header: "Capacidad (m³)", example: "80" },
      { header: "Capacidad (Pallets)", example: "24" },
      { header: "Kilometraje", example: "50000" },
    ],
  };

  // Renderizar estadísticas
  const renderStatsSection = () => {
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
        <StatCard title="Total" value={stats.total} icon={Truck} />
        <StatCard title="Habilitados" value={stats.enabled} icon={Shield} variant="success" />
        <StatCard title="Bloqueados" value={stats.blocked} icon={ShieldOff} variant="danger" />
        <StatCard title="Disponibles" value={stats.available} icon={CheckCircle} variant="info" />
        <StatCard title="En Ruta" value={stats.onRoute} icon={MapPin} variant="warning" />
        <StatCard title="Mantenimiento" value={stats.inMaintenance} icon={Wrench} variant="warning" />
        <StatCard title="Docs por vencer" value={stats.expiringSoon} icon={AlertTriangle} variant="danger" />
      </>
    );
  };

  // Renderizar lista de vehículos
  const renderVehiclesList = () => {
    if (vehiclesLoading) {
      return <CardsSkeleton />;
    }
    
    if (vehicles && vehicles.length > 0) {
      // Vista de tabla
      if (viewMode === "table") {
        return (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className={isPartialSelected ? "data-[state=checked]:bg-primary/50" : ""}
                    />
                  </TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Habilitación</TableHead>
                  <TableHead>Kilometraje</TableHead>
                  <TableHead>Documentación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => {
                  const checklistProgress = vehicle.checklist?.completionPercentage ?? 0;
                  
                  return (
                    <TableRow key={vehicle.id} className={selectedIds.has(vehicle.id) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(vehicle.id)}
                          onCheckedChange={(checked) => handleToggleSelect(vehicle.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{vehicle.specs?.brand} {vehicle.specs?.model}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.specs?.year}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vehicle.plate}</Badge>
                      </TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>
                        <OperationalBadge status={vehicle.operationalStatus} />
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Gauge className="h-4 w-4 text-muted-foreground" />
                          {vehicle.currentMileage?.toLocaleString() ?? 0} km
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={checklistProgress} className="w-16 h-2" />
                          <span className="text-sm">{checklistProgress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenView(vehicle)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEdit(vehicle)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenAssignment(vehicle)}>
                              <UserCircle className="h-4 w-4 mr-2" />
                              Asignar conductor
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOpenDelete(vehicle)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        );
      }
      
      // Vista de tarjetas
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              isSelected={selectedIds.has(vehicle.id)}
              onToggleSelect={handleToggleSelect}
            />
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
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Vehículo
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

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
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={vehiclesLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${vehiclesLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Vehículo
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        {renderStatsSection()}
      </div>

      {/* Búsqueda y Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vehículo (placa, marca)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Filtro por Estado Administrativo */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as VehicleStatus | "all")}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Filtro por Estado Operacional */}
            <Select value={operationalFilter} onValueChange={(value) => setOperationalFilter(value as VehicleOperationalStatus | "all")}>
              <SelectTrigger className="w-full lg:w-56">
                <SelectValue placeholder="Estado Operacional" />
              </SelectTrigger>
              <SelectContent>
                {OPERATIONAL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Filtro por Tipo de Vehículo */}
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as VehicleType | "all")}>
              <SelectTrigger className="w-full lg:w-44">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            
            {/* Spacer */}
            <div className="flex-1" />
            
            {/* Toggle de vista */}
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
          
          {/* Barra de selección */}
          {selectedIds.size > 0 && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedIds.size} vehículo{selectedIds.size > 1 ? "s" : ""} seleccionado{selectedIds.size > 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                  Deseleccionar todo
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setIsBulkDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar seleccionados
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de vehículos */}
      {renderVehiclesList()}

      {/* Paginación */}
      {totalItems > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          itemLabel="vehículos"
        />
      )}

      {/* Modal de Formulario */}
      <VehicleFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        vehicle={selectedVehicle}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />

      {/* Drawer de Detalle */}
      <VehicleDetailDrawer
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
        vehicle={selectedVehicle}
        onEdit={() => {
          if (selectedVehicle) handleOpenEdit(selectedVehicle);
        }}
        onDelete={() => {
          if (selectedVehicle) handleOpenDelete(selectedVehicle);
        }}
      />

      {/* Dialog de Eliminación Individual */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el vehículo
              {selectedVehicle && ` "${selectedVehicle.plate}"`} del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Eliminación Masiva */}
      <BulkDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        selectedCount={selectedIds.size}
        itemLabel="vehículo"
        itemLabelPlural="vehículos"
        onConfirm={handleBulkDelete}
        isDeleting={isSubmitting}
      />

      {/* Modal de Asignación Vehículo-Conductor */}
      <DriverVehicleAssignmentModal
        open={isAssignmentModalOpen}
        onOpenChange={setIsAssignmentModalOpen}
        mode="vehicle-to-driver"
        vehicle={selectedVehicle}
        drivers={driversForAssignment ?? []}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
      />

      {/* Modal de Importación desde Excel */}
      <ImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        title="Importar Vehículos"
        description="Carga vehículos desde un archivo Excel"
        columnMapping={importColumnMapping}
        templateConfig={importTemplateConfig}
        onImport={handleImport}
      />
    </PageWrapper>
  );
}
