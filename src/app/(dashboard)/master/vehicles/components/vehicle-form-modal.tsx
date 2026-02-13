"use client";

import * as React from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  FileText,
  Shield,
  Wrench,
  Upload,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Vehicle, 
} from "@/types/models/vehicle";
import { 
  VEHICLE_TYPE_LABELS,
  BODY_TYPE_LABELS,
  isValidPeruvianPlate,
  formatPlate,
} from "@/lib/validators/vehicle-validators";


/**
 * Esquema de validación para el formulario de vehículo
 */
const vehicleFormSchema = z.object({
  // Información General
  plate: z.string()
    .min(6, "Placa inválida")
    .max(7, "Placa inválida")
    .refine(val => isValidPeruvianPlate(val), "Formato de placa inválido"),
  type: z.enum(["camion", "tractocamion", "remolque", "semiremolque", "furgoneta", "pickup", "minivan", "cisterna", "volquete"]),
  bodyType: z.enum(["furgon", "furgon_frigorifico", "plataforma", "cisterna", "tolva", "volquete", "portacontenedor", "cama_baja", "jaula", "baranda", "otros"]),
  brand: z.string().min(2, "Marca requerida"),
  model: z.string().min(1, "Modelo requerido"),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  color: z.string().min(2, "Color requerido"),
  vin: z.string().min(17, "VIN debe tener 17 caracteres").max(17),

  // Especificaciones
  specs: z.object({
    engineNumber: z.string().optional(),
    engineType: z.string().optional(),
    horsePower: z.number().min(0).optional(),
    fuelType: z.enum(["diesel", "gasoline", "gas_glp", "gas_gnv", "electric", "hybrid"]),
    fuelCapacity: z.number().min(0).optional(),
    transmission: z.enum(["manual", "automatic", "semi_automatic"]).optional(),
    numberOfAxles: z.number().min(2).max(10).optional(),
    numberOfTires: z.number().min(4).max(24).optional(),
  }),

  // Dimensiones y Capacidad
  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    cargoLength: z.number().min(0).optional(),
    cargoWidth: z.number().min(0).optional(),
    cargoHeight: z.number().min(0).optional(),
  }),
  capacity: z.object({
    maxWeight: z.number().min(0),
    maxVolume: z.number().min(0).optional(),
    palletCapacity: z.number().min(0).optional(),
    tare: z.number().min(0).optional(),
    grossWeight: z.number().min(0).optional(),
  }),

  // Documentación
  registration: z.object({
    number: z.string().min(5, "Número de tarjeta requerido"),
    issueDate: z.string().optional(),
    issuingEntity: z.string().default("SUNARP"),
    fileUrl: z.string().optional(),
  }),

  status: z.enum(["active", "inactive", "pending", "blocked", "suspended", "on_leave", "terminated"]).default("active"),
  currentMileage: z.number().min(0).default(0),
  currentDriverId: z.string().optional(),
  notes: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export type { VehicleFormData };

/**
 * Props del componente
 */
interface VehicleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  isLoading?: boolean;
}


const FUEL_TYPES = [
  { value: "diesel", label: "Diésel" },
  { value: "gasoline", label: "Gasolina" },
  { value: "gas_glp", label: "Gas (GLP)" },
  { value: "gas_gnv", label: "Gas (GNV)" },
  { value: "electric", label: "Eléctrico" },
  { value: "hybrid", label: "Híbrido" },
];

const TRANSMISSION_TYPES = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automática" },
  { value: "semi_automatic", label: "Semi-automática" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Activo", color: "bg-green-500", description: "En operación normal" },
  { value: "inactive", label: "Inactivo", color: "bg-gray-500", description: "Fuera de servicio temporal" },
  { value: "pending", label: "Pendiente", color: "bg-yellow-500", description: "Pendiente de verificación" },
  { value: "blocked", label: "Bloqueado", color: "bg-red-500", description: "No disponible" },
];

