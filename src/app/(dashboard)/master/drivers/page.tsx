"use client";

/**
 * @fileoverview Página de Conductores - Módulo MAESTRO
 * 
 * Gestión de conductores con checklist de documentación,
 * CRUD completo con modales y drawer de detalles.
 * Incluye: paginación, vista tabla/tarjetas, selección múltiple.
 * 
 * @module app/(dashboard)/master/drivers/page
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
  UserCircle, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  MapPin,
  Shield,
  ShieldOff,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Filter,
  X,
  MoreHorizontal,
  Download,
  Upload,
  Truck,
} from "lucide-react";
import { Pagination, ViewToggle, BulkDeleteDialog, DriverVehicleAssignmentModal, ImportModal, type ViewMode } from "@/components/shared";
import { driversService, vehiclesService } from "@/services/master";
import { useService } from "@/hooks/use-service";
import { Driver, DriverStats, DriverStatus, DriverAvailability, LicenseCategory, Vehicle, DriverDocumentType } from "@/types/models";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { exportToExcel, EXPORT_CONFIGS } from "@/lib/excel-utils";

// Componentes locales
import { DriverFormModal, type DriverFormData } from "./components/driver-form-modal";
import { DriverDetailDrawer } from "./components/driver-detail-drawer";

/**
 * Opciones de filtro para estado
 */
const STATUS_OPTIONS: { value: DriverStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "suspended", label: "Suspendido" },
  { value: "on_leave", label: "De permiso" },
  { value: "terminated", label: "Cesado" },
];

/**
 * Opciones de filtro para disponibilidad
 */
const AVAILABILITY_OPTIONS: { value: DriverAvailability | "all"; label: string }[] = [
  { value: "all", label: "Todas las disponibilidades" },
  { value: "available", label: "Disponible" },
  { value: "on-route", label: "En Ruta" },
  { value: "resting", label: "Descansando" },
  { value: "vacation", label: "Vacaciones" },
  { value: "sick-leave", label: "Descanso Médico" },
  { value: "suspended", label: "Suspendido" },
  { value: "unavailable", label: "No disponible" },
];

/**
 * Opciones de filtro para categoría de licencia
 */
