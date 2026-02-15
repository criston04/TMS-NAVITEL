'use client';

/**
 * Bitácora - Módulo de control operativo
 * Visualiza ingresos, salidas y recorridos no planificados.
 * Relaciones: Monitoreo, Geocercas, Órdenes, Reportes.
 * Permite crear órdenes posteriores a partir de eventos registrados.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  LogIn,
  LogOut,
  MapPinOff,
  Route,
  Clock,
  AlertTriangle,
  Gauge,
  PauseCircle,
  Filter,
  Package,
  Eye,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CircleDot,
  XCircle,
  FileUp,
  MapPin,
  Truck,
  User,
  Calendar,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import type {
  BitacoraEntry,
  BitacoraEventType,
  BitacoraStatus,
  BitacoraSeverity,
  BitacoraStats,
  BitacoraVehicleSummary,
  BitacoraGeofenceSummary,
} from '@/types/bitacora';

// ============================================================
// CONSTANTES
// ============================================================

const EVENT_TYPE_CONFIG: Record<BitacoraEventType, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  entry:           { label: 'Ingreso',              icon: LogIn,          color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
  exit:            { label: 'Salida',               icon: LogOut,         color: 'text-blue-600',    bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  unplanned_stop:  { label: 'Parada no planificada', icon: MapPinOff,     color: 'text-amber-600',   bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
  unplanned_route: { label: 'Recorrido no planificado', icon: Route,     color: 'text-orange-600',  bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  dwell:           { label: 'Permanencia prolongada', icon: Clock,        color: 'text-purple-600',  bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  deviation:       { label: 'Desviación de ruta',    icon: AlertTriangle, color: 'text-red-600',     bgColor: 'bg-red-50 dark:bg-red-900/20' },
  idle:            { label: 'Tiempo inactivo',       icon: PauseCircle,   color: 'text-gray-600',    bgColor: 'bg-gray-50 dark:bg-gray-900/20' },
  speeding:        { label: 'Exceso de velocidad',   icon: Gauge,         color: 'text-red-700',     bgColor: 'bg-red-50 dark:bg-red-900/20' },
};

const STATUS_CONFIG: Record<BitacoraStatus, { label: string; icon: React.ElementType; color: string }> = {
  active:        { label: 'Activo',        icon: CircleDot,    color: 'text-green-600' },
  completed:     { label: 'Completado',    icon: CheckCircle2, color: 'text-blue-600' },
  reviewed:      { label: 'Revisado',      icon: Eye,          color: 'text-purple-600' },
  order_created: { label: 'Orden creada',  icon: Package,      color: 'text-amber-600' },
  dismissed:     { label: 'Descartado',    icon: XCircle,      color: 'text-gray-400' },
};

const SEVERITY_CONFIG: Record<BitacoraSeverity, { label: string; color: string; dotColor: string }> = {
  low:      { label: 'Baja',     color: 'text-gray-500',   dotColor: 'bg-gray-400' },
  medium:   { label: 'Media',    color: 'text-amber-500',  dotColor: 'bg-amber-400' },
  high:     { label: 'Alta',     color: 'text-orange-500', dotColor: 'bg-orange-500' },
  critical: { label: 'Crítica',  color: 'text-red-600',    dotColor: 'bg-red-500' },
};

// ============================================================
// SUB-COMPONENTES
// ============================================================

/** KPI Cards para estadísticas generales */
function BitacoraStatsCards({ stats }: { stats: BitacoraStats }) {
  const cards = [
    { label: 'Total registros',        value: stats.totalEntries,       icon: FileText,       color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Ingresos',               value: stats.totalEntries_entry, icon: LogIn,           color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Salidas',                value: stats.totalEntries_exit,  icon: LogOut,          color: 'text-sky-600',     bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Paradas no planificadas', value: stats.unplannedStops,    icon: MapPinOff,       color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Desviaciones',           value: stats.deviations,         icon: AlertTriangle,   color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Eventos activos',        value: stats.activeEvents,       icon: CircleDot,       color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Órdenes creadas',        value: stats.ordersCreated,      icon: Package,         color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Prom. permanencia',      value: `${stats.avgDwellMinutes.toFixed(0)} min`, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3 flex flex-col gap-1 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide truncate">{card.label}</span>
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', card.bg)}>
                <Icon className={cn('h-3.5 w-3.5', card.color)} />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Fila individual de bitácora */
function BitacoraRow({
  entry,
  expanded,
  onToggle,
  onCreateOrder,
}: {
  entry: BitacoraEntry;
  expanded: boolean;
  onToggle: () => void;
  onCreateOrder: (id: string) => void;
}) {
  const eventConfig = EVENT_TYPE_CONFIG[entry.eventType];
  const statusConfig = STATUS_CONFIG[entry.status];
  const severityConfig = SEVERITY_CONFIG[entry.severity];
  const EventIcon = eventConfig.icon;
  const StatusIcon = statusConfig.icon;

  const time = new Date(entry.startTimestamp).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = new Date(entry.startTimestamp).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <div className={cn(
      'bg-white dark:bg-slate-800 rounded-xl border transition-all',
      expanded ? 'border-primary/30 shadow-md' : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600',
    )}>
      {/* Fila principal */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        {/* Indicador de severidad */}
        <div className={cn('w-1.5 h-10 rounded-full shrink-0', severityConfig.dotColor)} />

        {/* Icono del evento */}
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', eventConfig.bgColor)}>
          <EventIcon className={cn('h-4.5 w-4.5', eventConfig.color)} />
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">{eventConfig.label}</span>
            {!entry.wasExpected && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-900/20">
                No planificado
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <Truck className="h-3 w-3" />
            <span className="font-medium">{entry.vehiclePlate}</span>
            {entry.driverName && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <User className="h-3 w-3" />
                <span>{entry.driverName}</span>
              </>
            )}
          </div>
        </div>

        {/* Geocerca / Ubicación */}
        <div className="hidden md:flex flex-col items-end min-w-0 max-w-[200px]">
          {entry.geofenceName ? (
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full text-right">{entry.geofenceName}</span>
          ) : (
            <span className="text-xs text-muted-foreground truncate w-full text-right">{entry.address}</span>
          )}
          {entry.dwellTimeMinutes && (
            <span className="text-[11px] text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-0.5" />{entry.dwellTimeMinutes} min
            </span>
          )}
        </div>

        {/* Status */}
        <div className="hidden sm:flex items-center gap-1.5">
          <StatusIcon className={cn('h-3.5 w-3.5', statusConfig.color)} />
          <span className={cn('text-xs font-medium', statusConfig.color)}>{statusConfig.label}</span>
        </div>

        {/* Hora */}
        <div className="text-right shrink-0 min-w-[50px]">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{time}</div>
          <div className="text-[11px] text-muted-foreground">{date}</div>
        </div>

        {/* Expand */}
        <div className="shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Panel expandido */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-700 pt-3 space-y-3">
          {/* Grid de detalles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {/* Ubicación */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">Ubicación</div>
                <div className="text-xs text-muted-foreground">{entry.address || 'Sin dirección'}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {entry.coordinates.lat.toFixed(5)}, {entry.coordinates.lng.toFixed(5)}
                </div>
              </div>
            </div>

            {/* Geocerca */}
            {entry.geofenceName && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">Geocerca</div>
                  <div className="text-xs text-muted-foreground">{entry.geofenceName}</div>
                  {entry.geofenceCategory && (
                    <Badge variant="outline" className="text-[10px] mt-1 capitalize">{entry.geofenceCategory}</Badge>
                  )}
                </div>
              </div>
            )}

            {/* Tiempos */}
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">Tiempos</div>
                <div className="text-xs text-muted-foreground">
                  Inicio: {new Date(entry.startTimestamp).toLocaleString('es-PE')}
                </div>
                {entry.endTimestamp && (
                  <div className="text-xs text-muted-foreground">
                    Fin: {new Date(entry.endTimestamp).toLocaleString('es-PE')}
                  </div>
                )}
                {entry.durationMinutes && (
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                    Duración: {entry.durationMinutes} min
                  </div>
                )}
              </div>
            </div>

            {/* Velocidad / Desviación */}
            {(entry.speed !== undefined || entry.deviationKm) && (
              <div className="flex items-start gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">Datos adicionales</div>
                  {entry.speed !== undefined && (
                    <div className="text-xs text-muted-foreground">Velocidad: {entry.speed} km/h</div>
                  )}
                  {entry.deviationKm && (
                    <div className="text-xs text-red-500">Desviación: {entry.deviationKm} km</div>
                  )}
                </div>
              </div>
            )}

            {/* Orden relacionada */}
            {entry.relatedOrderNumber && (
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">Orden relacionada</div>
                  <div className="text-xs text-blue-600 font-medium">{entry.relatedOrderNumber}</div>
                </div>
              </div>
            )}

            {/* Orden creada */}
            {entry.createdOrderNumber && (
              <div className="flex items-start gap-2">
                <FileUp className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">Orden generada</div>
                  <div className="text-xs text-violet-600 font-medium">{entry.createdOrderNumber}</div>
                </div>
              </div>
            )}
          </div>

          {/* Descripción */}
          {entry.description && (
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Descripción</div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{entry.description}</p>
            </div>
          )}

          {/* Notas del operador */}
          {entry.operatorNotes && (
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                Notas del operador
                {entry.reviewedBy && <span className="font-normal text-blue-400"> — {entry.reviewedBy}</span>}
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">{entry.operatorNotes}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2 pt-1">
            {entry.status !== 'order_created' && entry.status !== 'dismissed' && (
              <Button
                size="sm"
                onClick={(e) => { e.stopPropagation(); onCreateOrder(entry.id); }}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Package className="h-3.5 w-3.5 mr-1.5" />
                Crear orden
              </Button>
            )}
            <Button size="sm" variant="outline">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Ver en mapa
            </Button>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Tabla resumen por vehículo */
function VehicleSummaryTable({ summaries }: { summaries: BitacoraVehicleSummary[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          Resumen por vehículo
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Vehículo</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Conductor</th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase">Eventos</th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase">Ingresos</th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase">Salidas</th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase">No plan.</th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase">Desv.</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Prom. perm.</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s) => (
              <tr key={s.vehicleId} className="border-b last:border-b-0 border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{s.vehiclePlate}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.driverName || '—'}</td>
                <td className="text-center px-3 py-3 font-medium">{s.totalEvents}</td>
                <td className="text-center px-3 py-3">
                  <span className="text-emerald-600 font-medium">{s.entries}</span>
                </td>
                <td className="text-center px-3 py-3">
                  <span className="text-blue-600 font-medium">{s.exits}</span>
                </td>
                <td className="text-center px-3 py-3">
                  <span className={cn(s.unplannedStops > 0 ? 'text-amber-600 font-medium' : 'text-muted-foreground')}>
                    {s.unplannedStops}
                  </span>
                </td>
                <td className="text-center px-3 py-3">
                  <span className={cn(s.deviations > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground')}>
                    {s.deviations}
                  </span>
                </td>
                <td className="text-right px-4 py-3 text-muted-foreground">{s.avgDwellMinutes} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Tabla resumen por geocerca */
function GeofenceSummaryTable({ summaries }: { summaries: BitacoraGeofenceSummary[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Resumen por geocerca
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Geocerca</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase">Categoría</th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase">Visitas</th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase">Esperadas</th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase">No esperadas</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Prom. perm.</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Total perm.</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s) => (
              <tr key={s.geofenceId} className="border-b last:border-b-0 border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{s.geofenceName}</td>
                <td className="px-3 py-3">
                  <Badge variant="outline" className="text-[10px] capitalize">{s.geofenceCategory || '—'}</Badge>
                </td>
                <td className="text-center px-3 py-3 font-medium">{s.totalVisits}</td>
                <td className="text-center px-3 py-3 text-emerald-600 font-medium">{s.expectedVisits}</td>
                <td className="text-center px-3 py-3">
                  <span className={cn(s.unexpectedVisits > 0 ? 'text-amber-600 font-medium' : 'text-muted-foreground')}>
                    {s.unexpectedVisits}
                  </span>
                </td>
                <td className="text-right px-4 py-3 text-muted-foreground">{s.avgDwellMinutes} min</td>
                <td className="text-right px-4 py-3 text-muted-foreground">{s.totalDwellMinutes} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

interface BitacoraViewProps {
  entries: BitacoraEntry[];
  stats: BitacoraStats;
  vehicleSummaries: BitacoraVehicleSummary[];
  geofenceSummaries: BitacoraGeofenceSummary[];
}

export function BitacoraView({
  entries,
  stats,
  vehicleSummaries,
  geofenceSummaries,
}: BitacoraViewProps) {
  // Estado
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [expectedFilter, setExpectedFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'vehicles' | 'geofences'>('timeline');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Filtrado
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // Búsqueda
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.vehiclePlate.toLowerCase().includes(q) ||
          e.driverName?.toLowerCase().includes(q) ||
          e.geofenceName?.toLowerCase().includes(q) ||
          e.address?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.relatedOrderNumber?.toLowerCase().includes(q)
      );
    }

    // Tipo de evento (multi-select)
    if (eventTypeFilter.length > 0) {
      result = result.filter((e) => eventTypeFilter.includes(e.eventType));
    }

    // Estado
    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }

    // Severidad
    if (severityFilter !== 'all') {
      result = result.filter((e) => e.severity === severityFilter);
    }

    // Esperado/No esperado
    if (expectedFilter !== 'all') {
      result = result.filter((e) =>
        expectedFilter === 'expected' ? e.wasExpected : !e.wasExpected
      );
    }

    // Ordenamiento
    result.sort((a, b) => {
      const dateA = new Date(a.startTimestamp).getTime();
      const dateB = new Date(b.startTimestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [entries, search, eventTypeFilter, statusFilter, severityFilter, expectedFilter, sortOrder]);

  const handleCreateOrder = useCallback((id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      alert(`Se crearía una orden a partir del evento ${entry.id} (${EVENT_TYPE_CONFIG[entry.eventType].label}) del vehículo ${entry.vehiclePlate}`);
    }
  }, [entries]);

  const activeFilterCount = [eventTypeFilter, statusFilter, severityFilter, expectedFilter].filter(f => f !== 'all').length;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <BitacoraStatsCards stats={stats} />

      {/* Barra de acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, conductor, geocerca, dirección..."
            className="pl-10 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filtros toggle */}
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5"
        >
          <Filter className="h-3.5 w-3.5" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary/20 text-primary">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Ordenar */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="gap-1.5"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortOrder === 'newest' ? 'Más recientes' : 'Más antiguos'}
        </Button>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-slate-900 rounded-lg p-0.5 ml-auto">
          {(['timeline', 'vehicles', 'geofences'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab === 'timeline' ? 'Línea de tiempo' : tab === 'vehicles' ? 'Por vehículo' : 'Por geocerca'}
            </button>
          ))}
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de evento</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 text-sm w-full justify-between font-normal">
                  {eventTypeFilter.length === 0
                    ? 'Todos'
                    : eventTypeFilter.length === 1
                      ? EVENT_TYPE_CONFIG[eventTypeFilter[0] as BitacoraEventType]?.label
                      : `${eventTypeFilter.length} seleccionados`}
                  <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1">
                  <button
                    onClick={() => setEventTypeFilter([])}
                    className={cn(
                      'flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors',
                      eventTypeFilter.length === 0 && 'bg-muted font-medium'
                    )}
                  >
                    Todos
                  </button>
                  <div className="h-px bg-border my-1" />
                  {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => {
                    const isChecked = eventTypeFilter.includes(key);
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEventTypeFilter((prev) => [...prev, key]);
                            } else {
                              setEventTypeFilter((prev) => prev.filter((v) => v !== key));
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <config.icon className={cn('h-3.5 w-3.5', config.color)} />
                        <span>{config.label}</span>
                      </label>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Estado</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Severidad</label>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Planificación</label>
            <Select value={expectedFilter} onValueChange={setExpectedFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="expected">Planificados</SelectItem>
                <SelectItem value="unexpected">No planificados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Contenido según tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-12 text-center">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">No se encontraron registros</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Ajusta los filtros o la búsqueda</p>
            </div>
          ) : (
            <>
              <div className="text-xs text-muted-foreground px-1">
                {filteredEntries.length} registro{filteredEntries.length !== 1 ? 's' : ''} encontrado{filteredEntries.length !== 1 ? 's' : ''}
              </div>
              {filteredEntries.map((entry) => (
                <BitacoraRow
                  key={entry.id}
                  entry={entry}
                  expanded={expandedId === entry.id}
                  onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  onCreateOrder={handleCreateOrder}
                />
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'vehicles' && (
        <VehicleSummaryTable summaries={vehicleSummaries} />
      )}

      {activeTab === 'geofences' && (
        <GeofenceSummaryTable summaries={geofenceSummaries} />
      )}
    </div>
  );
}
