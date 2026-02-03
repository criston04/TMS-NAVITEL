/**
 * @fileoverview Mock data para Workflows configurables
 * @module mocks/orders/workflows
 * @description Genera workflows predefinidos y configurables para el módulo de órdenes.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import type { Workflow } from '@/types/workflow';

/**
 * Workflow Estándar - Para cargas generales
 */
const workflowStandard: Workflow = {
  id: 'wf-1',
  name: 'Workflow Estándar',
  description: 'Workflow para transporte de carga general con validaciones básicas en cada punto de control.',
  code: 'WF-STD',
  status: 'active',
  version: 1,
  isDefault: true,
  steps: [
    {
      id: 'wf1-step-1',
      name: 'Inicio de Viaje',
      description: 'Verificación inicial y carga del vehículo',
      sequence: 1,
      action: 'exit_geofence',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Verificar documentación completa y estado del vehículo antes de iniciar.',
        customFields: [
          {
            id: 'cf-1',
            label: 'Kilómetros iniciales',
            type: 'number',
            required: true,
            placeholder: 'Ej: 125430',
          },
          {
            id: 'cf-2',
            label: 'Nivel de combustible',
            type: 'select',
            required: true,
            options: [
              { value: 'full', label: 'Lleno' },
              { value: '3/4', label: '3/4' },
              { value: '1/2', label: '1/2' },
              { value: '1/4', label: '1/4' },
            ],
          },
        ],
      },
      estimatedDurationMinutes: 30,
      maxDurationMinutes: 60,
      transitionConditions: [
        {
          id: 'cond-1',
          type: 'location_reached',
          params: { geofenceId: 'origin' },
          description: 'Salir de la geocerca de origen',
        },
      ],
      notifications: [
        {
          id: 'not-1',
          type: 'email',
          trigger: 'on_exit',
          recipients: ['supervisor@navitel.com', 'cliente'],
          template: {
            subject: 'Viaje iniciado - Orden {{orderNumber}}',
            body: 'El viaje de la orden {{orderNumber}} ha iniciado. Vehículo: {{vehiclePlate}}. ETA destino: {{etaDestination}}.',
            variables: ['orderNumber', 'vehiclePlate', 'etaDestination'],
          },
        },
      ],
      color: '#22c55e',
      icon: 'play-circle',
    },
    {
      id: 'wf1-step-2',
      name: 'En Tránsito',
      description: 'Monitoreo durante el recorrido',
      sequence: 2,
      action: 'enter_geofence',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Mantener comunicación activa y reportar cualquier novedad.',
      },
      estimatedDurationMinutes: 480, // 8 horas promedio
      maxDurationMinutes: 720, // 12 horas máximo
      transitionConditions: [
        {
          id: 'cond-2',
          type: 'location_reached',
          params: { geofenceId: 'waypoint' },
          description: 'Llegar al siguiente punto de control',
        },
      ],
      notifications: [
        {
          id: 'not-2',
          type: 'push',
          trigger: 'on_delay',
          recipients: ['operador', 'supervisor'],
          template: {
            body: 'Alerta: Orden {{orderNumber}} presenta retraso de {{delayMinutes}} minutos.',
            variables: ['orderNumber', 'delayMinutes'],
          },
          onlyOnDelay: true,
        },
      ],
      color: '#3b82f6',
      icon: 'truck',
    },
    {
      id: 'wf1-step-3',
      name: 'Llegada a Destino',
      description: 'Entrada a geocerca de destino',
      sequence: 3,
      action: 'enter_geofence',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        geofenceName: 'Destino',
        instructions: 'Reportar llegada y esperar autorización para descarga.',
      },
      estimatedDurationMinutes: 15,
      maxDurationMinutes: 30,
      transitionConditions: [
        {
          id: 'cond-3',
          type: 'location_reached',
          params: { geofenceId: 'destination' },
          description: 'Entrar a geocerca de destino',
        },
      ],
      notifications: [
        {
          id: 'not-3',
          type: 'email',
          trigger: 'on_enter',
          recipients: ['cliente', 'almacen@destino.com'],
          template: {
            subject: 'Vehículo llegando - Orden {{orderNumber}}',
            body: 'El vehículo {{vehiclePlate}} ha llegado a las instalaciones. Por favor preparar área de descarga.',
            variables: ['orderNumber', 'vehiclePlate'],
          },
        },
      ],
      color: '#f59e0b',
      icon: 'map-pin',
    },
    {
      id: 'wf1-step-4',
      name: 'Descarga',
      description: 'Proceso de descarga de mercancía',
      sequence: 4,
      action: 'manual_check',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Supervisar descarga y verificar estado de la mercancía.',
        customFields: [
          {
            id: 'cf-3',
            label: 'Cantidad recibida',
            type: 'number',
            required: true,
          },
          {
            id: 'cf-4',
            label: 'Estado de la mercancía',
            type: 'select',
            required: true,
            options: [
              { value: 'perfect', label: 'Perfecto estado' },
              { value: 'minor_damage', label: 'Daños menores' },
              { value: 'major_damage', label: 'Daños mayores' },
            ],
          },
        ],
      },
      estimatedDurationMinutes: 60,
      maxDurationMinutes: 120,
      transitionConditions: [
        {
          id: 'cond-4',
          type: 'manual_trigger',
          params: {},
          description: 'Confirmación manual de descarga completada',
        },
      ],
      notifications: [],
      color: '#8b5cf6',
      icon: 'package',
    },
    {
      id: 'wf1-step-5',
      name: 'Firma de Conformidad',
      description: 'Obtener firma de recepción',
      sequence: 5,
      action: 'signature',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Obtener firma del responsable de almacén en el documento de entrega.',
      },
      estimatedDurationMinutes: 10,
      maxDurationMinutes: 20,
      transitionConditions: [
        {
          id: 'cond-5',
          type: 'document_uploaded',
          params: { documentType: 'signature' },
          description: 'Firma de conformidad capturada',
        },
      ],
      notifications: [],
      color: '#ec4899',
      icon: 'pen-tool',
    },
    {
      id: 'wf1-step-6',
      name: 'Fin de Viaje',
      description: 'Salida de geocerca de destino',
      sequence: 6,
      action: 'exit_geofence',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Completar documentación y salir de las instalaciones.',
        customFields: [
          {
            id: 'cf-5',
            label: 'Kilómetros finales',
            type: 'number',
            required: true,
          },
        ],
      },
      estimatedDurationMinutes: 15,
      maxDurationMinutes: 30,
      transitionConditions: [
        {
          id: 'cond-6',
          type: 'location_reached',
          params: { geofenceId: 'destination' },
          description: 'Salir de geocerca de destino',
        },
      ],
      notifications: [
        {
          id: 'not-6',
          type: 'email',
          trigger: 'on_complete',
          recipients: ['supervisor@navitel.com', 'facturacion@navitel.com'],
          template: {
            subject: 'Viaje completado - Orden {{orderNumber}}',
            body: 'El viaje de la orden {{orderNumber}} ha sido completado exitosamente. Documentación lista para facturación.',
            variables: ['orderNumber'],
          },
        },
      ],
      color: '#10b981',
      icon: 'check-circle',
    },
  ],
  escalationRules: [
    {
      id: 'esc-1',
      name: 'Escalamiento por retraso mayor a 2 horas',
      condition: {
        type: 'delay_threshold',
        thresholdMinutes: 120,
      },
      actions: [
        {
          type: 'notify',
          config: {
            notificationConfig: {
              id: 'esc-not-1',
              type: 'email',
              trigger: 'on_delay',
              recipients: ['gerencia@navitel.com'],
              template: {
                subject: 'ALERTA: Retraso crítico en orden {{orderNumber}}',
                body: 'La orden {{orderNumber}} presenta un retraso de más de 2 horas. Requiere atención inmediata.',
              },
            },
          },
        },
        {
          type: 'flag',
          config: {
            flagType: 'critical',
          },
        },
      ],
      isActive: true,
    },
    {
      id: 'esc-2',
      name: 'Sin actualización por 4 horas',
      condition: {
        type: 'no_update',
        thresholdMinutes: 240,
      },
      actions: [
        {
          type: 'notify',
          config: {
            notificationConfig: {
              id: 'esc-not-2',
              type: 'sms',
              trigger: 'on_delay',
              recipients: ['conductor', 'supervisor'],
              template: {
                body: 'NAVITEL: Sin señal de orden {{orderNumber}} por 4+ horas. Verificar estado.',
              },
            },
          },
        },
      ],
      isActive: true,
    },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  createdBy: 'admin@navitel.com',
  updatedAt: '2024-06-15T10:30:00.000Z',
  updatedBy: 'admin@navitel.com',
};

