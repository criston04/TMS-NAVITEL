'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/page-wrapper';
import { MapPinned, Plus, Search, Map, Tag, FileUp } from 'lucide-react';

export default function GeofencesPage() {
  return (
    <PageWrapper
      title="Geocercas"
      description="Gestión de zonas geográficas y polígonos en el mapa"
      actions={
        <>
          <Button variant="outline" size="sm">
            <FileUp className="mr-1.5 h-3.5 w-3.5" />
            Importar KML
          </Button>
          <Button size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva Geocerca
          </Button>
        </>
      }
    >
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar geocercas por nombre o etiqueta..."
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Button variant="secondary" size="sm">
              <Tag className="mr-1.5 h-3.5 w-3.5" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Total Geocercas</p>
            <MapPinned className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-xl font-bold">0</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Polígonos</p>
            <Map className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-blue-600">0</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-muted-foreground">Círculos</p>
          <p className="mt-1 text-xl font-bold text-green-600">0</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Etiquetas</p>
            <Tag className="h-3.5 w-3.5 text-purple-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-purple-600">0</p>
        </Card>
      </div>

      {/* Map Placeholder */}
      <Card className="overflow-hidden">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            Mapa de Geocercas
            <Badge variant="outline" className="text-[10px]">Vista interactiva</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center">
            <Map className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-medium text-muted-foreground">Mapa de Geocercas</h3>
            <p className="text-xs text-muted-foreground/70 mb-3">
              Aquí se visualizarán todas las geocercas creadas
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MapPinned className="mr-1.5 h-3.5 w-3.5" />
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
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <MapPinned className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Crear Manual</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Dibuja polígonos directamente en el mapa con nombre y etiquetas.
          </p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Search className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Buscador</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Busca geocercas por nombre o etiqueta para ubicarlas rápidamente.
          </p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <FileUp className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Importar KML</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Importa geocercas desde archivos KML de Google Earth.
          </p>
        </Card>
      </div>
    </PageWrapper>
  );
}
