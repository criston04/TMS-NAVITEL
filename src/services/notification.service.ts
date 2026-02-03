/**
 * @fileoverview Servicio de Notificaciones
 * @module services/notification.service
 * @description Gestiona el envío, almacenamiento y recuperación de notificaciones
 * del sistema. Soporta múltiples canales y preferencias de usuario.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import { apiConfig } from "@/config/api.config";
import type {
  SystemNotification,
  NotificationPreferences,
  NotificationTemplate,
  CreateNotificationDTO,
  NotificationFilters,
  NotificationStats,
  NotificationCategory,
  NotificationPriority,
} from "@/types/notification";

/* ============================================
   DATOS MOCK
   ============================================ */

const mockNotifications: SystemNotification[] = [
  {
    id: "notif-001",
    title: "Orden completada",
    message: "La orden ORD-2026-00123 ha sido completada exitosamente.",
    category: "order",
    priority: "medium",
    channel: "in_app",
    status: "delivered",
    userId: "user-001",
    relatedEntity: {
      type: "order",
      id: "ord-00123",
      name: "ORD-2026-00123",
    },
    actionUrl: "/orders/ord-00123",
    actionLabel: "Ver orden",
    createdAt: "2026-02-02T10:00:00Z",
    sentAt: "2026-02-02T10:00:05Z",
  },
  {
    id: "notif-002",
    title: "Documento por vencer",
    message: "La licencia del conductor Juan Pérez vence en 15 días.",
    category: "document",
    priority: "high",
    channel: "in_app",
    status: "delivered",
    userId: "user-001",
    relatedEntity: {
      type: "driver",
      id: "drv-001",
      name: "Juan Pérez",
    },
    actionUrl: "/master/drivers/drv-001",
    actionLabel: "Ver conductor",
    createdAt: "2026-02-01T09:00:00Z",
    sentAt: "2026-02-01T09:00:02Z",
  },
  {
    id: "notif-003",
    title: "Mantenimiento programado",
    message: "El vehículo ABC-123 tiene mantenimiento programado para mañana.",
    category: "maintenance",
    priority: "medium",
    channel: "in_app",
    status: "read",
    userId: "user-001",
    relatedEntity: {
      type: "vehicle",
      id: "veh-001",
      name: "ABC-123",
    },
    actionUrl: "/master/vehicles/veh-001/maintenance",
    actionLabel: "Ver mantenimiento",
    createdAt: "2026-02-01T08:00:00Z",
    sentAt: "2026-02-01T08:00:03Z",
    readAt: "2026-02-01T08:30:00Z",
  },
  {
    id: "notif-004",
    title: "Alerta de geocerca",
    message: "El vehículo XYZ-789 ha salido de la geocerca 'Almacén Central'.",
    category: "geofence",
    priority: "urgent",
    channel: "in_app",
    status: "delivered",
    userId: "user-001",
    relatedEntity: {
      type: "vehicle",
      id: "veh-002",
      name: "XYZ-789",
    },
    actionUrl: "/monitoring/tracking",
    actionLabel: "Ver en mapa",
    createdAt: "2026-02-02T11:30:00Z",
    sentAt: "2026-02-02T11:30:01Z",
  },
  {
    id: "notif-005",
    title: "Nuevo conductor registrado",
    message: "Se ha registrado un nuevo conductor: María García.",
    category: "driver",
    priority: "low",
    channel: "in_app",
    status: "read",
    userId: "user-001",
    relatedEntity: {
      type: "driver",
      id: "drv-002",
      name: "María García",
    },
    actionUrl: "/master/drivers/drv-002",
    actionLabel: "Ver perfil",
    createdAt: "2026-01-30T14:00:00Z",
    sentAt: "2026-01-30T14:00:02Z",
    readAt: "2026-01-30T15:00:00Z",
  },
];

