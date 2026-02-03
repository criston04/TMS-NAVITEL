/**
 * @fileoverview Servicio de Configuración del Sistema
 * @module services/settings.service
 * @description Gestiona la configuración del TMS, incluyendo ajustes
 * generales, roles, permisos, integraciones y auditoría.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import { apiConfig } from "@/config/api.config";
import type {
  SystemSettings,
  SettingCategory,
  Role,
  Integration,
  AuditLogEntry,
  SettingsOverview,
  IntegrationHealthStatus,
  UpdateSettingsDTO,
  CreateRoleDTO,
  CreateIntegrationDTO,
  AuditLogFilters,
} from "@/types/settings";

/* ============================================
   DATOS MOCK
   ============================================ */

const mockSettings: SystemSettings = {
  general: {
    companyName: "TMS NAVITEL",
    companyLogo: "/logo/navitel.png",
    companyAddress: "Av. Javier Prado Este 1234, Lima, Perú",
    companyPhone: "+51 1 234 5678",
    companyEmail: "info@tms-navitel.com",
    companyWebsite: "https://tms-navitel.com",
    companyTaxId: "20123456789",
    timezone: "America/Lima",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    defaultLanguage: "es",
    supportedLanguages: ["es", "en", "pt"],
  },
  operations: {
    defaultOrderStatus: "pending",
    autoAssignOrders: true,
    autoAssignRules: {
      byZone: true,
      byCapacity: true,
      byDistance: true,
      byWorkload: false,
    },
    maxOrdersPerVehicle: 20,
    maxOrdersPerDriver: 15,
    deliveryTimeWindowMinutes: 60,
    allowPartialDelivery: true,
    requireSignature: true,
    requirePhoto: true,
    requireGeolocation: true,
    enableRouteOptimization: true,
    routeOptimizationAlgorithm: "genetic",
    workingHours: { start: "06:00", end: "22:00" },
    workingDays: [1, 2, 3, 4, 5, 6],  // Lunes a Sábado
  },
  fleet: {
    enableSpeedAlerts: true,
    maxSpeedKmh: 90,
    enableIdleAlerts: true,
    maxIdleMinutes: 15,
    enableFuelAlerts: true,
    minFuelLevel: 20,
    enableMaintenanceAlerts: true,
    maintenanceIntervalKm: 10000,
    maintenanceIntervalDays: 90,
    enableDocumentExpiryAlerts: true,
    documentExpiryWarningDays: 30,
    trackingIntervalSeconds: 30,
    historyRetentionDays: 365,
    enableGeofenceAlerts: true,
    defaultSpeedLimit: 80,
    idleTimeThresholdMinutes: 15,
    maxDrivingHoursPerDay: 8,
    restBreakMinutes: 30,
    distanceUnit: "km",
    fuelCostPerKm: 0.5,
    defaultFuelType: "diesel",
    defaultFuelCapacity: 200,
  },
  finance: {
    defaultCurrency: "PEN",
    supportedCurrencies: ["PEN", "USD"],
    defaultTaxRate: 18,
    taxName: "IGV",
    taxIncludedByDefault: false,
    invoicePrefix: "INV",
    invoiceNumberDigits: 8,
    paymentTermsDays: 30,
    enableLateFees: true,
    lateFeePercentage: 2,
    enableDiscounts: true,
    maxDiscountPercentage: 15,
    requireApprovalAbove: 10000,
    bankAccounts: [
      {
        name: "Cuenta Principal",
        bank: "BCP",
        accountNumber: "193-1234567-0-12",
        currency: "PEN",
        isDefault: true,
      },
      {
        name: "Cuenta USD",
        bank: "BBVA",
        accountNumber: "0011-0123-0200123456",
        currency: "USD",
        isDefault: false,
      },
    ],
  },
  notifications: {
    enableEmailNotifications: true,
    enableSmsNotifications: true,
    enablePushNotifications: true,
    enableInAppNotifications: true,
    emailProvider: "smtp",
    smtpHost: "smtp.empresa.com",
    smtpPort: 587,
    smtpUser: "noreply@empresa.com",
    fromEmail: "noreply@tms-navitel.com",
    fromName: "TMS NAVITEL",
    smsProvider: "twilio",
    notifyOnNewOrder: true,
    notifyOnOrderStatusChange: true,
    notifyOnDeliveryCompleted: true,
    notifyOnIncident: true,
    notifyOnMaintenance: true,
    notifyOnDocumentExpiry: true,
    notifyOnGeofenceEvent: true,
    notifyOnPaymentReceived: true,
    notifyOnInvoiceOverdue: true,
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: false,
    passwordExpirationDays: 90,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    sessionTimeoutMinutes: 480,
    enableTwoFactor: false,
    twoFactorMethod: "email",
    enableAuditLog: true,
    auditLogRetentionDays: 365,
    enableIpWhitelist: false,
    ipWhitelist: [],
    allowedOrigins: ["*"],
    apiRateLimitPerMinute: 100,
  },
  localization: {
    defaultCountry: "PE",
    defaultTimezone: "America/Lima",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    numberFormat: {
      decimalSeparator: ".",
      thousandsSeparator: ",",
      decimalPlaces: 2,
    },
    currencyFormat: {
      symbol: "S/",
      symbolPosition: "before",
      decimalPlaces: 2,
    },
    distanceUnit: "km",
    weightUnit: "kg",
    volumeUnit: "m3",
    temperatureUnit: "C",
    firstDayOfWeek: 1,
  },
  appearance: {
    theme: "light",
    primaryColor: "#1E88E5",
    secondaryColor: "#43A047",
    accentColor: "#FF9800",
    fontFamily: "Inter",
    fontSize: "medium",
    compactMode: false,
    showBreadcrumbs: true,
    sidebarCollapsed: false,
    tablePageSize: 20,
    chartAnimations: true,
    mapStyle: "streets",
    mapDefaultZoom: 12,
    mapDefaultCenter: { lat: -12.0464, lng: -77.0428 },
    animationsEnabled: true,
    colorScheme: "blue",
    language: "es",
  },
};

