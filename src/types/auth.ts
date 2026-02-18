/**
 * @fileoverview Tipos de Autenticación, Roles y Permisos
 * Sistema TMS Navitel — Control de acceso basado en roles (RBAC)
 *
 * Jerarquía de roles:
 *   owner > admin > gerente_operaciones > despachador / gerente_finanzas / gerente_flota > operador_monitoreo > conductor
 *   (externos) empresa_cliente / operador_logistico
 *   (auditoría) auditor
 */

// ════════════════════════════════════════════════════════
// ROLES
// ════════════════════════════════════════════════════════

/**
 * Roles internos del sistema (personal de la empresa)
 */
export type InternalRole =
  | "owner"                 // Dueño / Gerente General
  | "admin"                 // Administrador de TI / Sistema
  | "gerente_operaciones"   // Jefe de Operaciones
  | "despachador"           // Coordinador / Despachador
  | "gerente_finanzas"      // Jefe de Finanzas / Contador
  | "gerente_flota"         // Jefe de Flota / Mantenimiento
  | "operador_monitoreo"    // Operador de Torre de Control
  | "conductor"             // Conductor / Chofer
  | "auditor";              // Auditor / Solo lectura

/**
 * Roles externos (acceso portal)
 */
export type ExternalRole =
  | "empresa_cliente"       // Cliente con acceso al portal
  | "operador_logistico";   // Transportista / Operador tercero

/**
 * Todos los roles del sistema
 */
export type UserRole = InternalRole | ExternalRole;

/**
 * Agrupación lógica de roles (útil para validaciones rápidas)
 */
export const ROLE_GROUPS = {
  /** Acceso total al sistema */
  SUPER: ["owner", "admin"] as const,
  /** Gestión operativa */
  OPERATIONS: ["owner", "admin", "gerente_operaciones", "despachador"] as const,
  /** Gestión financiera */
  FINANCE: ["owner", "admin", "gerente_finanzas"] as const,
  /** Gestión de flota */
  FLEET: ["owner", "admin", "gerente_flota"] as const,
  /** Monitoreo */
  MONITORING: ["owner", "admin", "gerente_operaciones", "despachador", "operador_monitoreo"] as const,
  /** Solo lectura general */
  READERS: ["owner", "admin", "gerente_operaciones", "despachador", "gerente_finanzas", "gerente_flota", "operador_monitoreo", "auditor"] as const,
  /** Internos (todos los de la empresa) */
  INTERNAL: ["owner", "admin", "gerente_operaciones", "despachador", "gerente_finanzas", "gerente_flota", "operador_monitoreo", "conductor", "auditor"] as const,
  /** Externos */
  EXTERNAL: ["empresa_cliente", "operador_logistico"] as const,
} as const;

// ════════════════════════════════════════════════════════
// PERMISOS
// ════════════════════════════════════════════════════════

/**
 * Recursos protegidos del sistema
 */
export type PermissionResource =
  // Operaciones
  | "orders"
  | "scheduling"
  | "workflows"
  | "incidents"
  | "bitacora"
  | "route_planner"
  // Monitoreo
  | "monitoring_control_tower"
  | "monitoring_retransmission"
  | "monitoring_historical"
  | "monitoring_multiwindow"
  | "monitoring_alerts"
  // Finanzas
  | "invoices"
  | "payments"
  | "costs"
  | "rates"
  | "finance_reports"
  // Mantenimiento
  | "work_orders"
  | "maintenance_schedules"
  | "inspections"
  | "parts_inventory"
  | "workshops"
  | "breakdowns"
  // Maestro
  | "customers"
  | "drivers"
  | "vehicles"
  | "operators"
  | "products"
  | "geofences"
  | "assignments"
  // Reportes
  | "reports"
  | "report_schedules"
  // Notificaciones
  | "notifications"
  | "notification_templates"
  // Configuración
  | "settings_general"
  | "settings_operations"
  | "settings_fleet"
  | "settings_finance"
  | "settings_notifications"
  | "settings_security"
  | "settings_appearance"
  | "roles"
  | "integrations"
  | "audit_log"
  // Plataforma
  | "subscription"
  | "billing";