/**
 * Workflow Express - Para entregas rápidas
 */
const workflowExpress: Workflow = {
  id: 'wf-2',
  name: 'Workflow Express',
  description: 'Workflow simplificado para entregas express con tiempos reducidos.',
  code: 'WF-EXP',
  status: 'active',
  version: 1,
  isDefault: false,
  steps: [
    {
      id: 'wf2-step-1',
      name: 'Inicio Express',
      description: 'Salida inmediata del origen',
      sequence: 1,
      action: 'exit_geofence',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Inicio rápido - verificar solo documentación esencial.',
      },
      estimatedDurationMinutes: 15,
      maxDurationMinutes: 30,
      transitionConditions: [
        {
          id: 'cond-1',
          type: 'location_reached',
          params: { geofenceId: 'origin' },
          description: 'Salir de origen',
        },
      ],
      notifications: [
        {
          id: 'not-1',
          type: 'push',
          trigger: 'on_exit',
          recipients: ['cliente'],
          template: {
            body: '🚀 Su pedido express {{orderNumber}} está en camino!',
          },
        },
      ],
      color: '#ef4444',
      icon: 'zap',
    },
    {
      id: 'wf2-step-2',
      name: 'Tránsito Express',
      description: 'Ruta directa sin paradas',
      sequence: 2,
      action: 'enter_geofence',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Ruta directa - no realizar paradas no autorizadas.',
      },
      estimatedDurationMinutes: 180,
      maxDurationMinutes: 240,
      transitionConditions: [
        {
          id: 'cond-2',
          type: 'location_reached',
          params: { geofenceId: 'destination' },
          description: 'Llegada a destino',
        },
      ],
      notifications: [
        {
          id: 'not-2',
          type: 'push',
          trigger: 'on_delay',
          recipients: ['cliente', 'operador'],
          template: {
            body: '⚠️ Pedido express {{orderNumber}} con posible retraso.',
          },
          onlyOnDelay: true,
        },
      ],
      color: '#f97316',
      icon: 'truck',
    },
    {
      id: 'wf2-step-3',
      name: 'Entrega Express',
      description: 'Entrega rápida con confirmación',
      sequence: 3,
      action: 'photo_capture',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        minPhotos: 1,
        instructions: 'Tomar foto de entrega como comprobante.',
      },
      estimatedDurationMinutes: 10,
      maxDurationMinutes: 20,
      transitionConditions: [
        {
          id: 'cond-3',
          type: 'document_uploaded',
          params: { documentType: 'photo' },
          description: 'Foto de entrega capturada',
        },
      ],
      notifications: [
        {
          id: 'not-3',
          type: 'push',
          trigger: 'on_complete',
          recipients: ['cliente'],
          template: {
            body: '✅ Su pedido {{orderNumber}} ha sido entregado!',
          },
        },
      ],
      color: '#22c55e',
      icon: 'camera',
    },
  ],
  escalationRules: [
    {
      id: 'esc-exp-1',
      name: 'Escalamiento express - 30 min retraso',
      condition: {
        type: 'delay_threshold',
        thresholdMinutes: 30,
      },
      actions: [
        {
          type: 'notify',
          config: {
            notificationConfig: {
              id: 'esc-not-exp-1',
              type: 'sms',
              trigger: 'on_delay',
              recipients: ['supervisor', 'cliente'],
              template: {
                body: 'URGENTE: Pedido express {{orderNumber}} retrasado. Acción inmediata requerida.',
              },
            },
          },
        },
        {
          type: 'flag',
          config: {
            flagType: 'critical',
          },
        },
      ],
      isActive: true,
    },
  ],
  createdAt: '2024-03-01T00:00:00.000Z',
  createdBy: 'admin@navitel.com',
  updatedAt: '2024-06-15T10:30:00.000Z',
  updatedBy: 'admin@navitel.com',
};

