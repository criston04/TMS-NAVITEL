/**
 * Skeleton Components - Siguiendo principios DRY y SRP
 * Cada componente tiene una única responsabilidad y es reutilizable
 */

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/* ============================================
   BASE SKELETON COMPONENTS (Building Blocks)
   ============================================ */

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

/** Skeleton para texto con múltiples líneas */
export function SkeletonText({ lines = 1, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 && lines > 1 && "w-3/4")}
        />
      ))}
    </div>
  );
}

interface SkeletonAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Skeleton para avatares */
export function SkeletonAvatar({ size = "md", className }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
  );
}

interface SkeletonButtonProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Skeleton para botones */
export function SkeletonButton({ size = "md", className }: SkeletonButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  };

  return (
    <Skeleton className={cn("rounded-md", sizeClasses[size], className)} />
  );
}

/* ============================================
   COMPOSITE SKELETON COMPONENTS
   ============================================ */

/** Skeleton para KPI Card */
export function SkeletonKPICard() {
  return (
    <Card className="border-l-4 border-l-muted">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

/** Skeleton para fila de tabla */
export function SkeletonTableRow({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-2">
          {i === 0 ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ) : (
            <Skeleton className="h-4 w-full max-w-[100px]" />
          )}
        </td>
      ))}
    </tr>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

/** Skeleton para tabla completa */
export function SkeletonTable({ rows = 5, columns = 6 }: SkeletonTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="pb-3 px-2">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <SkeletonTableRow key={i} columns={columns} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/** Skeleton para Vehicle Overview card */
export function SkeletonVehicleOverview() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Labels */}
        <div className="flex justify-between">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        {/* Progress bar */}
        <Skeleton className="h-10 w-full rounded-lg" />
        {/* Stats list */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Skeleton para gráfico de estadísticas */
export function SkeletonChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Skeleton para stats card pequeña */
export function SkeletonStatCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