const mockRoles: Role[] = [
  {
    id: "role-001",
    code: "admin",
    name: "Administrador",
    description: "Acceso total al sistema",
    permissions: [
      { resource: "*", actions: { create: true, read: true, update: true, delete: true } },
    ],
    isSystem: true,
    isActive: true,
    userCount: 3,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role-002",
    code: "operations",
    name: "Operaciones",
    description: "Gestión de órdenes, rutas y flota",
    permissions: [
      { resource: "orders", actions: { create: true, read: true, update: true, delete: false } },
      { resource: "routes", actions: { create: true, read: true, update: true, delete: false } },
      { resource: "vehicles", actions: { create: false, read: true, update: true, delete: false } },
      { resource: "drivers", actions: { create: false, read: true, update: true, delete: false } },
    ],
    isSystem: true,
    isActive: true,
    userCount: 8,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role-003",
    code: "finance",
    name: "Finanzas",
    description: "Gestión financiera y facturación",
    permissions: [
      { resource: "invoices", actions: { create: true, read: true, update: true, delete: false } },
      { resource: "payments", actions: { create: true, read: true, update: true, delete: false } },
      { resource: "costs", actions: { create: true, read: true, update: true, delete: false } },
      { resource: "reports.financial", actions: { create: true, read: true, update: false, delete: false } },
    ],
    isSystem: true,
    isActive: true,
    userCount: 4,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role-004",
    code: "driver",
    name: "Conductor",
    description: "Acceso móvil para conductores",
    permissions: [
      { resource: "orders", actions: { create: false, read: true, update: true, delete: false } },
      { resource: "vehicles", actions: { create: false, read: true, update: false, delete: false } },
    ],
    isSystem: true,
    isActive: true,
    userCount: 25,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const mockIntegrations: Integration[] = [
  {
    id: "int-001",
    code: "gps_tracker",
    name: "GPS Tracker Pro",
    description: "Sistema de rastreo GPS para vehículos",
    type: "gps",
    status: "active",
    config: {
      refreshInterval: 30,
      enableHistory: true,
    },
    baseUrl: "https://api.gpstracker.com/v2",
    lastSyncAt: "2026-02-02T12:00:00Z",
    syncIntervalMinutes: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-02-02T12:00:00Z",
  },
  {
    id: "int-002",
    code: "sap_erp",
    name: "SAP ERP",
    description: "Integración con sistema ERP corporativo",
    type: "erp",
    status: "active",
    config: {
      syncOrders: true,
      syncInvoices: true,
      syncCustomers: true,
    },
    baseUrl: "https://sap.empresa.com/api",
    lastSyncAt: "2026-02-02T06:00:00Z",
    syncIntervalMinutes: 60,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-02-02T06:00:00Z",
  },
  {
    id: "int-003",
    code: "google_maps",
    name: "Google Maps Platform",
    description: "Mapas, geocodificación y rutas",
    type: "maps",
    status: "active",
    config: {
      enableDirections: true,
      enableGeocoding: true,
      enablePlaces: true,
    },
    baseUrl: "https://maps.googleapis.com/maps/api",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const mockAuditLog: AuditLogEntry[] = [
  {
    id: "audit-001",
    timestamp: "2026-02-02T14:30:00Z",
    userId: "user-001",
    userName: "Admin",
    action: "update",
    resource: "settings",
    resourceId: "operations",
    details: "Actualización de configuración de operaciones",
    changes: [
      { field: "maxOrdersPerVehicle", oldValue: 15, newValue: 20 },
    ],
    ipAddress: "192.168.1.100",
  },
  {
    id: "audit-002",
    timestamp: "2026-02-02T14:00:00Z",
    userId: "user-002",
    userName: "María García",
    action: "create",
    resource: "orders",
    resourceId: "ord-100",
    resourceName: "ORD-2026-00100",
    details: "Creación de nueva orden",
    ipAddress: "192.168.1.101",
  },
  {
    id: "audit-003",
    timestamp: "2026-02-02T13:45:00Z",
    userId: "user-001",
    userName: "Admin",
    action: "login",
    resource: "auth",
    details: "Inicio de sesión exitoso",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
];

/* ============================================
   SERVICIO
   ============================================ */

class SettingsService {
  private settings: SystemSettings = { ...mockSettings };
  private roles: Role[] = [...mockRoles];
  private integrations: Integration[] = [...mockIntegrations];
  private auditLog: AuditLogEntry[] = [...mockAuditLog];
  private useMocks: boolean;

  constructor() {
    this.useMocks = apiConfig.useMocks;
  }

  private async simulateDelay(ms: number = 200): Promise<void> {
    if (this.useMocks) {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private addAuditEntry(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
    this.auditLog.unshift({
      id: this.generateId("audit"),
      timestamp: new Date().toISOString(),
      ...entry,
    });
  }

  // ============================================
  // CONFIGURACIÓN GENERAL
  // ============================================

  async getAllSettings(): Promise<SystemSettings> {
    await this.simulateDelay();

    if (this.useMocks) {
      return { ...this.settings };
    }

    throw new Error("API not implemented");
  }

  async getSettingsByCategory<T extends keyof SystemSettings>(
    category: T
  ): Promise<SystemSettings[T]> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      return { ...this.settings[category] };
    }

    throw new Error("API not implemented");
  }

  async updateSettings(data: UpdateSettingsDTO): Promise<void> {
    await this.simulateDelay(300);

    if (this.useMocks) {
      const category = data.category as keyof SystemSettings;
      const oldSettings = { ...this.settings[category] };

      this.settings = {
        ...this.settings,
        [category]: {
          ...this.settings[category],
          ...data.settings,
        },
      };

      // Registrar en auditoría
      const changes = Object.entries(data.settings)
        .filter(([key, value]) => (oldSettings as Record<string, unknown>)[key] !== value)
        .map(([key, value]) => ({
          field: key,
          oldValue: (oldSettings as Record<string, unknown>)[key],
          newValue: value,
        }));

      this.addAuditEntry({
        userId: "current-user",
        userName: "Usuario Actual",
        action: "config",
        resource: "settings",
        resourceId: category,
        details: `Actualización de configuración: ${category}`,
        changes,
      });

      return;
    }

    throw new Error("API not implemented");
  }

  async resetSettings(category: SettingCategory): Promise<SystemSettings[keyof SystemSettings]> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const defaults = mockSettings[category as keyof SystemSettings];
      Object.assign(this.settings, { [category]: { ...defaults } });

      this.addAuditEntry({
        userId: "current-user",
        userName: "Usuario Actual",
        action: "config",
        resource: "settings",
        resourceId: category,
        details: `Restablecimiento de configuración: ${category}`,
      });

      return defaults;
    }

    throw new Error("API not implemented");
  }

  async exportSettings(): Promise<string> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      return JSON.stringify(this.settings, null, 2);
    }

    throw new Error("API not implemented");
  }

  async importSettings(json: string): Promise<void> {
    await this.simulateDelay(300);

    if (this.useMocks) {
      try {
        const imported = JSON.parse(json) as Partial<SystemSettings>;
        this.settings = {
          ...this.settings,
          ...imported,
        };

        this.addAuditEntry({
          userId: "current-user",
          userName: "Usuario Actual",
          action: "import",
          resource: "settings",
          details: "Importación de configuración",
        });
      } catch {
        throw new Error("JSON de configuración inválido");
      }
      return;
    }

    throw new Error("API not implemented");
  }

  // ============================================
  // ROLES Y PERMISOS
  // ============================================

  async getRoles(): Promise<Role[]> {
    await this.simulateDelay();

    if (this.useMocks) {
      return [...this.roles];
    }

    throw new Error("API not implemented");
  }

  async getRoleById(id: string): Promise<Role | null> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      return this.roles.find(r => r.id === id) || null;
    }

    throw new Error("API not implemented");
  }

  async createRole(data: CreateRoleDTO): Promise<Role> {
    await this.simulateDelay(300);

    if (this.useMocks) {
      const now = new Date().toISOString();
      const role: Role = {
        id: this.generateId("role"),
        code: data.code,
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        isSystem: false,
        isActive: true,
        userCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      this.roles.push(role);

      this.addAuditEntry({
        userId: "current-user",
        userName: "Usuario Actual",
        action: "create",
        resource: "roles",
        resourceId: role.id,
        resourceName: role.name,
        details: `Creación de rol: ${role.name}`,
      });

      return role;
    }

    throw new Error("API not implemented");
  }

  async updateRole(id: string, data: Partial<CreateRoleDTO>): Promise<Role> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const index = this.roles.findIndex(r => r.id === id);
      if (index === -1) throw new Error("Rol no encontrado");

      if (this.roles[index].isSystem) {
        throw new Error("No se puede modificar un rol del sistema");
      }

      this.roles[index] = {
        ...this.roles[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      this.addAuditEntry({
        userId: "current-user",
        userName: "Usuario Actual",
        action: "update",
        resource: "roles",
        resourceId: id,
        resourceName: this.roles[index].name,
        details: `Actualización de rol: ${this.roles[index].name}`,
      });

      return this.roles[index];
    }

    throw new Error("API not implemented");
  }

  async deleteRole(id: string): Promise<void> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const role = this.roles.find(r => r.id === id);
      if (!role) throw new Error("Rol no encontrado");
      if (role.isSystem) throw new Error("No se puede eliminar un rol del sistema");
      if (role.userCount > 0) throw new Error("No se puede eliminar un rol con usuarios asignados");

      this.roles = this.roles.filter(r => r.id !== id);

      this.addAuditEntry({
        userId: "current-user",
        userName: "Usuario Actual",
        action: "delete",
        resource: "roles",
        resourceId: id,
        resourceName: role.name,
        details: `Eliminación de rol: ${role.name}`,
      });

      return;
    }

    throw new Error("API not implemented");
  }

  // ============================================
  // INTEGRACIONES
  // ============================================

  async getIntegrations(): Promise<Integration[]> {
    await this.simulateDelay();

    if (this.useMocks) {
      return [...this.integrations];
    }

    throw new Error("API not implemented");
  }

  async getIntegrationById(id: string): Promise<Integration | null> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      return this.integrations.find(i => i.id === id) || null;
    }

    throw new Error("API not implemented");
  }

  async createIntegration(data: CreateIntegrationDTO): Promise<Integration> {
    await this.simulateDelay(300);

    if (this.useMocks) {
      const now = new Date().toISOString();
      const integration: Integration = {
        id: this.generateId("int"),
        code: data.code,
        name: data.name,
        description: data.description,
        type: data.type,
        status: "pending",
        config: data.config,
        credentials: data.credentials,
        baseUrl: data.baseUrl,
        webhookUrl: data.webhookUrl,
        syncIntervalMinutes: data.syncIntervalMinutes,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      };

      this.integrations.push(integration);

      this.addAuditEntry({
        userId: "current-user",
        userName: "Usuario Actual",
        action: "create",
        resource: "integrations",
        resourceId: integration.id,
        resourceName: integration.name,
        details: `Creación de integración: ${integration.name}`,
      });

      return integration;
    }

    throw new Error("API not implemented");
  }

  async updateIntegration(id: string, data: Partial<CreateIntegrationDTO>): Promise<Integration> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const index = this.integrations.findIndex(i => i.id === id);
      if (index === -1) throw new Error("Integración no encontrada");

      this.integrations[index] = {
        ...this.integrations[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return this.integrations[index];
    }

    throw new Error("API not implemented");
  }

  async toggleIntegration(id: string): Promise<Integration> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const index = this.integrations.findIndex(i => i.id === id);
      if (index === -1) throw new Error("Integración no encontrada");

      const newActive = !this.integrations[index].isActive;
      this.integrations[index] = {
        ...this.integrations[index],
        isActive: newActive,
        status: newActive ? "active" : "inactive",
        updatedAt: new Date().toISOString(),
      };

      return this.integrations[index];
    }

    throw new Error("API not implemented");
  }

  async testIntegration(id: string): Promise<{ success: boolean; message: string; responseTimeMs: number }> {
    await this.simulateDelay(500);

    if (this.useMocks) {
      const integration = this.integrations.find(i => i.id === id);
      if (!integration) throw new Error("Integración no encontrada");

      // Simular test
      const success = Math.random() > 0.2;
      const responseTimeMs = Math.floor(Math.random() * 300) + 50;

      if (success) {
        const index = this.integrations.findIndex(i => i.id === id);
        this.integrations[index].status = "active";
        this.integrations[index].lastSyncAt = new Date().toISOString();
      }

      return {
        success,
        message: success ? "Conexión exitosa" : "Error de conexión: timeout",
        responseTimeMs,
      };
    }

    throw new Error("API not implemented");
  }

  async syncIntegration(id: string): Promise<{ recordsSynced: number }> {
    await this.simulateDelay(1000);

    if (this.useMocks) {
      const integration = this.integrations.find(i => i.id === id);
      if (!integration) throw new Error("Integración no encontrada");

      const index = this.integrations.findIndex(i => i.id === id);
      this.integrations[index].lastSyncAt = new Date().toISOString();

      return { recordsSynced: Math.floor(Math.random() * 100) + 10 };
    }

    throw new Error("API not implemented");
  }

  async getIntegrationHealth(): Promise<IntegrationHealthStatus[]> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      return this.integrations.map(i => ({
        integrationId: i.id,
        integrationName: i.name,
        status: i.status,
        lastCheck: new Date().toISOString(),
        responseTimeMs: Math.floor(Math.random() * 200) + 30,
        errorRate: i.status === "active" ? Math.random() * 5 : 25 + Math.random() * 25,
        uptime: i.status === "active" ? 95 + Math.random() * 5 : 50 + Math.random() * 30,
      }));
    }

    throw new Error("API not implemented");
  }

  // ============================================
  // AUDITORÍA
  // ============================================

  async getAuditLog(
    filters: AuditLogFilters = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ data: AuditLogEntry[]; total: number }> {
    await this.simulateDelay();

    if (this.useMocks) {
      let filtered = [...this.auditLog];

      if (filters.userId) {
        filtered = filtered.filter(e => e.userId === filters.userId);
      }
      if (filters.action) {
        const actions = Array.isArray(filters.action) ? filters.action : [filters.action];
        filtered = filtered.filter(e => actions.includes(e.action));
      }
      if (filters.resource) {
        filtered = filtered.filter(e => e.resource === filters.resource);
      }
      if (filters.startDate) {
        filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(filters.startDate!));
      }
      if (filters.endDate) {
        filtered = filtered.filter(e => new Date(e.timestamp) <= new Date(filters.endDate!));
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(e =>
          e.userName.toLowerCase().includes(s) ||
          e.resource.toLowerCase().includes(s) ||
          e.details?.toLowerCase().includes(s)
        );
      }

      filtered.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const start = (page - 1) * pageSize;
      return {
        data: filtered.slice(start, start + pageSize),
        total: filtered.length,
      };
    }

    throw new Error("API not implemented");
  }

  async exportAuditLog(filters: AuditLogFilters = {}): Promise<string> {
    const result = await this.getAuditLog(filters, 1, 10000);
    return JSON.stringify(result.data, null, 2);
  }

  // ============================================
  // RESUMEN
  // ============================================

  async getSettingsOverview(): Promise<SettingsOverview> {
    await this.simulateDelay(300);

    if (this.useMocks) {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const entries24h = this.auditLog.filter(e => new Date(e.timestamp) >= last24h);
      const entries7d = this.auditLog.filter(e => new Date(e.timestamp) >= last7d);

      // Contar acciones
      const actionCounts = new Map<string, number>();
      const userCounts = new Map<string, { name: string; count: number }>();

      for (const entry of entries7d) {
        const actionCount = actionCounts.get(entry.action) || 0;
        actionCounts.set(entry.action, actionCount + 1);

        const userCount = userCounts.get(entry.userId) || { name: entry.userName, count: 0 };
        userCount.count++;
        userCounts.set(entry.userId, userCount);
      }

      return {
        lastUpdated: new Date().toISOString(),
        updatedBy: "Admin",
        totalSettings: 50,
        customizedSettings: 25,
        roles: {
          total: this.roles.length,
          active: this.roles.filter(r => r.isActive).length,
        },
        integrations: {
          total: this.integrations.length,
          active: this.integrations.filter(i => i.isActive).length,
          withErrors: this.integrations.filter(i => i.status === "error").length,
        },
        auditLog: {
          entriesLast24h: entries24h.length,
          entriesLast7d: entries7d.length,
          topActions: Array.from(actionCounts.entries())
            .map(([action, count]) => ({ action, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          topUsers: Array.from(userCounts.entries())
            .map(([userId, data]) => ({ userId, userName: data.name, count: data.count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
        },
      };
    }

    throw new Error("API not implemented");
  }
}

export const settingsService = new SettingsService();

export default settingsService;
