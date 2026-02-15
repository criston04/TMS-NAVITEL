"use client";

/* ============================================
   CONTEXT: Route Planner (Multi-Route)
   Transportation Management System
   Supports: select → configure → results → assign
   ============================================ */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type {
  TransportOrder,
  Route,
  RouteStop,
  Vehicle,
  Driver,
  RouteConfiguration,
  RouteAlert,
  OptimizationParams,
  PlannerStep,
  RouteAssignment,
} from "@/types/route-planner";
import {
  generateRoutePolyline,
  calculateTotalDistance,
  estimateDuration,
  estimateCost,
  generateMultipleOptimizedRoutes,
} from "@/lib/mock-data/route-planner";

/* ============================================
   CONTEXT TYPES
   ============================================ */
interface RoutePlannerContextValue {
  // Step
  plannerStep: PlannerStep;
  setPlannerStep: (step: PlannerStep) => void;

  // Orders
  selectedOrders: TransportOrder[];
  addOrder: (order: TransportOrder) => void;
  removeOrder: (orderId: string) => void;
  clearOrders: () => void;

  // Optimization params
  optimizationParams: OptimizationParams;
  updateOptimizationParams: (params: Partial<OptimizationParams>) => void;

  // Single route (legacy/compatibility)
  currentRoute: Route | null;
  generateRoute: () => void;
  reorderStops: (stops: RouteStop[]) => void;

  // Multi-route optimization
  generatedRoutes: Route[];
  generateOptimizedRoutes: () => void;

  // Assignments
  routeAssignments: RouteAssignment[];
  assignVehicleToRoute: (routeId: string, vehicle: Vehicle) => void;
  assignDriverToRoute: (routeId: string, driver: Driver) => void;

  // Vehicle/Driver (legacy single-route)
  selectedVehicle: Vehicle | null;
  selectedDriver: Driver | null;
  selectVehicle: (vehicle: Vehicle | null) => void;
  selectDriver: (driver: Driver | null) => void;

  // Configuration
  configuration: RouteConfiguration;
  updateConfiguration: (config: Partial<RouteConfiguration>) => void;

  // Actions
  confirmRoute: () => void;
  confirmAllRoutes: () => void;
  resetRoute: () => void;
  resetAll: () => void;

  // Helpers
  selectedRouteId: string | null;
  setSelectedRouteId: (id: string | null) => void;
  allRoutesAssigned: boolean;
}

const RoutePlannerContext = createContext<RoutePlannerContextValue | undefined>(undefined);

/* ============================================
   DEFAULT CONFIGURATION
   ============================================ */
const defaultConfiguration: RouteConfiguration = {
  avoidTolls: false,
  priority: "balanced",
  considerTraffic: true,
  timeBuffer: 10,
};

const defaultOptimizationParams: OptimizationParams = {
  timeWindowStart: "08:00",
  timeWindowEnd: "18:00",
  truckCount: 3,
  stopDuration: 30,
};

/* ============================================
   PROVIDER COMPONENT
   ============================================ */