/**
 * Acciones CRUD + extras
 */
export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "export"
  | "import"
  | "approve"
  | "assign";

/**
 * Permiso individual
 */
export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

/**
 * Definición completa de un rol con metadatos
 */
export interface RoleDefinition {
  /** Código del rol */
  code: UserRole;
  /** Nombre para mostrar */
  label: string;
  /** Descripción */
  description: string;
  /** Es un rol del sistema (no se puede eliminar) */
  isSystem: boolean;
  /** Nivel jerárquico (1 = más alto) */
  level: number;
  /** Categoría */
  category: "internal" | "external";
  /** Permisos del rol */
  permissions: Permission[];
}

// ════════════════════════════════════════════════════════
// USUARIO AUTENTICADO
// ════════════════════════════════════════════════════════

/**
 * Usuario del sistema con rol y permisos
 */
export interface AuthUser {
  /** ID único */
  id: string;
  /** Nombre completo */
  name: string;
  /** Email */
  email: string;
  /** Rol principal */
  role: UserRole;
  /** Avatar URL */
  avatar?: string;
  /** Teléfono */
  phone?: string;
  /** ID del tenant (multi-tenant) */
  tenantId: string;
  /** Nombre de la empresa del tenant */
  tenantName: string;
  /** Permisos efectivos (puede ser customizado por admin) */
  permissions?: Permission[];
  /** Si el usuario está activo */
  isActive: boolean;
  /** Último login */
  lastLoginAt?: string;
  /** Preferencias del usuario */
  preferences?: UserPreferences;
}

/**
 * Preferencias del usuario
 */
export interface UserPreferences {
  language: "es" | "en";
  timezone: string;
  theme: "light" | "dark" | "system";
  /** Módulo de inicio al hacer login */
  defaultModule?: string;
  /** Sidebar colapsado */
  sidebarCollapsed?: boolean;
}

// ════════════════════════════════════════════════════════
// DTOs DE AUTH
// ════════════════════════════════════════════════════════

/**
 * Payload de login
 */
export interface LoginDTO {
  email: string;
  password: string;
  /** Código de 2FA si está habilitado */
  twoFactorCode?: string;
  /** Recordar sesión */
  rememberMe?: boolean;
}

/**
 * Respuesta de login exitoso
 */
export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // segundos
  /** Si requiere 2FA antes de continuar */
  requires2FA?: boolean;
}

/**
 * Payload de registro (solo owner puede crear la empresa)
 */
export interface RegisterDTO {
  /** Datos de la empresa */
  company: {
    name: string;
    ruc: string;
    address: string;
    phone: string;
  };
  /** Datos del owner */
  user: {
    name: string;
    email: string;
    password: string;
    phone: string;
  };
}

/**
 * Payload para crear usuario (admin/owner)
 */
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  /** Permisos personalizados (si no se usa, hereda del rol) */
  customPermissions?: Permission[];
}

/**
 * Payload para actualizar usuario
 */
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
  customPermissions?: Permission[];
}

/**
 * Cambio de contraseña
 */
export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Recuperación de contraseña
 */
export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ════════════════════════════════════════════════════════
// DEFINICIÓN DE ROLES POR DEFECTO
// ════════════════════════════════════════════════════════

/**
 * Catálogo de roles del sistema con sus permisos predeterminados.
 *
 * Convención de permisos:
 *   - "full" = ["create", "read", "update", "delete", "export", "import", "approve", "assign"]
 *   - "manage" = ["create", "read", "update", "delete"]
 *   - "read" = ["read"]
 *   - "read_export" = ["read", "export"]
 */
