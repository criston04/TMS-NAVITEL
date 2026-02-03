'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/page-wrapper';
import { Box, Plus, Upload, Download, Search } from 'lucide-react';

export default function ProductsPage() {
  return (
    <PageWrapper
      title="Productos"
      description="Catálogo de productos para transporte"
      actions={
        <>
          <Button variant="outline" size="sm">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo Producto
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
                placeholder="Buscar productos por nombre, SKU, categoría..."
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Button variant="secondary" size="sm">Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Total Productos</p>
            <Box className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-xl font-bold">0</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-muted-foreground">Activos</p>
          <p className="mt-1 text-xl font-bold text-green-600">0</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-muted-foreground">Inactivos</p>
          <p className="mt-1 text-xl font-bold text-gray-400">0</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-muted-foreground">Categorías</p>
          <p className="mt-1 text-xl font-bold text-blue-600">0</p>
        </Card>
      </div>

      {/* Table Placeholder */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            Catálogo de Productos
            <Badge variant="outline" className="text-[10px]">0 registros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Box className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-medium">No hay productos registrados</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Agrega productos manualmente o importa desde Excel/CSV
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Importar
              </Button>
              <Button size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
