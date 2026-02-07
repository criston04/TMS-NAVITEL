"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Truck,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  X,
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  FolderOpen,
  BookTemplate,
  GripVertical,
  AlertTriangle,
  Bell,
  AlertCircle,
  MapPinOff,
  Zap,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RouteMapSimple } from "@/components/route-planner/route-map-simple";
import { cn } from "@/lib/utils";

// Función helper para formatear minutos a horas y minutos
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
};

interface RouteData {
  id: string;
  name: string;
  stops: number;
  distance: number;
  duration: number;
  status: "pending" | "assigned";
  assignedVehicle?: string;
  coordinates: Array<{ lat: number; lng: number; name: string; route?: string; dwellTime?: number }>;
}

// Tipos para Templates
interface RouteTemplate {
  id: string;
  name: string;
  description: string;
  vehicles: string;
  startTime: string;
  endTime: string;
  points: Array<{ name: string; lat: string; lng: string; address: string }>;
  createdAt: string;
}

function RouteWizard({ onComplete, isModal = false }: { onComplete: (data: any) => void; isModal?: boolean }) {
  const [vehicles, setVehicles] = useState("3");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<"file" | "manual">("manual");
  const [manualPoints, setManualPoints] = useState<Array<{ name: string; lat: string; lng: string; address: string; dwellTime?: string }>>([]);
  const [currentPoint, setCurrentPoint] = useState({ name: "", lat: "", lng: "", address: "", dwellTime: "45" });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingSuggestions, setGeocodingSuggestions] = useState<Array<{display_name: string, lat: number, lon: number}>>([]);
  
  // Estados para Templates
  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Cargar templates desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('routeTemplates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  // Función para geocodificar direcciones usando Nominatim (OpenStreetMap)
  const geocodeAddress = async (address: string): Promise<{lat: number, lng: number, displayName: string} | null> => {
    if (!address.trim()) return null;
    
    try {
      setIsGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=pe`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  // Buscar sugerencias de direcciones mientras escribe
  const searchAddressSuggestions = async (query: string) => {
    if (query.length < 3) {
      setGeocodingSuggestions([]);
      return;
    }

    try {
      // Agregar "Lima, Peru" si no está en la búsqueda para mejorar resultados
      const searchQuery = query.toLowerCase().includes('lima') || query.toLowerCase().includes('peru') 
        ? query 
        : `${query}, Lima, Peru`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&countrycodes=pe&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Priorizar resultados que tengan dirección completa (road, house_number)
        const sortedData = data.sort((a: any, b: any) => {
          const aHasRoad = a.address?.road ? 1 : 0;
          const bHasRoad = b.address?.road ? 1 : 0;
          return bHasRoad - aHasRoad;
        });
        
        setGeocodingSuggestions(
          sortedData.map((item: any) => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon)
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Auto-geocodificar cuando el usuario escribe una dirección
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setCurrentPoint({ ...currentPoint, address });
    searchAddressSuggestions(address);
  };

  // Seleccionar una sugerencia de dirección
  const selectAddressSuggestion = (suggestion: {display_name: string, lat: number, lon: number}) => {
    setCurrentPoint({
      ...currentPoint,
      address: suggestion.display_name,
      lat: suggestion.lat.toString(),
      lng: suggestion.lon.toString(),
      name: currentPoint.name || suggestion.display_name.split(',')[0]
    });
    setGeocodingSuggestions([]);
  };

  // ===== FUNCIONES PARA TEMPLATES =====
  
  // Guardar configuración actual como template
  const saveAsTemplate = () => {
    if (!templateName.trim()) {
      alert("Por favor ingresa un nombre para la plantilla");
      return;
    }

    if (inputMode === "manual" && manualPoints.length === 0) {
      alert("No hay puntos de entrega para guardar");
      return;
    }

    const newTemplate: RouteTemplate = {
      id: Date.now().toString(),
      name: templateName,
      description: templateDescription,
      vehicles,
      startTime,
      endTime,
      points: manualPoints,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('routeTemplates', JSON.stringify(updatedTemplates));
    
    setTemplateName("");
    setTemplateDescription("");
    setShowTemplateDialog(false);
    
    alert(`✅ Plantilla "${newTemplate.name}" guardada exitosamente`);
  };

  // Cargar un template existente
  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setVehicles(template.vehicles);
    setStartTime(template.startTime);
    setEndTime(template.endTime);
    setManualPoints(template.points);
    setInputMode("manual");
    setSelectedTemplate(templateId);
    
    alert(`✅ Plantilla "${template.name}" cargada`);
  };

  // Eliminar un template
  const deleteTemplate = (templateId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta plantilla?")) return;
    
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('routeTemplates', JSON.stringify(updatedTemplates));
    
    if (selectedTemplate === templateId) {
      setSelectedTemplate("");
    }
  };

  // ===== FIN FUNCIONES TEMPLATES =====

  // Calcular automáticamente el número de rutas sugerido basado en los puntos
  const calculateSuggestedRoutes = (totalPoints: number): number => {
    if (totalPoints <= 5) return 1;
    if (totalPoints <= 10) return 2;
    if (totalPoints <= 15) return 3;
    if (totalPoints <= 20) return 4;
    return Math.ceil(totalPoints / 5); // ~5 puntos por ruta
  };

  // Actualizar automáticamente cuando cambian los puntos
  useEffect(() => {
    if (inputMode === "manual" && manualPoints.length > 0) {
      const suggested = calculateSuggestedRoutes(manualPoints.length);
      setVehicles(suggested.toString());
    }
  }, [manualPoints.length, inputMode]);

  // Estado para almacenar los puntos parseados del archivo
  const [parsedFilePoints, setParsedFilePoints] = useState<Array<{ name: string; lat: string; lng: string; address: string; route?: string; dwellTime?: string }>>([]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      parseExcelFile(droppedFile);
    }
  };

  // Función para parsear el archivo Excel/CSV
  const parseExcelFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length <= 1) {
        console.error("Archivo vacío o sin datos");
        return;
      }

      // Primera línea son los headers
      const headers = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase());
      const points: Array<{ name: string; lat: string; lng: string; address: string; route?: string; dwellTime?: string }> = [];
      
      // Detectar índices de columnas (flexible para diferentes formatos)
      const nameIdx = headers.findIndex(h => h.includes('nombre') || h.includes('name') || h.includes('punto'));
      const latIdx = headers.findIndex(h => h.includes('lat') && !h.includes('long'));
      const lngIdx = headers.findIndex(h => h.includes('lon') || h.includes('lng'));
      const addressIdx = headers.findIndex(h => h.includes('direc') || h.includes('address') || h.includes('ubicacion'));
      const routeIdx = headers.findIndex(h => h.includes('ruta') || h.includes('route'));
      const dwellTimeIdx = headers.findIndex(h => h.includes('tiempo') || h.includes('espera') || h.includes('dwell') || h.includes('duracion'));

      // Procesar cada línea de datos
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/[,;\t]/).map(v => v.trim().replace(/^["']|["']$/g, ''));
        
        if (values.length > Math.max(nameIdx, latIdx, lngIdx)) {
          const point = {
            name: nameIdx >= 0 ? values[nameIdx] : `Punto ${i}`,
            lat: latIdx >= 0 ? values[latIdx] : '',
            lng: lngIdx >= 0 ? values[lngIdx] : '',
            address: addressIdx >= 0 ? values[addressIdx] : '',
            route: routeIdx >= 0 ? values[routeIdx] : undefined,
            dwellTime: dwellTimeIdx >= 0 ? values[dwellTimeIdx] : '45'
          };
          
          // Validar que tenga coordenadas válidas
          if (point.lat && point.lng && !isNaN(parseFloat(point.lat)) && !isNaN(parseFloat(point.lng))) {
            points.push(point);
          }
        }
      }

      console.log(`✅ Archivo parseado: ${points.length} puntos encontrados`);
      setParsedFilePoints(points);

      // Detectar automáticamente el número de rutas desde el archivo
      if (routeIdx >= 0) {
        const uniqueRoutes = new Set(points.map(p => p.route).filter(Boolean));
        const numRoutes = uniqueRoutes.size;
        console.log(`📊 Rutas detectadas en archivo: ${numRoutes}`);
        setVehicles(numRoutes.toString());
      } else {
        // Si no hay columna de ruta, calcular basado en cantidad de puntos
        const suggested = calculateSuggestedRoutes(points.length);
        console.log(`📊 Rutas sugeridas por cantidad de puntos: ${suggested}`);
        setVehicles(suggested.toString());
      }
      
    } catch (error) {
      console.error("Error al parsear archivo:", error);
      setParsedFilePoints([]);
    }
  };

  const handleProcess = () => {
    console.log("=== PROCESANDO RUTAS ===");
    console.log("Modo:", inputMode);
    
    // Determinar los puntos a usar y el número de rutas
    let coordinates: Array<{ lat: number; lng: number; name: string; route?: string; dwellTime?: number }> = [];
    let numRoutes = vehicles && parseInt(vehicles) > 0 ? parseInt(vehicles) : 3;
    
    if (inputMode === "manual" && manualPoints.length > 0) {
      // Modo manual: usar puntos manuales
      coordinates = manualPoints.map(p => ({
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng),
        name: p.name,
        dwellTime: p.dwellTime ? parseInt(p.dwellTime) : 45
      }));
      console.log("Usando puntos manuales:", coordinates.length);
    } else if (inputMode === "file" && parsedFilePoints.length > 0) {
      // Modo archivo: usar puntos del archivo parseado
      coordinates = parsedFilePoints.map(p => ({
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng),
        name: p.name,
        route: p.route,
        dwellTime: p.dwellTime ? parseInt(p.dwellTime) : 45
      }));
      console.log("Usando puntos del archivo:", coordinates.length);
      
      // Si el archivo tiene columna de ruta, agrupar por ruta
      const hasRouteColumn = coordinates.some(c => c.route);
      if (hasRouteColumn) {
        const routeGroups = new Map<string, typeof coordinates>();
        coordinates.forEach(coord => {
          const routeKey = coord.route || 'default';
          if (!routeGroups.has(routeKey)) {
            routeGroups.set(routeKey, []);
          }
          routeGroups.get(routeKey)!.push(coord);
        });
        
        // Crear rutas basadas en los grupos del archivo
        const mockRoutes: RouteData[] = Array.from(routeGroups.entries()).map(([routeName, routeCoords], i) => {
          const distance = routeCoords.length * 2.5;
          const duration = routeCoords.length * 9;
          
          return {
            id: `r${i + 1}`,
            name: routeName !== 'default' ? routeName : `Ruta ${i + 1}`,
            stops: routeCoords.length,
            distance: parseFloat(distance.toFixed(1)),
            duration,
            status: "pending",
            coordinates: routeCoords,
          };
        });
        
        console.log(`✅ ${mockRoutes.length} rutas generadas desde archivo con columna de ruta`);
        
        onComplete({
          routes: mockRoutes,
          vehicles: mockRoutes.length,
          timeRange: { start: startTime, end: endTime },
        });
        return;
      }
    } else {
      // Fallback: usar puntos mock si no hay datos
      coordinates = [
        { lat: -12.046374, lng: -77.042793, name: "Lima Centro", dwellTime: 45 },
        { lat: -12.056374, lng: -77.052793, name: "Miraflores", dwellTime: 45 },
        { lat: -12.066374, lng: -77.062793, name: "San Isidro", dwellTime: 45 },
        { lat: -12.076374, lng: -77.072793, name: "Surco", dwellTime: 45 },
        { lat: -12.086374, lng: -77.082793, name: "La Molina", dwellTime: 45 },
        { lat: -12.036374, lng: -77.032793, name: "Breña", dwellTime: 45 },
        { lat: -12.046374, lng: -77.042793, name: "Jesús María", dwellTime: 45 },
        { lat: -12.056374, lng: -77.052793, name: "Lince", dwellTime: 45 },
        { lat: -12.066374, lng: -77.062793, name: "San Borja", dwellTime: 45 },
        { lat: -12.076374, lng: -77.072793, name: "San Luis", dwellTime: 45 },
        { lat: -12.086374, lng: -77.082793, name: "Ate", dwellTime: 45 },
        { lat: -12.096374, lng: -77.092793, name: "Santa Anita", dwellTime: 45 },
        { lat: -12.106374, lng: -77.102793, name: "El Agustino", dwellTime: 45 },
        { lat: -12.026374, lng: -77.022793, name: "Pueblo Libre", dwellTime: 45 },
        { lat: -12.036374, lng: -77.032793, name: "Magdalena", dwellTime: 45 },
        { lat: -12.046374, lng: -77.042793, name: "San Miguel", dwellTime: 45 },
        { lat: -12.056374, lng: -77.052793, name: "Callao", dwellTime: 45 },
        { lat: -12.066374, lng: -77.062793, name: "Bellavista", dwellTime: 45 },
        { lat: -12.076374, lng: -77.072793, name: "La Perla", dwellTime: 45 },
        { lat: -12.186374, lng: -77.012793, name: "Chorrillos", dwellTime: 45 },
      ];
      console.log("⚠️ Usando puntos mock (sin datos reales)");
    }

    console.log("Número de rutas a generar:", numRoutes);
    console.log("Total de puntos:", coordinates.length);

    // Dividir puntos en rutas de manera equitativa
    const chunkSize = Math.ceil(coordinates.length / numRoutes);
    const mockRoutes: RouteData[] = [];
    
    for (let i = 0; i < numRoutes; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const routeCoords = coordinates.slice(start, end);
      
      if (routeCoords.length > 0) {
        const distance = routeCoords.length * 2.5;
        // Calcular duración: tiempo de viaje + tiempo de espera en cada punto
        const travelTime = routeCoords.length * 9; // 9 minutos por punto de viaje
        const totalDwellTime = routeCoords.reduce((sum, coord) => sum + (coord.dwellTime || 45), 0);
        const duration = travelTime + totalDwellTime;
        
        mockRoutes.push({
          id: `r${i + 1}`,
          name: `Ruta ${i + 1}`,
          stops: routeCoords.length,
          distance: parseFloat(distance.toFixed(1)),
          duration,
          status: "pending",
          coordinates: routeCoords,
        });
      }
    }

    console.log(`✅ ${mockRoutes.length} rutas generadas con total de ${coordinates.length} puntos`);

    onComplete({
      routes: mockRoutes,
      vehicles: numRoutes,
      timeRange: { start: startTime, end: endTime },
    });
  };

  const handleAddPoint = () => {
    if (currentPoint.name && currentPoint.lat && currentPoint.lng) {
      const newPoint = { ...currentPoint };
      setManualPoints([...manualPoints, newPoint]);
      setCurrentPoint({ name: "", lat: "", lng: "", address: "", dwellTime: "45" });
      console.log("Punto agregado:", newPoint);
      console.log("Total de puntos:", manualPoints.length + 1);
    } else {
      console.warn("Datos incompletos:", currentPoint);
    }
  };

  const handleRemovePoint = (index: number) => {
    setManualPoints(manualPoints.filter((_, i) => i !== index));
  };

  return (
    <div className={cn(
      isModal 
        ? "w-full" 
        : "flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-50 to-slate-100 p-8"
    )}>
      <Card className={cn(
        "w-full shadow-xl",
        isModal ? "border-0 shadow-none p-0" : "max-w-2xl border-2 p-8"
      )}>
        {!isModal && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#3DBAFF]/10 mb-4">
              <MapPin className="h-8 w-8 text-[#3DBAFF]" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Planificación de Rutas</h1>
            <p className="text-muted-foreground">
              Configura los parámetros para optimizar tus entregas
            </p>
          </div>
        )}

        {/* Sección de Templates */}
        {templates.length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 mb-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <BookTemplate className="h-4 w-4 text-purple-600" />
                Plantillas Guardadas
              </Label>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {templates.length} plantilla{templates.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer",
                    selectedTemplate === template.id 
                      ? "bg-purple-100 border-purple-400" 
                      : "bg-white border-gray-200 hover:border-purple-300"
                  )}
                  onClick={() => loadTemplate(template.id)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {template.points.length} puntos • {template.vehicles} rutas • {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                    {template.description && (
                      <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedTemplate === template.id && (
                      <CheckCircle2 className="h-4 w-4 text-purple-600 mr-2" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(template.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {/* Campo de número de rutas - solo en modo manual */}
          {inputMode === "manual" && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Truck className="h-4 w-4 text-[#3DBAFF]" />
                Número de Rutas a Generar
              </Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={vehicles}
                onChange={(e) => setVehicles(e.target.value)}
                className="text-lg h-12"
                placeholder="Ej: 3"
              />
              {manualPoints.length > 0 && (
                <div className="flex items-center gap-2 text-xs p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex-1">
                    <span className="text-blue-700">
                      💡 <strong>Sugerencia automática:</strong> {calculateSuggestedRoutes(manualPoints.length)} ruta(s) 
                      para {manualPoints.length} punto(s) de entrega
                    </span>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {manualPoints.length === 0 
                  ? "Define cuántas rutas quieres generar" 
                  : `Los puntos se dividirán en ${vehicles || "X"} ruta(s). Puedes ajustar este número.`}
              </p>
            </div>
          )}

          {/* Horario de operación - solo en modo manual */}
          {inputMode === "manual" && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-[#3DBAFF]" />
                Horario de Operación
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Hora de Inicio
                  </Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Hora de Fin
                  </Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <FileSpreadsheet className="h-4 w-4 text-[#3DBAFF]" />
              Puntos de Entrega
            </Label>

            {/* Toggle entre crear manualmente y subir archivo */}
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={inputMode === "manual" ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  inputMode === "manual" && "bg-[#3DBAFF] hover:bg-[#3DBAFF]/90"
                )}
                onClick={() => setInputMode("manual")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Manualmente
              </Button>
              <Button
                type="button"
                variant={inputMode === "file" ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  inputMode === "file" && "bg-[#3DBAFF] hover:bg-[#3DBAFF]/90"
                )}
                onClick={() => setInputMode("file")}
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Archivo
              </Button>
            </div>

            {/* Contenido según el modo seleccionado */}
            {inputMode === "file" ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  isDragging
                    ? "border-[#3DBAFF] bg-[#3DBAFF]/5"
                    : "border-border hover:border-[#3DBAFF]/50"
                )}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      setFile(selectedFile);
                      parseExcelFile(selectedFile);
                    }
                  }}
                />
                {file ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-green-500" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setParsedFilePoints([]);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {parsedFilePoints.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium">
                          ✅ {parsedFilePoints.length} puntos de entrega cargados correctamente
                        </p>
                        {parsedFilePoints.some(p => p.route) && (
                          <p className="text-xs text-green-700 mt-1">
                            📊 Detectadas {new Set(parsedFilePoints.map(p => p.route).filter(Boolean)).size} rutas en el archivo
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">
                      Arrastra tu archivo Excel o CSV aquí
                    </p>
                    <p className="text-sm text-muted-foreground">
                      o haz clic para seleccionar (formato: .xlsx, .xls, .csv)
                    </p>
                    <div className="text-xs text-muted-foreground mt-3 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="font-semibold text-slate-700 mb-2">📋 Formato del archivo:</p>
                      <p>
                        <strong className="text-slate-900">Obligatorio:</strong> Nombre, Latitud, Longitud
                      </p>
                      <p>
                        <strong className="text-slate-900">Opcional:</strong> Dirección, Ruta, TiempoEspera
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                        💡 La columna "Ruta" agrupa puntos automáticamente. "TiempoEspera" es en minutos (por defecto: 45).
                      </p>
                      <p className="text-[10px] text-green-600 mt-2 pt-2 border-t border-slate-200 font-medium">
                        ✅ El archivo de ejemplo incluye filas vacías listas para que agregues tus propios datos
                      </p>
                    </div>
                    <a 
                      href="/puntos-entrega-ejemplo.csv" 
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#3DBAFF] text-white rounded-lg hover:bg-[#2DA8E8] transition-colors text-sm font-medium shadow-sm"
                    >
                      📥 Descargar plantilla Excel
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mensaje informativo */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Puedes agregar múltiples puntos de entrega. Llena el formulario y haz clic en "Agregar Punto" para cada ubicación.
                  </p>
                </div>

                {/* Formulario para agregar puntos manualmente */}
                <Card className="p-4 bg-slate-50 border-2 border-[#3DBAFF]/20">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#3DBAFF]" />
                    Agregar Nuevo Punto
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-xs mb-1 block">Nombre del Punto *</Label>
                      <Input
                        placeholder="Ej: Cliente 1"
                        value={currentPoint.name}
                        onChange={(e) => setCurrentPoint({ ...currentPoint, name: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    <div className="relative">
                      <Label className="text-xs mb-1 block">
                        Dirección 
                        <span className="text-[#3DBAFF] ml-1">✨ Auto-completar</span>
                      </Label>
                      <Input
                        placeholder="Escribe nombre de calle, avenida o distrito (ej: Av. Arequipa 123)"
                        value={currentPoint.address}
                        onChange={handleAddressChange}
                        className="h-9"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        💡 Tip: Escribe la dirección completa para mejores resultados. Ej: "Av. Larco 1301, Miraflores"
                      </p>
                      {/* Sugerencias de geocodificación */}
                      {geocodingSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-[#3DBAFF] rounded-lg shadow-xl max-h-[300px] overflow-y-auto">
                          <div className="sticky top-0 bg-[#3DBAFF] text-white px-3 py-1.5 text-xs font-medium">
                            Selecciona una dirección
                          </div>
                          {geocodingSuggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectAddressSuggestion(suggestion)}
                              className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b last:border-b-0 transition-colors group"
                            >
                              <p className="text-sm font-medium text-gray-900 group-hover:text-[#3DBAFF]">
                                📍 {suggestion.display_name.split(',')[0]}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {suggestion.display_name.split(',').slice(1).join(',')}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                Lat: {suggestion.lat.toFixed(6)}, Lng: {suggestion.lon.toFixed(6)}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Latitud *</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Ej: -12.046374"
                        value={currentPoint.lat}
                        onChange={(e) => setCurrentPoint({ ...currentPoint, lat: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Longitud *</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Ej: -77.042793"
                        value={currentPoint.lng}
                        onChange={(e) => setCurrentPoint({ ...currentPoint, lng: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Tiempo de Espera (minutos)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="5"
                        placeholder="Ej: 15"
                        value={currentPoint.dwellTime}
                        onChange={(e) => setCurrentPoint({ ...currentPoint, dwellTime: e.target.value })}
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Tiempo de espera</p>
                    </div>
                  </div>
                  
                  {/* Botón de geocodificación manual */}
                  {currentPoint.address && !currentPoint.lat && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        const coords = await geocodeAddress(currentPoint.address);
                        if (coords) {
                          setCurrentPoint({
                            ...currentPoint,
                            lat: coords.lat.toString(),
                            lng: coords.lng.toString(),
                          });
                        }
                      }}
                      disabled={isGeocoding}
                      className="w-full h-9 mb-2 border-[#3DBAFF] text-[#3DBAFF] hover:bg-[#3DBAFF]/10"
                      size="sm"
                    >
                      {isGeocoding ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3DBAFF] mr-2" />
                          Buscando coordenadas...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2" />
                          📍 Auto-completar con Geocodificación
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={handleAddPoint}
                    disabled={!currentPoint.name || !currentPoint.lat || !currentPoint.lng}
                    className="w-full h-9 bg-[#3DBAFF] hover:bg-[#3DBAFF]/90 disabled:opacity-50"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {manualPoints.length === 0 ? "Agregar Primer Punto" : `Agregar Punto #${manualPoints.length + 1}`}
                  </Button>
                </Card>

                {/* Lista de puntos agregados */}
                {manualPoints.length > 0 && (
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Puntos agregados ({manualPoints.length})</Label>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {manualPoints.map((point, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                                {index + 1}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{point.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {point.lat}, {point.lng}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePoint(index)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            {/* Botón para guardar como template */}
            {inputMode === "manual" && manualPoints.length > 0 && (
              <Button
                onClick={() => setShowTemplateDialog(true)}
                variant="outline"
                className="flex-1 h-14 text-base font-semibold border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Save className="h-5 w-5 mr-2" />
                Guardar como Plantilla
              </Button>
            )}
            
            {/* Botón principal de procesamiento */}
            <Button
              onClick={handleProcess}
              disabled={
                (inputMode === "file" && !file) ||
                (inputMode === "manual" && manualPoints.length === 0) ||
                (vehicles !== "" && parseInt(vehicles) <= 0)
              }
              className={cn(
                "h-14 text-base font-semibold bg-[#3DBAFF] hover:bg-[#3DBAFF]/90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                inputMode === "manual" && manualPoints.length > 0 ? "flex-1" : "w-full"
              )}
            >
              <MapPin className="h-5 w-5 mr-2" />
              Procesar y Optimizar Rutas
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
          
          {/* Dialog para guardar template */}
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookTemplate className="h-5 w-5 text-purple-600" />
                  Guardar como Plantilla
                </DialogTitle>
                <DialogDescription>
                  Guarda esta configuración de ruta para reutilizarla más tarde
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="template-name" className="text-sm font-medium mb-2 block">
                    Nombre de la Plantilla *
                  </Label>
                  <Input
                    id="template-name"
                    placeholder="Ej: Ruta Diaria Lima Norte"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="template-desc" className="text-sm font-medium mb-2 block">
                    Descripción (opcional)
                  </Label>
                  <Input
                    id="template-desc"
                    placeholder="Ej: Clientes frecuentes zona industrial"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Se guardará:</strong> {manualPoints.length} puntos, {vehicles} rutas, horario {startTime} - {endTime}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveAsTemplate}
                  disabled={!templateName.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Plantilla
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Mostrar mensaje de ayuda si está deshabilitado */}
          {(inputMode === "manual" && manualPoints.length === 0) && (
            <p className="text-sm text-center text-muted-foreground">
              Agrega al menos un punto de entrega para continuar
            </p>
          )}
          {(inputMode === "file" && !file) && (
            <p className="text-sm text-center text-muted-foreground">
              Sube un archivo con los puntos de entrega para continuar
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

// Componente para paradas arrastrables
interface SortableStopProps {
  id: string;
  index: number;
  coord: { lat: number; lng: number; name: string };
  onRemove?: () => void;
}

function SortableStop({ id, index, coord, onRemove }: SortableStopProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors group",
        isDragging && "shadow-lg ring-2 ring-[#3DBAFF]/50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-[#3DBAFF] transition-colors"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#3DBAFF] text-white flex items-center justify-center text-sm font-bold shadow-sm">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{coord.name}</p>
        <p className="text-xs text-muted-foreground">
          {coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}
        </p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function RouteDashboard({
  routes,
  vehicles,
  onReset,
  onAddRoutes,
}: {
  routes: RouteData[];
  vehicles: number;
  onReset: () => void;
  onAddRoutes: (newRoutes: RouteData[]) => void;
}) {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(routes[0]?.id || null);
  const [routesList, setRoutesList] = useState(routes);
  const [showNewRouteModal, setShowNewRouteModal] = useState(false);
  const [showScenarioComparison, setShowScenarioComparison] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editingRouteName, setEditingRouteName] = useState("");

  // Configurar sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Manejar el fin del arrastre
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const currentRoute = routesList.find(r => r.id === selectedRoute);
      if (!currentRoute) return;

      const oldIndex = currentRoute.coordinates.findIndex((_, idx) => `stop-${idx}` === active.id);
      const newIndex = currentRoute.coordinates.findIndex((_, idx) => `stop-${idx}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newCoordinates = arrayMove(currentRoute.coordinates, oldIndex, newIndex);
        
        const updatedRoutesList = routesList.map(route =>
          route.id === selectedRoute
            ? { ...route, coordinates: newCoordinates, stops: newCoordinates.length }
            : route
        );
        
        setRoutesList(updatedRoutesList);
      }
    }
  };

  // Generar múltiples escenarios de optimización
  const generateScenarios = () => {
    const baseRoutes = routesList;
    
    // Función auxiliar para redistribuir paradas entre rutas
    const redistributeStops = (routes: typeof baseRoutes, factor: number) => {
      return routes.map((route, idx) => {
        const newStops = Math.max(2, Math.round(route.stops * factor));
        const newDistance = Math.round(route.distance * factor);
        const newDuration = Math.round(route.duration * factor);
        
        // Crear nuevas coordenadas basadas en las originales pero con variaciones
        const newCoordinates = route.coordinates.slice(0, newStops).map((coord, i) => ({
          ...coord,
          lat: coord.lat + (Math.random() - 0.5) * 0.001 * (idx + 1),
          lng: coord.lng + (Math.random() - 0.5) * 0.001 * (idx + 1),
        }));
        
        return {
          ...route,
          stops: newStops,
          distance: newDistance,
          duration: newDuration,
          coordinates: newCoordinates,
        };
      });
    };
    
    const scenariosData = [
      {
        id: 'fastest',
        name: 'Más Rápido',
        description: 'Minimiza el tiempo total de entrega',
        icon: '⚡',
        color: 'yellow',
        routes: redistributeStops(baseRoutes, 0.85).map(route => ({
          ...route,
          duration: Math.round(route.duration * 0.85), // 15% más rápido
          distance: Math.round(route.distance * 1.1), // 10% más distancia por usar rutas más directas/rápidas
        })),
        metrics: {
          totalTime: Math.round(baseRoutes.reduce((acc, r) => acc + r.duration, 0) * 0.85),
          totalDistance: Math.round(baseRoutes.reduce((acc, r) => acc + r.distance, 0) * 1.1),
          totalCost: Math.round(baseRoutes.reduce((acc, r) => acc + r.distance, 0) * 1.1 * 3.2),
          fuelConsumption: Math.round(baseRoutes.reduce((acc, r) => acc + r.distance, 0) * 1.1 * 0.12),
        }
      },
      {
        id: 'balanced',
        name: 'Equilibrado',
        description: 'Balance entre tiempo y distancia',
        icon: '⚖️',
        color: 'green',
        routes: baseRoutes.map(route => ({
          ...route,
          coordinates: [...route.coordinates], // Mantener coordenadas originales
        })),
        metrics: {
          totalTime: baseRoutes.reduce((acc, r) => acc + r.duration, 0),
          totalDistance: Math.round(baseRoutes.reduce((acc, r) => acc + r.distance, 0)),
          totalCost: Math.round(baseRoutes.reduce((acc, r) => acc + r.distance, 0) * 3.0),
          fuelConsumption: Math.round(baseRoutes.reduce((acc, r) => acc + r.distance, 0) * 0.11),
        }
      },
      {
        id: 'cost',
        name: 'Económico',
        description: 'Minimiza los costos operativos totales',
        icon: '💰',
        color: 'purple',
        routes: redistributeStops(baseRoutes, 1.15).map(route => ({
          ...route,
          duration: Math.round(route.duration * 1.08), // 8% más tiempo
          distance: Math.round(route.distance * 0.90), // 10% menos distancia
        })),
        metrics: {
          totalTime: Math.round(baseRoutes.reduce((acc, r) => acc + r.duration, 0) * 1.08),
          totalDistance: Math.round(baseRoutes.reduce((acc, r) => acc + r.distance, 0) * 0.90),
          totalCost: Math.round(baseRoutes.reduce((acc, r) => acc + r.distance, 0) * 0.90 * 2.3),
          fuelConsumption: Math.round(baseRoutes.reduce((acc, r) => acc + r.distance, 0) * 0.90 * 0.09),
        }
      },
    ];

    setScenarios(scenariosData);
    setShowScenarioComparison(true);
  };

  // Flota completa de vehículos con placas reales (simulación de flota real)
  const allFleetVehicles = [
    { id: 'ABC-123', plate: 'ABC-123', brand: 'Mercedes-Benz', model: 'Sprinter', type: 'Furgoneta', capacity: '1500 kg', status: 'Disponible' },
    { id: 'XYZ-789', plate: 'XYZ-789', brand: 'Volkswagen', model: 'Delivery', type: 'Camión', capacity: '3500 kg', status: 'Disponible' },
    { id: 'DEF-456', plate: 'DEF-456', brand: 'Ford', model: 'Transit', type: 'Furgoneta', capacity: '1200 kg', status: 'Disponible' },
    { id: 'GHI-321', plate: 'GHI-321', brand: 'Isuzu', model: 'NPR', type: 'Camión', capacity: '4000 kg', status: 'Disponible' },
    { id: 'JKL-654', plate: 'JKL-654', brand: 'Renault', model: 'Master', type: 'Furgoneta', capacity: '1400 kg', status: 'Disponible' },
    { id: 'MNO-987', plate: 'MNO-987', brand: 'Toyota', model: 'Hilux', type: 'Camioneta', capacity: '1000 kg', status: 'Disponible' },
    { id: 'PQR-147', plate: 'PQR-147', brand: 'Hyundai', model: 'Porter', type: 'Camión', capacity: '2500 kg', status: 'Disponible' },
    { id: 'STU-258', plate: 'STU-258', brand: 'Peugeot', model: 'Boxer', type: 'Furgoneta', capacity: '1600 kg', status: 'Disponible' },
    { id: 'VWX-369', plate: 'VWX-369', brand: 'Nissan', model: 'Frontier', type: 'Camioneta', capacity: '900 kg', status: 'Disponible' },
    { id: 'YZA-741', plate: 'YZA-741', brand: 'Chevrolet', model: 'N300', type: 'Furgoneta', capacity: '800 kg', status: 'Disponible' },
  ];

  // Obtener vehículos ya asignados a otras rutas
  const assignedVehicleIds = routesList
    .filter(r => r.id !== selectedRoute && r.assignedVehicle)
    .map(r => r.assignedVehicle);

  // Mostrar TODA la flota con estado actualizado (no filtrar por cantidad)
  // El número de vehículos especificado solo determina cuántas rutas se generan
  const fleetVehicles = allFleetVehicles.map(vehicle => ({
    ...vehicle,
    status: assignedVehicleIds.includes(vehicle.id) ? 'En Uso' : 'Disponible'
  }));

  const currentRoute = routesList.find((r) => r.id === selectedRoute);

  const handleAssignVehicle = (vehicleId: string) => {
    if (!selectedRoute) return;
    setRoutesList((prev) =>
      prev.map((r) =>
        r.id === selectedRoute
          ? { ...r, assignedVehicle: vehicleId }
          : r
      )
    );
  };

  const handleConfirmRoute = () => {
    if (!selectedRoute || !currentRoute?.assignedVehicle) return;
    
    // Actualizar estado de la ruta a asignada
    setRoutesList((prev) =>
      prev.map((r) =>
        r.id === selectedRoute ? { ...r, status: "assigned" as const } : r
      )
    );

    // Generar órdenes desde las paradas de la ruta
    const routeOrders = currentRoute.coordinates.map((coord, index) => {
      const orderNumber = `ORD-${Date.now()}-${index + 1}`;
      const scheduledDate = new Date();
      scheduledDate.setHours(scheduledDate.getHours() + index); // Escalonar 1 hora entre paradas
      
      const newOrder = {
        id: `order-${Date.now()}-${index}`,
        orderNumber,
        customerId: 'customer-default',
        customer: {
          id: 'customer-default',
          name: coord.name,
          code: `CLI-${index + 1}`,
          email: `${coord.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        },
        vehicleId: currentRoute.assignedVehicle,
        vehicle: {
          id: currentRoute.assignedVehicle,
          plate: currentRoute.assignedVehicle,
          brand: 'Mercedes-Benz',
          model: 'Sprinter',
          type: 'Furgoneta' as const,
        },
        status: 'assigned' as const,
        priority: 'normal' as const,
        syncStatus: 'not_sent' as const,
        cargo: {
          description: `Entrega para ${coord.name}`,
          type: 'general' as const,
          weightKg: 100,
          quantity: 1,
        },
        milestones: [
          {
            id: `milestone-${Date.now()}-${index}-origin`,
            orderId: `order-${Date.now()}-${index}`,
            geofenceId: 'origin-geofence',
            geofenceName: 'Almacén Principal',
            type: 'origin' as const,
            sequence: 1,
            address: 'Av. Industrial 123, Lima',
            coordinates: { lat: -12.046374, lng: -77.042793 },
            estimatedArrival: scheduledDate.toISOString(),
            status: 'completed' as const,
          },
          {
            id: `milestone-${Date.now()}-${index}-dest`,
            orderId: `order-${Date.now()}-${index}`,
            geofenceId: `dest-${index}`,
            geofenceName: coord.name,
            type: 'destination' as const,
            sequence: 2,
            address: coord.name,
            coordinates: { lat: coord.lat, lng: coord.lng },
            estimatedArrival: new Date(scheduledDate.getTime() + 30 * 60000).toISOString(),
            status: 'pending' as const,
          }
        ],
        completionPercentage: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'route-planner',
        updatedAt: new Date().toISOString(),
        scheduledStartDate: scheduledDate.toISOString(),
        scheduledEndDate: new Date(scheduledDate.getTime() + 60 * 60000).toISOString(),
        statusHistory: [
          {
            id: `history-${Date.now()}-${index}`,
            fromStatus: 'draft' as const,
            toStatus: 'assigned' as const,
            changedAt: new Date().toISOString(),
            changedBy: 'route-planner',
            changedByName: 'Sistema de Planificación',
            reason: `Asignado desde planificador de rutas - ${currentRoute.name}`,
          }
        ],
        notes: `Generado automáticamente desde ${currentRoute.name}`,
        tags: ['route-planner', currentRoute.name],
        metadata: {
          routeId: currentRoute.id,
          routeName: currentRoute.name,
          routeSequence: index + 1,
          generatedFrom: 'route-planner',
        },
      };
      
      return newOrder;
    });

    // Guardar órdenes en localStorage para que aparezcan en el módulo de órdenes
    const existingOrders = JSON.parse(localStorage.getItem('tms-generated-orders') || '[]');
    const updatedOrders = [...existingOrders, ...routeOrders];
    localStorage.setItem('tms-generated-orders', JSON.stringify(updatedOrders));

    console.log(`✅ ${routeOrders.length} órdenes generadas desde ${currentRoute.name}`);
    
    // Mostrar notificación visual al usuario
    const ordersList = routeOrders.map((o, i) => `${i + 1}. ${o.orderNumber} - ${o.customer?.name}`).join('\n');
    alert(`✅ Órdenes Generadas Exitosamente\n\n${routeOrders.length} órdenes fueron creadas desde "${currentRoute.name}":\n\n${ordersList}\n\n📋 Ve al módulo de Órdenes para ver los detalles completos.`);
  };

  const handleAddNewRoutes = (data: any) => {
    const newRoutes = data.routes.map((route: RouteData) => ({
      ...route,
      id: `r${Date.now()}_${route.id}`, // Generar ID único
    }));
    
    setRoutesList((prev) => [...prev, ...newRoutes]);
    onAddRoutes(newRoutes);
    setShowNewRouteModal(false);
  };

  const handleStartEditingRouteName = (routeId: string, currentName: string) => {
    setEditingRouteId(routeId);
    setEditingRouteName(currentName);
  };

  const handleSaveRouteName = (routeId: string) => {
    if (editingRouteName.trim()) {
      setRoutesList((prev) =>
        prev.map((r) =>
          r.id === routeId ? { ...r, name: editingRouteName.trim() } : r
        )
      );
    }
    setEditingRouteId(null);
    setEditingRouteName("");
  };

  const handleCancelEditingRouteName = () => {
    setEditingRouteId(null);
    setEditingRouteName("");
  };

  return (
    <>
      <Dialog open={showNewRouteModal} onOpenChange={setShowNewRouteModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0">
          <div className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle className="text-2xl">Agregar Nuevas Rutas</DialogTitle>
              <DialogDescription>
                Configura nuevos puntos de entrega para optimizar rutas adicionales
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <RouteWizard 
                onComplete={handleAddNewRoutes}
                isModal={true}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex h-[calc(100vh-3.5rem)] bg-slate-50 overflow-hidden">
      <div className="w-80 border-r border-border bg-white flex flex-col shadow-lg h-full">
        <div className="p-4 border-b border-border bg-gradient-to-r from-[#3DBAFF]/10 to-white flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Rutas Sugeridas</h2>
            <div className="flex gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateScenarios} 
                className="gap-1 hover:bg-orange-50 hover:border-orange-400 text-orange-600 px-2 h-8 text-xs"
              >
                ⚡
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowNewRouteModal(true)} 
                className="gap-1 hover:bg-[#3DBAFF]/10 hover:border-[#3DBAFF] px-2 h-8"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {routesList.length} rutas optimizadas
          </p>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3 pb-4">
            {routesList.map((route) => (
              <Card
                key={route.id}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-lg",
                  selectedRoute === route.id
                    ? "border-[#3DBAFF] border-2 bg-[#3DBAFF]/5 shadow-md"
                    : "border-border hover:border-[#3DBAFF]/50"
                )}
                onClick={() => setSelectedRoute(route.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {editingRouteId === route.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editingRouteName}
                          onChange={(e) => setEditingRouteName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveRouteName(route.id);
                            } else if (e.key === "Escape") {
                              handleCancelEditingRouteName();
                            }
                          }}
                          className="h-8 text-base font-bold"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveRouteName(route.id)}
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEditingRouteName}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditingRouteName(route.id, route.name);
                        }}
                      >
                        <h3 className="font-bold text-base">{route.name}</h3>
                        <button className="text-muted-foreground hover:text-[#3DBAFF] transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {route.stops} paradas
                    </p>
                  </div>
                  {route.status === "assigned" && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Asignada
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{route.distance} km</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{formatDuration(route.duration)}</span>
                  </div>
                </div>

                {route.assignedVehicle && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-[#3DBAFF]" />
                      <span className="font-semibold">
                        Vehículo {route.assignedVehicle}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 relative bg-white overflow-hidden min-h-0">
        <RouteMapSimple
          route={
            currentRoute
              ? {
                  id: currentRoute.id,
                  name: currentRoute.name,
                  status: "generated" as const,
                  stops: currentRoute.coordinates.map((coord, idx) => ({
                    id: `stop-${idx}`,
                    orderId: `order-${idx}`,
                    sequence: idx + 1,
                    type: "delivery" as const,
                    address: coord.name,
                    city: "Lima",
                    coordinates: [coord.lat, coord.lng],
                    estimatedArrival: new Date().toISOString(),
                    duration: 15,
                    status: "pending" as const,
                    order: {
                      id: `order-${idx}`,
                      orderNumber: `ORD-${1000 + idx}`,
                      customer: coord.name,
                      deliveryAddress: coord.name,
                      priority: "normal" as const,
                      status: "pending" as const,
                    },
                  })),
                  metrics: {
                    totalDistance: currentRoute.distance,
                    estimatedDuration: currentRoute.duration,
                    estimatedCost: currentRoute.distance * 2.5,
                    fuelCost: currentRoute.distance * 1.5,
                    tollsCost: 0,
                    totalWeight: 0,
                    totalVolume: 0,
                  },
                  polyline: currentRoute.coordinates.map(coord => [coord.lat, coord.lng]),
                  configuration: {
                    avoidTolls: false,
                    considerTraffic: true,
                    priority: "balanced" as const,
                    timeBuffer: 10,
                  },
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : null
          }
          selectedOrders={[]}
          showOrderMarkers={true}
        />

        {!selectedRoute && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <MapPin className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold mb-2">
                Selecciona una ruta para visualizar
              </p>
              <p className="text-sm text-muted-foreground">
                Haz clic en cualquier ruta del panel izquierdo
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="w-96 border-l border-border bg-white flex flex-col shadow-lg h-full">
        {selectedRoute && currentRoute ? (
          <>
            <div className="p-4 border-b border-border bg-gradient-to-r from-[#3DBAFF]/10 to-white flex-shrink-0">
              <h2 className="text-lg font-bold mb-1">{currentRoute.name}</h2>
              <p className="text-sm text-muted-foreground">
                Detalles y asignación
              </p>
            </div>

            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Resumen de Ruta
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Distancia</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {currentRoute.distance} km
                      </p>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">Tiempo</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">
                        {formatDuration(currentRoute.duration)}
                      </p>
                    </Card>
                  </div>
                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-600">Paradas</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">{currentRoute.stops} destinos</p>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Asignar Vehículo
                  </h3>
                  <div className="text-xs text-muted-foreground mb-2">
                    Selecciona un vehículo de tu flota ({fleetVehicles.filter(v => v.status === 'Disponible').length} disponibles)
                  </div>
                  <Select
                    value={currentRoute.assignedVehicle || ""}
                    onValueChange={handleAssignVehicle}
                  >
                    <SelectTrigger className="w-full h-12 font-medium">
                      <SelectValue placeholder="Selecciona un vehículo por placa" />
                    </SelectTrigger>
                    <SelectContent>
                      {fleetVehicles.map((vehicle) => {
                        const isAssignedToCurrentRoute = currentRoute.assignedVehicle === vehicle.id;
                        const isInUse = vehicle.status === 'En Uso' && !isAssignedToCurrentRoute;
                        
                        return (
                          <SelectItem 
                            key={vehicle.id} 
                            value={vehicle.id}
                            disabled={isInUse}
                          >
                            <div className="flex items-center gap-3">
                              <Truck className={cn(
                                "h-5 w-5",
                                isInUse ? "text-gray-400" : "text-[#3DBAFF]"
                              )} />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "font-bold text-base",
                                    isInUse && "text-gray-400"
                                  )}>
                                    {vehicle.plate}
                                  </span>
                                  {isInUse && (
                                    <Badge variant="secondary" className="text-xs">En uso</Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {vehicle.brand} {vehicle.model} • {vehicle.type} • {vehicle.capacity}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  {currentRoute.assignedVehicle && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <div>
                          <span className="text-sm font-bold block">Vehículo {currentRoute.assignedVehicle}</span>
                          <span className="text-xs">
                            {fleetVehicles.find(v => v.id === currentRoute.assignedVehicle)?.brand} {' '}
                            {fleetVehicles.find(v => v.id === currentRoute.assignedVehicle)?.model}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Paradas Programadas ({currentRoute.stops})
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      <GripVertical className="h-3 w-3 mr-1" />
                      Arrastrar para reordenar
                    </Badge>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={currentRoute.coordinates.map((_, idx) => `stop-${idx}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {currentRoute.coordinates.map((coord, idx) => (
                          <SortableStop
                            key={`stop-${idx}`}
                            id={`stop-${idx}`}
                            index={idx}
                            coord={coord}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-gradient-to-r from-slate-50 to-white shadow-lg flex-shrink-0">
              <Button
                onClick={handleConfirmRoute}
                disabled={!currentRoute.assignedVehicle || currentRoute.status === "assigned"}
                className={cn(
                  "w-full h-14 text-base font-bold shadow-lg transition-all",
                  currentRoute.status === "assigned"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-[#3DBAFF] hover:bg-[#3DBAFF]/90"
                )}
              >
                {currentRoute.status === "assigned" ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    ¡Ruta Confirmada!
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Confirmar y Generar Órdenes
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Truck className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-lg font-semibold mb-2">Sin ruta seleccionada</p>
              <p className="text-sm text-muted-foreground">
                Selecciona una ruta del panel izquierdo<br />para ver sus detalles
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Dialog del Comparador de Escenarios */}
    <Dialog open={showScenarioComparison} onOpenChange={setShowScenarioComparison}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            ⚡ Comparador de Escenarios de Optimización
          </DialogTitle>
          <DialogDescription>
            Compara diferentes estrategias de optimización y elige la que mejor se adapte a tus necesidades
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-xl border-2",
                `hover:border-${scenario.color}-400`
              )}
              onClick={() => {
                setRoutesList(scenario.routes);
                setShowScenarioComparison(false);
              }}
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{scenario.icon}</div>
                <h3 className="font-bold text-lg">{scenario.name}</h3>
                <p className="text-xs text-muted-foreground">{scenario.description}</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-700">Tiempo Total</span>
                    <span className="text-sm font-bold text-blue-900">{formatDuration(scenario.metrics.totalTime)}</span>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-700">Distancia Total</span>
                    <span className="text-sm font-bold text-purple-900">{scenario.metrics.totalDistance} km</span>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-green-700">Costo Estimado</span>
                    <span className="text-sm font-bold text-green-900">S/ {scenario.metrics.totalCost}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-700">Combustible</span>
                    <span className="text-sm font-bold text-emerald-900">{scenario.metrics.fuelConsumption} L</span>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4 bg-gradient-to-r from-[#3DBAFF] to-blue-600 hover:from-[#3DBAFF]/90 hover:to-blue-600/90">
                Seleccionar Escenario
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>💡 Tip:</strong> Los valores son estimaciones basadas en algoritmos de optimización. Los resultados reales pueden variar según el tráfico y condiciones de la ruta.
          </p>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default function RoutePlannerPage() {
  const [planningData, setPlanningData] = useState<any>(null);

  const handleAddRoutes = (newRoutes: RouteData[]) => {
    if (planningData) {
      setPlanningData({
        ...planningData,
        routes: [...planningData.routes, ...newRoutes],
      });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!planningData ? (
        <RouteWizard key="wizard" onComplete={setPlanningData} />
      ) : (
        <RouteDashboard
          key="dashboard"
          routes={planningData.routes}
          vehicles={planningData.vehicles}
          onReset={() => setPlanningData(null)}
          onAddRoutes={handleAddRoutes}
        />
      )}
    </AnimatePresence>
  );
}
