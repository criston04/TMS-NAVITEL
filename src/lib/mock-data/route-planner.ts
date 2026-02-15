/* ============================================
   MOCK DATA: Route Planner Module
   Transportation Management System
   ============================================ */

import type { TransportOrder, Vehicle, Driver, RouteStop, Route, RouteConfiguration, RouteAlert, OptimizationParams } from "@/types/route-planner";

/* ============================================
   MOCK ORDERS
   ============================================ */
export const mockOrders: TransportOrder[] = [
  {
    id: "ORD-001",
    orderNumber: "TMS-2026-001",
    client: {
      name: "Distribuidora Central",
      phone: "+1 555-0101",
    },
    pickup: {
      address: "Av. Industrial 1250",
      city: "Lima",
      coordinates: [-12.0464, -77.0428],
      timeWindow: {
        start: "08:00",
        end: "12:00",
      },
    },
    delivery: {
      address: "Jr. Comercio 890",
      city: "Lima",
      coordinates: [-12.0532, -77.0514],
      timeWindow: {
        start: "14:00",
        end: "18:00",
      },
    },
    cargo: {
      weight: 1200,
      volume: 8.5,
      description: "Electrodomésticos varios",
      fragile: true,
    },
    status: "pending",
    priority: "high",
    requestedDate: "2026-02-02",
    zone: "Lima Centro",
  },
  {
    id: "ORD-002",
    orderNumber: "TMS-2026-002",
    client: {
      name: "Supermercados del Norte",
      phone: "+1 555-0102",
    },
    pickup: {
      address: "Panamericana Norte Km 12",
      city: "Lima",
      coordinates: [-11.9893, -77.0621],
      timeWindow: {
        start: "07:00",
        end: "10:00",
      },
    },
    delivery: {
      address: "Av. Túpac Amaru 2450",
      city: "Lima",
      coordinates: [-12.0102, -77.0538],
      timeWindow: {
        start: "11:00",
        end: "15:00",
      },
    },
    cargo: {
      weight: 2500,
      volume: 15.2,
      description: "Productos perecederos",
      requiresRefrigeration: true,
    },
    status: "pending",
    priority: "high",
    requestedDate: "2026-02-02",
    zone: "Lima Norte",
  },
  {
    id: "ORD-003",
    orderNumber: "TMS-2026-003",
    client: {
      name: "Ferretería Moderna",
      phone: "+1 555-0103",
    },
    pickup: {
      address: "Av. Argentina 3420",
      city: "Lima",
      coordinates: [-12.0564, -77.0832],
      timeWindow: {
        start: "09:00",
        end: "13:00",
      },
    },
    delivery: {
      address: "Av. Venezuela 1850",
      city: "Lima",
      coordinates: [-12.0612, -77.0698],
    },
    cargo: {
      weight: 800,
      volume: 5.5,
      description: "Herramientas y materiales",
    },
    status: "pending",
    priority: "medium",
    requestedDate: "2026-02-03",
    zone: "Callao",
  },
  {
    id: "ORD-004",
    orderNumber: "TMS-2026-004",
    client: {
      name: "Textiles Andinos",
      phone: "+1 555-0104",
    },
    pickup: {
      address: "Jr. Gamarra 850",
      city: "Lima",
      coordinates: [-12.0689, -77.0142],
      timeWindow: {
        start: "10:00",
        end: "14:00",
      },
    },
    delivery: {
      address: "Av. Aviación 2850",
      city: "Lima",
      coordinates: [-12.0842, -77.0198],
      timeWindow: {
        start: "15:00",
        end: "19:00",
      },
    },
    cargo: {
      weight: 450,
      volume: 12.0,
      description: "Prendas de vestir",
    },
    status: "pending",
    priority: "low",
    requestedDate: "2026-02-04",
    zone: "Lima Este",
  },
  {
    id: "ORD-005",
    orderNumber: "TMS-2026-005",
    client: {
      name: "Farmacéutica del Sol",
      phone: "+1 555-0105",
    },
    pickup: {
      address: "Av. Javier Prado 5820",
      city: "Lima",
      coordinates: [-12.0876, -76.9742],
      timeWindow: {
        start: "08:00",
        end: "11:00",
      },
    },
    delivery: {
      address: "Av. La Molina 1850",
      city: "Lima",
      coordinates: [-12.0732, -76.9426],
      timeWindow: {
        start: "12:00",
        end: "16:00",
      },
    },
    cargo: {
      weight: 320,
      volume: 2.8,
      description: "Medicamentos e insumos médicos",
      requiresRefrigeration: true,
    },
    status: "pending",
    priority: "high",
    requestedDate: "2026-02-02",
    zone: "Lima Este",
  },
  {
    id: "ORD-006",
    orderNumber: "TMS-2026-006",
    client: {
      name: "Alimentos Premium",
      phone: "+1 555-0106",
    },
    pickup: {
      address: "Av. Universitaria 1890",
      city: "Lima",
      coordinates: [-12.0698, -77.0842],
    },
    delivery: {
      address: "Av. Benavides 2450",
      city: "Lima",
      coordinates: [-12.1156, -77.0298],
      timeWindow: {
        start: "13:00",
        end: "17:00",
      },
    },
    cargo: {
      weight: 950,
      volume: 6.5,
      description: "Productos gourmet",
      requiresRefrigeration: true,
    },
    status: "pending",
    priority: "medium",
    requestedDate: "2026-02-03",
    zone: "Lima Sur",
  },
  {
    id: "ORD-007",
    orderNumber: "TMS-2026-007",
    client: {
      name: "Tecnología Global",
      phone: "+1 555-0107",
    },
    pickup: {
      address: "Av. Primavera 890",
      city: "Lima",
      coordinates: [-12.0954, -76.9812],
      timeWindow: {
        start: "09:00",
        end: "12:00",
      },
    },
    delivery: {
      address: "Av. Conquistadores 1420",
      city: "Lima",
      coordinates: [-12.1012, -77.0342],
      timeWindow: {
        start: "14:00",
        end: "18:00",
      },
    },
    cargo: {
      weight: 650,
      volume: 4.2,
      description: "Equipos informáticos",
      fragile: true,
    },
    status: "pending",
    priority: "medium",
    requestedDate: "2026-02-05",
    zone: "Lima Sur",
  },
  {
    id: "ORD-008",
    orderNumber: "TMS-2026-008",
    client: {
      name: "Muebles & Diseño",
      phone: "+1 555-0108",
    },
    pickup: {
      address: "Av. Separadora Industrial 1250",
      city: "Lima",
      coordinates: [-12.0142, -77.0156],
      timeWindow: {
        start: "07:00",
        end: "11:00",
      },
    },
    delivery: {
      address: "Av. Salaverry 3280",
      city: "Lima",
      coordinates: [-12.0895, -77.0486],
    },
    cargo: {
      weight: 1800,
      volume: 22.0,
      description: "Muebles de oficina",
      fragile: true,
    },
    status: "pending",
    priority: "low",
    requestedDate: "2026-02-06",
    zone: "Lima Centro",
  },
];

