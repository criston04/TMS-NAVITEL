/**
 * @fileoverview Hook para gestión de geocercas
 * 
 * Principio SRP: Solo maneja estado y operaciones de geocercas.
 * Principio DRY: Centraliza toda la lógica de geocercas.
 * 
 * @module hooks/useGeofences
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { geofencesService } from "@/services/master";
import { 
  Geofence, 
  GeofenceCategory, 
  GeofenceAlerts,
  GeofenceStats,
  GeoCoordinate 
} from "@/types/models/geofence";
import { EntityStatus } from "@/types/common";

/**
 * Estado del hook de geocercas
 */
interface UseGeofencesState {
  geofences: Geofence[];
  selectedIds: Set<string>;
  editingId: string | null;
  isLoading: boolean;
  error: Error | null;
  stats: GeofenceStats | null;
}

/**
 * Filtros para geocercas
 */
interface GeofenceFilters {
  search?: string;
  category?: GeofenceCategory;
  type?: "polygon" | "circle" | "corridor";
  status?: EntityStatus;
  tags?: string[];
  customerId?: string;
}

/**
 * Opciones de configuración del hook
 */
interface UseGeofencesOptions {
  autoLoad?: boolean;
  initialFilters?: GeofenceFilters;
}

/**
 * Retorno del hook useGeofences
 */
interface UseGeofencesReturn {
  // Estado
  geofences: Geofence[];
  filteredGeofences: Geofence[];
  selectedIds: Set<string>;
  selectedGeofences: Geofence[];
  editingId: string | null;
  editingGeofence: Geofence | null;
  isLoading: boolean;
  error: Error | null;
  stats: GeofenceStats | null;
  filters: GeofenceFilters;
  
  // Acciones CRUD
  loadGeofences: () => Promise<void>;
  createGeofence: (geofence: Omit<Geofence, "id" | "createdAt" | "updatedAt">) => Promise<Geofence>;
  updateGeofence: (id: string, data: Partial<Geofence>) => Promise<Geofence>;
  deleteGeofence: (id: string) => Promise<void>;
  deleteMany: (ids: string[]) => Promise<void>;
  duplicateGeofence: (id: string, newName?: string) => Promise<Geofence>;
  
  // Acciones de selección
  selectGeofence: (id: string) => void;
  deselectGeofence: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectByCategory: (category: GeofenceCategory) => void;
  
  // Acciones de edición
  startEditing: (id: string) => void;
  stopEditing: () => void;
  
  // Acciones de filtrado
  setFilters: (filters: GeofenceFilters) => void;
  clearFilters: () => void;
  
  // Acciones de alertas
  updateAlerts: (id: string, alerts: GeofenceAlerts) => Promise<Geofence>;
  
  // Acciones en lote
  updateColorBatch: (ids: string[], color: string) => Promise<void>;
  updateCategoryBatch: (ids: string[], category: GeofenceCategory) => Promise<void>;
  toggleStatusBatch: (ids: string[]) => Promise<void>;
  
  // Exportación/Importación
  exportToKML: (selectedOnly?: boolean) => Promise<string>;
  importFromKML: (content: string) => Promise<{ imported: number; errors: number }>;
  
  // Utilidades
  getGeofenceById: (id: string) => Geofence | undefined;
  isGeofenceSelected: (id: string) => boolean;
  calculateArea: (geofence: Geofence) => number;
  calculatePerimeter: (geofence: Geofence) => number;
  getGeofencesContainingPoint: (point: GeoCoordinate) => Promise<Geofence[]>;
  refreshStats: () => Promise<void>;
}

/**
 * Hook para gestión completa de geocercas
 * 
 * @param options - Opciones de configuración
 * @returns Estado y acciones para geocercas
 * 
 * @example
 * const { 
 *   geofences, 
 *   createGeofence, 
 *   selectedGeofences,
 *   toggleSelection 
 * } = useGeofences({ autoLoad: true });
 */