/**
 * Workflow Refrigerado - Para cadena de frío
 */
const workflowRefrigerated: Workflow = {
  id: 'wf-3',
  name: 'Workflow Cadena de Frío',
  description: 'Workflow especializado para transporte refrigerado con verificaciones de temperatura.',
  code: 'WF-REF',
  status: 'active',
  version: 1,
  isDefault: false,
  applicableCargoTypes: ['refrigerated'],
  steps: [
    {
      id: 'wf3-step-1',
      name: 'Pre-enfriamiento',
      description: 'Verificar temperatura del contenedor antes de carga',
      sequence: 1,
      action: 'temperature_check',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        temperatureRange: { min: 2, max: 8 },
        instructions: 'Verificar que la unidad alcanzó temperatura objetivo antes de cargar.',
        customFields: [
          {
            id: 'cf-temp-1',
            label: 'Temperatura inicial (°C)',
            type: 'number',
            required: true,
            placeholder: 'Ej: 4.5',
          },
          {
            id: 'cf-temp-2',
            label: 'Foto del termómetro',
            type: 'file',
            required: true,
          },
        ],
      },
      estimatedDurationMinutes: 60,
      maxDurationMinutes: 90,
      transitionConditions: [
        {
          id: 'cond-1',
          type: 'manual_trigger',
          params: {},
          description: 'Confirmación de temperatura correcta',
        },
      ],
      notifications: [],
      color: '#06b6d4',
      icon: 'thermometer',
    },
    {
      id: 'wf3-step-2',
      name: 'Carga Refrigerada',
      description: 'Carga con monitoreo de temperatura',
      sequence: 2,
      action: 'manual_check',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Cargar rápidamente para minimizar exposición térmica.',
        customFields: [
          {
            id: 'cf-load-1',
            label: 'Temperatura post-carga (°C)',
            type: 'number',
            required: true,
          },
          {
            id: 'cf-load-2',
            label: 'Tiempo de puertas abiertas (min)',
            type: 'number',
            required: true,
          },
        ],
      },
      estimatedDurationMinutes: 45,
      maxDurationMinutes: 60,
      transitionConditions: [
        {
          id: 'cond-2',
          type: 'manual_trigger',
          params: {},
          description: 'Carga completada',
        },
      ],
      notifications: [],
      color: '#0ea5e9',
      icon: 'package',
    },
    {
      id: 'wf3-step-3',
      name: 'Inicio Transporte Refrigerado',
      description: 'Salida con monitoreo activo',
      sequence: 3,
      action: 'exit_geofence',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Verificar funcionamiento del sistema de refrigeración.',
      },
      estimatedDurationMinutes: 15,
      maxDurationMinutes: 30,
      transitionConditions: [
        {
          id: 'cond-3',
          type: 'location_reached',
          params: { geofenceId: 'origin' },
          description: 'Salir de origen',
        },
      ],
      notifications: [
        {
          id: 'not-3',
          type: 'email',
          trigger: 'on_exit',
          recipients: ['calidad@navitel.com', 'cliente'],
          template: {
            subject: 'Transporte refrigerado iniciado - {{orderNumber}}',
            body: 'Carga refrigerada en camino. Temperatura inicial: {{initialTemp}}°C. Monitoreo activo.',
          },
        },
      ],
      color: '#3b82f6',
      icon: 'truck',
    },
    {
      id: 'wf3-step-4',
      name: 'Verificación en Ruta',
      description: 'Control de temperatura cada 2 horas',
      sequence: 4,
      action: 'temperature_check',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        temperatureRange: { min: 2, max: 8 },
        instructions: 'Verificar y registrar temperatura. Alertar si fuera de rango.',
        customFields: [
          {
            id: 'cf-route-1',
            label: 'Temperatura actual (°C)',
            type: 'number',
            required: true,
          },
        ],
      },
      estimatedDurationMinutes: 5,
      maxDurationMinutes: 10,
      transitionConditions: [
        {
          id: 'cond-4',
          type: 'time_elapsed',
          params: { minutes: 120 },
          description: 'Cada 2 horas o al llegar a destino',
        },
      ],
      notifications: [],
      color: '#8b5cf6',
      icon: 'thermometer',
    },
    {
      id: 'wf3-step-5',
      name: 'Llegada y Verificación Final',
      description: 'Control de temperatura al llegar',
      sequence: 5,
      action: 'temperature_check',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        temperatureRange: { min: 2, max: 8 },
        instructions: 'Verificar temperatura antes de descarga. Documentar con foto.',
        customFields: [
          {
            id: 'cf-final-1',
            label: 'Temperatura final (°C)',
            type: 'number',
            required: true,
          },
          {
            id: 'cf-final-2',
            label: 'Foto del termómetro',
            type: 'file',
            required: true,
          },
          {
            id: 'cf-final-3',
            label: 'Cadena de frío mantenida',
            type: 'checkbox',
            required: true,
          },
        ],
      },
      estimatedDurationMinutes: 15,
      maxDurationMinutes: 30,
      transitionConditions: [
        {
          id: 'cond-5',
          type: 'manual_trigger',
          params: {},
          description: 'Verificación de temperatura completada',
        },
      ],
      notifications: [
        {
          id: 'not-5',
          type: 'email',
          trigger: 'on_complete',
          recipients: ['calidad@navitel.com', 'cliente'],
          template: {
            subject: 'Cadena de frío verificada - {{orderNumber}}',
            body: 'Temperatura final: {{finalTemp}}°C. Cadena de frío: {{coldChainStatus}}.',
          },
        },
      ],
      color: '#10b981',
      icon: 'check-circle',
    },
    {
      id: 'wf3-step-6',
      name: 'Entrega Refrigerada',
      description: 'Descarga con certificación de temperatura',
      sequence: 6,
      action: 'document_upload',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        acceptedDocumentTypes: ['pdf', 'jpg', 'png'],
        instructions: 'Obtener firma de recepción con certificación de cadena de frío.',
      },
      estimatedDurationMinutes: 30,
      maxDurationMinutes: 45,
      transitionConditions: [
        {
          id: 'cond-6',
          type: 'document_uploaded',
          params: { documentType: 'pod' },
          description: 'POD con certificación de temperatura',
        },
      ],
      notifications: [
        {
          id: 'not-6',
          type: 'email',
          trigger: 'on_complete',
          recipients: ['facturacion@navitel.com'],
          template: {
            subject: 'Entrega refrigerada completada - {{orderNumber}}',
            body: 'Entrega completada con certificación de cadena de frío. Lista para facturación.',
          },
        },
      ],
      color: '#22c55e',
      icon: 'file-check',
    },
  ],
  escalationRules: [
    {
      id: 'esc-ref-1',
      name: 'Alerta temperatura fuera de rango',
      condition: {
        type: 'step_stuck',
        thresholdMinutes: 15,
        stepIds: ['wf3-step-4', 'wf3-step-5'],
      },
      actions: [
        {
          type: 'notify',
          config: {
            notificationConfig: {
              id: 'esc-not-ref-1',
              type: 'sms',
              trigger: 'on_delay',
              recipients: ['conductor', 'calidad@navitel.com', 'gerencia@navitel.com'],
              template: {
                body: '🚨 ALERTA CRÍTICA: Posible ruptura de cadena de frío en orden {{orderNumber}}. Verificar inmediatamente.',
              },
            },
          },
        },
        {
          type: 'flag',
          config: {
            flagType: 'critical',
          },
        },
      ],
      isActive: true,
    },
  ],
  createdAt: '2024-02-15T00:00:00.000Z',
  createdBy: 'admin@navitel.com',
  updatedAt: '2024-06-15T10:30:00.000Z',
  updatedBy: 'admin@navitel.com',
};