/* ============================================
   MOCK VEHICLES
   ============================================ */
export const mockVehicles: Vehicle[] = [
  {
    id: "VEH-001",
    plate: "ABC-123",
    brand: "Mercedes-Benz",
    model: "Actros 2546",
    year: 2023,
    capacity: {
      weight: 25000,
      volume: 90,
    },
    fuelType: "diesel",
    fuelConsumption: 8.5,
    status: "available",
    currentLocation: [-12.0464, -77.0428],
    features: ["GPS", "Refrigeración", "Sistema de seguridad"],
  },
  {
    id: "VEH-002",
    plate: "DEF-456",
    brand: "Volvo",
    model: "FH 460",
    year: 2022,
    capacity: {
      weight: 18000,
      volume: 65,
    },
    fuelType: "diesel",
    fuelConsumption: 9.2,
    status: "available",
    currentLocation: [-12.0532, -77.0514],
    features: ["GPS", "Cámara reversa"],
  },
  {
    id: "VEH-003",
    plate: "GHI-789",
    brand: "Scania",
    model: "R 450",
    year: 2024,
    capacity: {
      weight: 22000,
      volume: 80,
    },
    fuelType: "diesel",
    fuelConsumption: 8.8,
    status: "in_route",
    currentLocation: [-11.9893, -77.0621],
    features: ["GPS", "Refrigeración", "Control de temperatura"],
  },
  {
    id: "VEH-004",
    plate: "JKL-012",
    brand: "Isuzu",
    model: "NPR 75L",
    year: 2023,
    capacity: {
      weight: 5000,
      volume: 25,
    },
    fuelType: "diesel",
    fuelConsumption: 12.5,
    status: "available",
    currentLocation: [-12.0564, -77.0832],
    features: ["GPS", "Portón hidráulico"],
  },
  {
    id: "VEH-005",
    plate: "MNO-345",
    brand: "Ford",
    model: "Cargo 1722",
    year: 2021,
    capacity: {
      weight: 8000,
      volume: 35,
    },
    fuelType: "diesel",
    fuelConsumption: 11.0,
    status: "available",
    currentLocation: [-12.0689, -77.0142],
    features: ["GPS", "Sistema de rastreo"],
  },
  {
    id: "VEH-006",
    plate: "PQR-678",
    brand: "Hyundai",
    model: "HD 78",
    year: 2024,
    capacity: {
      weight: 4500,
      volume: 20,
    },
    fuelType: "diesel",
    fuelConsumption: 13.0,
    status: "available",
    currentLocation: [-12.0876, -76.9742],
    features: ["GPS", "Eco-friendly"],
  },
];

