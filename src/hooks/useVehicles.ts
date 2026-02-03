/**
 * @fileoverview Hook de Gestión de Vehículos
 * 
 * Hook personalizado para operaciones CRUD de vehículos
 * con estados de carga, caché y optimistic updates.
 * 
 * @module hooks/useVehicles
 */

"use client";

import * as React from "react";
import { 
  Vehicle, 
  VehicleType,
  VehicleOperationalStatus 
} from "@/types/models/vehicle";
import { EntityStatus } from "@/types/common";

/* ============================================
   TIPOS
   ============================================ */

export interface VehicleFilters {
  search?: string;
  status?: EntityStatus | "all";
  operationalStatus?: VehicleOperationalStatus | "all";
  type?: VehicleType | "all";
  hasDriver?: boolean;
  hasValidDocuments?: boolean;
  needsMaintenance?: boolean;
  sortBy?: "plate" | "status" | "type" | "brand" | "lastMaintenance";
  sortOrder?: "asc" | "desc";
}

export interface VehiclesState {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface UseVehiclesOptions {
  initialFilters?: VehicleFilters;
  pageSize?: number;
  autoFetch?: boolean;
}

export interface UseVehiclesReturn extends VehiclesState {
  // Acciones CRUD
  fetchVehicles: (filters?: VehicleFilters) => Promise<void>;
  getVehicleById: (id: string) => Promise<Vehicle | null>;
  createVehicle: (data: Partial<Vehicle>) => Promise<Vehicle>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
  bulkDeleteVehicles: (ids: string[]) => Promise<void>;
  
  // Paginación
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Filtros
  filters: VehicleFilters;
  setFilters: (filters: VehicleFilters) => void;
  clearFilters: () => void;
  
  // Selección
  selectedVehicles: string[];
  selectVehicle: (id: string) => void;
  deselectVehicle: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
  