const LICENSE_OPTIONS: { value: LicenseCategory | "all"; label: string }[] = [
  { value: "all", label: "Todas las licencias" },
  { value: "A-I", label: "A-I (Motos)" },
  { value: "A-IIa", label: "A-IIa (hasta 3,500 kg)" },
  { value: "A-IIb", label: "A-IIb (hasta 6,000 kg)" },
  { value: "A-IIIa", label: "A-IIIa (hasta 12,000 kg)" },
  { value: "A-IIIb", label: "A-IIIb (+12,000 kg)" },
  { value: "A-IIIc", label: "A-IIIc (Mat. Peligrosos)" },
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
    info: "bg-blue-500/10 text-blue-600",
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
 * Estado de disponibilidad del conductor
 */
function AvailabilityBadge({ availability }: Readonly<{ availability: Driver["availability"] }>) {
  const config: Record<Driver["availability"], { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof CheckCircle }> = {
    "available": { label: "Disponible", variant: "default", icon: CheckCircle },
    "on-route": { label: "En Ruta", variant: "secondary", icon: MapPin },
    "resting": { label: "Descansando", variant: "outline", icon: Clock },
    "vacation": { label: "Vacaciones", variant: "outline", icon: Clock },
    "sick-leave": { label: "Descanso Médico", variant: "outline", icon: Clock },
    "suspended": { label: "Suspendido", variant: "destructive", icon: AlertTriangle },
    "unavailable": { label: "No disponible", variant: "destructive", icon: Clock },
  };

  const availabilityConfig = config[availability] || config["unavailable"];
  const { label, variant, icon: Icon } = availabilityConfig;

  return (
    <Badge variant={variant}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}

/**
 * Tarjeta de conductor con acciones y checkbox
 */
function DriverCard({ 
  driver,
  onView,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
}: Readonly<{ 
  driver: Driver;
  onView: (driver: Driver) => void;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string, selected: boolean) => void;
}>) {
  const checklistProgress = driver.checklist?.completionPercentage ?? 0;

  return (
    <Card className={`hover:shadow-md transition-shadow ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {onToggleSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onToggleSelect(driver.id, !!checked)}
              />
            )}
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-medium">{driver.firstName} {driver.lastName}</p>
              <p className="text-sm text-muted-foreground">{driver.documentNumber}</p>
            </div>
          </div>
          <AvailabilityBadge availability={driver.availability} />
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
            {driver.isEnabled ? (
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
            <Button variant="ghost" size="sm" onClick={() => onView(driver)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(driver)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(driver)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Documentos por vencer */}
        {driver.documents?.some(doc => {
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

const STATS_SKELETON_KEYS = ['stat-1', 'stat-2', 'stat-3', 'stat-4', 'stat-5', 'stat-6'] as const;

/**
 * Página principal de Conductores
 */
export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DriverStatus | "all">("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<DriverAvailability | "all">("all");
  const [licenseFilter, setLicenseFilter] = useState<LicenseCategory | "all">("all");
  
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
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Verificar si hay filtros activos
  const hasActiveFilters = statusFilter !== "all" || availabilityFilter !== "all" || licenseFilter !== "all";
  
  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setAvailabilityFilter("all");
    setLicenseFilter("all");
    setSearch("");
  }, []);
  
  // Cargar estadísticas
  const { 
    data: stats, 
    loading: statsLoading,
    execute: refreshStats,
  } = useService<DriverStats>(
    () => driversService.getStats(),
    { immediate: true }
  );

  // Cargar lista de conductores
  const { 
    data: driversRaw, 
    loading: driversLoading,
    execute: refreshDrivers 
  } = useService<Driver[]>(
    () => driversService.getAll({ search }).then(res => res.items),
    { immediate: true }
  );

  // Filtrar conductores localmente
  const filteredDrivers = useMemo(() => {
    return driversRaw?.filter(driver => {
      if (statusFilter !== "all" && driver.status !== statusFilter) return false;
      if (availabilityFilter !== "all" && driver.availability !== availabilityFilter) return false;
      // Soportar tanto license.category como licenseCategory (legacy)
      if (licenseFilter !== "all") {
        const driverLicenseCategory = driver.license?.category || (driver as unknown as { licenseCategory?: string }).licenseCategory;
        if (driverLicenseCategory !== licenseFilter) return false;
      }
      return true;
    }) ?? [];
  }, [driversRaw, statusFilter, availabilityFilter, licenseFilter]);

  // Calcular paginación
  const totalItems = filteredDrivers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Aplicar paginación
  const paginatedDrivers = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredDrivers.slice(start, end);
  }, [filteredDrivers, page, pageSize]);

  // Alias para compatibilidad
  const drivers = paginatedDrivers;

  // Reset página cuando cambian filtros
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [statusFilter, availabilityFilter, licenseFilter, search]);

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
      setSelectedIds(new Set(paginatedDrivers.map(d => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [paginatedDrivers]);

  const isAllSelected = paginatedDrivers.length > 0 && 
    paginatedDrivers.every(d => selectedIds.has(d.id));
  const isPartialSelected = selectedIds.size > 0 && !isAllSelected;

  // Re-fetch cuando cambia la búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      refreshDrivers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, refreshDrivers]);

  // Handlers
  const handleOpenCreate = useCallback(() => {
    setSelectedDriver(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((driver: Driver) => {
    setSelectedDriver(driver);
    setIsFormModalOpen(true);
    setIsDetailDrawerOpen(false);
  }, []);

  const handleOpenView = useCallback((driver: Driver) => {
    setSelectedDriver(driver);
    setIsDetailDrawerOpen(true);
  }, []);

  const handleOpenDelete = useCallback((driver: Driver) => {
    setSelectedDriver(driver);
    setIsDeleteDialogOpen(true);
    setIsDetailDrawerOpen(false);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshDrivers();
    refreshStats();
  }, [refreshDrivers, refreshStats]);

  const handleFormSubmit = useCallback(async (data: DriverFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedDriver) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await driversService.update(selectedDriver.id, data as any);
        toast.success("Conductor actualizado correctamente");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await driversService.create(data as any);
        toast.success("Conductor creado correctamente");
      }
      setIsFormModalOpen(false);
      setSelectedDriver(null);
      handleRefresh();
    } catch {
      toast.error("Error al guardar conductor");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDriver, handleRefresh]);

  const handleDelete = useCallback(async () => {
    if (!selectedDriver) return;
    setIsSubmitting(true);
    try {
      await driversService.delete(selectedDriver.id);
      toast.success("Conductor eliminado correctamente");
      setIsDeleteDialogOpen(false);
      setSelectedDriver(null);
      handleRefresh();
    } catch {
      toast.error("Error al eliminar conductor");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDriver, handleRefresh]);

  // Handler de eliminación masiva
  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsSubmitting(true);
    try {
      await driversService.bulkDelete(Array.from(selectedIds));
      toast.success(`${selectedIds.size} conductor(es) eliminado(s)`);
      setIsBulkDeleteOpen(false);
      setSelectedIds(new Set());
      handleRefresh();
    } catch {
      toast.error("Error al eliminar conductores");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedIds, handleRefresh]);

  // Cargar vehículos para asignación
  const { data: vehiclesForAssignment } = useService<Vehicle[]>(
    () => vehiclesService.getAll().then(res => res.items),
    { immediate: true }
  );

  // Handler de exportación Excel
  const handleExport = useCallback(() => {
    if (!filteredDrivers || filteredDrivers.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    try {
      exportToExcel(filteredDrivers, EXPORT_CONFIGS.drivers);
      toast.success(`${filteredDrivers.length} conductores exportados`);
    } catch {
      toast.error("Error al exportar datos");
    }
  }, [filteredDrivers]);

  // Handler de asignación conductor-vehículo
  const handleOpenAssignment = useCallback((driver: Driver) => {
    setSelectedDriver(driver);
    setIsAssignmentModalOpen(true);
  }, []);

  const handleAssign = useCallback(async (driverId: string, vehicleId: string) => {
    try {
      await driversService.assignVehicle(driverId, vehicleId);
      toast.success("Vehículo asignado correctamente");
      handleRefresh();
    } catch {
      toast.error("Error al asignar vehículo");
    }
  }, [handleRefresh]);

  const handleUnassign = useCallback(async (driverId: string, vehicleId: string) => {
    try {
      await driversService.unassignVehicle(driverId, vehicleId);
      toast.success("Vehículo desasignado correctamente");
      handleRefresh();
    } catch {
      toast.error("Error al desasignar vehículo");
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
        await driversService.create({
          firstName: String(row.firstName || ""),
          lastName: String(row.lastName || ""),
          documentType: (row.documentType as DriverDocumentType) || "DNI",
          documentNumber: String(row.documentNumber || ""),
          phone: String(row.phone || ""),
          email: String(row.email || ""),
          license: {
            number: String(row.licenseNumber || ""),
            category: (row.licenseCategory as LicenseCategory) || "A-IIa",
            expiryDate: row.licenseExpiry ? String(row.licenseExpiry) : new Date().toISOString().split("T")[0],
          },
          status: "active",
          availability: "available",
          isEnabled: true,
        } as unknown as Parameters<typeof driversService.create>[0]);
        successCount++;
      } catch {
        errorCount++;
        errors.push({
          row: i + 2, // +2 porque la fila 1 es el header
          field: "general",
          message: "Error al crear el conductor",
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

  // Configuración del importador de conductores
  const importColumnMapping = [
    { excelHeader: "Nombres", fieldKey: "firstName", required: true },
    { excelHeader: "Apellidos", fieldKey: "lastName", required: true },
    { excelHeader: "Tipo Doc", fieldKey: "documentType" },
    { excelHeader: "Nro. Documento", fieldKey: "documentNumber", required: true },
    { excelHeader: "Teléfono", fieldKey: "phone" },
    { excelHeader: "Email", fieldKey: "email" },
    { excelHeader: "Nro. Licencia", fieldKey: "licenseNumber", required: true },
    { excelHeader: "Cat. Licencia", fieldKey: "licenseCategory", required: true },
    { excelHeader: "Venc. Licencia", fieldKey: "licenseExpiry", required: true },
  ];

  const importTemplateConfig = {
    filename: "plantilla_conductores",
    columns: [
      { header: "Nombres", example: "Juan Carlos" },
      { header: "Apellidos", example: "Pérez García" },
      { header: "Tipo Doc", example: "DNI" },
      { header: "Nro. Documento", example: "12345678" },
      { header: "Teléfono", example: "987654321" },
      { header: "Email", example: "juan.perez@email.com" },
      { header: "Nro. Licencia", example: "Q12345678" },
      { header: "Cat. Licencia", example: "A-IIIa" },
      { header: "Venc. Licencia", example: "2027-12-31" },
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
        <StatCard title="Total" value={stats.total} icon={UserCircle} />
        <StatCard title="Habilitados" value={stats.enabled} icon={Shield} variant="success" />
        <StatCard title="Bloqueados" value={stats.blocked} icon={ShieldOff} variant="danger" />
        <StatCard title="Disponibles" value={stats.available} icon={CheckCircle} variant="info" />
        <StatCard title="En Ruta" value={stats.onRoute} icon={MapPin} variant="warning" />
        <StatCard title="Docs por vencer" value={stats.expiringSoon} icon={AlertTriangle} variant="danger" />
      </>
    );
  };

  // Renderizar lista de conductores
  const renderDriversList = () => {
    if (driversLoading) {
      return <CardsSkeleton />;
    }
    
    if (drivers && drivers.length > 0) {
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
                  <TableHead>Conductor</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Licencia</TableHead>
                  <TableHead>Disponibilidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Documentación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => {
                  // Compatibilidad con datos legacy
                  const driverAny = driver as unknown as { 
                    licenseCategory?: string; 
                    name?: string;
                    licenseNumber?: string;
                  };
                  const licenseCategory = driver.license?.category || driverAny.licenseCategory || "N/A";
                  const checklistProgress = driver.checklist?.completionPercentage ?? 0;
                  
                  return (
                    <TableRow key={driver.id} className={selectedIds.has(driver.id) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(driver.id)}
                          onCheckedChange={(checked) => handleToggleSelect(driver.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{driver.firstName} {driver.lastName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{driver.documentNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{licenseCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        <AvailabilityBadge availability={driver.availability} />
                      </TableCell>
                      <TableCell>
                        {driver.isEnabled ? (
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
                            <DropdownMenuItem onClick={() => handleOpenView(driver)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEdit(driver)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenAssignment(driver)}>
                              <Truck className="h-4 w-4 mr-2" />
                              Asignar vehículo
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOpenDelete(driver)}
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
          {drivers.map((driver) => (
            <DriverCard 
              key={driver.id} 
              driver={driver}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              isSelected={selectedIds.has(driver.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      );
    }
    
    return (
      <Card>
        <CardContent className="text-center py-12">
          <UserCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay conductores</h3>
          <p className="text-muted-foreground mb-4">
            {search ? "No se encontraron resultados" : "Comienza agregando tu primer conductor"}
          </p>
          {!search && (
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Conductor
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <PageWrapper title="Conductores">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCircle className="h-6 w-6" />
            Gestión de Conductores
          </h1>
          <p className="text-muted-foreground">
            Administra conductores y su documentación
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={driversLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${driversLoading ? "animate-spin" : ""}`} />
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
            Nuevo Conductor
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
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
                placeholder="Buscar conductor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Filtro por Estado */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DriverStatus | "all")}>
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
            
            {/* Filtro por Disponibilidad */}
            <Select value={availabilityFilter} onValueChange={(value) => setAvailabilityFilter(value as DriverAvailability | "all")}>
              <SelectTrigger className="w-full lg:w-56">
                <SelectValue placeholder="Disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Filtro por Licencia */}
            <Select value={licenseFilter} onValueChange={(value) => setLicenseFilter(value as LicenseCategory | "all")}>
              <SelectTrigger className="w-full lg:w-52">
                <SelectValue placeholder="Licencia" />
              </SelectTrigger>
              <SelectContent>
                {LICENSE_OPTIONS.map((option) => (
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
                {selectedIds.size} conductor{selectedIds.size > 1 ? "es" : ""} seleccionado{selectedIds.size > 1 ? "s" : ""}
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

      {/* Lista de conductores */}
      {renderDriversList()}

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
          itemLabel="conductores"
        />
      )}

      {/* Modal de Formulario */}
      <DriverFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        driver={selectedDriver}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />

      {/* Drawer de Detalle */}
      <DriverDetailDrawer
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
        driver={selectedDriver}
        onEdit={() => {
          if (selectedDriver) handleOpenEdit(selectedDriver);
        }}
        onDelete={() => {
          if (selectedDriver) handleOpenDelete(selectedDriver);
        }}
      />

      {/* Dialog de Eliminación Individual */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conductor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el conductor
              {selectedDriver && ` "${selectedDriver.firstName} ${selectedDriver.lastName}"`} del sistema.
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
        itemLabel="conductor"
        itemLabelPlural="conductores"
        onConfirm={handleBulkDelete}
        isDeleting={isSubmitting}
      />

      {/* Modal de Asignación Conductor-Vehículo */}
      <DriverVehicleAssignmentModal
        open={isAssignmentModalOpen}
        onOpenChange={setIsAssignmentModalOpen}
        mode="driver-to-vehicle"
        driver={selectedDriver}
        vehicles={vehiclesForAssignment ?? []}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
      />

      {/* Modal de Importación desde Excel */}
      <ImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        title="Importar Conductores"
        description="Carga conductores desde un archivo Excel"
        columnMapping={importColumnMapping}
        templateConfig={importTemplateConfig}
        onImport={handleImport}
      />
    </PageWrapper>
  );
}