/* ============================================
   MOCK DRIVERS
   ============================================ */
export const mockDrivers: Driver[] = [
  {
    id: "DRV-001",
    firstName: "Carlos",
    lastName: "Ramírez",
    phone: "+1 555-1001",
    email: "carlos.ramirez@navitel.com",
    licenseNumber: "L1234567",
    licenseExpiry: "2027-06-15",
    rating: 4.8,
    status: "available",
    experience: 12,
    specializations: ["Carga pesada", "Refrigerados"],
  },
  {
    id: "DRV-002",
    firstName: "María",
    lastName: "González",
    phone: "+1 555-1002",
    email: "maria.gonzalez@navitel.com",
    licenseNumber: "L2345678",
    licenseExpiry: "2026-08-22",
    rating: 4.9,
    status: "available",
    experience: 8,
    specializations: ["Carga frágil", "Distribución urbana"],
  },
  {
    id: "DRV-003",
    firstName: "Jorge",
    lastName: "Torres",
    phone: "+1 555-1003",
    email: "jorge.torres@navitel.com",
    licenseNumber: "L3456789",
    licenseExpiry: "2028-03-10",
    rating: 4.6,
    status: "on_route",
    experience: 15,
    specializations: ["Larga distancia", "Carga pesada"],
  },
  {
    id: "DRV-004",
    firstName: "Ana",
    lastName: "Mendoza",
    phone: "+1 555-1004",
    email: "ana.mendoza@navitel.com",
    licenseNumber: "L4567890",
    licenseExpiry: "2027-11-18",
    rating: 4.7,
    status: "available",
    experience: 6,
    specializations: ["Distribución urbana", "Carga ligera"],
  },
  {
    id: "DRV-005",
    firstName: "Pedro",
    lastName: "Silva",
    phone: "+1 555-1005",
    email: "pedro.silva@navitel.com",
    licenseNumber: "L5678901",
    licenseExpiry: "2026-09-25",
    rating: 4.5,
    status: "available",
    experience: 10,
    specializations: ["Refrigerados", "Farmacéuticos"],
  },
  {
    id: "DRV-006",
    firstName: "Rosa",
    lastName: "Vargas",
    phone: "+1 555-1006",
    email: "rosa.vargas@navitel.com",
    licenseNumber: "L6789012",
    licenseExpiry: "2028-01-14",
    rating: 4.9,
    status: "available",
    experience: 9,
    specializations: ["Carga frágil", "Tecnología"],
  },
];

/* ============================================
   HELPER: Generate Route Polyline
   ============================================ */
