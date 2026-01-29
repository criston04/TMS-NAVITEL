'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import ColorPicker from "@/components/geofences/color-picker";

interface GeofenceFormProps {
  formData: {
    name: string;
    description: string;
    tags: string;
    color: string;
  };
  onFormDataChange: (data: Partial<GeofenceFormProps['formData']>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function GeofenceForm({ 
  formData, 
  onFormDataChange, 
  onSave, 
  onCancel 
}: GeofenceFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="geofence-name-input">Nombre</Label>
        <Input
          id="geofence-name-input"
          value={formData.name}
          onChange={(e) => onFormDataChange({ name: e.target.value })}
          placeholder="Nombre de la geocerca"
        />
      </div>
      <div>
        <Label htmlFor="geofence-description-input">Descripción</Label>
        <textarea
          id="geofence-description-input"
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          placeholder="Descripción (opcional)"
          rows={3}
          className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
        />
      </div>
      <div>
        <Label htmlFor="geofence-tags-input">Etiquetas</Label>
        <Input
          id="geofence-tags-input"
          value={formData.tags}
          onChange={(e) => onFormDataChange({ tags: e.target.value })}
          placeholder="Separadas por comas"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="geofence-color-picker">Color</Label>
        <ColorPicker
          value={formData.color}
          onChange={(color) => onFormDataChange({ color })}
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Button
          className="flex-1"
          onClick={onSave}
          disabled={!formData.name.trim()}
        >
          <Save className="mr-2 h-4 w-4" />
          Guardar
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