export const DEFAULT_ROLES: RoleDefinition[] = [
  // ── OWNER ───────────────────────────────────────
  {
    code: "owner",
    label: "Dueño / Gerente General",
    description:
      "Control total del sistema incluyendo facturación de plataforma, suscripción y gestión de la empresa.",
    isSystem: true,
    level: 1,
    category: "internal",
    permissions: [
      // Todo
      { resource: "orders", actions: ["create", "read", "update", "delete", "export", "import", "approve", "assign"] },
      { resource: "scheduling", actions: ["create", "read", "update", "delete", "assign"] },
      { resource: "workflows", actions: ["create", "read", "update", "delete", "approve"] },
      { resource: "incidents", actions: ["create", "read", "update", "delete"] },
      { resource: "bitacora", actions: ["create", "read", "update", "delete"] },
      { resource: "route_planner", actions: ["create", "read", "update", "delete"] },
      { resource: "monitoring_control_tower", actions: ["read"] },
      { resource: "monitoring_retransmission", actions: ["read", "update"] },
      { resource: "monitoring_historical", actions: ["read", "export"] },
      { resource: "monitoring_multiwindow", actions: ["read"] },
      { resource: "monitoring_alerts", actions: ["create", "read", "update", "delete"] },
      { resource: "invoices", actions: ["create", "read", "update", "delete", "export", "approve"] },
      { resource: "payments", actions: ["create", "read", "update", "delete", "approve"] },
      { resource: "costs", actions: ["create", "read", "update", "delete"] },
      { resource: "rates", actions: ["create", "read", "update", "delete"] },
      { resource: "finance_reports", actions: ["read", "export"] },
      { resource: "work_orders", actions: ["create", "read", "update", "delete", "approve"] },
      { resource: "maintenance_schedules", actions: ["create", "read", "update", "delete"] },
      { resource: "inspections", actions: ["create", "read", "update", "delete"] },
      { resource: "parts_inventory", actions: ["create", "read", "update", "delete"] },
      { resource: "workshops", actions: ["create", "read", "update", "delete"] },
      { resource: "breakdowns", actions: ["create", "read", "update", "delete"] },
      { resource: "customers", actions: ["create", "read", "update", "delete", "export", "import"] },
      { resource: "drivers", actions: ["create", "read", "update", "delete", "export", "import"] },
      { resource: "vehicles", actions: ["create", "read", "update", "delete", "export", "import"] },
      { resource: "operators", actions: ["create", "read", "update", "delete"] },
      { resource: "products", actions: ["create", "read", "update", "delete"] },
      { resource: "geofences", actions: ["create", "read", "update", "delete"] },
      { resource: "assignments", actions: ["create", "read", "update", "delete"] },
      { resource: "reports", actions: ["create", "read", "update", "delete", "export"] },
      { resource: "report_schedules", actions: ["create", "read", "update", "delete"] },
      { resource: "notifications", actions: ["read", "update"] },
      { resource: "notification_templates", actions: ["create", "read", "update", "delete"] },
      { resource: "settings_general", actions: ["read", "update"] },
      { resource: "settings_operations", actions: ["read", "update"] },
      { resource: "settings_fleet", actions: ["read", "update"] },
      { resource: "settings_finance", actions: ["read", "update"] },
      { resource: "settings_notifications", actions: ["read", "update"] },
      { resource: "settings_security", actions: ["read", "update"] },
      { resource: "settings_appearance", actions: ["read", "update"] },
      { resource: "roles", actions: ["create", "read", "update", "delete"] },
      { resource: "integrations", actions: ["create", "read", "update", "delete"] },
      { resource: "audit_log", actions: ["read", "export"] },
      { resource: "subscription", actions: ["read", "update"] },
      { resource: "billing", actions: ["read", "update"] },
    ],
  },

  // ── ADMIN ───────────────────────────────────────
  {
    code: "admin",
    label: "Administrador del Sistema",
    description:
      "Administrador de TI. Configuración del sistema, roles, integraciones, usuarios. Todo excepto suscripción/facturación de plataforma.",
    isSystem: true,
    level: 2,
    category: "internal",
    permissions: [
      { resource: "orders", actions: ["create", "read", "update", "delete", "export", "import", "approve", "assign"] },
      { resource: "scheduling", actions: ["create", "read", "update", "delete", "assign"] },
      { resource: "workflows", actions: ["create", "read", "update", "delete", "approve"] },
      { resource: "incidents", actions: ["create", "read", "update", "delete"] },
      { resource: "bitacora", actions: ["create", "read", "update", "delete"] },
      { resource: "route_planner", actions: ["create", "read", "update", "delete"] },
      { resource: "monitoring_control_tower", actions: ["read"] },
      { resource: "monitoring_retransmission", actions: ["read", "update"] },
      { resource: "monitoring_historical", actions: ["read", "export"] },
      { resource: "monitoring_multiwindow", actions: ["read"] },
      { resource: "monitoring_alerts", actions: ["create", "read", "update", "delete"] },
      { resource: "invoices", actions: ["create", "read", "update", "delete", "export", "approve"] },
      { resource: "payments", actions: ["create", "read", "update", "delete", "approve"] },
      { resource: "costs", actions: ["create", "read", "update", "delete"] },
      { resource: "rates", actions: ["create", "read", "update", "delete"] },
      { resource: "finance_reports", actions: ["read", "export"] },
      { resource: "work_orders", actions: ["create", "read", "update", "delete", "approve"] },
      { resource: "maintenance_schedules", actions: ["create", "read", "update", "delete"] },
      { resource: "inspections", actions: ["create", "read", "update", "delete"] },
      { resource: "parts_inventory", actions: ["create", "read", "update", "delete"] },
      { resource: "workshops", actions: ["create", "read", "update", "delete"] },
      { resource: "breakdowns", actions: ["create", "read", "update", "delete"] },
      { resource: "customers", actions: ["create", "read", "update", "delete", "export", "import"] },
      { resource: "drivers", actions: ["create", "read", "update", "delete", "export", "import"] },
      { resource: "vehicles", actions: ["create", "read", "update", "delete", "export", "import"] },
      { resource: "operators", actions: ["create", "read", "update", "delete"] },
      { resource: "products", actions: ["create", "read", "update", "delete"] },
      { resource: "geofences", actions: ["create", "read", "update", "delete"] },
      { resource: "assignments", actions: ["create", "read", "update", "delete"] },
      { resource: "reports", actions: ["create", "read", "update", "delete", "export"] },
      { resource: "report_schedules", actions: ["create", "read", "update", "delete"] },
      { resource: "notifications", actions: ["read", "update"] },
      { resource: "notification_templates", actions: ["create", "read", "update", "delete"] },
      { resource: "settings_general", actions: ["read", "update"] },
      { resource: "settings_operations", actions: ["read", "update"] },
      { resource: "settings_fleet", actions: ["read", "update"] },
      { resource: "settings_finance", actions: ["read", "update"] },
      { resource: "settings_notifications", actions: ["read", "update"] },
      { resource: "settings_security", actions: ["read", "update"] },
      { resource: "settings_appearance", actions: ["read", "update"] },
      { resource: "roles", actions: ["create", "read", "update", "delete"] },
      { resource: "integrations", actions: ["create", "read", "update", "delete"] },
      { resource: "audit_log", actions: ["read", "export"] },
      // NO subscription / billing
    ],
  },

  // ── GERENTE DE OPERACIONES ──────────────────────
  {
    code: "gerente_operaciones",
    label: "Gerente de Operaciones",
    description:
      "Supervisa toda la operación: órdenes, programación, monitoreo, bitácora, incidencias, rutas. Puede aprobar y asignar.",
    isSystem: true,
    level: 3,
    category: "internal",
    permissions: [
      { resource: "orders", actions: ["create", "read", "update", "delete", "export", "import", "approve", "assign"] },
      { resource: "scheduling", actions: ["create", "read", "update", "delete", "assign"] },
      { resource: "workflows", actions: ["read", "update", "approve"] },
      { resource: "incidents", actions: ["create", "read", "update", "delete"] },
      { resource: "bitacora", actions: ["create", "read", "update"] },
      { resource: "route_planner", actions: ["create", "read", "update", "delete"] },
      { resource: "monitoring_control_tower", actions: ["read"] },
      { resource: "monitoring_retransmission", actions: ["read", "update"] },
      { resource: "monitoring_historical", actions: ["read", "export"] },
      { resource: "monitoring_multiwindow", actions: ["read"] },
      { resource: "monitoring_alerts", actions: ["create", "read", "update", "delete"] },
      { resource: "customers", actions: ["read"] },
      { resource: "drivers", actions: ["read"] },
      { resource: "vehicles", actions: ["read"] },
      { resource: "operators", actions: ["read"] },
      { resource: "geofences", actions: ["read"] },
      { resource: "assignments", actions: ["create", "read", "update"] },
      { resource: "reports", actions: ["read", "export"] },
      { resource: "notifications", actions: ["read", "update"] },
    ],
  },

  // ── DESPACHADOR ─────────────────────────────────
  {
    code: "despachador",
    label: "Despachador / Coordinador",
    description:
      "Gestión operativa del día a día: crea y programa órdenes, asigna recursos, monitorea flota.",
    isSystem: true,
    level: 4,
    category: "internal",
    permissions: [
      { resource: "orders", actions: ["create", "read", "update", "export", "import", "assign"] },
      { resource: "scheduling", actions: ["create", "read", "update", "assign"] },
      { resource: "workflows", actions: ["read", "update"] },
      { resource: "incidents", actions: ["create", "read", "update"] },
      { resource: "bitacora", actions: ["create", "read", "update"] },
      { resource: "route_planner", actions: ["create", "read", "update"] },
      { resource: "monitoring_control_tower", actions: ["read"] },
      { resource: "monitoring_retransmission", actions: ["read"] },
      { resource: "monitoring_historical", actions: ["read", "export"] },
      { resource: "monitoring_multiwindow", actions: ["read"] },
      { resource: "monitoring_alerts", actions: ["read"] },
      { resource: "customers", actions: ["read"] },
      { resource: "drivers", actions: ["read"] },
      { resource: "vehicles", actions: ["read"] },
      { resource: "operators", actions: ["read"] },
      { resource: "geofences", actions: ["read"] },
      { resource: "assignments", actions: ["create", "read", "update"] },
      { resource: "reports", actions: ["read", "export"] },
      { resource: "notifications", actions: ["read", "update"] },
    ],
  },

  // ── GERENTE DE FINANZAS ─────────────────────────
  {
    code: "gerente_finanzas",
    label: "Gerente de Finanzas / Contador",
    description:
      "Gestión financiera completa: facturación, cobros, costos, tarifas, reportes financieros.",
    isSystem: true,
    level: 4,
    category: "internal",
    permissions: [
      { resource: "invoices", actions: ["create", "read", "update", "delete", "export", "approve"] },
      { resource: "payments", actions: ["create", "read", "update", "delete", "approve"] },
      { resource: "costs", actions: ["create", "read", "update", "delete", "export"] },
      { resource: "rates", actions: ["create", "read", "update", "delete"] },
      { resource: "finance_reports", actions: ["read", "export"] },
      { resource: "orders", actions: ["read"] },
      { resource: "customers", actions: ["read"] },
      { resource: "reports", actions: ["read", "export"] },
      { resource: "report_schedules", actions: ["create", "read", "update", "delete"] },
      { resource: "settings_finance", actions: ["read", "update"] },
      { resource: "notifications", actions: ["read", "update"] },
    ],
  },

  // ── GERENTE DE FLOTA ────────────────────────────
  {
    code: "gerente_flota",
    label: "Gerente de Flota / Mantenimiento",
    description:
      "Gestión de flota vehicular: vehículos, conductores, mantenimiento, inspecciones, inventario de repuestos.",
    isSystem: true,
    level: 4,
    category: "internal",
    permissions: [
      { resource: "vehicles", actions: ["create", "read", "update", "delete", "export", "import"] },
      { resource: "drivers", actions: ["create", "read", "update", "delete", "export", "import"] },
      { resource: "work_orders", actions: ["create", "read", "update", "delete", "approve"] },
      { resource: "maintenance_schedules", actions: ["create", "read", "update", "delete"] },
      { resource: "inspections", actions: ["create", "read", "update", "delete"] },
      { resource: "parts_inventory", actions: ["create", "read", "update", "delete"] },
      { resource: "workshops", actions: ["create", "read", "update", "delete"] },
      { resource: "breakdowns", actions: ["create", "read", "update", "delete"] },
      { resource: "operators", actions: ["read"] },
      { resource: "assignments", actions: ["create", "read", "update"] },
      { resource: "reports", actions: ["read", "export"] },
      { resource: "settings_fleet", actions: ["read", "update"] },
      { resource: "notifications", actions: ["read", "update"] },
    ],
  },

  // ── OPERADOR DE MONITOREO ───────────────────────
  {
    code: "operador_monitoreo",
    label: "Operador de Torre de Control",
    description:
      "Monitoreo en tiempo real de la flota: torre de control, retransmisión, rastreo histórico, multiventana, alertas.",
    isSystem: true,
    level: 5,
    category: "internal",
    permissions: [
      { resource: "monitoring_control_tower", actions: ["read"] },
      { resource: "monitoring_retransmission", actions: ["read", "update"] },
      { resource: "monitoring_historical", actions: ["read", "export"] },
      { resource: "monitoring_multiwindow", actions: ["read"] },
      { resource: "monitoring_alerts", actions: ["read", "update"] },
      { resource: "orders", actions: ["read"] },
      { resource: "bitacora", actions: ["create", "read", "update"] },
      { resource: "vehicles", actions: ["read"] },
      { resource: "drivers", actions: ["read"] },
      { resource: "geofences", actions: ["read"] },
      { resource: "notifications", actions: ["read", "update"] },
    ],
  },

  // ── CONDUCTOR ───────────────────────────────────
  {
    code: "conductor",
    label: "Conductor / Chofer",
    description:
      "Acceso limitado: solo sus órdenes asignadas, puede reportar incidencias y ver su información personal.",
    isSystem: true,
    level: 6,
    category: "internal",
    permissions: [
      // Solo sus órdenes asignadas (filtro: driverId = userId)
      { resource: "orders", actions: ["read", "update"] },
      { resource: "incidents", actions: ["create", "read"] },
      { resource: "notifications", actions: ["read", "update"] },
    ],
  },

  // ── AUDITOR ─────────────────────────────────────
  {
    code: "auditor",
    label: "Auditor / Solo Lectura",
    description:
      "Acceso de solo lectura a todos los módulos del sistema para fines de auditoría y cumplimiento.",
    isSystem: true,
    level: 7,
    category: "internal",
    permissions: [
      { resource: "orders", actions: ["read", "export"] },
      { resource: "scheduling", actions: ["read"] },
      { resource: "workflows", actions: ["read"] },
      { resource: "incidents", actions: ["read"] },
      { resource: "bitacora", actions: ["read"] },
      { resource: "route_planner", actions: ["read"] },
      { resource: "monitoring_control_tower", actions: ["read"] },
      { resource: "monitoring_retransmission", actions: ["read"] },
      { resource: "monitoring_historical", actions: ["read", "export"] },
      { resource: "monitoring_multiwindow", actions: ["read"] },
      { resource: "monitoring_alerts", actions: ["read"] },
      { resource: "invoices", actions: ["read", "export"] },
      { resource: "payments", actions: ["read"] },
      { resource: "costs", actions: ["read", "export"] },
      { resource: "rates", actions: ["read"] },
      { resource: "finance_reports", actions: ["read", "export"] },
      { resource: "work_orders", actions: ["read"] },
      { resource: "maintenance_schedules", actions: ["read"] },
      { resource: "inspections", actions: ["read"] },
      { resource: "parts_inventory", actions: ["read"] },
      { resource: "workshops", actions: ["read"] },
      { resource: "breakdowns", actions: ["read"] },
      { resource: "customers", actions: ["read"] },
      { resource: "drivers", actions: ["read"] },
      { resource: "vehicles", actions: ["read"] },
      { resource: "operators", actions: ["read"] },
      { resource: "products", actions: ["read"] },
      { resource: "geofences", actions: ["read"] },
      { resource: "assignments", actions: ["read"] },
      { resource: "reports", actions: ["read", "export"] },
      { resource: "report_schedules", actions: ["read"] },
      { resource: "notifications", actions: ["read"] },
      { resource: "audit_log", actions: ["read", "export"] },
    ],
  },

  // ── EMPRESA CLIENTE (EXTERNO) ───────────────────
  {
    code: "empresa_cliente",
    label: "Cliente (Portal Externo)",
    description:
      "Acceso al portal de clientes: ve sus órdenes, facturas y reportes filtrados por su empresa.",
    isSystem: true,
    level: 8,
    category: "external",
    permissions: [
      // Filtrado por customerId del tenant externo
      { resource: "orders", actions: ["read"] },
      { resource: "invoices", actions: ["read"] },
      { resource: "monitoring_control_tower", actions: ["read"] },
      { resource: "reports", actions: ["read"] },
      { resource: "notifications", actions: ["read", "update"] },
    ],
  },

  // ── OPERADOR LOGÍSTICO (EXTERNO) ────────────────
  {
    code: "operador_logistico",
    label: "Operador Logístico (Tercero)",
    description:
      "Transportista o socio externo: accede a las órdenes asignadas a su empresa y actualiza estados.",
    isSystem: true,
    level: 8,
    category: "external",
    permissions: [
      // Filtrado por carrierId del operador
      { resource: "orders", actions: ["read", "update"] },
      { resource: "monitoring_control_tower", actions: ["read"] },
      { resource: "drivers", actions: ["read"] },
      { resource: "vehicles", actions: ["read"] },
      { resource: "notifications", actions: ["read", "update"] },
    ],
  },
];