export function generateRoutePolyline(stops: { coordinates: [number, number] }[]): [number, number][] {
  const polyline: [number, number][] = [];
  
  for (let i = 0; i < stops.length - 1; i++) {
    const start = stops[i].coordinates;
    const end = stops[i + 1].coordinates;
    
    // Generar puntos intermedios simulados (línea recta con curvatura)
    const steps = 10;
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      const lat = start[0] + (end[0] - start[0]) * t + (Math.random() - 0.5) * 0.002;
      const lng = start[1] + (end[1] - start[1]) * t + (Math.random() - 0.5) * 0.002;
      polyline.push([lat, lng]);
    }
  }
  
  return polyline;
}

/* ============================================
   HELPER: Calculate Distance (Haversine)
   ============================================ */
export function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1[0] * Math.PI) / 180) *
      Math.cos((coord2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* ============================================
   HELPER: Calculate Total Route Distance
   ============================================ */
export function calculateTotalDistance(stops: { coordinates: [number, number] }[]): number {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += calculateDistance(stops[i].coordinates, stops[i + 1].coordinates);
  }
  return Math.round(total * 10) / 10;
}

/* ============================================
   HELPER: Estimate Route Duration
   ============================================ */
export function estimateDuration(distanceKm: number, stopCount: number): number {
  const avgSpeed = 40; // km/h promedio en ciudad
  const stopTime = 20; // minutos por parada
  const travelTime = (distanceKm / avgSpeed) * 60;
  const totalStopTime = stopCount * stopTime;
  return Math.round(travelTime + totalStopTime);
}

/* ============================================
   HELPER: Estimate Route Cost
   ============================================ */
export function estimateCost(
  distanceKm: number,
  fuelConsumption: number,
  hasTolls: boolean
): { total: number; fuel: number; tolls: number } {
  const fuelPrice = 4.5; // USD por galón
  const fuelCost = (distanceKm / fuelConsumption) * fuelPrice;
  const tollsCost = hasTolls ? distanceKm * 0.08 : 0;
  
  return {
    fuel: Math.round(fuelCost * 100) / 100,
    tolls: Math.round(tollsCost * 100) / 100,
    total: Math.round((fuelCost + tollsCost) * 100) / 100,
  };
}

/* ============================================
   HELPER: Cluster Orders by Proximity (k-means)
   Groups N orders into k clusters using delivery
   coordinates for geographic proximity.
   ============================================ */
export function clusterOrdersByProximity(
  orders: TransportOrder[],
  k: number
): TransportOrder[][] {
  if (orders.length === 0) return [];
  if (k >= orders.length) return orders.map((o) => [o]);

  // Initialize centroids using first k orders (spread selection)
  const step = Math.floor(orders.length / k);
  let centroids: [number, number][] = [];
  for (let i = 0; i < k; i++) {
    const order = orders[Math.min(i * step, orders.length - 1)];
    centroids.push(order.delivery.coordinates);
  }

  let clusters: TransportOrder[][] = Array.from({ length: k }, () => []);
  const maxIterations = 20;

  for (let iter = 0; iter < maxIterations; iter++) {
    // Reset clusters
    const newClusters: TransportOrder[][] = Array.from({ length: k }, () => []);

    // Assign each order to nearest centroid
    for (const order of orders) {
      let minDist = Infinity;
      let bestCluster = 0;
      for (let c = 0; c < k; c++) {
        const dist = calculateDistance(order.delivery.coordinates, centroids[c]);
        if (dist < minDist) {
          minDist = dist;
          bestCluster = c;
        }
      }
      newClusters[bestCluster].push(order);
    }

    // Recalculate centroids
    const newCentroids: [number, number][] = newClusters.map((cluster, i) => {
      if (cluster.length === 0) return centroids[i]; // Keep old centroid
      const avgLat = cluster.reduce((s, o) => s + o.delivery.coordinates[0], 0) / cluster.length;
      const avgLng = cluster.reduce((s, o) => s + o.delivery.coordinates[1], 0) / cluster.length;
      return [avgLat, avgLng] as [number, number];
    });

    // Check convergence
    let converged = true;
    for (let c = 0; c < k; c++) {
      if (calculateDistance(centroids[c], newCentroids[c]) > 0.01) {
        converged = false;
        break;
      }
    }

    centroids = newCentroids;
    clusters = newClusters;
    if (converged) break;
  }

  // Remove empty clusters
  return clusters.filter((c) => c.length > 0);
}

/* ============================================
   HELPER: Nearest-Neighbor TSP ordering
   Orders stops within a cluster for minimum
   total travel distance.
   ============================================ */
function optimizeStopOrder(stops: RouteStop[]): RouteStop[] {
  if (stops.length <= 2) return stops;

  const unvisited = [...stops];
  const ordered: RouteStop[] = [unvisited.shift()!];

  while (unvisited.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearest = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistance(last.coordinates, unvisited[i].coordinates);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    }
    ordered.push(unvisited.splice(nearest, 1)[0]);
  }

  return ordered.map((s, i) => ({ ...s, sequence: i + 1 }));
}

