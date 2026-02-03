/**
 * @fileoverview Hook de Gestión de Conductores
 * 
 * Hook personalizado para operaciones CRUD de conductores
 * con estados de carga, caché y optimistic updates.
 * 
 * @module hooks/useDrivers
 */

"use client";

import * as React from "react";
import { Driver, DriverStatus } from "@/types/models/driver";

/* ============================================
   TIPOS
   ============================================ */

export interface DriverFilters {
  search?: string;
  status?: DriverStatus | "all";
  licenseType?: string;
  hasValidDocuments?: boolean;
  assignedVehicle?: boolean;
  sortBy?: "name" | "status" | "hireDate" | "licenseExpiry";
  sortOrder?: "asc" | "desc";
}

export interface DriversState {
  drivers: Driver[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface UseDriversOptions {
  initialFilters?: DriverFilters;
  pageSize?: number;
  autoFetch?: boolean;
}

export interface UseDriversReturn extends DriversState {
  // Acciones CRUD
  fetchDrivers: (filters?: DriverFilters) => Promise<void>;
  getDriverById: (id: string) => Promise<Driver | null>;
  createDriver: (data: Partial<Driver>) => Promise<Driver>;
  updateDriver: (id: string, data: Partial<Driver>) => Promise<Driver>;
  deleteDriver: (id: string) => Promise<void>;
  bulkDeleteDrivers: (ids: string[]) => Promise<void>;
  
  // Paginación
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Filtros
  filters: DriverFilters;
  setFilters: (filters: DriverFilters) => void;
  clearFilters: () => void;
  
  // Selección
  selectedDrivers: string[];
  selectDriver: (id: string) => void;
  deselectDriver: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
  
  // Utilidades
  refetch: () => Promise<void>;
  getDriversByStatus: (status: DriverStatus) => Driver[];
  getExpiringLicenses: (days: number) => Driver[];
  searchDrivers: (query: string) => Driver[];
}

/* ============================================
   DATOS MOCK
   ============================================ */

// TODO: Refactorizar mocks para cumplir con la interfaz Driver completa
const mockDrivers = [
  {
    id: "drv-001",
    name: "Carlos Pérez García",
    email: "carlos.perez@navitel.pe",
    phone: "987654321",
    status: "active",
    documentType: "DNI",
    documentNumber: "12345678",
    birthDate: "1985-03-15",
    address: "Av. Arequipa 1234, Miraflores",
    province: "Lima",
    department: "Lima",
    bloodType: "O+",
    licenseNumber: "Q12345678",
    licenseType: "A-IIIb",
    licenseExpiry: "2026-03-15",
    license: {
      number: "Q12345678",
      category: "A-IIIb",
      issueDate: "2021-03-15",
      expiryDate: "2026-03-15",
      issuingAuthority: "MTC",
      issuingCountry: "PE",
      restrictions: {
        requiresGlasses: false,
        requiresHearingAid: false,
        automaticOnly: false,
        otherRestrictions: [],
      },
      points: 5,
      maxPoints: 100,
      verificationStatus: "verified",
    },
    emergencyContact: { name: "María García", relationship: "spouse", phone: "987654322" },
    additionalEmergencyContacts: [],
    hireDate: "2020-01-15",
    assignedVehicleId: "v001",
    assignedVehiclePlate: "ABC-123",
    medicalExamHistory: [
      {
        id: "med-001",
        type: "periodic",
        date: "2025-06-01",
        expiryDate: "2026-06-01",
        result: "approved",
        restrictions: [],
        clinicName: "Clínica San Pablo",
        clinicRuc: "20100091896",
        doctorName: "Dr. Roberto Sánchez",
        doctorCmp: "012345",
        certificateNumber: "MED-2025-001",
        createdAt: "2025-06-01T10:00:00Z",
      },
    ],
    psychologicalExamHistory: [
      {
        id: "psy-001",
        date: "2025-06-01",
        expiryDate: "2026-06-01",
        result: "approved",
        centerName: "Centro Psicológico Lima",
        psychologistName: "Lic. Ana Rodríguez",
        psychologistLicense: "CPP-12345",
        certificateNumber: "PSY-2025-001",
        profile: {
          stressLevel: "low",
          reactionTime: "normal",
          attentionLevel: "excellent",
          pressureHandling: "good",
        },
        createdAt: "2025-06-01T11:00:00Z",
      },
    ],
    performanceMetrics: {
      overallRating: 4.8,
      completedDeliveries: 245,
      totalKilometers: 125000,
      onTimeDeliveryRate: 98.5,
      fuelEfficiency: 3.2,
      incidentCount: 1,
      customerComplaints: 0,
      evaluationPeriod: {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
    },
    createdAt: "2020-01-15T08:00:00Z",
    updatedAt: "2025-06-15T14:30:00Z",
  },
  {
    id: "drv-002",
    name: "Juan López Mendoza",
    email: "juan.lopez@navitel.pe",
    phone: "987654323",
    status: "active",
    documentType: "dni",
    documentNumber: "23456789",
    birthDate: "1988-07-20",
    address: "Jr. Huancavelica 567, Cercado",
    city: "Lima",
    department: "Lima",
    bloodType: "A+",
    licenseNumber: "Q23456789",
    licenseType: "A-IIIa",
    licenseExpiry: "2025-08-20",
    license: {
      number: "Q23456789",
      category: "A-IIIa",
      issueDate: "2020-08-20",
      expiryDate: "2025-08-20",
      issuingEntity: "MTC",
      restrictions: ["Uso obligatorio de lentes"],
      points: 88,
      isValid: true,
    },
    emergencyContacts: [
      { name: "Rosa Mendoza", relationship: "Madre", phone: "987654324" },
    ],
    hireDate: "2021-06-01",
    performanceMetrics: {
      safetyScore: 88,
      totalTrips: 180,
      totalKilometers: 95000,
      onTimeDeliveryRate: 95.2,
      fuelEfficiency: 3.0,
      incidentCount: 2,
      averageRating: 4.5,
    },
    createdAt: "2021-06-01T08:00:00Z",
    updatedAt: "2025-06-10T16:00:00Z",
  },
  {
    id: "drv-003",
    name: "Pedro Ramírez Torres",
    email: "pedro.ramirez@navitel.pe",
    phone: "987654325",
    status: "suspended",
    documentType: "dni",
    documentNumber: "34567890",
    birthDate: "1990-11-05",
    address: "Av. Colonial 890, Callao",
    city: "Callao",
    department: "Callao",
    bloodType: "B+",
    licenseNumber: "Q34567890",
    licenseType: "A-IIb",
    licenseExpiry: "2024-11-05",
    license: {
      number: "Q34567890",
      category: "A-IIb",
      issueDate: "2019-11-05",
      expiryDate: "2024-11-05",
      issuingEntity: "MTC",
      restrictions: [],
      points: 45,
      isValid: false,
    },
    emergencyContacts: [
      { name: "Carmen Torres", relationship: "Madre", phone: "987654326" },
    ],
    hireDate: "2019-03-15",
    notes: "Suspendido por infracciones múltiples",
    createdAt: "2019-03-15T08:00:00Z",
    updatedAt: "2025-05-20T10:00:00Z",
  },
  {
    id: "drv-004",
    name: "Miguel Ángel Soto",
    email: "miguel.soto@navitel.pe",
    phone: "987654327",
    status: "on_leave",
    documentType: "dni",
    documentNumber: "45678901",
    birthDate: "1982-02-28",
    address: "Av. Brasil 1234, Jesús María",
    city: "Lima",
    department: "Lima",
    bloodType: "AB+",
    licenseNumber: "Q45678901",
    licenseType: "A-IIIc",
    licenseExpiry: "2026-02-28",
    license: {
      number: "Q45678901",
      category: "A-IIIc",
      issueDate: "2021-02-28",
      expiryDate: "2026-02-28",
      issuingEntity: "MTC",
      restrictions: [],
      points: 100,
      isValid: true,
    },
    emergencyContacts: [
      { name: "Elena Soto", relationship: "Esposa", phone: "987654328" },
    ],
    hireDate: "2018-09-01",
    notes: "De permiso médico hasta 2025-08-01",
    createdAt: "2018-09-01T08:00:00Z",
    updatedAt: "2025-06-01T09:00:00Z",
  },
  {
    id: "drv-005",
    name: "Roberto Vargas León",
    email: "roberto.vargas@navitel.pe",
    phone: "987654329",
    status: "inactive",
    documentType: "dni",
    documentNumber: "56789012",
    birthDate: "1975-06-10",
    address: "Jr. Puno 567, Breña",
    city: "Lima",
    department: "Lima",
    bloodType: "O-",
    licenseNumber: "Q56789012",
    licenseType: "A-IIa",
    licenseExpiry: "2025-06-10",
    license: {
      number: "Q56789012",
      category: "A-IIa",
      issueDate: "2020-06-10",
      expiryDate: "2025-06-10",
      issuingEntity: "MTC",
      restrictions: [],
      points: 75,
      isValid: true,
    },
    emergencyContacts: [
      { name: "Luis Vargas", relationship: "Hijo", phone: "987654330" },
    ],
    hireDate: "2015-01-15",
    notes: "Próximo a jubilación",
    createdAt: "2015-01-15T08:00:00Z",
    updatedAt: "2025-04-15T11:00:00Z",
  },
] as unknown as Driver[];

/* ============================================
   HOOK PRINCIPAL
   ============================================ */

export function useDrivers(options: UseDriversOptions = {}): UseDriversReturn {
  const {
    initialFilters = {},
    pageSize: initialPageSize = 10,
    autoFetch = true,
  } = options;

  // Estado principal
  const [state, setState] = React.useState<DriversState>({
    drivers: [],
    isLoading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    pageSize: initialPageSize,
    totalPages: 1,
  });

  // Filtros
  const [filters, setFiltersState] = React.useState<DriverFilters>(initialFilters);

  // Selección
  const [selectedDrivers, setSelectedDrivers] = React.useState<string[]>([]);

  // Caché de datos
  const driversCache = React.useRef<Driver[]>(mockDrivers);

  /**
   * Simula delay de red
   */
  const simulateDelay = (ms: number = 300) => 
    new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Aplica filtros a la lista de conductores
   */
  const applyFilters = React.useCallback((drivers: Driver[], filters: DriverFilters): Driver[] => {
    let result = [...drivers];

    // Búsqueda por texto
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(search) ||
        d.email.toLowerCase().includes(search) ||
        d.documentNumber?.toLowerCase().includes(search) ||
        d.licenseNumber?.toLowerCase().includes(search) ||
        d.phone.includes(search)
      );
    }

    // Filtro por estado
    if (filters.status && filters.status !== "all") {
      result = result.filter(d => d.status === filters.status);
    }

    // Filtro por tipo de licencia
    if (filters.licenseType) {
      result = result.filter(d => 
        d.license?.category === filters.licenseType || 
        d.licenseType === filters.licenseType
      );
    }

    // Filtro por vehículo asignado
    if (filters.assignedVehicle !== undefined) {
      result = result.filter(d => 
        filters.assignedVehicle 
          ? !!d.assignedVehicleId 
          : !d.assignedVehicleId
      );
    }

    // Ordenamiento
    if (filters.sortBy) {
      result.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "hireDate":
            comparison = new Date(a.hireDate || 0).getTime() - new Date(b.hireDate || 0).getTime();
            break;
          case "licenseExpiry":
            const aExpiry = a.license?.expiryDate || a.licenseExpiry || "";
            const bExpiry = b.license?.expiryDate || b.licenseExpiry || "";
            comparison = new Date(aExpiry).getTime() - new Date(bExpiry).getTime();
            break;
        }

        return filters.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return result;
  }, []);

  /**
   * Obtiene lista de conductores con filtros y paginación
   * Usa setState funcional para garantizar acceso al estado más reciente
   */
  const fetchDrivers = React.useCallback(async (newFilters?: DriverFilters) => {
    setState(prev => {
      // Iniciamos la carga
      return { ...prev, isLoading: true, error: null };
    });

    try {
      await simulateDelay(300);

      // Usamos setState funcional para acceder al estado actual
      setState(prev => {
        const currentFilters = newFilters || filters;
        const filteredDrivers = applyFilters(driversCache.current, currentFilters);
        
        // Paginación con valores del estado actual
        const totalCount = filteredDrivers.length;
        const totalPages = Math.ceil(totalCount / prev.pageSize) || 1;
        
        // Ajustar página si es necesario
        const validPage = Math.min(prev.currentPage, totalPages) || 1;
        const startIndex = (validPage - 1) * prev.pageSize;
        const paginatedDrivers = filteredDrivers.slice(startIndex, startIndex + prev.pageSize);

        return {
          ...prev,
          drivers: paginatedDrivers,
          totalCount,
          totalPages,
          currentPage: validPage,
          isLoading: false,
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al cargar conductores",
      }));
    }
  }, [filters, applyFilters]);

  /**
   * Obtiene un conductor por ID
   */
  const getDriverById = React.useCallback(async (id: string): Promise<Driver | null> => {
    await simulateDelay(200);
    return driversCache.current.find(d => d.id === id) || null;
  }, []);

  /**
   * Crea un nuevo conductor
   */
  const createDriver = React.useCallback(async (data: Partial<Driver>): Promise<Driver> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await simulateDelay(500);

      const newDriver: Driver = {
        id: `drv-${Date.now().toString(36)}`,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        status: data.status || "active",
        licenseNumber: data.licenseNumber || "",
        licenseType: data.licenseType || "",
        licenseExpiry: data.licenseExpiry || "",
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Driver;

      driversCache.current = [newDriver, ...driversCache.current];
      
      await fetchDrivers();
      
      return newDriver;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al crear conductor",
      }));
      throw error;
    }
  }, [fetchDrivers]);

  /**
   * Actualiza un conductor
   */
  const updateDriver = React.useCallback(async (id: string, data: Partial<Driver>): Promise<Driver> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await simulateDelay(400);

      const index = driversCache.current.findIndex(d => d.id === id);
      if (index === -1) {
        throw new Error(`Conductor con ID ${id} no encontrado`);
      }

      const updatedDriver: Driver = {
        ...driversCache.current[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      driversCache.current[index] = updatedDriver;
      
      await fetchDrivers();
      
      return updatedDriver;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al actualizar conductor",
      }));
      throw error;
    }
  }, [fetchDrivers]);

  /**
   * Elimina un conductor
   */
  const deleteDriver = React.useCallback(async (id: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await simulateDelay(300);

      driversCache.current = driversCache.current.filter(d => d.id !== id);
      setSelectedDrivers(prev => prev.filter(dId => dId !== id));
      
      await fetchDrivers();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al eliminar conductor",
      }));
      throw error;
    }
  }, [fetchDrivers]);

  /**
   * Elimina múltiples conductores
   */
  const bulkDeleteDrivers = React.useCallback(async (ids: string[]): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await simulateDelay(500);

      driversCache.current = driversCache.current.filter(d => !ids.includes(d.id));
      setSelectedDrivers([]);
      
      await fetchDrivers();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al eliminar conductores",
      }));
      throw error;
    }
  }, [fetchDrivers]);

  // Paginación
  const goToPage = React.useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: Math.max(1, Math.min(page, prev.totalPages)) }));
  }, []);

  const setPageSize = React.useCallback((size: number) => {
    setState(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
  }, []);

  // Filtros
  const setFilters = React.useCallback((newFilters: DriverFilters) => {
    setFiltersState(newFilters);
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const clearFilters = React.useCallback(() => {
    setFiltersState({});
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Selección
  const selectDriver = React.useCallback((id: string) => {
    setSelectedDrivers(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const deselectDriver = React.useCallback((id: string) => {
    setSelectedDrivers(prev => prev.filter(dId => dId !== id));
  }, []);

  const selectAll = React.useCallback(() => {
    setSelectedDrivers(state.drivers.map(d => d.id));
  }, [state.drivers]);

  const deselectAll = React.useCallback(() => {
    setSelectedDrivers([]);
  }, []);

  const isSelected = React.useCallback((id: string) => {
    return selectedDrivers.includes(id);
  }, [selectedDrivers]);

  // Utilidades
  const refetch = React.useCallback(async () => {
    await fetchDrivers();
  }, [fetchDrivers]);

  const getDriversByStatus = React.useCallback((status: DriverStatus): Driver[] => {
    return driversCache.current.filter(d => d.status === status);
  }, []);

  const getExpiringLicenses = React.useCallback((days: number): Driver[] => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return driversCache.current.filter(d => {
      const expiryDate = d.license?.expiryDate || d.licenseExpiry;
      if (!expiryDate) return false;
      const expiry = new Date(expiryDate);
      return expiry > today && expiry <= futureDate;
    });
  }, []);

  const searchDrivers = React.useCallback((query: string): Driver[] => {
    const search = query.toLowerCase();
    return driversCache.current.filter(d =>
      d.name.toLowerCase().includes(search) ||
      d.email.toLowerCase().includes(search) ||
      d.documentNumber?.toLowerCase().includes(search)
    );
  }, []);

  // Auto-fetch al montar
  React.useEffect(() => {
    if (autoFetch) {
      fetchDrivers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]); // Solo en mount, no incluir fetchDrivers para evitar re-ejecución

  // Refetch cuando cambian filtros, página o pageSize
  React.useEffect(() => {
    fetchDrivers();
  }, [filters, state.currentPage, state.pageSize, fetchDrivers]);

  return {
    ...state,
    fetchDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver,
    bulkDeleteDrivers,
    goToPage,
    setPageSize,
    filters,
    setFilters,
    clearFilters,
    selectedDrivers,
    selectDriver,
    deselectDriver,
    selectAll,
    deselectAll,
    isSelected,
    refetch,
    getDriversByStatus,
    getExpiringLicenses,
    searchDrivers,
  };
}

export default useDrivers;