const COMMON_BRANDS = [
  "Volvo", "Scania", "Mercedes-Benz", "MAN", "DAF", "Iveco",
  "Kenworth", "Freightliner", "International", "Mack",
  "Hino", "Isuzu", "Mitsubishi Fuso", "Hyundai", "FAW", "Foton",
];

const COMMON_COLORS = [
  "Blanco", "Negro", "Gris", "Plateado", "Azul", "Rojo",
  "Verde", "Amarillo", "Naranja", "Beige",
];


export function VehicleFormModal({
  open,
  onOpenChange,
  vehicle,
  onSubmit,
  isLoading = false,
}: VehicleFormModalProps) {
  const [activeTab, setActiveTab] = React.useState("general");

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema) as Resolver<VehicleFormData>,
    defaultValues: {
      plate: "",
      type: "camion",
      bodyType: "furgon",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "Blanco",
      vin: "",
      specs: {
        engineNumber: "",
        engineType: "",
        horsePower: 0,
        fuelType: "diesel",
        fuelCapacity: 0,
        transmission: "manual",
        numberOfAxles: 2,
        numberOfTires: 6,
      },
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        cargoLength: 0,
        cargoWidth: 0,
        cargoHeight: 0,
      },
      capacity: {
        maxWeight: 0,
        maxVolume: 0,
        palletCapacity: 0,
        tare: 0,
        grossWeight: 0,
      },
      registration: {
        number: "",
        issueDate: "",
        issuingEntity: "SUNARP",
        fileUrl: "",
      },
      status: "active",
      currentMileage: 0,
      currentDriverId: "",
      notes: "",
    },
  });

  // Cargar datos del vehículo si es edición
  React.useEffect(() => {
    if (vehicle && open) {
      form.reset({
        plate: vehicle.plate,
        type: vehicle.type,
        bodyType: vehicle.bodyType || "furgon",
        brand: vehicle.specs?.brand || "",
        model: vehicle.specs?.model || "",
        year: vehicle.specs?.year || new Date().getFullYear(),
        color: vehicle.specs?.color || "Blanco",
        vin: vehicle.specs?.chassisNumber || "",
        specs: {
          engineNumber: vehicle.specs?.engineNumber || "",
          engineType: vehicle.specs?.fuelType || "diesel",
          horsePower: vehicle.specs?.horsepower || 0,
          fuelType: vehicle.specs?.fuelType || "diesel",
          fuelCapacity: vehicle.specs?.fuelTankCapacity || 0,
          transmission: vehicle.specs?.transmission || "manual",
          numberOfAxles: vehicle.specs?.axles || 2,
          numberOfTires: vehicle.specs?.wheels || 6,
        },
        dimensions: {
          length: vehicle.dimensions?.length || 0,
          width: vehicle.dimensions?.width || 0,
          height: vehicle.dimensions?.height || 0,
          cargoLength: vehicle.dimensions?.cargoLength || 0,
          cargoWidth: vehicle.dimensions?.cargoWidth || 0,
          cargoHeight: vehicle.dimensions?.cargoHeight || 0,
        },
        capacity: {
          maxWeight: vehicle.capacity?.maxPayload || 0,
          maxVolume: vehicle.capacity?.maxVolume || 0,
          palletCapacity: vehicle.capacity?.palletCapacity || 0,
          tare: vehicle.capacity?.tareWeight || 0,
          grossWeight: vehicle.capacity?.grossWeight || 0,
        },
        registration: vehicle.registration ? {
          number: vehicle.registration.registrationNumber || "",
          issueDate: vehicle.registration.registrationDate || "",
          issuingEntity: vehicle.registration.registryOffice || "SUNARP",
          fileUrl: vehicle.registration.fileUrl || "",
        } : {
          number: "",
          issueDate: "",
          issuingEntity: "SUNARP",
          fileUrl: "",
        },
        status: vehicle.status,
        currentMileage: vehicle.currentMileage || 0,
        currentDriverId: vehicle.currentDriverId || "",
        notes: vehicle.notes || "",
      });
    }
  }, [vehicle, open, form]);

  // Reset cuando se cierra
  React.useEffect(() => {
    if (!open) {
      form.reset();
      setActiveTab("general");
    }
  }, [open, form]);

  const handleSubmit = async (data: VehicleFormData) => {
    try {
      // Formatear placa antes de enviar
      data.plate = formatPlate(data.plate);
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar vehículo:", error);
    }
  };

  const isEditing = !!vehicle;
  const _watchedType = form.watch("type");
  const watchedBodyType = form.watch("bodyType");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">
            {isEditing ? "Editar Vehículo" : "Nuevo Vehículo"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifique la información del vehículo" 
              : "Complete toda la información requerida para registrar el vehículo"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-5 h-auto">
                  <TabsTrigger value="general" className="flex items-center gap-2 py-3">
                    <Truck className="h-4 w-4" />
                    <span className="hidden sm:inline">General</span>
                  </TabsTrigger>
                  <TabsTrigger value="specs" className="flex items-center gap-2 py-3">
                    <Gauge className="h-4 w-4" />
                    <span className="hidden sm:inline">Técnico</span>
                  </TabsTrigger>
                  <TabsTrigger value="capacity" className="flex items-center gap-2 py-3">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Capacidad</span>
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center gap-2 py-3">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Documentos</span>
                  </TabsTrigger>
                  <TabsTrigger value="status" className="flex items-center gap-2 py-3">
                    <Wrench className="h-4 w-4" />
                    <span className="hidden sm:inline">Estado</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="h-[55vh] px-6 py-4">
                {/* TAB: INFORMACIÓN GENERAL */}
                <TabsContent value="general" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Identificación del Vehículo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="plate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Placa *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="ABC-123" 
                                  {...field}
                                  onChange={e => field.onChange(e.target.value.toUpperCase())}
                                  className="uppercase"
                                />
                              </FormControl>
                              <FormDescription>
                                Formato: ABC-123 o A1B-234
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Vehículo *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bodyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Carrocería *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(BODY_TYPE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marca *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {COMMON_BRANDS.map(brand => (
                                    <SelectItem key={brand} value={brand}>
                                      {brand}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="other">Otra marca</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Modelo *</FormLabel>
                              <FormControl>
                                <Input placeholder="FH 540" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Año *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1990}
                                  max={new Date().getFullYear() + 1}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {COMMON_COLORS.map(color => (
                                    <SelectItem key={color} value={color}>
                                      {color}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="vin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Chasis (VIN) *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="1HGBH41JXMN109186" 
                                  maxLength={17}
                                  {...field}
                                  onChange={e => field.onChange(e.target.value.toUpperCase())}
                                  className="uppercase font-mono"
                                />
                              </FormControl>
                              <FormDescription>
                                17 caracteres alfanuméricos
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: ESPECIFICACIONES TÉCNICAS */}
                <TabsContent value="specs" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Motor y Transmisión</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="specs.engineNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Motor</FormLabel>
                              <FormControl>
                                <Input placeholder="D13K540" className="font-mono" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="specs.engineType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Motor</FormLabel>
                              <FormControl>
                                <Input placeholder="D13K" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="specs.horsePower"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Potencia (HP)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="specs.fuelType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Combustible *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {FUEL_TYPES.map(fuel => (
                                    <SelectItem key={fuel.value} value={fuel.value}>
                                      {fuel.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="specs.fuelCapacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacidad Tanque (L)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="specs.transmission"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transmisión</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TRANSMISSION_TYPES.map(trans => (
                                    <SelectItem key={trans.value} value={trans.value}>
                                      {trans.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="specs.numberOfAxles"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Ejes</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={2}
                                  max={10}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="specs.numberOfTires"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Neumáticos</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={4}
                                  max={24}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dimensiones (metros)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Dimensiones exteriores del vehículo
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="dimensions.length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Largo</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dimensions.width"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ancho</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dimensions.height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alto</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator />
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        Dimensiones del área de carga
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="dimensions.cargoLength"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Largo Carga</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dimensions.cargoWidth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ancho Carga</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dimensions.cargoHeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alto Carga</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: CAPACIDAD */}
                <TabsContent value="capacity" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Capacidad de Carga</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="capacity.maxWeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacidad Máxima de Carga (kg) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Peso máximo de carga útil
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="capacity.maxVolume"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Volumen Máximo (m³)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1"
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="capacity.palletCapacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacidad de Pallets</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Pallets estándar (1.2 x 1.0 m)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="capacity.tare"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tara (kg)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Peso del vehículo vacío
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="capacity.grossWeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Peso Bruto (kg)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={0}
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Peso máximo autorizado
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {watchedBodyType === "furgon_frigorifico" && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="font-medium text-blue-800 dark:text-blue-200">
                            Vehículo Refrigerado
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Configure los rangos de temperatura en la sección de documentos
                            o después de crear el vehículo.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: DOCUMENTACIÓN */}
                <TabsContent value="documents" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Tarjeta de Propiedad</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="registration.number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Tarjeta *</FormLabel>
                              <FormControl>
                                <Input placeholder="123456789" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="registration.issueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de Emisión</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="p-4 border border-dashed rounded-lg">
                        <div className="flex items-center gap-4">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Adjuntar tarjeta de propiedad</p>
                            <p className="text-sm text-muted-foreground">
                              PDF o imagen (máx. 5MB)
                            </p>
                          </div>
                          <Button type="button" variant="outline" className="ml-auto">
                            Subir archivo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Documentos Adicionales Requeridos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Los siguientes documentos se gestionan después de crear el vehículo:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200">
                          <li>• <strong>SOAT</strong> - Seguro Obligatorio de Accidentes de Tránsito</li>
                          <li>• <strong>Revisión Técnica</strong> - Certificado de Inspección Técnica</li>
                          <li>• <strong>Certificado de Operación</strong> - Permiso MTC</li>
                          <li>• <strong>Póliza de Seguro</strong> - Seguro contra todo riesgo</li>
                          <li>• <strong>Certificación GPS</strong> - Homologación MTC</li>
                        </ul>
                      </div>

                      {isEditing && vehicle && (
                        <div className="mt-4 space-y-3">
                          <Separator />
                          <p className="text-sm font-medium">Documentos Registrados:</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 border rounded-lg">
                              <p className="text-sm text-muted-foreground">SOAT</p>
                              {vehicle.insurancePolicies?.find(p => p.type === "soat") ? (
                                <Badge variant="outline" className="mt-1 bg-green-50">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Vigente
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="mt-1">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  No registrado
                                </Badge>
                              )}
                            </div>
                            <div className="p-3 border rounded-lg">
                              <p className="text-sm text-muted-foreground">Revisión Técnica</p>
                              {vehicle.currentInspection ? (
                                <Badge variant="outline" className="mt-1 bg-green-50">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Vigente
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="mt-1">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  No registrado
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: ESTADO */}
                <TabsContent value="status" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Estado Operativo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {STATUS_OPTIONS.map(status => (
                                  <SelectItem key={status.value} value={status.value}>
                                    <div className="flex items-center gap-2">
                                      <span className={cn("w-2 h-2 rounded-full", status.color)} />
                                      <span>{status.label}</span>
                                      <span className="text-xs text-muted-foreground">
                                        - {status.description}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currentMileage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kilometraje Actual (km)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0}
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Lectura actual del kilometraje
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notas / Observaciones</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Información adicional sobre el vehículo..."
                                className="min-h-25"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isEditing && vehicle && (
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                          <p className="text-sm font-medium">Información del Sistema</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <p>ID: {vehicle.id}</p>
                            <p>Creado: {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString("es-PE") : "N/A"}</p>
                            {vehicle.currentDriverId && (
                              <p className="col-span-2">
                                Conductor asignado: {vehicle.currentDriverName || vehicle.currentDriverId}
                              </p>
                            )}
                            {vehicle.gpsDevice && (
                              <p className="col-span-2">
                                GPS: {vehicle.gpsDevice.imei} ({vehicle.gpsDevice.provider})
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>

              {/* ACCIONES */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEditing ? "Guardar Cambios" : "Crear Vehículo"}
                </Button>
              </div>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default VehicleFormModal;
