'use client';

import { memo, useState, useCallback, useRef } from 'react';
import {
  GitBranch,
  Edit2,
  Copy,
  Trash2,
  Play,
  Pause,
  X,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  GripVertical,
  Plus,
  Settings,
  ChevronLeft,
  MoreVertical,
  FileText
} from 'lucide-react';
import type { Workflow, WorkflowStep, CreateWorkflowDTO } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface WorkflowDetailPanelProps {
  workflow: Workflow | null;
  isEditing: boolean;
  isSaving?: boolean;
  availableGeofences?: Array<{ id: string; name: string; type: string; color: string }>;
  availableCustomers?: Array<{ id: string; name: string }>;
  onEdit: () => void;
  onSave: (data: CreateWorkflowDTO) => Promise<void>;
  onCancel: () => void;
  onDuplicate: (workflow: Workflow) => void;
  onDelete: (workflow: Workflow) => void;
  onToggleStatus: (workflow: Workflow) => void;
  className?: string; // Para layout flexible
}

// STEP CARD

interface StepCardProps {
  step: WorkflowStep;
  index: number;
  isEditing: boolean;
  geofences?: Array<{ id: string; name: string; type: string; color: string }>;
  onChange?: (step: WorkflowStep) => void;
  onRemove?: () => void;
}

const ACTION_ICONS: Record<string, typeof MapPin> = {
  enter_geofence: MapPin,
  exit_geofence: MapPin,
  manual_check: Users,
  document_scan: FileText,
  signature: Edit2,
  photo: Settings,
};

