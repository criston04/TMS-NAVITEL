'use client';

import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  FileUp, 
  Download,
  X,
  MapPin,
  Check,
  Pencil
} from "lucide-react";
import { GeofencesMap } from "@/components/geofences/geofences-map";
import GeofenceForm from "@/components/geofences/geofence-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Geofence, GeofenceCategory } from "@/types/models/geofence";
import { GeofenceFormData } from "@/components/geofences/geofence-form";
import { cn } from "@/lib/utils";
import { FloatingPanel } from "@/components/ui/floating-panel";

export default function GeofencesPage() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDrawOptions, setShowDrawOptions] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"all" | "selected">("all");
  const [selectedGeofences, setSelectedGeofences] = useState<Set<string>>(new Set());
  const [showPanel, setShowPanel] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingGeofenceId, setEditingGeofenceId] = useState<string | null>(null);
  const { success, error } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<GeofenceFormData>({
    name: "",
    description: "",
    tags: "",
    color: "#00c9ff",
    category: "other" as GeofenceCategory,
    alerts: {
      onEntry: false,
      onExit: false,
      onDwell: false,
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Marcar como montado para evitar errores de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detectar cambios en el ancho del sidebar
  useEffect(() => {
    if (!isMounted) return;
    
    const updateSidebarWidth = () => {
      // Intentar múltiples selectores para encontrar el sidebar
      const sidebar = document.querySelector('aside') || 
                     document.querySelector('[role="navigation"]') ||
                     document.querySelector('nav') ||
                     document.querySelector('.sidebar');
      
      if (sidebar) {
        const width = sidebar.offsetWidth;
        if (width > 0) {
          setSidebarWidth(width);
        }
      }
    };

    // Actualizar repetidamente para capturar cambios
    const interval = setInterval(updateSidebarWidth, 100);
    
    // Actualizar al cargar
    setTimeout(updateSidebarWidth, 100);
    setTimeout(updateSidebarWidth, 500);

    // Actualizar en resize
    window.addEventListener('resize', updateSidebarWidth);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateSidebarWidth);
    };
  }, [isMounted]);

  // Handler cuando se crea una nueva geocerca
  const handleGeofenceCreated = (geofence: Geofence) => {
    setGeofences(prev => [...prev, geofence]);
    success("Geocerca creada", `La geocerca "${geofence.name}" se creó correctamente`);
  };

  // Handler cuando se actualiza una geocerca existente
  const handleGeofenceUpdated = (updatedGeofence: Geofence) => {
    setGeofences(prev => 
      prev.map(g => g.id === updatedGeofence.id ? updatedGeofence : g)
    );
    success("Geocerca actualizada", `La geocerca "${updatedGeofence.name}" se actualizó correctamente`);
  };

  // Handler cuando se importan geocercas desde KML
  const handleKMLImported = (importedGeofences: Geofence[]) => {
    setGeofences(prev => [...prev, ...importedGeofences]);
    success("Importación exitosa", `Se han importado ${importedGeofences.length} geocercas correctamente`);
  };

  // Handlers para dibujo
  const handleDrawPolygon = () => {
    setIsEditingMode(true);
    setEditingGeofenceId(null);
    setShowDrawOptions(false);
    setTimeout(() => {
      (window as any).__drawPolygon?.();
    }, 100);
  };

  const handleDrawCircle = () => {
    setIsEditingMode(true);
    setEditingGeofenceId(null);
    setShowDrawOptions(false);
    setTimeout(() => {
      (window as any).__drawCircle?.();
    }, 100);
  };

  // Handler para importar KML
  const handleImportKML = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    (window as any).__importKML?.(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handler para editar geocerca
  const handleEditGeofence = (geofenceId: string) => {
    // Buscar la geocerca para cargar sus datos
    const geofence = geofences.find(g => g.id === geofenceId);
    if (!geofence) return;
    
    // Asegurarse de que esté seleccionada para que sea visible
    if (!selectedGeofences.has(geofenceId)) {
      setSelectedGeofences(prev => {
        const newSet = new Set(prev);
        newSet.add(geofenceId);
        return newSet;
      });
    }
    
    // Cargar datos en el formulario
    setFormData({
      name: geofence.name,
      description: geofence.description || "",
      tags: geofence.tags.map(t => t.name).join(", "),
      color: geofence.color,
      category: (geofence.category || "other") as GeofenceCategory,
      alerts: geofence.alerts || {
        onEntry: false,
        onExit: false,
        onDwell: false,
      },
    });
    
    setIsEditingMode(true);
    setEditingGeofenceId(geofenceId);
    
    // Llamar a la función global para habilitar edición
    setTimeout(() => {
      (window as any).__editGeofence?.(geofenceId);
    }, 100);
  };

  // Handler cuando se completa la creación/edición
  const handleEditingComplete = () => {
    setIsEditingMode(false);
    setEditingGeofenceId(null);
    setFormData({
      name: "",
      description: "",
      tags: "",
      color: "#00c9ff",
      category: "other" as GeofenceCategory,
      alerts: {
        onEntry: false,
        onExit: false,
        onDwell: false,
      },
    });
  };

  // Handler cuando se cancela la edición
  const handleCancelEditing = () => {
    (window as any).__cancelEditing?.();
    setIsEditingMode(false);
    setEditingGeofenceId(null);
    setFormData({
      name: "",
      description: "",
      tags: "",
      color: "#00c9ff",
      category: "other" as GeofenceCategory,
      alerts: {
        onEntry: false,
        onExit: false,
        onDwell: false,
      },
    });
  };

  // Handler para guardar desde el formulario
  const handleSaveFromForm = () => {
    if (typeof (window as any).__saveGeofence === 'function') {
      (window as any).__saveGeofence(formData);
    } else {
      error('Error al guardar', 'La función de guardado no está disponible. Intenta recargar la página.');
    }
  };

  // Handler para solicitar eliminar geocerca
  const handleDeleteGeofence = (geofenceId: string) => {
    setDeleteId(geofenceId);
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    if (!deleteId) return;
    
    // Remover del estado
    setGeofences(prev => prev.filter(g => g.id !== deleteId));
    
    // Remover del set de seleccionadas
    setSelectedGeofences(prev => {
      const newSet = new Set(prev);
      newSet.delete(deleteId);
      return newSet;
    });
    
    // Remover del mapa
    (window as any).__deleteGeofence?.(deleteId);
    
    success("Geocerca eliminada", "La geocerca ha sido eliminada correctamente");
    setDeleteId(null);
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = geofences.length;
    const polygons = geofences.filter(g => g.type === "polygon").length;
    const circles = geofences.filter(g => g.type === "circle").length;
    const uniqueTags = new Set(geofences.flatMap(g => g.tags.map(t => t.id))).size;

    return { total, polygons, circles, uniqueTags };
  }, [geofences]);

  // Filtrar geocercas por búsqueda
  const filteredGeofences = useMemo(() => {
    if (!searchQuery.trim()) return geofences;
    
    const query = searchQuery.toLowerCase();
    return geofences.filter(g => 
      g.name.toLowerCase().includes(query) ||
      g.tags.some(t => t.name.toLowerCase().includes(query)) ||
      g.description?.toLowerCase().includes(query)
    );
  }, [geofences, searchQuery]);

  // Toggle selección de geocerca
  const toggleGeofenceSelection = (id: string) => {
    setSelectedGeofences(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        // Hacer zoom a la geocerca seleccionada
        (window as any).__zoomToGeofence?.(id);
      }
      return newSet;
    });
  };

  // Geocercas a mostrar según tab
  const displayedGeofences = useMemo(() => {
    if (selectedTab === "selected") {
      return filteredGeofences.filter(g => selectedGeofences.has(g.id));
    }
    return filteredGeofences;
  }, [filteredGeofences, selectedTab, selectedGeofences]);

  // Prevenir error de hidratación
  if (!isMounted) {
    return (
      <div 
        className="geofences-fullscreen fixed transition-all duration-300" 
        style={{ 
          left: '240px', 
          top: 0, 
          right: 0, 
          bottom: 0 
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Override del padding del layout padre */}
      <style jsx global>{`
        main:has(> div.geofences-fullscreen) {
          padding: 0 !important;
          overflow: hidden !important;
        }
        body:has(div.geofences-fullscreen) header {
          display: none !important;
        }
      `}</style>
      
      <div 
        className="geofences-fullscreen fixed transition-all duration-300" 
        style={{ 
          left: `${sidebarWidth}px`, 
          top: 0, 
          right: 0, 
          bottom: 0 
        }}
      >
        {/* Mapa a pantalla completa */}
        <div className="w-full h-full relative">
          <GeofencesMap 
            className="absolute inset-0"
            geofences={geofences}
            selectedGeofenceIds={selectedGeofences}
            sidebarWidth={sidebarWidth}
            isEditingMode={isEditingMode}
            editingGeofenceId={editingGeofenceId}
            onGeofenceCreated={handleGeofenceCreated}
            onGeofenceUpdated={handleGeofenceUpdated}
            onKMLImported={handleKMLImported}
            onEditingComplete={handleEditingComplete}
            onFormDataChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
          />
        </div>

        {/* Panel lateral flotante Draggable */}
        {showPanel && (
          <FloatingPanel
            title={isEditingMode ? (editingGeofenceId ? 'Editar Geocerca' : 'Nueva Geocerca') : 'Geocercas'}
            onClose={() => setShowPanel(false)}
            width={430}
            defaultPosition={{ x: window.innerWidth - 450, y: 20 }}
            headerActions={
              !isEditingMode && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 w-8 p-0"
                    title="Importar KML"
                  >
                    <FileUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Descargar"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )
            }
          >
            {!isEditingMode ? (
              <div className="p-4 space-y-4">
                {/* Tabs */}
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setSelectedTab("all")}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      selectedTab === "all"
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    )}
                  >
                    Todas ({geofences.length})
                  </button>
                  <button
                    onClick={() => setSelectedTab("selected")}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      selectedTab === "selected"
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    )}
                  >
                    Elegidas ({selectedGeofences.size})
                  </button>
                  
                  {/* Botón nueva geocerca con dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDrawOptions(!showDrawOptions)}
                      className={cn(
                        "h-10 w-10 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center shrink-0",
                        showDrawOptions && "rotate-45"
                      )}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    
                    {/* Opciones de dibujo */}
                    {showDrawOptions && (
                      <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 p-2 flex flex-col gap-2 z-50 animate-scale-in">
                        <button
                          onClick={handleDrawPolygon}
                          className="h-10 w-10 rounded-md border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center group"
                          title="Dibujar Polígono"
                        >
                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2 L22 9 L18 21 L6 21 L2 9 Z" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="2" r="2.5" fill="#DC2626"/>
                            <circle cx="22" cy="9" r="2.5" fill="#DC2626"/>
                            <circle cx="18" cy="21" r="2.5" fill="#DC2626"/>
                            <circle cx="6" cy="21" r="2.5" fill="#DC2626"/>
                            <circle cx="2" cy="9" r="2.5" fill="#DC2626"/>
                          </svg>
                        </button>
                        <button
                          onClick={handleDrawCircle}
                          className="h-10 w-10 rounded-md border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center group"
                          title="Dibujar Círculo"
                        >
                          <svg className="h-5 w-5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                            <circle cx="12" cy="12" r="9"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buscador */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar geocercas..."
                    className="pl-10 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Lista de geocercas */}
                <div className="space-y-1 pb-4">
                  {displayedGeofences.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-lg">
                      <MapPin className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium opacity-60">
                        {searchQuery ? "No se encontraron geocercas" : "No hay geocercas"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {displayedGeofences.map((geofence) => (
                        <div
                          key={geofence.id}
                          className={cn(
                            "group p-3 rounded-lg border transition-all cursor-pointer relative hover:shadow-md",
                            selectedGeofences.has(geofence.id) 
                              ? "bg-primary/5 border-primary/20 dark:bg-primary/10" 
                              : "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-primary/20"
                          )}
                          onClick={() => toggleGeofenceSelection(geofence.id)}
                        >
                          <div className="flex items-start gap-3">
                             <div className={cn(
                                "mt-1 h-5 w-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                                selectedGeofences.has(geofence.id)
                                  ? "bg-primary border-primary text-white shadow-sm"
                                  : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 group-hover:border-primary/50"
                              )}>
                                {selectedGeofences.has(geofence.id) && <Check className="h-3 w-3" />}
                             </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {geofence.type === "circle" ? (
                                  <svg className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                                    <circle cx="12" cy="12" r="9"/>
                                  </svg>
                                ) : (
                                  <svg className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                    <path d="M2 17l10 5 10-5"/>
                                    <path d="M2 12l10 5 10-5"/>
                                  </svg>
                                )}
                                <span className="font-semibold text-sm truncate flex-1 text-gray-900 dark:text-gray-100">{geofence.name}</span>
                              </div>
                              
                              {geofence.description && (
                                <p className="text-xs text-muted-foreground truncate mb-2">
                                  {geofence.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                {geofence.tags.length > 0 ? (
                                    <div className="flex gap-1 flex-wrap">
                                      {geofence.tags.slice(0, 2).map((tag) => (
                                        <Badge
                                          key={tag.id}
                                          variant="secondary"
                                          className="text-[10px] px-1.5 py-0 h-5 font-normal"
                                          style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                                        >
                                          {tag.name}
                                        </Badge>
                                      ))}
                                      {geofence.tags.length > 2 && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground border-transparent bg-gray-100 dark:bg-slate-800">
                                          +{geofence.tags.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                ) : <div />}

                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-sm hover:bg-gray-100 dark:hover:bg-slate-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditGeofence(geofence.id);
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-gray-500" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteGeofence(geofence.id);
                                    }}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 pt-1">
                <GeofenceForm
                  formData={formData}
                  onFormDataChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                  onSave={handleSaveFromForm}
                  onCancel={handleCancelEditing}
                />
              </div>
            )}
          </FloatingPanel>
        )}

        {/* Botón para mostrar panel si está oculto */}
        {!showPanel && (
          <button
            onClick={() => setShowPanel(true)}
            className="absolute top-4 right-4 h-10 w-10 rounded-lg bg-white dark:bg-slate-900 shadow-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:shadow-xl transition-all z-1000"
          >
            <MapPin className="h-5 w-5" />
          </button>
        )}


        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="¿Eliminar geocerca?"
          description="Esta acción no se puede deshacer. Se eliminará la geocerca de forma permanente."
          onConfirm={confirmDelete}
          variant="destructive"
          confirmText="Eliminar"
        />
        {/* Input oculto para KML */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".kml"
          onChange={handleImportKML}
          className="hidden"
        />
      </div>
    </>
  );
}
