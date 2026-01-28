import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton para la tarjeta de vehículo */
function VehicleCardSkeleton() {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-5 w-5 rounded" />
      </div>
    </div>
  );
}

/** Loading skeleton para la página de Fleet con mapa */
export default function FleetLoading() {
  return (
    <div className="h-[calc(100vh-7rem)] animate-fade-in">
      <Card className="h-full overflow-hidden">
        <div className="flex h-full">
          {/* Panel izquierdo - Lista de vehículos */}
          <div className="w-[400px] border-r flex-shrink-0 bg-card">
            {/* Header */}
            <div className="p-4 border-b">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-4 w-36 mt-2" />
            </div>

            {/* Lista de vehículos */}
            <div className="p-4 space-y-3">
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
            </div>
          </div>

          {/* Panel derecho - Mapa */}
          <div className="flex-1 relative bg-muted">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Cargando mapa...</p>
              </div>
            </div>
            {/* Skeleton del mapa */}
            <Skeleton className="absolute inset-4 rounded-lg" />
          </div>
        </div>
      </Card>
    </div>
  );
}
