/* ============================================
   TYPES: Route Planner Module
   Transportation Management System
   ============================================ */

export type OrderStatus = "pending" | "assigned" | "in_transit" | "delivered";
export type RouteStatus = "draft" | "generated" | "confirmed" | "dispatched";
export type Priority = "speed" | "cost" | "balanced";

/* ============================================
   TRANSPORT ORDER
   ============================================ */
export interface TransportOrder {
  id: string;
  orderNumber: string;
  client: {
    name: string;
    phone: string;
  };
  pickup: {
    address: string;
    city: string;
    coordinates: [number, number]; // [lat, lng]
    timeWindow?: {
      start: string;
      end: string;
    };
  };
  delivery: {
    address: string;
    city: string;
    coordinates: [number, number];
    timeWindow?: {
      start: string;
      end: string;
    };
  };
  cargo: {
    weight: number; // kg
    volume: number; // m³
    description: string;
    requiresRefrigeration?: boolean;
    fragile?: boolean;
  };
  status: OrderStatus;
  priority: "high" | "medium" | "low";
  requestedDate: string;
  zone: string;
}

/* ============================================
   ROUTE STOP
   ============================================ */
export interface RouteStop {
  id: string;
  orderId: string;
  sequence: number;
  type: "pickup" | "delivery";
  address: string;
  city: string;
  coordinates: [number, number];
  estimatedArrival?: string;
  timeWindow?: {
    start: string;
    end: string;
  };
  duration: number; // minutos
  status: "pending" | "completed" | "skipped";
}

/* ============================================
   VEHICLE
   ============================================ */
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  capacity: {
    weight: number; // kg
    volume: number; // m³
  };
  fuelType: "diesel" | "gasoline" | "electric" | "hybrid";
  fuelConsumption: number; // km/L
  status: "available" | "in_route" | "maintenance" | "unavailable";
  currentLocation?: [number, number];
  features: string[];
}

/* ============================================
   DRIVER
   ============================================ */
export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  rating: number; // 0-5
  status: "available" | "on_route" | "off_duty";
  experience: number; // años
  specializations: string[];
  avatar?: string;
}

/* ============================================
   ROUTE
   ============================================ */
export interface Route {
  id: string;
  name: string;
  status: RouteStatus;
  stops: RouteStop[];
  vehicle?: Vehicle;
  driver?: Driver;
  metrics: {
    totalDistance: number; // km
    estimatedDuration: number; // minutos
    estimatedCost: number; // USD
    fuelCost: number;
    tollsCost: number;
    totalWeight: number; // kg
    totalVolume: number; // m³
  };
  configuration: RouteConfiguration;
  polyline?: [number, number][]; // Coordenadas de la ruta
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  alerts?: RouteAlert[];
}

/* ============================================
   ROUTE CONFIGURATION
   ============================================ */
export interface RouteConfiguration {
  avoidTolls: boolean;
  priority: Priority;
  considerTraffic: boolean;
  maxStops?: number;
  timeBuffer: number; // minutos extra por parada
}

/* ============================================
   ROUTE ALERT
   ============================================ */
export interface RouteAlert {
  id: string;
  type: "warning" | "error" | "info";
  severity: "high" | "medium" | "low";
  message: string;
  code: "CAPACITY_EXCEEDED" | "DELAY_RISK" | "TRAFFIC_WARNING" | "TIME_WINDOW_CONFLICT" | "OTHER";
}

/* ============================================
   FILTERS
   ============================================ */
export interface OrderFilters {
  zone?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: OrderStatus[];
  priority?: ("high" | "medium" | "low")[];
  searchTerm?: string;
}