// ════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════

/**
 * Verifica si un rol tiene acceso a una acción sobre un recurso
 */
export function hasPermission(
  role: UserRole,
  resource: PermissionResource,
  action: PermissionAction,
  customPermissions?: Permission[]
): boolean {
  // Si hay permisos personalizados, usar esos
  const permissions =
    customPermissions ??
    DEFAULT_ROLES.find((r) => r.code === role)?.permissions ??
    [];

  const perm = permissions.find((p) => p.resource === resource);
  return perm ? perm.actions.includes(action) : false;
}

/**
 * Verifica si un rol pertenece a un grupo
 */
export function isInGroup(
  role: UserRole,
  group: keyof typeof ROLE_GROUPS
): boolean {
  return (ROLE_GROUPS[group] as readonly string[]).includes(role);
}

/**
 * Obtiene la definición completa de un rol
 */
export function getRoleDefinition(role: UserRole): RoleDefinition | undefined {
  return DEFAULT_ROLES.find((r) => r.code === role);
}

/**
 * Verifica si un rol puede gestionar a otro (jerarquía)
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  const manager = DEFAULT_ROLES.find((r) => r.code === managerRole);
  const target = DEFAULT_ROLES.find((r) => r.code === targetRole);
  if (!manager || !target) return false;
  return manager.level < target.level;
}
