/**
 * @fileoverview Servicio de Notificaciones Push
 * Sistema de notificaciones en tiempo real para alertas críticas
 */

export type NotificationType = 'critical' | 'warning' | 'info' | 'success';

export interface NotificationData {
  title: string;
  body: string;
  type: NotificationType;
  icon?: string;
  data?: any;
  onClick?: () => void;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private notifications: Notification[] = [];

  constructor() {
    this.checkPermission();
  }

  /**
   * Verifica y solicita permisos de notificación
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    }

    this.permission = 'denied';
    return 'denied';
  }

  /**
   * Verifica el estado actual de permisos
   */
  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Envía una notificación push
   */
  async send(data: NotificationData): Promise<void> {
    // Solicitar permiso si no se ha hecho
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Permiso de notificación denegado');
        return;
      }
    }

    // Configurar icono según tipo
    const icon = data.icon || this.getIconByType(data.type);

    // Crear notificación
    const notification = new Notification(data.title, {
      body: data.body,
      icon,
      badge: '/favicon.ico',
      tag: `notification-${Date.now()}`,
      requireInteraction: data.type === 'critical',
      data: data.data,
    });

    // Manejar click
    if (data.onClick) {
      notification.onclick = () => {
        window.focus();
        data.onClick?.();
        notification.close();
      };
    }

    // Auto cerrar después de 10 segundos (excepto críticas)
    if (data.type !== 'critical') {
      setTimeout(() => notification.close(), 10000);
    }

    this.notifications.push(notification);
  }

  /**
   * Envía una notificación crítica
   */
  async sendCritical(title: string, body: string, onClick?: () => void): Promise<void> {
    await this.send({
      title,
      body,
      type: 'critical',
      onClick,
    });
  }

  /**
   * Envía una notificación de advertencia
   */
  async sendWarning(title: string, body: string, onClick?: () => void): Promise<void> {
    await this.send({
      title,
      body,
      type: 'warning',
      onClick,
    });
  }

  /**
   * Envía una notificación informativa
   */
  async sendInfo(title: string, body: string, onClick?: () => void): Promise<void> {
    await this.send({
      title,
      body,
      type: 'info',
      onClick,
    });
  }

  /**
   * Envía una notificación de éxito
   */
  async sendSuccess(title: string, body: string, onClick?: () => void): Promise<void> {
    await this.send({
      title,
      body,
      type: 'success',
      onClick,
    });
  }

  /**
   * Obtiene el icono según el tipo de notificación
   */
  private getIconByType(type: NotificationType): string {
    const icons = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅',
    };
    return icons[type];
  }

  /**
   * Cierra todas las notificaciones activas
   */
  closeAll(): void {
    this.notifications.forEach((notification) => notification.close());
    this.notifications = [];
  }

  /**
   * Verifica si las notificaciones están habilitadas
   */
  isEnabled(): boolean {
    return this.permission === 'granted';
  }
}

// Exportar instancia singleton
export const notificationService = new NotificationService();