  // Utilidades
  refetch: () => Promise<void>;
  getVehiclesByStatus: (status: EntityStatus) => Vehicle[];
  getVehiclesByType: (type: VehicleType) => Vehicle[];
  getAvailableVehicles: () => Vehicle[];
  getExpiringDocuments: (days: number) => Vehicle[];
  getVehiclesNeedingMaintenance: () => Vehicle[];
  searchVehicles: (query: string) => Vehicle[];
}

/* ============================================
   DATOS MOCK
   ============================================ */

// TODO: Refactorizar mocks para cumplir con la interfaz Vehicle completa
const mockVehicles = [
  {
    id: "v001",
    plate: "ABC-123",
    type: "truck",
    brand: "Volvo",
    model: "FH16",
    year: 2022,
    color: "Blanco",
    status: "active",
    operationalStatus: "operational",
    specs: {
      engine: "Diesel Turbo 16L",
      power: "750 HP",
      transmission: "I-Shift 14 velocidades",
      fuelType: "diesel",
      fuelCapacity: 600,
      mileage: 85000,
      vin: "YV2RT40A5MA123456",
      engineNumber: "D16K750-12345",
      chassisNumber: "YV2RT40A123456789",
      grossWeight: 40000,
      netWeight: 8500,
      maxPayload: 31500,
    },
    dimensions: {
      length: 18.75,
      width: 2.55,
      height: 4.0,
    },
    capacity: {
      loadCapacity: 31500,
      volumeCapacity: 90,
      palletCapacity: 33,
      unit: "kg",
      containerSize: "40ft",
      hazmatCertified: true,
      temperatureControlled: false,
    },
    registration: {
      registrationNumber: "ABC-123",
      registrationDate: "2022-01-15",
      registrationExpiry: "2027-01-15",
      ownerName: "Navitel SAC",
      ownerRuc: "20601234567",
      ownerAddress: "Av. Industrial 1234, Ate",
      region: "Lima",
      province: "Lima",
      district: "Ate",
    },
    insurancePolicies: [
      {
        id: "ins-001",
        type: "soat",
        provider: "Rímac Seguros",
        policyNumber: "SOAT-2025-001234",
        startDate: "2025-01-01",
        endDate: "2026-01-01",
        coverage: 1250000,
        premium: 850,
        status: "active",
      },
      {
        id: "ins-002",
        type: "third_party",
        provider: "Pacífico Seguros",
        policyNumber: "RC-2025-005678",
        startDate: "2025-01-01",
        endDate: "2026-01-01",
        coverage: 5000000,
        premium: 3500,
        status: "active",
      },
    ],
    currentInspection: {
      id: "insp-001",
      date: "2025-03-15",
      expiryDate: "2026-03-15",
      result: "approved",
      inspectionCenter: "REVISIONES TECNICAS DEL PERU SAC",
      inspectionCenterRuc: "20509876543",
      certificateNumber: "RT-2025-123456",
      observations: [],
      nextInspectionDate: "2026-03-15",
      createdAt: "2025-03-15T10:00:00Z",
    },
    operatingCertificate: {
      id: "cert-001",
      certificateNumber: "TUM-2025-00123",
      type: "nacional",
      issueDate: "2025-01-15",
      expiryDate: "2026-01-15",
      issuingEntity: "MTC",
      authorizedRoutes: ["Nacional"],
      serviceType: "carga_pesada",
      restrictions: [],
      status: "active",
    },
    gpsDevice: {
      id: "gps-001",
      deviceId: "GPS-NAVITEL-001",
      brand: "Queclink",
      model: "GV300",
      imei: "123456789012345",
      simNumber: "987654321",
      simOperator: "Movistar",
      installationDate: "2022-01-20",
      status: "active",
      mtcCertified: true,
      mtcCertificationNumber: "MTC-GPS-2022-001",
      mtcCertificationExpiry: "2025-01-20",
      features: ["Geofencing", "Speed Alerts", "Route Tracking"],
    },
    currentDriverId: "drv-001",
    currentDriverName: "Carlos Pérez García",
    maintenanceHistory: [
      {
        id: "maint-001",
        type: "preventive",
        date: "2025-05-01",
        mileageAtService: 80000,
        description: "Mantenimiento preventivo 80,000 km",
        workshop: "Taller Autorizado Volvo Lima",
        workshopRuc: "20456789012",
        cost: 3500,
        currency: "PEN",
        workItems: [
          {
            id: "wi-001",
            description: "Cambio de aceite motor",
            quantity: 1,
            unitCost: 450,
            totalCost: 450,
            partNumber: "VOL-OIL-16L",
          },
          {
            id: "wi-002",
            description: "Filtro de aceite",
            quantity: 1,
            unitCost: 180,
            totalCost: 180,
            partNumber: "VOL-FLT-001",
          },
          {
            id: "wi-003",
            description: "Filtro de aire",
            quantity: 1,
            unitCost: 250,
            totalCost: 250,
            partNumber: "VOL-AIR-001",
          },
        ],
        technician: "Luis Rodríguez",
        status: "completed",
        completedDate: "2025-05-02",
        nextScheduledDate: "2025-08-01",
        nextScheduledMileage: 100000,
        createdAt: "2025-05-01T08:00:00Z",
        updatedAt: "2025-05-02T16:00:00Z",
      },
    ],
    maintenanceSchedules: [
      {
        id: "sched-001",
        type: "preventive",
        description: "Mantenimiento preventivo 100,000 km",
        scheduledDate: "2025-08-15",
        scheduledMileage: 100000,
        priority: "medium",
        estimatedDuration: 8,
        status: "scheduled",
        createdAt: "2025-05-02T16:00:00Z",
      },
    ],
    fuelHistory: [
      {
        id: "fuel-001",
        date: "2025-06-20",
        fuelType: "diesel",
        quantity: 450,
        unitPrice: 15.50,
        totalCost: 6975,
        odometer: 84500,
        station: "Grifo Primax - Ate",
        fullTank: true,
        driverId: "drv-001",
        driverName: "Carlos Pérez García",
      },
      {
        id: "fuel-002",
        date: "2025-06-15",
        fuelType: "diesel",
        quantity: 420,
        unitPrice: 15.30,
        totalCost: 6426,
        odometer: 83200,
        station: "Grifo Repsol - La Victoria",
        fullTank: true,
        driverId: "drv-001",
        driverName: "Carlos Pérez García",
      },
    ],
    performanceMetrics: {
      fuelEfficiency: 3.2,
      utilizationRate: 85,
      averageTripsPerMonth: 18,
      averageKmPerTrip: 850,
      maintenanceCostPerKm: 0.15,
      incidentRate: 0.02,
      onTimeDeliveryRate: 98.5,
    },
    notes: "Vehículo principal para rutas nacionales largas",
    createdAt: "2022-01-15T08:00:00Z",
    updatedAt: "2025-06-20T14:00:00Z",
  },
  {
    id: "v002",
    plate: "DEF-456",
    type: "truck",
    brand: "Scania",
    model: "R450",
    year: 2021,
    color: "Azul",
    status: "active",
    operationalStatus: "operational",
    specs: {
      engine: "Diesel DC13 13L",
      power: "450 HP",
      transmission: "Opticruise 12 velocidades",
      fuelType: "diesel",
      fuelCapacity: 400,
      mileage: 120000,
      vin: "XLER4X20005123456",
      engineNumber: "DC13-450-23456",
      chassisNumber: "XLER4X2005123456",
      grossWeight: 26000,
      netWeight: 7800,
      maxPayload: 18200,
    },
    capacity: {
      loadCapacity: 18200,
      volumeCapacity: 65,
      palletCapacity: 22,
      unit: "kg",
    },
    insurancePolicies: [
      {
        id: "ins-003",
        type: "soat",
        provider: "La Positiva",
        policyNumber: "SOAT-2025-002345",
        startDate: "2025-02-01",
        endDate: "2026-02-01",
        coverage: 1250000,
        premium: 780,
        status: "active",
      },
    ],
    currentInspection: {
      id: "insp-002",
      date: "2025-04-20",
      expiryDate: "2026-04-20",
      result: "approved",
      inspectionCenter: "CERTIPERUSAC",
      inspectionCenterRuc: "20512345678",
      certificateNumber: "RT-2025-234567",
      observations: [],
      nextInspectionDate: "2026-04-20",
      createdAt: "2025-04-20T09:00:00Z",
    },
    performanceMetrics: {
      fuelEfficiency: 2.8,
      utilizationRate: 78,
      averageTripsPerMonth: 15,
      averageKmPerTrip: 650,
      maintenanceCostPerKm: 0.12,
      incidentRate: 0.01,
      onTimeDeliveryRate: 97.2,
    },
    createdAt: "2021-03-10T08:00:00Z",
    updatedAt: "2025-06-18T10:00:00Z",
  },
  {
    id: "v003",
    plate: "GHI-789",
    type: "van",
    brand: "Mercedes-Benz",
    model: "Sprinter 516",
    year: 2023,
    color: "Blanco",
    status: "active",
    operationalStatus: "operational",
    specs: {
      engine: "Diesel OM651 2.2L",
      power: "163 HP",
      transmission: "Automática 7G-Tronic",
      fuelType: "diesel",
      fuelCapacity: 75,
      mileage: 35000,
      vin: "WDB9066571S123456",
      engineNumber: "OM651-98765",
      chassisNumber: "WDB9066571S123456",
      grossWeight: 5500,
      netWeight: 2500,
      maxPayload: 3000,
    },
    capacity: {
      loadCapacity: 3000,
      volumeCapacity: 17,
      palletCapacity: 6,
      unit: "kg",
      temperatureControlled: true,
      temperatureRange: { min: 2, max: 8 },
    },
    insurancePolicies: [
      {
        id: "ins-004",
        type: "soat",
        provider: "Rímac Seguros",
        policyNumber: "SOAT-2025-003456",
        startDate: "2025-03-01",
        endDate: "2026-03-01",
        coverage: 1250000,
        premium: 520,
        status: "active",
      },
    ],
    notes: "Vehículo refrigerado para productos perecibles",
    performanceMetrics: {
      fuelEfficiency: 5.2,
      utilizationRate: 92,
      averageTripsPerMonth: 45,
      averageKmPerTrip: 120,
      maintenanceCostPerKm: 0.08,
      incidentRate: 0.005,
      onTimeDeliveryRate: 99.1,
    },
    createdAt: "2023-02-20T08:00:00Z",
    updatedAt: "2025-06-19T11:00:00Z",
  },
  {
    id: "v004",
    plate: "JKL-012",
    type: "truck",
    brand: "Hino",
    model: "500 Series",
    year: 2020,
    color: "Blanco",
    status: "maintenance",
    operationalStatus: "in_maintenance",
    specs: {
      engine: "Diesel J08E 8L",
      power: "300 HP",
      transmission: "Manual 6 velocidades",
      fuelType: "diesel",
      fuelCapacity: 200,
      mileage: 180000,
      vin: "JHDGH8JSKA123456",
      engineNumber: "J08E-45678",
      chassisNumber: "JHDGH8JSKA123456",
      grossWeight: 16000,
      netWeight: 5500,
      maxPayload: 10500,
    },
    capacity: {
      loadCapacity: 10500,
      volumeCapacity: 40,
      palletCapacity: 14,
      unit: "kg",
    },
    maintenanceSchedules: [
      {
        id: "sched-002",
        type: "corrective",
        description: "Reparación de sistema de frenos",
        scheduledDate: "2025-06-22",
        priority: "high",
        estimatedDuration: 16,
        status: "in_progress",
        createdAt: "2025-06-20T08:00:00Z",
      },
    ],
    notes: "En taller por reparación de frenos",
    createdAt: "2020-06-15T08:00:00Z",
    updatedAt: "2025-06-21T09:00:00Z",
  },
  {
    id: "v005",
    plate: "MNO-345",
    type: "pickup",
    brand: "Toyota",
    model: "Hilux",
    year: 2022,
    color: "Gris",
    status: "inactive",
    operationalStatus: "parked",
    specs: {
      engine: "Diesel 2.8L Turbo",
      power: "204 HP",
      transmission: "Automática 6 velocidades",
      fuelType: "diesel",
      fuelCapacity: 80,
      mileage: 45000,
      vin: "MR0FB8CD7N123456",
      engineNumber: "1GD-78901",
      chassisNumber: "MR0FB8CD7N123456",
      grossWeight: 3210,
      netWeight: 1990,
      maxPayload: 1220,
    },
    capacity: {
      loadCapacity: 1220,
      volumeCapacity: 2.5,
      unit: "kg",
    },
    insurancePolicies: [
      {
        id: "ins-005",
        type: "soat",
        provider: "Mapfre",
        policyNumber: "SOAT-2024-004567",
        startDate: "2024-05-01",
        endDate: "2025-05-01",
        coverage: 1250000,
        premium: 350,
        status: "expired",
      },
    ],
    notes: "SOAT vencido - Pendiente renovación",
    createdAt: "2022-08-10T08:00:00Z",
    updatedAt: "2025-06-15T14:00:00Z",
  },
] as unknown as Vehicle[];

/* ============================================
   HOOK PRINCIPAL
   ============================================ */

export function useVehicles(options: UseVehiclesOptions = {}): UseVehiclesReturn {
  const {
    initialFilters = {},
    pageSize: initialPageSize = 10,
    autoFetch = true,
  } = options;

  // Estado principal
  const [state, setState] = React.useState<VehiclesState>({
    vehicles: [],
    isLoading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    pageSize: initialPageSize,
    totalPages: 1,
  });

  // Filtros
  const [filters, setFiltersState] = React.useState<VehicleFilters>(initialFilters);

  // Selección
  const [selectedVehicles, setSelectedVehicles] = React.useState<string[]>([]);

  // Caché de datos
  const vehiclesCache = React.useRef<Vehicle[]>(mockVehicles);

  /**
   * Simula delay de red
   */
  const simulateDelay = (ms: number = 300) => 
    new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Aplica filtros a la lista de vehículos
   */
  const applyFilters = React.useCallback((vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] => {
    let result = [...vehicles];

    // Búsqueda por texto
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(v => 
        v.plate.toLowerCase().includes(search) ||
        v.specs?.brand?.toLowerCase().includes(search) ||
        v.specs?.model?.toLowerCase().includes(search) ||
        v.currentDriverName?.toLowerCase().includes(search) ||
        v.specs?.chassisNumber?.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    if (filters.status && filters.status !== "all") {
      result = result.filter(v => v.status === filters.status);
    }

    // Filtro por estado operacional
    if (filters.operationalStatus && filters.operationalStatus !== "all") {
      result = result.filter(v => v.operationalStatus === filters.operationalStatus);
    }

    // Filtro por tipo
    if (filters.type && filters.type !== "all") {
      result = result.filter(v => v.type === filters.type);
    }

    // Filtro por conductor asignado
    if (filters.hasDriver !== undefined) {
      result = result.filter(v => 
        filters.hasDriver ? !!v.currentDriverId : !v.currentDriverId
      );
    }

    // Filtro por mantenimiento pendiente
    if (filters.needsMaintenance) {
      result = result.filter(v => 
        v.maintenanceSchedules?.some(s => {
          // Verificar si tiene próxima fecha o kilometraje de mantenimiento
          const hasPendingDate = s.nextDueDate && new Date(s.nextDueDate) <= new Date();
          const hasPendingMileage = s.nextDueMileage && v.currentMileage >= s.nextDueMileage;
          return hasPendingDate || hasPendingMileage;
        }) || v.operationalStatus === "maintenance"
      );
    }

    // Ordenamiento
    if (filters.sortBy) {
      result.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case "plate":
            comparison = a.plate.localeCompare(b.plate);
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "type":
            comparison = a.type.localeCompare(b.type);
            break;
          case "brand":
            comparison = (a.specs?.brand || "").localeCompare(b.specs?.brand || "");
            break;
          case "lastMaintenance":
            const aDate = a.maintenanceHistory?.[0]?.date || "";
            const bDate = b.maintenanceHistory?.[0]?.date || "";
            comparison = new Date(bDate).getTime() - new Date(aDate).getTime();
            break;
        }

        return filters.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return result;
  }, []);

  /**
   * Obtiene lista de vehículos con filtros y paginación
   * Usa setState funcional para garantizar acceso al estado más reciente
   */
  const fetchVehicles = React.useCallback(async (newFilters?: VehicleFilters) => {
    setState(prev => {
      // Iniciamos la carga
      return { ...prev, isLoading: true, error: null };
    });

    try {
      await simulateDelay(300);

      // Usamos setState funcional para acceder al estado actual
      setState(prev => {
        const currentFilters = newFilters || filters;
        const filteredVehicles = applyFilters(vehiclesCache.current, currentFilters);
        
        // Paginación con valores del estado actual
        const totalCount = filteredVehicles.length;
        const totalPages = Math.ceil(totalCount / prev.pageSize) || 1;
        
        // Ajustar página si es necesario
        const validPage = Math.min(prev.currentPage, totalPages) || 1;
        const startIndex = (validPage - 1) * prev.pageSize;
        const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + prev.pageSize);

        return {
          ...prev,
          vehicles: paginatedVehicles,
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
        error: error instanceof Error ? error.message : "Error al cargar vehículos",
      }));
    }
  }, [filters, applyFilters]);

  /**
   * Obtiene un vehículo por ID
   */
  const getVehicleById = React.useCallback(async (id: string): Promise<Vehicle | null> => {
    await simulateDelay(200);
    return vehiclesCache.current.find(v => v.id === id) || null;
  }, []);

  /**
   * Crea un nuevo vehículo
   */
  const createVehicle = React.useCallback(async (data: Partial<Vehicle>): Promise<Vehicle> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await simulateDelay(500);

      // Crear nuevo vehículo con estructura adaptada
      const newVehicle = {
        id: `v${Date.now().toString(36)}`,
        plate: data.plate || "",
        type: data.type || "camion",
        bodyType: data.bodyType || "furgon",
        status: data.status || "active",
        operationalStatus: data.operationalStatus || "available",
        currentMileage: 0,
        maintenanceHistory: [],
        maintenanceSchedules: [],
        fuelHistory: [],
        incidents: [],
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as Vehicle;

      vehiclesCache.current = [newVehicle, ...vehiclesCache.current];
      
      await fetchVehicles();
      
      return newVehicle;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al crear vehículo",
      }));
      throw error;
    }
  }, [fetchVehicles]);

  /**
   * Actualiza un vehículo
   */
  const updateVehicle = React.useCallback(async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await simulateDelay(400);

      const index = vehiclesCache.current.findIndex(v => v.id === id);
      if (index === -1) {
        throw new Error(`Vehículo con ID ${id} no encontrado`);
      }

      const updatedVehicle: Vehicle = {
        ...vehiclesCache.current[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      vehiclesCache.current[index] = updatedVehicle;
      
      await fetchVehicles();
      
      return updatedVehicle;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al actualizar vehículo",
      }));
      throw error;
    }
  }, [fetchVehicles]);

  /**
   * Elimina un vehículo
   */
  const deleteVehicle = React.useCallback(async (id: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await simulateDelay(300);

      vehiclesCache.current = vehiclesCache.current.filter(v => v.id !== id);
      setSelectedVehicles(prev => prev.filter(vId => vId !== id));
      
      await fetchVehicles();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al eliminar vehículo",
      }));
      throw error;
    }
  }, [fetchVehicles]);

  /**
   * Elimina múltiples vehículos
   */
  const bulkDeleteVehicles = React.useCallback(async (ids: string[]): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await simulateDelay(500);

      vehiclesCache.current = vehiclesCache.current.filter(v => !ids.includes(v.id));
      setSelectedVehicles([]);
      
      await fetchVehicles();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al eliminar vehículos",
      }));
      throw error;
    }
  }, [fetchVehicles]);

  // Paginación
  const goToPage = React.useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: Math.max(1, Math.min(page, prev.totalPages)) }));
  }, []);

  const setPageSize = React.useCallback((size: number) => {
    setState(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
  }, []);

  // Filtros
  const setFilters = React.useCallback((newFilters: VehicleFilters) => {
    setFiltersState(newFilters);
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const clearFilters = React.useCallback(() => {
    setFiltersState({});
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Selección
  const selectVehicle = React.useCallback((id: string) => {
    setSelectedVehicles(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const deselectVehicle = React.useCallback((id: string) => {
    setSelectedVehicles(prev => prev.filter(vId => vId !== id));
  }, []);

  const selectAll = React.useCallback(() => {
    setSelectedVehicles(state.vehicles.map(v => v.id));
  }, [state.vehicles]);

  const deselectAll = React.useCallback(() => {
    setSelectedVehicles([]);
  }, []);

  const isSelected = React.useCallback((id: string) => {
    return selectedVehicles.includes(id);
  }, [selectedVehicles]);

  // Utilidades
  const refetch = React.useCallback(async () => {
    await fetchVehicles();
  }, [fetchVehicles]);

  const getVehiclesByStatus = React.useCallback((status: EntityStatus): Vehicle[] => {
    return vehiclesCache.current.filter(v => v.status === status);
  }, []);

  const getVehiclesByType = React.useCallback((type: VehicleType): Vehicle[] => {
    return vehiclesCache.current.filter(v => v.type === type);
  }, []);

  const getAvailableVehicles = React.useCallback((): Vehicle[] => {
    return vehiclesCache.current.filter(v => 
      v.status === "active" && 
      v.operationalStatus === "operational" &&
      !v.currentDriverId
    );
  }, []);

  const getExpiringDocuments = React.useCallback((days: number): Vehicle[] => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return vehiclesCache.current.filter(v => {
      // Check SOAT
      const soat = v.insurancePolicies?.find(p => p.type === "soat");
      if (soat) {
        const expiryDate = new Date(soat.endDate);
        if (expiryDate > today && expiryDate <= futureDate) return true;
      }

      // Check Revisión Técnica
      if (v.currentInspection?.expiryDate) {
        const expiryDate = new Date(v.currentInspection.expiryDate);
        if (expiryDate > today && expiryDate <= futureDate) return true;
      }

      // Check Certificado de Operación
      if (v.operatingCertificate?.expiryDate) {
        const expiryDate = new Date(v.operatingCertificate.expiryDate);
        if (expiryDate > today && expiryDate <= futureDate) return true;
      }

      return false;
    });
  }, []);

  const getVehiclesNeedingMaintenance = React.useCallback((): Vehicle[] => {
    return vehiclesCache.current.filter(v => {
      // Check scheduled maintenance by date
      if (v.maintenanceSchedules?.some(s => 
        s.nextDueDate && new Date(s.nextDueDate) <= new Date()
      )) {
        return true;
      }

      // Check mileage-based maintenance
      if (v.maintenanceSchedules?.some(s =>
        s.nextDueMileage && v.currentMileage >= s.nextDueMileage
      )) {
        return true;
      }

      return false;
    });
  }, []);

  const searchVehicles = React.useCallback((query: string): Vehicle[] => {
    const search = query.toLowerCase();
    return vehiclesCache.current.filter(v =>
      v.plate.toLowerCase().includes(search) ||
      v.specs?.brand?.toLowerCase().includes(search) ||
      v.specs?.model?.toLowerCase().includes(search)
    );
  }, []);

  // Auto-fetch al montar
  React.useEffect(() => {
    if (autoFetch) {
      fetchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]); // Solo en mount, no incluir fetchVehicles para evitar re-ejecución

  // Refetch cuando cambian filtros, página o pageSize
  React.useEffect(() => {
    fetchVehicles();
  }, [filters, state.currentPage, state.pageSize, fetchVehicles]);

  return {
    ...state,
    fetchVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    bulkDeleteVehicles,
    goToPage,
    setPageSize,
    filters,
    setFilters,
    clearFilters,
    selectedVehicles,
    selectVehicle,
    deselectVehicle,
    selectAll,
    deselectAll,
    isSelected,
    refetch,
    getVehiclesByStatus,
    getVehiclesByType,
    getAvailableVehicles,
    getExpiringDocuments,
    getVehiclesNeedingMaintenance,
    searchVehicles,
  };
}

export default useVehicles;