/**
 * Workflow Materiales Peligrosos
 */
const workflowHazmat: Workflow = {
  id: 'wf-4',
  name: 'Workflow MATPEL',
  description: 'Workflow para transporte de materiales peligrosos con cumplimiento regulatorio.',
  code: 'WF-HAZ',
  status: 'active',
  version: 1,
  isDefault: false,
  applicableCargoTypes: ['hazardous'],
  steps: [
    {
      id: 'wf4-step-1',
      name: 'Verificación MATPEL',
      description: 'Verificación de documentación y equipo de seguridad',
      sequence: 1,
      action: 'manual_check',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Verificar: Hoja de seguridad, rótulos, kit de emergencia, EPP del conductor.',
        customFields: [
          {
            id: 'cf-haz-1',
            label: 'Número ONU',
            type: 'text',
            required: true,
            placeholder: 'Ej: UN1203',
          },
          {
            id: 'cf-haz-2',
            label: 'Clase de peligro',
            type: 'select',
            required: true,
            options: [
              { value: '1', label: 'Clase 1 - Explosivos' },
              { value: '2', label: 'Clase 2 - Gases' },
              { value: '3', label: 'Clase 3 - Líquidos inflamables' },
              { value: '4', label: 'Clase 4 - Sólidos inflamables' },
              { value: '5', label: 'Clase 5 - Oxidantes' },
              { value: '6', label: 'Clase 6 - Tóxicos' },
              { value: '7', label: 'Clase 7 - Radiactivos' },
              { value: '8', label: 'Clase 8 - Corrosivos' },
              { value: '9', label: 'Clase 9 - Misceláneos' },
            ],
          },
          {
            id: 'cf-haz-3',
            label: 'Kit emergencia verificado',
            type: 'checkbox',
            required: true,
          },
          {
            id: 'cf-haz-4',
            label: 'Foto de rótulos',
            type: 'file',
            required: true,
          },
        ],
      },
      estimatedDurationMinutes: 45,
      maxDurationMinutes: 60,
      transitionConditions: [
        {
          id: 'cond-1',
          type: 'manual_trigger',
          params: {},
          description: 'Verificación MATPEL completada',
        },
      ],
      notifications: [
        {
          id: 'not-1',
          type: 'email',
          trigger: 'on_complete',
          recipients: ['seguridad@navitel.com'],
          template: {
            subject: 'MATPEL verificado - {{orderNumber}}',
            body: 'Carga MATPEL verificada. UN: {{unNumber}}, Clase: {{hazClass}}.',
          },
        },
      ],
      color: '#dc2626',
      icon: 'alert-triangle',
    },
    {
      id: 'wf4-step-2',
      name: 'Inicio Transporte MATPEL',
      description: 'Inicio con ruta autorizada',
      sequence: 2,
      action: 'exit_geofence',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Seguir exclusivamente ruta autorizada para MATPEL.',
      },
      estimatedDurationMinutes: 15,
      maxDurationMinutes: 30,
      transitionConditions: [
        {
          id: 'cond-2',
          type: 'location_reached',
          params: { geofenceId: 'origin' },
          description: 'Salir de origen',
        },
      ],
      notifications: [
        {
          id: 'not-2',
          type: 'webhook',
          trigger: 'on_exit',
          recipients: ['https://api.autoridades.gob/matpel/notify'],
          template: {
            body: '{"orderNumber": "{{orderNumber}}", "unNumber": "{{unNumber}}", "route": "{{route}}"}',
          },
        },
      ],
      color: '#f97316',
      icon: 'truck',
    },
    {
      id: 'wf4-step-3',
      name: 'Monitoreo Continuo',
      description: 'Seguimiento especial de ruta',
      sequence: 3,
      action: 'custom',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        instructions: 'Mantener velocidad regulada y evitar zonas pobladas según ruta.',
      },
      estimatedDurationMinutes: 360,
      maxDurationMinutes: 480,
      transitionConditions: [
        {
          id: 'cond-3',
          type: 'location_reached',
          params: { geofenceId: 'destination' },
          description: 'Llegada a destino',
        },
      ],
      notifications: [
        {
          id: 'not-3',
          type: 'push',
          trigger: 'on_delay',
          recipients: ['seguridad@navitel.com', 'operador'],
          template: {
            body: '⚠️ MATPEL: Orden {{orderNumber}} presenta desviación de ruta o retraso.',
          },
          onlyOnDelay: true,
        },
      ],
      color: '#eab308',
      icon: 'radio',
    },
    {
      id: 'wf4-step-4',
      name: 'Entrega MATPEL',
      description: 'Entrega con protocolo de seguridad',
      sequence: 4,
      action: 'document_upload',
      isRequired: true,
      canSkip: false,
      actionConfig: {
        acceptedDocumentTypes: ['pdf'],
        instructions: 'Obtener firma de recepción y verificar condiciones de descarga segura.',
        customFields: [
          {
            id: 'cf-del-1',
            label: 'Responsable de recepción',
            type: 'text',
            required: true,
          },
          {
            id: 'cf-del-2',
            label: 'Certificación MATPEL receptor',
            type: 'text',
            required: true,
          },
        ],
      },
      estimatedDurationMinutes: 60,
      maxDurationMinutes: 90,
      transitionConditions: [
        {
          id: 'cond-4',
          type: 'document_uploaded',
          params: { documentType: 'pod' },
          description: 'POD MATPEL firmado',
        },
      ],
      notifications: [
        {
          id: 'not-4',
          type: 'email',
          trigger: 'on_complete',
          recipients: ['seguridad@navitel.com', 'legal@navitel.com'],
          template: {
            subject: 'Entrega MATPEL completada - {{orderNumber}}',
            body: 'Transporte MATPEL completado sin incidentes. Documentación archivada.',
          },
        },
      ],
      color: '#22c55e',
      icon: 'shield-check',
    },
  ],
  escalationRules: [
    {
      id: 'esc-haz-1',
      name: 'Desvío de ruta MATPEL',
      condition: {
        type: 'step_stuck',
        thresholdMinutes: 10,
        stepIds: ['wf4-step-3'],
      },
      actions: [
        {
          type: 'notify',
          config: {
            notificationConfig: {
              id: 'esc-not-haz-1',
              type: 'sms',
              trigger: 'on_delay',
              recipients: ['seguridad@navitel.com', 'gerencia@navitel.com', 'conductor'],
              template: {
                body: '🚨 EMERGENCIA MATPEL: Posible desvío de ruta en orden {{orderNumber}}. Contactar conductor inmediatamente.',
              },
            },
          },
        },
        {
          type: 'flag',
          config: {
            flagType: 'critical',
          },
        },
      ],
      isActive: true,
    },
  ],
  createdAt: '2024-04-01T00:00:00.000Z',
  createdBy: 'admin@navitel.com',
  updatedAt: '2024-06-15T10:30:00.000Z',
  updatedBy: 'admin@navitel.com',
};