export function useGeofences(options: UseGeofencesOptions = {}): UseGeofencesReturn {
  const { autoLoad = true, initialFilters = {} } = options;
  
  // Estado principal
  const [state, setState] = useState<UseGeofencesState>({
    geofences: [],
    selectedIds: new Set(),
    editingId: null,
    isLoading: false,
    error: null,
    stats: null,
  });
  
  // Filtros
  const [filters, setFiltersState] = useState<GeofenceFilters>(initialFilters);
  
  // Cargar geocercas
  const loadGeofences = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await geofencesService.getAll();
      const stats = await geofencesService.getStats();
      
      setState((prev) => ({
        ...prev,
        geofences: response.items,
        stats,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Error al cargar geocercas"),
        isLoading: false,
      }));
    }
  }, []);
  
  // Auto-cargar al montar
  useEffect(() => {
    if (autoLoad) {
      loadGeofences();
    }
  }, [autoLoad, loadGeofences]);
  
  // Geocercas filtradas
  const filteredGeofences = useMemo(() => {
    let result = [...state.geofences];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((g) =>
        g.name.toLowerCase().includes(searchLower) ||
        g.description?.toLowerCase().includes(searchLower) ||
        g.tags.some((t) => t.name.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.category) {
      result = result.filter((g) => g.category === filters.category);
    }
    
    if (filters.type) {
      result = result.filter((g) => g.type === filters.type);
    }
    
    if (filters.status) {
      result = result.filter((g) => g.status === filters.status);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((g) =>
        g.tags.some((t) => filters.tags?.includes(t.id))
      );
    }
    
    if (filters.customerId) {
      result = result.filter((g) => g.customerId === filters.customerId);
    }
    
    return result;
  }, [state.geofences, filters]);
  
  // Geocercas seleccionadas
  const selectedGeofences = useMemo(() =>
    state.geofences.filter((g) => state.selectedIds.has(g.id)),
    [state.geofences, state.selectedIds]
  );
  
  // Geocerca en edición
  const editingGeofence = useMemo(() =>
    state.editingId ? state.geofences.find((g) => g.id === state.editingId) || null : null,
    [state.geofences, state.editingId]
  );
  
  // CRUD Operations
  const createGeofence = useCallback(async (
    geofence: Omit<Geofence, "id" | "createdAt" | "updatedAt">
  ): Promise<Geofence> => {
    const newGeofence = await geofencesService.create(geofence);
    setState((prev) => ({
      ...prev,
      geofences: [...prev.geofences, newGeofence],
    }));
    return newGeofence;
  }, []);
  
  const updateGeofence = useCallback(async (
    id: string, 
    data: Partial<Geofence>
  ): Promise<Geofence> => {
    const updated = await geofencesService.update(id, data);
    setState((prev) => ({
      ...prev,
      geofences: prev.geofences.map((g) => (g.id === id ? updated : g)),
    }));
    return updated;
  }, []);
  
  const deleteGeofence = useCallback(async (id: string): Promise<void> => {
    await geofencesService.delete(id);
    setState((prev) => ({
      ...prev,
      geofences: prev.geofences.filter((g) => g.id !== id),
      selectedIds: new Set([...prev.selectedIds].filter((i) => i !== id)),
    }));
  }, []);
  
  const deleteMany = useCallback(async (ids: string[]): Promise<void> => {
    await geofencesService.deleteMany(ids);
    setState((prev) => ({
      ...prev,
      geofences: prev.geofences.filter((g) => !ids.includes(g.id)),
      selectedIds: new Set([...prev.selectedIds].filter((i) => !ids.includes(i))),
    }));
  }, []);
  
  const duplicateGeofence = useCallback(async (
    id: string, 
    newName?: string
  ): Promise<Geofence> => {
    const duplicated = await geofencesService.duplicate(id, newName);
    setState((prev) => ({
      ...prev,
      geofences: [...prev.geofences, duplicated],
    }));
    return duplicated;
  }, []);
  
  // Selection Operations
  const selectGeofence = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedIds: new Set([...prev.selectedIds, id]),
    }));
  }, []);
  
  const deselectGeofence = useCallback((id: string) => {
    setState((prev) => {
      const newIds = new Set(prev.selectedIds);
      newIds.delete(id);
      return { ...prev, selectedIds: newIds };
    });
  }, []);
  
  const toggleSelection = useCallback((id: string) => {
    setState((prev) => {
      const newIds = new Set(prev.selectedIds);
      if (newIds.has(id)) {
        newIds.delete(id);
      } else {
        newIds.add(id);
      }
      return { ...prev, selectedIds: newIds };
    });
  }, []);
  
  const selectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedIds: new Set(filteredGeofences.map((g) => g.id)),
    }));
  }, [filteredGeofences]);
  
  const deselectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedIds: new Set(),
    }));
  }, []);
  
  const selectByCategory = useCallback((category: GeofenceCategory) => {
    setState((prev) => ({
      ...prev,
      selectedIds: new Set(
        prev.geofences.filter((g) => g.category === category).map((g) => g.id)
      ),
    }));
  }, []);
  
  // Editing Operations
  const startEditing = useCallback((id: string) => {
    setState((prev) => ({ ...prev, editingId: id }));
  }, []);
  
  const stopEditing = useCallback(() => {
    setState((prev) => ({ ...prev, editingId: null }));
  }, []);
  
  // Filter Operations
  const setFilters = useCallback((newFilters: GeofenceFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);
  
  // Alerts Operations
  const updateAlerts = useCallback(async (
    id: string, 
    alerts: GeofenceAlerts
  ): Promise<Geofence> => {
    return updateGeofence(id, { alerts });
  }, [updateGeofence]);
  
  // Batch Operations
  const updateColorBatch = useCallback(async (
    ids: string[], 
    color: string
  ): Promise<void> => {
    const updated = await geofencesService.updateColorBatch(ids, color);
    setState((prev) => ({
      ...prev,
      geofences: prev.geofences.map((g) => {
        const upd = updated.find((u) => u.id === g.id);
        return upd || g;
      }),
    }));
  }, []);
  
  const updateCategoryBatch = useCallback(async (
    ids: string[], 
    category: GeofenceCategory
  ): Promise<void> => {
    await Promise.all(ids.map((id) => updateGeofence(id, { category })));
  }, [updateGeofence]);
  
  const toggleStatusBatch = useCallback(async (ids: string[]): Promise<void> => {
    await Promise.all(ids.map((id) => geofencesService.toggleStatus(id)));
    await loadGeofences();
  }, [loadGeofences]);
  
  // Export/Import Operations
  const exportToKML = useCallback(async (selectedOnly = false): Promise<string> => {
    const idsToExport = selectedOnly ? [...state.selectedIds] : undefined;
    return geofencesService.exportToKML({ geofenceIds: idsToExport });
  }, [state.selectedIds]);
  
  const importFromKML = useCallback(async (
    content: string
  ): Promise<{ imported: number; errors: number }> => {
    const result = await geofencesService.importFromKML(content);
    
    // Agregar las geocercas importadas al estado
    setState((prev) => ({
      ...prev,
      geofences: [...prev.geofences, ...result.imported],
    }));
    
    return { 
      imported: result.imported.length, 
      errors: result.errors.length 
    };
  }, []);
  
  // Utility Functions
  const getGeofenceById = useCallback((id: string): Geofence | undefined => {
    return state.geofences.find((g) => g.id === id);
  }, [state.geofences]);
  
  const isGeofenceSelected = useCallback((id: string): boolean => {
    return state.selectedIds.has(id);
  }, [state.selectedIds]);
  
  const calculateArea = useCallback((geofence: Geofence): number => {
    return geofencesService.calculateArea(geofence);
  }, []);
  
  const calculatePerimeter = useCallback((geofence: Geofence): number => {
    return geofencesService.calculatePerimeter(geofence);
  }, []);
  
  const getGeofencesContainingPoint = useCallback(async (
    point: GeoCoordinate
  ): Promise<Geofence[]> => {
    return geofencesService.getContainingPoint(point);
  }, []);
  
  const refreshStats = useCallback(async () => {
    const stats = await geofencesService.getStats();
    setState((prev) => ({ ...prev, stats }));
  }, []);
  
  return {
    // Estado
    geofences: state.geofences,
    filteredGeofences,
    selectedIds: state.selectedIds,
    selectedGeofences,
    editingId: state.editingId,
    editingGeofence,
    isLoading: state.isLoading,
    error: state.error,
    stats: state.stats,
    filters,
    
    // Acciones CRUD
    loadGeofences,
    createGeofence,
    updateGeofence,
    deleteGeofence,
    deleteMany,
    duplicateGeofence,
    
    // Acciones de selección
    selectGeofence,
    deselectGeofence,
    toggleSelection,
    selectAll,
    deselectAll,
    selectByCategory,
    
    // Acciones de edición
    startEditing,
    stopEditing,
    
    // Acciones de filtrado
    setFilters,
    clearFilters,
    
    // Acciones de alertas
    updateAlerts,
    
    // Acciones en lote
    updateColorBatch,
    updateCategoryBatch,
    toggleStatusBatch,
    
    // Exportación/Importación
    exportToKML,
    importFromKML,
    
    // Utilidades
    getGeofenceById,
    isGeofenceSelected,
    calculateArea,
    calculatePerimeter,
    getGeofencesContainingPoint,
    refreshStats,
  };
}

export type { UseGeofencesReturn, GeofenceFilters, UseGeofencesOptions };