const StepCard = memo(function StepCard({
  step,
  index,
  isEditing,
  geofences,
  onChange,
  onRemove,
}: StepCardProps) {
  const IconComponent = ACTION_ICONS[step.action] || GitBranch;
  
  return (
    <div className="relative pl-6 pb-6 last:pb-0 group">
      {/* Timeline Line */}
      <div className="absolute left-2.75 top-8 bottom-0 w-px bg-border group-last:hidden" />
      
      {/* Step Node */}
      <div 
        className={cn(
          "absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-background z-10 transition-colors",
          isEditing ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground"
        )}
      >
        <span className="text-[10px] font-bold">{index + 1}</span>
      </div>

      <div className={cn(
        "ml-4 rounded-xl border transition-all duration-200 overflow-hidden",
        isEditing 
          ? "bg-card shadow-sm hover:shadow-md border-primary/20" 
          : "bg-card/50 hover:bg-card border-transparent hover:border-border"
      )}>
        {/* Step Header */}
        <div className="p-3 flex items-start gap-3 bg-muted/10 border-b border-border/50">
          <div className="p-2 bg-background rounded-md border shadow-sm shrink-0">
            <IconComponent className="w-4 h-4 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0 pt-0.5">
            {isEditing ? (
              <Input
                value={step.name}
                onChange={(e) => onChange?.({ ...step, name: e.target.value })}
                className="h-7 text-sm font-medium bg-transparent border-transparent hover:border-border focus:border-primary px-1 -ml-1"
                placeholder="Nombre del paso"
              />
            ) : (
              <h4 className="font-medium text-sm truncate pr-2">{step.name}</h4>
            )}
            
            {isEditing ? (
              <Input
                value={step.description || ''}
                onChange={(e) => onChange?.({ ...step, description: e.target.value })}
                className="h-6 text-xs text-muted-foreground bg-transparent border-transparent hover:border-border focus:border-primary px-1 -ml-1 mt-1"
                placeholder="Añade una descripción..."
              />
            ) : step.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            )}
          </div>

          {isEditing && (
             <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={onRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
                   <GripVertical className="h-4 w-4" />
                </div>
             </div>
          )}
        </div>

        {/* Step Body (Config) */}
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Acción</label>
                {isEditing ? (
                  <Select
                    value={step.action}
                    onValueChange={(v) => onChange?.({ ...step, action: v as WorkflowStep['action'] })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enter_geofence">Entrar a geocerca</SelectItem>
                      <SelectItem value="exit_geofence">Salir de geocerca</SelectItem>
                      <SelectItem value="manual_check">Verificación manual</SelectItem>
                      <SelectItem value="document_scan">Escaneo de documento</SelectItem>
                      <SelectItem value="signature">Firma</SelectItem>
                      <SelectItem value="photo">Fotografía</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-xs font-medium py-1">
                    {step.action === 'enter_geofence' ? 'Entrar a geocerca' :
                     step.action === 'exit_geofence' ? 'Salir de geocerca' :
                     step.action === 'manual_check' ? 'Verificación manual' : step.action}
                  </div>
                )}
             </div>

             <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Duración Est.</label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={step.estimatedDurationMinutes || ''}
                      onChange={(e) => onChange?.({ ...step, estimatedDurationMinutes: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">min</span>
                  </div>
                ) : (
                  <div className="text-xs font-medium py-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    {step.estimatedDurationMinutes || 0} min
                  </div>
                )}
             </div>
          </div>

          {/* Conditional Config based on action */}
          {(step.action === 'enter_geofence' || step.action === 'exit_geofence') && (
            <div className="pt-2 border-t border-border/50">
               <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1">Geocerca Requerida</label>
               {isEditing ? (
                 <Select
                   value={step.actionConfig?.geofenceId || ''}
                   onValueChange={(v) => {
                     const geo = geofences?.find(g => g.id === v);
                     onChange?.({
                       ...step,
                       actionConfig: {
                         ...step.actionConfig,
                         geofenceId: v,
                         geofenceName: geo?.name,
                       },
                     });
                   }}
                 >
                   <SelectTrigger className="h-8 text-xs w-full">
                     <SelectValue placeholder="Seleccionar geocerca" />
                   </SelectTrigger>
                   <SelectContent>
                     {geofences?.map((geo) => (
                       <SelectItem key={geo.id} value={geo.id}>
                         <div className="flex items-center gap-2">
                           <div 
                             className="w-2 h-2 rounded-full"
                             style={{ backgroundColor: geo.color }}
                           />
                           {geo.name}
                         </div>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               ) : (
                 <div className="flex items-center gap-2 text-xs py-1">
                    {step.actionConfig?.geofenceName ? (
                      <Badge variant="secondary" className="font-normal">
                         <MapPin className="w-3 h-3 mr-1" />
                         {step.actionConfig.geofenceName}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground italic">No asignada</span>
                    )}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// COMPONENTE PRINCIPAL

export const WorkflowDetailPanel = memo(function WorkflowDetailPanel({
  workflow,
  isEditing,
  isSaving = false,
  availableGeofences = [],
  availableCustomers: _availableCustomers = [],
  onEdit,
  onSave,
  onCancel, // Usado como "Back" cuando no se está editando, o "Cancelar edición"
  onDuplicate,
  onDelete,
  onToggleStatus,
  className,
}: Readonly<WorkflowDetailPanelProps>) {
  
  const [editData, setEditData] = useState<Partial<CreateWorkflowDTO>>(() => {
    if (workflow) {
      return {
        name: workflow.name,
        description: workflow.description,
        code: workflow.code,
        steps: workflow.steps,
        isDefault: workflow.isDefault,
        applicableCargoTypes: workflow.applicableCargoTypes,
        applicableCustomerIds: workflow.applicableCustomerIds,
      };
    }
    return {
      steps: [],
      name: '',
      code: '',
      isDefault: false
    };
  });
  const [activeTab, setActiveTab] = useState<'design' | 'settings'>('design');

  // Sincronizar editData cuando cambia workflow usando el patrón recomendado
  // de "storing previous props" para detectar cambios y resetear estado
  const prevWorkflowIdRef = useRef(workflow?.id);
  if (workflow?.id !== prevWorkflowIdRef.current) {
    prevWorkflowIdRef.current = workflow?.id;
    // Reset editData cuando el workflow cambia (durante render, no en effect)
    const newData = workflow ? {
      name: workflow.name,
      description: workflow.description,
      code: workflow.code,
      steps: workflow.steps,
      isDefault: workflow.isDefault,
      applicableCargoTypes: workflow.applicableCargoTypes,
      applicableCustomerIds: workflow.applicableCustomerIds,
    } : {
      steps: [],
      name: '',
      code: '',
      isDefault: false
    };
    setEditData(newData);
  }

  const handleSave = () => {
    if (!editData.name || !editData.code) return; // Simple validation
    onSave(editData as CreateWorkflowDTO);
  };

  const addStep = useCallback(() => {
    const newStep: WorkflowStep = {
      id: `step-new-${Date.now()}`,
      name: 'Nuevo paso',
      description: '',
      sequence: (editData.steps?.length || 0) + 1,
      action: 'manual_check',
      isRequired: true,
      canSkip: false,
      actionConfig: {},
      estimatedDurationMinutes: 30,
      transitionConditions: [],
      notifications: [],
      color: '#3b82f6',
      icon: 'GitBranch',
    };
    setEditData(prev => ({
       ...prev,
       steps: [...(prev.steps || []), newStep]
    }));
  }, [editData.steps]);

  const updateStep = useCallback((index: number, updated: WorkflowStep) => {
    setEditData(prev => {
      const newSteps = [...(prev.steps || [])];
      newSteps[index] = updated;
      return { ...prev, steps: newSteps };
    });
  }, []);

  const removeStep = useCallback((index: number) => {
    setEditData(prev => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  // Empty State eliminado porque ahora siempre mostramos el editor/visualizador completo

  const displayData = isEditing ? editData : workflow;
  // Fallback seguro
  if (!displayData) return null;

  return (
    <div className={cn("flex flex-col h-full bg-background animate-in fade-in duration-300", className)}>
      {/* Header Toolbar */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-card sticky top-0 z-20">
        <div className="flex items-center gap-4 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="mr-2 -ml-2 text-muted-foreground hover:text-foreground"
            title="Volver a la lista"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div className="p-2 rounded-lg bg-primary/10 text-primary hidden sm:block">
             <GitBranch className="w-5 h-5" />
          </div>
          <div className="min-w-0">
             {isEditing ? (
               <Input 
                  value={editData.name || ''} 
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  className="h-8 font-semibold text-lg border-transparent hover:border-border px-1 -ml-1 bg-transparent w-full md:w-64 focus-visible:ring-0"
                  placeholder="Nombre del workflow"
               />
             ) : (
               <h1 className="text-lg font-semibold truncate">{workflow?.name}</h1>
             )}
             <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                {isEditing ? (
                  <Input 
                    value={editData.code || ''}
                    onChange={e => setEditData({...editData, code: e.target.value.toUpperCase()})}
                    className="h-5 w-32 font-mono text-xs border-transparent hover:border-border px-1 -ml-1 bg-transparent uppercase"
                    placeholder="CODE_123"
                  />
                ) : (
                  <span className="font-mono">{workflow?.code}</span>
                )}
                {!isEditing && workflow?.isDefault && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1">Default</Badge>
                )}
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {isEditing ? (
             <>
               <Button variant="ghost" onClick={onCancel} disabled={isSaving}>Cancelar</Button>
               <Button onClick={handleSave} disabled={isSaving}>
                 {isSaving ? 'Guardando...' : 'Guardar Cambios'}
               </Button>
             </>
           ) : (
             <>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => workflow && onDuplicate(workflow)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => workflow && onToggleStatus(workflow)}>
                      {workflow?.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" /> Desactivar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" /> Activar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => workflow && onDelete(workflow)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             </>
           )}
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'design' | 'settings')} className="flex-1 flex flex-col min-h-0">
        <div className="border-b px-6 bg-muted/10">
           <TabsList className="bg-transparent h-10 p-0 transform translate-y-px">
              <TabsTrigger 
                value="design" 
                className="rounded-t-lg rounded-b-none border border-transparent data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-none px-4 h-10"
              >
                Diseño del Flujo
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-t-lg rounded-b-none border border-transparent data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-none px-4 h-10"
              >
                Configuración
              </TabsTrigger>
           </TabsList>
        </div>

        <TabsContent value="design" className="flex-1 min-h-0 m-0 p-0 relative">
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto p-8">
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-lg font-medium">Secuencia de Pasos</h3>
                   <p className="text-sm text-muted-foreground">Define el orden y las acciones que deben completarse.</p>
                 </div>
                 {isEditing && (
                   <Button size="sm" variant="secondary" onClick={addStep}>
                     <Plus className="w-4 h-4 mr-2" />
                     Agregar Paso
                   </Button>
                 )}
               </div>

               <div className="space-y-1 pb-10">
                 {/* Start Node */}
                 <div className="flex items-center gap-4 mb-4 opacity-50 text-sm">
                    <div className="w-6 h-6 rounded-full border-2 border-dashed flex items-center justify-center ml-px">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <span>Inicio del Workflow</span>
                 </div>

                 {/* Steps */}
                 {(isEditing ? editData.steps : displayData.steps)?.map((step, idx) => (
                    <StepCard 
                      key={(step as WorkflowStep).id || `step-${idx}`}
                      step={step as WorkflowStep}
                      index={idx}
                      isEditing={isEditing}
                      geofences={availableGeofences}
                      onChange={(updated) => updateStep(idx, updated)}
                      onRemove={() => removeStep(idx)}
                    />
                 ))}

                 {(!displayData.steps || displayData.steps.length === 0) && (
                    <div className="border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground ml-8">
                       <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                       <p>No hay pasos definidos</p>
                    </div>
                 )}

                 {/* End Node */}
                 <div className="flex items-center gap-4 mt-8 opacity-50 text-sm">
                    <div className="w-6 h-6 rounded-full border-2 border-dashed flex items-center justify-center ml-px">
                       <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <span>Fin del Workflow</span>
                 </div>
               </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 min-h-0 m-0 p-8 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-6">
             <div className="space-y-4">
                <h3 className="font-medium">Descripción y Metadatos</h3>
                <div className="space-y-2">
                   <Label>Descripción</Label>
                   {isEditing ? (
                     <Textarea 
                       value={editData.description || ''}
                       onChange={e => setEditData({...editData, description: e.target.value})}
                       rows={4}
                     />
                   ) : (
                     <p className="text-sm text-muted-foreground p-3 border rounded-md">{displayData.description || 'Sin descripción'}</p>
                   )}
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                   <Switch 
                      id="is-default" 
                      checked={isEditing ? editData.isDefault : workflow?.isDefault}
                      disabled={!isEditing}
                      onCheckedChange={(c) => setEditData({...editData, isDefault: c})}
                   />
                   <Label htmlFor="is-default">Marcar como workflow por defecto</Label>
                </div>
             </div>

             <div className="space-y-4 pt-6 border-t">
                <h3 className="font-medium">Clientes y Cargas</h3>
                <p className="text-sm text-muted-foreground">Configura para quiénes aplica este workflow automáticamente.</p>
                {/* Aquí irían selectores para clientes y tipos de carga */}
                <div className="text-xs text-muted-foreground italic bg-muted p-4 rounded-lg">
                   Funcionalidad avanzada: Reglas de asignación automática
                </div>
             </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});
