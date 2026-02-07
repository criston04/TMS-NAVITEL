'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/page-wrapper';
import { Building2, Plus, Upload, Download, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function OperatorsPage() {
  return (
    <PageWrapper
      title="Operadores Logísticos"
      description="Gestión de operadores logísticos con validación y checklist"
      actions={
        <>
          <Button variant="outline" size="sm">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Carga Masiva
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo Operador
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
                placeholder="Buscar operadores por nombre, RUC..."
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
            <p className="text-xs font-medium text-muted-foreground">Total Operadores</p>
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-xl font-bold">0</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Habilitados</p>
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-green-600">0</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Bloqueados</p>
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-red-600">0</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Por Validar</p>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-amber-600">0</p>
        </Card>
      </div>

      {/* Checklist Info */}
      <Card className="border-[#34b7ff]/30 bg-[#34b7ff]/5 dark:bg-[#34b7ff]/10 dark:border-[#34b7ff]/20 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Sistema de Validación</h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Los operadores requieren validación mediante checklist de documentos.
            </p>
          </div>
        </div>
      </Card>

      {/* Table Placeholder */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            Lista de Operadores Logísticos
            <Badge variant="outline" className="text-[10px]">0 registros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-medium">No hay operadores registrados</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Registra operadores manualmente o mediante carga masiva
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Carga Masiva
              </Button>
              <Button size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Registrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