export function RoutePlannerProvider({ children }: { children: ReactNode }) {
  const [plannerStep, setPlannerStep] = useState<PlannerStep>("select");
  const [selectedOrders, setSelectedOrders] = useState<TransportOrder[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [generatedRoutes, setGeneratedRoutes] = useState<Route[]>([]);
  const [routeAssignments, setRouteAssignments] = useState<RouteAssignment[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [configuration, setConfiguration] = useState<RouteConfiguration>(defaultConfiguration);
  const [optimizationParams, setOptimizationParams] = useState<OptimizationParams>(defaultOptimizationParams);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  /* ============================================
     ADD ORDER TO SELECTION
     ============================================ */
  const addOrder = useCallback((order: TransportOrder) => {
    setSelectedOrders((prev) => {
      if (prev.find((o) => o.id === order.id)) return prev;
      return [...prev, order];
    });
  }, []);

  /* ============================================
     REMOVE ORDER FROM SELECTION
     ============================================ */
  const removeOrder = useCallback((orderId: string) => {
    setSelectedOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  /* ============================================
     CLEAR ALL ORDERS
     ============================================ */
  const clearOrders = useCallback(() => {
    setSelectedOrders([]);
    setCurrentRoute(null);
  }, []);

  /* ============================================
     GENERATE ROUTE FROM SELECTED ORDERS
     ============================================ */
  const generateRoute = useCallback(() => {
    if (selectedOrders.length === 0) return;

    // Crear paradas desde las órdenes seleccionadas
    const stops: RouteStop[] = [];
    let sequence = 1;

    selectedOrders.forEach((order) => {
      // Pickup
      stops.push({
        id: `stop-${order.id}-pickup`,
        orderId: order.id,
        sequence: sequence++,
        type: "pickup",
        address: order.pickup.address,
        city: order.pickup.city,
        coordinates: order.pickup.coordinates,
        timeWindow: order.pickup.timeWindow,
        duration: 15,
        status: "pending",
      });

      // Delivery
      stops.push({
        id: `stop-${order.id}-delivery`,
        orderId: order.id,
        sequence: sequence++,
        type: "delivery",
        address: order.delivery.address,
        city: order.delivery.city,
        coordinates: order.delivery.coordinates,
        timeWindow: order.delivery.timeWindow,
        duration: 15,
        status: "pending",
      });
    });

    // Calcular métricas
    const totalDistance = calculateTotalDistance(stops);
    const estimatedDurationValue = estimateDuration(totalDistance, stops.length);
    const fuelConsumption = selectedVehicle?.fuelConsumption || 10;
    const costs = estimateCost(totalDistance, fuelConsumption, !configuration.avoidTolls);

    // Calcular peso y volumen total
    const totalWeight = selectedOrders.reduce((sum, o) => sum + o.cargo.weight, 0);
    const totalVolume = selectedOrders.reduce((sum, o) => sum + o.cargo.volume, 0);

    // Generar alertas
    const alerts: RouteAlert[] = [];
    
    if (selectedVehicle) {
      if (totalWeight > selectedVehicle.capacity.weight) {
        alerts.push({
          id: "alert-weight",
          type: "error",
          severity: "high",
          message: `Peso total (${totalWeight}kg) excede capacidad del vehículo (${selectedVehicle.capacity.weight}kg)`,
          code: "CAPACITY_EXCEEDED",
        });
      }
      if (totalVolume > selectedVehicle.capacity.volume) {
        alerts.push({
          id: "alert-volume",
          type: "error",
          severity: "high",
          message: `Volumen total (${totalVolume}m³) excede capacidad del vehículo (${selectedVehicle.capacity.volume}m³)`,
          code: "CAPACITY_EXCEEDED",
        });
      }
    }

    if (estimatedDurationValue > 480) {
      alerts.push({
        id: "alert-duration",
        type: "warning",
        severity: "medium",
        message: "Ruta excede 8 horas de trabajo. Considere dividir la ruta.",
        code: "DELAY_RISK",
      });
    }

    // Crear ruta
    const route: Route = {
      id: `route-${Date.now()}`,
      name: `Ruta ${new Date().toLocaleDateString()}`,
      status: "generated",
      stops,
      vehicle: selectedVehicle || undefined,
      driver: selectedDriver || undefined,
      metrics: {
        totalDistance,
        estimatedDuration: estimatedDurationValue,
        estimatedCost: costs.total,
        fuelCost: costs.fuel,
        tollsCost: costs.tolls,
        totalWeight,
        totalVolume,
      },
      configuration,
      polyline: generateRoutePolyline(stops),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      alerts: alerts.length > 0 ? alerts : undefined,
    };

    setCurrentRoute(route);
  }, [selectedOrders, selectedVehicle, selectedDriver, configuration]);

  /* ============================================
     REORDER STOPS
     ============================================ */
  const reorderStops = useCallback((stops: RouteStop[]) => {
    if (!currentRoute) return;

    // Actualizar secuencia
    const reorderedStops = stops.map((stop, index) => ({
      ...stop,
      sequence: index + 1,
    }));

    // Recalcular métricas
    const totalDistance = calculateTotalDistance(reorderedStops);
    const estimatedDurationValue = estimateDuration(totalDistance, reorderedStops.length);
    const fuelConsumption = selectedVehicle?.fuelConsumption || 10;
    const costs = estimateCost(totalDistance, fuelConsumption, !configuration.avoidTolls);

    setCurrentRoute({
      ...currentRoute,
      stops: reorderedStops,
      metrics: {
        ...currentRoute.metrics,
        totalDistance,
        estimatedDuration: estimatedDurationValue,
        estimatedCost: costs.total,
        fuelCost: costs.fuel,
        tollsCost: costs.tolls,
      },
      polyline: generateRoutePolyline(reorderedStops),
      updatedAt: new Date().toISOString(),
    });
  }, [currentRoute, selectedVehicle, configuration]);

  /* ============================================
     SELECT VEHICLE
     ============================================ */
  const selectVehicle = useCallback((vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
  }, []);

  /* ============================================
     SELECT DRIVER
     ============================================ */
  const selectDriver = useCallback((driver: Driver | null) => {
    setSelectedDriver(driver);
  }, []);

  /* ============================================
     UPDATE CONFIGURATION
     ============================================ */
  const updateConfiguration = useCallback((config: Partial<RouteConfiguration>) => {
    setConfiguration((prev) => ({ ...prev, ...config }));
  }, []);

  /* ============================================
     CONFIRM ROUTE
     ============================================ */
  const confirmRoute = useCallback(() => {
    if (!currentRoute) return;
    setCurrentRoute({
      ...currentRoute,
      status: "confirmed",
      confirmedAt: new Date().toISOString(),
    });
  }, [currentRoute]);

  /* ============================================
     GENERATE MULTIPLE OPTIMIZED ROUTES
     ============================================ */
  const generateOptimizedRoutes = useCallback(() => {
    if (selectedOrders.length === 0) return;
    const routes = generateMultipleOptimizedRoutes(
      selectedOrders,
      optimizationParams,
      configuration
    );
    setGeneratedRoutes(routes);
    setRouteAssignments(routes.map((r) => ({ routeId: r.id })));
    setPlannerStep("results");
    if (routes.length > 0) {
      setSelectedRouteId(routes[0].id);
    }
  }, [selectedOrders, optimizationParams, configuration]);

  /* ============================================
     ASSIGN VEHICLE TO ROUTE
     ============================================ */
  const assignVehicleToRoute = useCallback((routeId: string, vehicle: Vehicle) => {
    setRouteAssignments((prev) =>
      prev.map((a) => (a.routeId === routeId ? { ...a, vehicle } : a))
    );
    setGeneratedRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, vehicle } : r))
    );
  }, []);

  /* ============================================
     ASSIGN DRIVER TO ROUTE
     ============================================ */
  const assignDriverToRoute = useCallback((routeId: string, driver: Driver) => {
    setRouteAssignments((prev) =>
      prev.map((a) => (a.routeId === routeId ? { ...a, driver } : a))
    );
    setGeneratedRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, driver } : r))
    );
  }, []);

  /* ============================================
     UPDATE OPTIMIZATION PARAMS
     ============================================ */
  const updateOptimizationParams = useCallback((params: Partial<OptimizationParams>) => {
    setOptimizationParams((prev) => ({ ...prev, ...params }));
  }, []);

  /* ============================================
     CONFIRM ALL ROUTES
     ============================================ */
  const confirmAllRoutes = useCallback(() => {
    setGeneratedRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        status: "confirmed" as const,
        confirmedAt: new Date().toISOString(),
      }))
    );
  }, []);

  /* ============================================
     RESET ROUTE
     ============================================ */
  const resetRoute = useCallback(() => {
    setCurrentRoute(null);
    setSelectedOrders([]);
    setSelectedVehicle(null);
    setSelectedDriver(null);
    setConfiguration(defaultConfiguration);
  }, []);

  /* ============================================
     RESET ALL (multi-route)
     ============================================ */
  const resetAll = useCallback(() => {
    setPlannerStep("select");
    setSelectedOrders([]);
    setCurrentRoute(null);
    setGeneratedRoutes([]);
    setRouteAssignments([]);
    setSelectedVehicle(null);
    setSelectedDriver(null);
    setConfiguration(defaultConfiguration);
    setOptimizationParams(defaultOptimizationParams);
    setSelectedRouteId(null);
  }, []);

  /* ============================================
     COMPUTED VALUES
     ============================================ */
  const allRoutesAssigned = routeAssignments.length > 0 &&
    routeAssignments.every((a) => a.vehicle && a.driver);

  const value: RoutePlannerContextValue = {
    plannerStep,
    setPlannerStep,
    selectedOrders,
    addOrder,
    removeOrder,
    clearOrders,
    optimizationParams,
    updateOptimizationParams,
    currentRoute,
    generateRoute,
    reorderStops,
    generatedRoutes,
    generateOptimizedRoutes,
    routeAssignments,
    assignVehicleToRoute,
    assignDriverToRoute,
    selectedVehicle,
    selectedDriver,
    selectVehicle,
    selectDriver,
    configuration,
    updateConfiguration,
    confirmRoute,
    confirmAllRoutes,
    resetRoute,
    resetAll,
    selectedRouteId,
    setSelectedRouteId,
    allRoutesAssigned,
  };

  return (
    <RoutePlannerContext.Provider value={value}>
      {children}
    </RoutePlannerContext.Provider>
  );
}

/* ============================================
   HOOK: useRoutePlanner
   ============================================ */
export function useRoutePlanner() {
  const context = useContext(RoutePlannerContext);
  if (context === undefined) {
    throw new Error("useRoutePlanner must be used within RoutePlannerProvider");
  }
  return context;
}