/* ============================================
   HELPER: Generate Multiple Optimized Routes
   Takes N orders + optimization params →
   Returns k optimized routes (one per truck).
   ============================================ */
export function generateMultipleOptimizedRoutes(
  orders: TransportOrder[],
  params: OptimizationParams,
  config: RouteConfiguration
): Route[] {
  const k = Math.min(params.truckCount, orders.length);
  const clusters = clusterOrdersByProximity(orders, k);

  const routeColors = [
    "#3DBAFF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#06B6D4", "#F97316", "#14B8A6", "#6366F1",
  ];

  return clusters.map((clusterOrders, index) => {
    // Create stops from cluster orders
    const stops: RouteStop[] = [];
    let seq = 1;

    clusterOrders.forEach((order) => {
      stops.push({
        id: `stop-${order.id}-pickup`,
        orderId: order.id,
        sequence: seq++,
        type: "pickup",
        address: order.pickup.address,
        city: order.pickup.city,
        coordinates: order.pickup.coordinates,
        timeWindow: {
          start: params.timeWindowStart,
          end: params.timeWindowEnd,
        },
        duration: params.stopDuration,
        status: "pending",
      });
      stops.push({
        id: `stop-${order.id}-delivery`,
        orderId: order.id,
        sequence: seq++,
        type: "delivery",
        address: order.delivery.address,
        city: order.delivery.city,
        coordinates: order.delivery.coordinates,
        timeWindow: {
          start: params.timeWindowStart,
          end: params.timeWindowEnd,
        },
        duration: params.stopDuration,
        status: "pending",
      });
    });

    // Optimize stop ordering within route
    const optimizedStops = optimizeStopOrder(stops);

    // Calculate metrics
    const totalDistance = calculateTotalDistance(optimizedStops);
    const estimatedDurationValue = estimateDuration(totalDistance, optimizedStops.length);
    const defaultFuelConsumption = 10;
    const costs = estimateCost(totalDistance, defaultFuelConsumption, !config.avoidTolls);
    const totalWeight = clusterOrders.reduce((s, o) => s + o.cargo.weight, 0);
    const totalVolume = clusterOrders.reduce((s, o) => s + o.cargo.volume, 0);

    // Alerts
    const alerts: RouteAlert[] = [];
    const windowMinutes =
      (parseInt(params.timeWindowEnd.split(":")[0]) - parseInt(params.timeWindowStart.split(":")[0])) * 60;
    if (estimatedDurationValue > windowMinutes) {
      alerts.push({
        id: `alert-time-${index}`,
        type: "warning",
        severity: "medium",
        message: `Ruta ${index + 1} excede la ventana horaria (${Math.floor(estimatedDurationValue / 60)}h vs ${Math.floor(windowMinutes / 60)}h disponibles).`,
        code: "DELAY_RISK",
      });
    }

    return {
      id: `route-opt-${Date.now()}-${index}`,
      name: `Ruta ${index + 1}`,
      status: "generated" as const,
      stops: optimizedStops,
      metrics: {
        totalDistance,
        estimatedDuration: estimatedDurationValue,
        estimatedCost: costs.total,
        fuelCost: costs.fuel,
        tollsCost: costs.tolls,
        totalWeight,
        totalVolume,
      },
      configuration: config,
      polyline: generateRoutePolyline(optimizedStops),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      alerts: alerts.length > 0 ? alerts : undefined,
      color: routeColors[index % routeColors.length],
    } as Route & { color: string };
  });
}
