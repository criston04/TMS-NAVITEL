"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPinned, Plus, Search, Map, Tag, FileUp } from "lucide-react";

export default function GeofencesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Geocercas</h1>
          <p className="text-muted-foreground">
            Gestión de zonas geográficas y polígonos en el mapa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileUp className="mr-2 h-4 w-4" />
            Importar KML
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Geocerca
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar geocercas por nombre o etiqueta..."
                className="pl-10"
              />
            </div>
            <Button variant="secondary">
              <Tag className="mr-2 h-4 w-4" />
              Filtrar por Etiqueta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Geocercas</CardTitle>
            <MapPinned className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Polígonos</CardTitle>
            <Map className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Círculos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Etiquetas</CardTitle>
            <Tag className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Map Placeholder */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Mapa de Geocercas
            <Badge variant="outline" className="ml-2">Vista interactiva</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-100 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center">
            <Map className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Mapa de Geocercas</h3>
            <p className="text-sm text-muted-foreground/70 mb-4">
              Aquí se visualizarán todas las geocercas creadas
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MapPinned className="mr-2 h-4 w-4" />
                Dibujar Polígono
              </Button>
              <Button variant="outline" size="sm">
                Dibujar Círculo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-primary" />
              Crear Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Dibuja polígonos directamente en el mapa con nombre y etiquetas personalizadas para filtros.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Buscador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Busca geocercas por nombre o etiqueta para ubicarlas rápidamente en el mapa.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" />
              Importar KML
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Importa geocercas desde archivos KML generados por Google Earth u otras herramientas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