const mockTemplates: NotificationTemplate[] = [
  {
    id: "tmpl-001",
    name: "Orden Completada",
    category: "order",
    channel: "email",
    subject: "Orden {{orderNumber}} completada",
    body: "Estimado usuario,\n\nLa orden {{orderNumber}} ha sido completada exitosamente.\n\nDetalles:\n- Cliente: {{customerName}}\n- Fecha: {{completionDate}}\n\nSaludos,\nTMS Navitel",
    variables: ["orderNumber", "customerName", "completionDate"],
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tmpl-002",
    name: "Documento por Vencer",
    category: "document",
    channel: "in_app",
    body: "El documento {{documentType}} de {{entityName}} vence en {{daysRemaining}} días.",
    variables: ["documentType", "entityName", "daysRemaining", "expiryDate"],
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tmpl-003",
    name: "Alerta de Geocerca",
    category: "geofence",
    channel: "push",
    body: "{{vehiclePlate}} ha {{eventType}} la geocerca {{geofenceName}}.",
    variables: ["vehiclePlate", "eventType", "geofenceName", "timestamp"],
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const defaultPreferences: NotificationPreferences = {
  userId: "user-001",
  channels: {
    order: ["in_app", "email"],
    driver: ["in_app"],
    vehicle: ["in_app"],
    maintenance: ["in_app", "email"],
    document: ["in_app", "email", "push"],
    geofence: ["in_app", "push"],
    alert: ["in_app", "push", "email"],
    system: ["in_app"],
  },
  quietHours: {
    enabled: false,
    startTime: "22:00",
    endTime: "07:00",
  },
  dailyDigest: true,
  digestEmail: "usuario@ejemplo.com",
  soundEnabled: true,
  vibrationEnabled: true,
};

/* ============================================
   SERVICIO DE NOTIFICACIONES
   ============================================ */

/**
 * Servicio para gestión de notificaciones del sistema
 */
class NotificationService {
  private notifications: SystemNotification[] = [...mockNotifications];
  private templates: NotificationTemplate[] = [...mockTemplates];
  private preferences: Map<string, NotificationPreferences> = new Map([
    ["user-001", defaultPreferences],
  ]);
  private listeners: Set<(notification: SystemNotification) => void> = new Set();
  private useMocks: boolean;

  constructor() {
    this.useMocks = apiConfig.useMocks;
  }

  /**
   * Simula delay de red
   */
  private async simulateDelay(ms: number = 200): Promise<void> {
    if (this.useMocks) {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  /**
   * Genera ID único
   */
  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // ============================================
  // CRUD DE NOTIFICACIONES
  // ============================================

  /**
   * Obtiene notificaciones con filtros
   */
  async getNotifications(
    filters: NotificationFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    data: SystemNotification[];
    total: number;
    page: number;
    pageSize: number;
    unreadCount: number;
  }> {
    await this.simulateDelay();

    if (this.useMocks) {
      let filtered = [...this.notifications];

      // Aplicar filtros
      if (filters.userId) {
        filtered = filtered.filter(n => n.userId === filters.userId);
      }
      if (filters.category) {
        filtered = filtered.filter(n => n.category === filters.category);
      }
      if (filters.priority) {
        filtered = filtered.filter(n => n.priority === filters.priority);
      }
      if (filters.channel) {
        filtered = filtered.filter(n => n.channel === filters.channel);
      }
      if (filters.status) {
        filtered = filtered.filter(n => n.status === filters.status);
      }
      if (filters.isRead !== undefined) {
        filtered = filtered.filter(n => 
          filters.isRead ? n.readAt !== undefined : n.readAt === undefined
        );
      }
      if (filters.startDate) {
        filtered = filtered.filter(n => 
          new Date(n.createdAt) >= new Date(filters.startDate!)
        );
      }
      if (filters.endDate) {
        filtered = filtered.filter(n => 
          new Date(n.createdAt) <= new Date(filters.endDate!)
        );
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(n =>
          n.title.toLowerCase().includes(search) ||
          n.message.toLowerCase().includes(search)
        );
      }

      // Ordenar por fecha (más reciente primero)
      filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Contar no leídas
      const unreadCount = filtered.filter(n => !n.readAt).length;

      // Paginación
      const start = (page - 1) * pageSize;
      const paginatedData = filtered.slice(start, start + pageSize);

      return {
        data: paginatedData,
        total: filtered.length,
        page,
        pageSize,
        unreadCount,
      };
    }

    throw new Error("API not implemented");
  }

  /**
   * Obtiene una notificación por ID
   */
  async getNotificationById(id: string): Promise<SystemNotification | null> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      return this.notifications.find(n => n.id === id) || null;
    }

    throw new Error("API not implemented");
  }

  /**
   * Crea y envía una notificación
   */
  async createNotification(data: CreateNotificationDTO): Promise<SystemNotification> {
    await this.simulateDelay(300);

    if (this.useMocks) {
      const now = new Date().toISOString();
      
      const newNotification: SystemNotification = {
        id: this.generateId(),
        title: data.title,
        message: data.message,
        category: data.category,
        priority: data.priority || "medium",
        channel: data.channel || "in_app",
        status: "pending",
        userId: data.userId,
        recipientEmail: data.recipientEmail,
        recipientPhone: data.recipientPhone,
        relatedEntity: data.relatedEntity,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        metadata: data.metadata,
        expiresAt: data.expiresAt,
        createdAt: now,
      };

      // Simular envío
      newNotification.status = "sent";
      newNotification.sentAt = now;

      // Simular entrega (para in_app es inmediato)
      if (newNotification.channel === "in_app") {
        newNotification.status = "delivered";
      }

      this.notifications.unshift(newNotification);

      // Notificar a los listeners
      this.notifyListeners(newNotification);

      return newNotification;
    }

    throw new Error("API not implemented");
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(id: string): Promise<SystemNotification> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      const notification = this.notifications.find(n => n.id === id);
      if (!notification) {
        throw new Error(`Notificación con ID ${id} no encontrada`);
      }

      notification.status = "read";
      notification.readAt = new Date().toISOString();

      return notification;
    }

    throw new Error("API not implemented");
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(userId?: string): Promise<number> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      let count = 0;
      const now = new Date().toISOString();

      for (const notification of this.notifications) {
        if (!notification.readAt) {
          if (!userId || notification.userId === userId) {
            notification.status = "read";
            notification.readAt = now;
            count++;
          }
        }
      }

      return count;
    }

    throw new Error("API not implemented");
  }

  /**
   * Elimina una notificación
   */
  async deleteNotification(id: string): Promise<boolean> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index === -1) {
        return false;
      }

      this.notifications.splice(index, 1);
      return true;
    }

    throw new Error("API not implemented");
  }

  /**
   * Elimina notificaciones antiguas
   */
  async deleteOldNotifications(olderThanDays: number = 30): Promise<number> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const initialLength = this.notifications.length;
      this.notifications = this.notifications.filter(n => 
        n.isPersistent || new Date(n.createdAt) >= cutoffDate
      );

      return initialLength - this.notifications.length;
    }

    throw new Error("API not implemented");
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  /**
   * Obtiene estadísticas de notificaciones
   */
  async getStats(userId?: string): Promise<NotificationStats> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      let notifications = this.notifications;
      if (userId) {
        notifications = notifications.filter(n => n.userId === userId);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const byCategory: Record<NotificationCategory, number> = {
        order: 0,
        driver: 0,
        vehicle: 0,
        maintenance: 0,
        document: 0,
        geofence: 0,
        alert: 0,
        system: 0,
      };

      const byPriority: Record<NotificationPriority, number> = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
      };

      notifications.forEach(n => {
        byCategory[n.category]++;
        byPriority[n.priority]++;
      });

      return {
        total: notifications.length,
        unread: notifications.filter(n => !n.readAt).length,
        pending: notifications.filter(n => n.status === "pending").length,
        sentToday: notifications.filter(n => 
          n.sentAt && new Date(n.sentAt) >= today
        ).length,
        failed: notifications.filter(n => n.status === "failed").length,
        byCategory,
        byPriority,
      };
    }

    throw new Error("API not implemented");
  }

  // ============================================
  // PREFERENCIAS
  // ============================================

  /**
   * Obtiene preferencias de notificación de un usuario
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      return this.preferences.get(userId) || {
        ...defaultPreferences,
        userId,
      };
    }

    throw new Error("API not implemented");
  }

  /**
   * Actualiza preferencias de notificación
   */
  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const current = this.preferences.get(userId) || { ...defaultPreferences, userId };
      const updated = { ...current, ...updates, userId };
      this.preferences.set(userId, updated);
      return updated;
    }

    throw new Error("API not implemented");
  }

  // ============================================
  // PLANTILLAS
  // ============================================

  /**
   * Obtiene plantillas de notificación
   */
  async getTemplates(category?: NotificationCategory): Promise<NotificationTemplate[]> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      if (category) {
        return this.templates.filter(t => t.category === category);
      }
      return this.templates;
    }

    throw new Error("API not implemented");
  }

  /**
   * Crea una notificación usando una plantilla
   */
  async createFromTemplate(
    templateId: string,
    variables: Record<string, string>,
    options: Partial<CreateNotificationDTO> = {}
  ): Promise<SystemNotification> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const template = this.templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Plantilla con ID ${templateId} no encontrada`);
      }

      // Reemplazar variables en el cuerpo
      let message = template.body;
      let subject = template.subject;
      
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, "g");
        message = message.replace(regex, value);
        if (subject) {
          subject = subject.replace(regex, value);
        }
      }

      return this.createNotification({
        title: subject || template.name,
        message,
        category: template.category,
        channel: template.channel,
        ...options,
      });
    }

    throw new Error("API not implemented");
  }

  // ============================================
  // SUSCRIPCIÓN EN TIEMPO REAL
  // ============================================

  /**
   * Suscribe a nuevas notificaciones
   */
  subscribe(callback: (notification: SystemNotification) => void): () => void {
    this.listeners.add(callback);
    
    // Retorna función de desuscripción
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notifica a todos los listeners
   */
  private notifyListeners(notification: SystemNotification): void {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error("[NotificationService] Error en listener:", error);
      }
    });
  }

  // ============================================
  // NOTIFICACIONES PREDEFINIDAS
  // ============================================

  /**
   * Envía notificación de orden completada
   */
  async notifyOrderCompleted(
    orderId: string,
    orderNumber: string,
    userId?: string
  ): Promise<SystemNotification> {
    return this.createNotification({
      title: "Orden completada",
      message: `La orden ${orderNumber} ha sido completada exitosamente.`,
      category: "order",
      priority: "medium",
      channel: "in_app",
      userId,
      relatedEntity: {
        type: "order",
        id: orderId,
        name: orderNumber,
      },
      actionUrl: `/orders/${orderId}`,
      actionLabel: "Ver orden",
    });
  }

  /**
   * Envía notificación de documento por vencer
   */
  async notifyDocumentExpiring(
    entityType: "driver" | "vehicle",
    entityId: string,
    entityName: string,
    documentType: string,
    daysRemaining: number,
    userId?: string
  ): Promise<SystemNotification> {
    const priority: NotificationPriority = 
      daysRemaining <= 7 ? "urgent" : daysRemaining <= 15 ? "high" : "medium";

    return this.createNotification({
      title: "Documento por vencer",
      message: `El documento "${documentType}" de ${entityName} vence en ${daysRemaining} días.`,
      category: "document",
      priority,
      channel: "in_app",
      userId,
      relatedEntity: {
        type: entityType,
        id: entityId,
        name: entityName,
      },
      actionUrl: `/master/${entityType}s/${entityId}`,
      actionLabel: `Ver ${entityType === "driver" ? "conductor" : "vehículo"}`,
    });
  }

  /**
   * Envía notificación de evento de geocerca
   */
  async notifyGeofenceEvent(
    vehicleId: string,
    vehiclePlate: string,
    geofenceName: string,
    eventType: "entry" | "exit",
    userId?: string
  ): Promise<SystemNotification> {
    const action = eventType === "entry" ? "ha ingresado a" : "ha salido de";

    return this.createNotification({
      title: `Alerta de geocerca: ${eventType === "entry" ? "Entrada" : "Salida"}`,
      message: `El vehículo ${vehiclePlate} ${action} la geocerca "${geofenceName}".`,
      category: "geofence",
      priority: "high",
      channel: "in_app",
      userId,
      relatedEntity: {
        type: "vehicle",
        id: vehicleId,
        name: vehiclePlate,
      },
      actionUrl: "/monitoring/tracking",
      actionLabel: "Ver en mapa",
      metadata: {
        eventType,
        geofenceName,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Envía notificación de mantenimiento próximo
   */
  async notifyMaintenanceDue(
    vehicleId: string,
    vehiclePlate: string,
    maintenanceType: string,
    dueDate: string,
    userId?: string
  ): Promise<SystemNotification> {
    const daysUntil = Math.ceil(
      (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const priority: NotificationPriority =
      daysUntil <= 0 ? "urgent" : daysUntil <= 3 ? "high" : "medium";

    return this.createNotification({
      title: "Mantenimiento programado",
      message: `El vehículo ${vehiclePlate} tiene ${maintenanceType} programado para ${
        daysUntil <= 0 ? "hoy" : `en ${daysUntil} días`
      }.`,
      category: "maintenance",
      priority,
      channel: "in_app",
      userId,
      relatedEntity: {
        type: "vehicle",
        id: vehicleId,
        name: vehiclePlate,
      },
      actionUrl: `/master/vehicles/${vehicleId}/maintenance`,
      actionLabel: "Ver mantenimiento",
    });
  }
}

/** Instancia singleton del servicio */
export const notificationService = new NotificationService();

export default notificationService;
