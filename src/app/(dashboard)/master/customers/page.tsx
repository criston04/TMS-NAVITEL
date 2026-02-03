"use client";

/**
 * @fileoverview Página de Clientes - Módulo MAESTRO
 * 
 * Gestión de clientes con estadísticas y acciones CRUD.
 * Consume datos desde customersService.
 * 
 * @module app/(dashboard)/master/customers/page
 */

import { useEffect, useState } from "react";
import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Search, 
  Building2, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { customersService } from "@/services/master";
import { useService } from "@/hooks/use-service";
import { Customer, CustomerStats } from "@/types/models";
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
  variant?: "default" | "success" | "warning" | "danger";
}>) {
  const variantStyles = {
    default: "bg-muted/50",
    success: "bg-green-500/10 text-green-600",
    warning: "bg-yellow-500/10 text-yellow-600",
    danger: "bg-red-500/10 text-red-600",
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
 * Fila de cliente en la tabla
 */
function CustomerRow({ customer }: Readonly<{ customer: Customer }>) {
  // Obtener el contacto principal
  const primaryContact = customer.contacts?.find(c => c.isPrimary) || customer.contacts?.[0];
  
  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.tradeName || customer.documentNumber}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <p className="text-sm">{customer.documentType}: {customer.documentNumber}</p>
      </td>
      <td className="p-4">
        <p className="text-sm">{primaryContact?.name || "-"}</p>
        <p className="text-sm text-muted-foreground">{customer.email}</p>
      </td>
      <td className="p-4">
        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
          {customer.status === "active" ? (
            <><CheckCircle className="h-3 w-3 mr-1" /> Activo</>
          ) : (
            <><XCircle className="h-3 w-3 mr-1" /> Inactivo</>
          )}
        </Badge>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Ver</Button>
          <Button variant="ghost" size="sm">Editar</Button>
        </div>
      </td>
    </tr>
  );
}

/**
 * Skeleton de carga para la tabla
 */
const TABLE_SKELETON_KEYS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5'] as const;

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {TABLE_SKELETON_KEYS.map((key) => (
        <div key={key} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-50" />
            <Skeleton className="h-3 w-37.5" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

const STATS_SKELETON_KEYS = ['stat-1', 'stat-2', 'stat-3', 'stat-4'] as const;

/**
 * Helper function for rendering stats section
 */
function renderStatsSection(statsLoading: boolean, stats: CustomerStats | null) {
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
        title="Total Clientes" 
        value={stats.total} 
        icon={Building2}
      />
      <StatCard 
        title="Activos" 
        value={stats.active} 
        icon={CheckCircle}
        variant="success"
      />
      <StatCard 
        title="Inactivos" 
        value={stats.inactive} 
        icon={XCircle}
        variant="danger"
      />
      <StatCard 
        title="Nuevos este mes" 
        value={stats.newThisMonth} 
        icon={TrendingUp}
        variant="warning"
      />
    </>
  );
}

/**
 * Helper function for rendering customers table content
 */
function renderCustomersContent(
  customersLoading: boolean, 
  customers: Customer[] | null, 
  search: string
) {
  if (customersLoading) {
    return <TableSkeleton />;
  }
  
  if (customers && customers.length > 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="p-4 font-medium">Cliente</th>
              <th className="p-4 font-medium">Documento</th>
              <th className="p-4 font-medium">Contacto</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div className="text-center py-12">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No hay clientes</h3>
      <p className="text-muted-foreground mb-4">
        {search ? "No se encontraron resultados para tu búsqueda" : "Comienza agregando tu primer cliente"}
      </p>
      {!search && (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Cliente
        </Button>
      )}
    </div>
  );
}

/**
 * Página principal de Clientes
 */
export default function CustomersPage() {
  const [search, setSearch] = useState("");
  
  // Cargar estadísticas
  const { 
    data: stats, 
    loading: statsLoading 
  } = useService<CustomerStats>(
    () => customersService.getStats(),
    { immediate: true }
  );

  // Cargar lista de clientes
  const { 
    data: customers, 
    loading: customersLoading,
    execute: refreshCustomers 
  } = useService<Customer[]>(
    () => customersService.getAll({ search }).then(res => res.items),
    { immediate: true }
  );

  // Re-fetch cuando cambia la búsqueda (con debounce)
  useEffect(() => {
    const timeout = setTimeout(() => {
      refreshCustomers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, refreshCustomers]);

  return (
    <PageWrapper title="Clientes">
      {/* Encabezado con acciones */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gestión de Clientes
          </h1>
          <p className="text-muted-foreground">
            Administra la información de tus clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {renderStatsSection(statsLoading, stats)}
      </div>

      {/* Tabla de clientes */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Listado de Clientes</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderCustomersContent(customersLoading, customers, search)}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