/**
 * Base de datos mock de workflows
 */
export const mockWorkflows: Workflow[] = [
  workflowStandard,
  workflowExpress,
  workflowRefrigerated,
  workflowHazmat,
];

/**
 * Obtiene todos los workflows
 * @returns Array de workflows
 */
export const getAllWorkflows = (): Workflow[] => mockWorkflows;

/**
 * Obtiene un workflow por ID
 * @param id - ID del workflow
 * @returns Workflow o undefined
 */
export const getWorkflowById = (id: string): Workflow | undefined => {
  return mockWorkflows.find(wf => wf.id === id);
};

/**
 * Obtiene workflows activos
 * @returns Workflows con status 'active'
 */
export const getActiveWorkflows = (): Workflow[] => {
  return mockWorkflows.filter(wf => wf.status === 'active');
};

/**
 * Obtiene el workflow por defecto
 * @returns Workflow por defecto
 */
export const getDefaultWorkflow = (): Workflow | undefined => {
  return mockWorkflows.find(wf => wf.isDefault);
};

/**
 * Obtiene workflows aplicables a un tipo de carga
 * @param cargoType - Tipo de carga
 * @returns Workflows aplicables
 */
export const getWorkflowsByCargoType = (cargoType: string): Workflow[] => {
  return mockWorkflows.filter(wf => 
    wf.status === 'active' && 
    (!wf.applicableCargoTypes || wf.applicableCargoTypes.length === 0 || wf.applicableCargoTypes.includes(cargoType))
  );
};
