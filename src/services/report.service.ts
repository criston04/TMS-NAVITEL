/**
 * @fileoverview Servicio de Reportes
 * @module services/report.service
 * @description Gestiona la generación, programación y distribución de
 * reportes del TMS, incluyendo reportes operacionales, financieros y KPIs.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import { apiConfig } from "@/config/api.config";
import type {
  ReportDefinition,
  ReportTemplate,
  GeneratedReport,
  ReportSchedule,
  ReportUsageStats,
  OperationalReportData,
  FinancialReportData,
  GenerateReportRequest,
  CreateReportDefinitionDTO,
  CreateReportScheduleDTO,
  GeneratedReportFilters,
  ReportType,
  ReportStatus,
} from "@/types/report";

type RelativeDateRange = { unit: "days" | "weeks" | "months" | "quarters" | "years"; value: number };

/* ============================================
   DATOS MOCK
   ============================================ */

const mockDefinitions: ReportDefinition[] = [
  {
    id: "def-001",
    code: "RPT-OPS-DAILY",
    name: "Reporte Operacional Diario",
    description: "Resumen de operaciones del día",
    type: "operational",
    category: "Operaciones",
    dataSource: "orders",
    columns: [
      { id: "col-1", field: "orderNumber", header: "N° Orden", isVisible: true, format: "text" },
      { id: "col-2", field: "customerName", header: "Cliente", isVisible: true, format: "text" },
      { id: "col-3", field: "status", header: "Estado", isVisible: true, format: "text" },
      { id: "col-4", field: "deliveryDate", header: "Fecha Entrega", isVisible: true, format: "datetime" },
      { id: "col-5", field: "vehiclePlate", header: "Vehículo", isVisible: true, format: "text" },
      { id: "col-6", field: "driverName", header: "Conductor", isVisible: true, format: "text" },
    ],
    filters: [],
    isPublic: true,
    createdBy: "admin",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    usageCount: 125,
  },
  {
    id: "def-002",
    code: "RPT-FIN-MONTHLY",
    name: "Reporte Financiero Mensual",
    description: "Resumen financiero del mes",
    type: "financial",
    category: "Finanzas",
    dataSource: "invoices",
    columns: [
      { id: "col-1", field: "invoiceNumber", header: "N° Factura", isVisible: true, format: "text" },
      { id: "col-2", field: "customerName", header: "Cliente", isVisible: true, format: "text" },
      { id: "col-3", field: "total", header: "Total", isVisible: true, format: "currency", currency: "PEN" },
      { id: "col-4", field: "amountPaid", header: "Pagado", isVisible: true, format: "currency", currency: "PEN" },
      { id: "col-5", field: "status", header: "Estado", isVisible: true, format: "text" },
    ],
    filters: [],
    showTotals: true,
    isPublic: true,
    createdBy: "admin",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    usageCount: 89,
  },
  {
    id: "def-003",
    code: "RPT-FLEET-STATUS",
    name: "Estado de Flota",
    description: "Estado actual de todos los vehículos",
    type: "fleet",
    category: "Flota",
    dataSource: "vehicles",
    columns: [
      { id: "col-1", field: "plate", header: "Placa", isVisible: true, format: "text" },
      { id: "col-2", field: "model", header: "Modelo", isVisible: true, format: "text" },
      { id: "col-3", field: "status", header: "Estado", isVisible: true, format: "text" },
      { id: "col-4", field: "currentKm", header: "Km Actual", isVisible: true, format: "number" },
      { id: "col-5", field: "lastMaintenance", header: "Último Mtto", isVisible: true, format: "date" },
      { id: "col-6", field: "nextMaintenance", header: "Próximo Mtto", isVisible: true, format: "date" },
    ],
    filters: [],
    isPublic: true,
    createdBy: "admin",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    usageCount: 67,
  },
];

const mockTemplates: ReportTemplate[] = [
  {
    id: "tpl-001",
    name: "Órdenes por Período",
    type: "order",
    definition: {
      dataSource: "orders",
      columns: mockDefinitions[0].columns,
    },
    requiredParams: [
      { name: "dateRange", label: "Rango de Fechas", type: "dateRange", required: true },
      { 
        name: "status", 
        label: "Estado", 
        type: "multiSelect", 
        options: [
          { value: "pending", label: "Pendiente" },
          { value: "in_progress", label: "En Progreso" },
          { value: "completed", label: "Completado" },
        ],
        required: false 
      },
    ],
    defaultFormat: "pdf",
    availableFormats: ["pdf", "excel", "csv"],
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tpl-002",
    name: "Facturación por Cliente",
    type: "financial",
    definition: {
      dataSource: "invoices",
      columns: mockDefinitions[1].columns,
      showTotals: true,
    },
    requiredParams: [
      { name: "dateRange", label: "Rango de Fechas", type: "dateRange", required: true },
      { name: "customerId", label: "Cliente", type: "select", required: false },
    ],
    defaultFormat: "excel",
    availableFormats: ["pdf", "excel", "csv"],
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const mockGeneratedReports: GeneratedReport[] = [
  {
    id: "gen-001",
    definitionId: "def-001",
    name: "Reporte Operacional - Enero 2026",
    type: "operational",
    parameters: { month: "2026-01" },
    filters: [],
    dateRange: { start: "2026-01-01", end: "2026-01-31" },
    status: "completed",
    format: "pdf",
    fileUrl: "/reports/gen-001.pdf",
    fileSize: 245678,
    rowCount: 150,
    requestedAt: "2026-02-01T08:00:00Z",
    startedAt: "2026-02-01T08:00:01Z",
    completedAt: "2026-02-01T08:00:15Z",
    expiresAt: "2026-02-08T08:00:00Z",
    requestedBy: "admin",
  },
  {
    id: "gen-002",
    definitionId: "def-002",
    name: "Reporte Financiero - Enero 2026",
    type: "financial",
    parameters: { month: "2026-01" },
    filters: [],
    dateRange: { start: "2026-01-01", end: "2026-01-31" },
    status: "completed",
    format: "excel",
    fileUrl: "/reports/gen-002.xlsx",
    fileSize: 189456,
    rowCount: 45,
    requestedAt: "2026-02-01T09:00:00Z",
    startedAt: "2026-02-01T09:00:01Z",
    completedAt: "2026-02-01T09:00:08Z",
    expiresAt: "2026-02-08T09:00:00Z",
    requestedBy: "finance",
  },
];

const mockSchedules: ReportSchedule[] = [
  {
    id: "sch-001",
    definitionId: "def-001",
    name: "Reporte Operacional Diario",
    frequency: "daily",
    timeOfDay: "06:00",
    timezone: "America/Lima",
    parameters: {},
    relativeDateRange: { unit: "days", value: 1 },
    format: "pdf",
    recipients: ["operaciones@empresa.com", "gerencia@empresa.com"],
    sendEmpty: false,
    isActive: true,
    lastRunAt: "2026-02-02T06:00:00Z",
    nextRunAt: "2026-02-03T06:00:00Z",
    lastStatus: "completed",
    runCount: 33,
    createdBy: "admin",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-02-02T06:00:00Z",
  },
  {
    id: "sch-002",
    definitionId: "def-002",
    name: "Reporte Financiero Semanal",
    frequency: "weekly",
    dayOfWeek: 1, // Lunes
    timeOfDay: "08:00",
    timezone: "America/Lima",
    parameters: {},
    relativeDateRange: { unit: "weeks", value: 1 },
    format: "excel",
    recipients: ["finanzas@empresa.com"],
    sendEmpty: true,
    isActive: true,
    lastRunAt: "2026-01-27T08:00:00Z",
    nextRunAt: "2026-02-03T08:00:00Z",
    lastStatus: "completed",
    runCount: 5,
    createdBy: "admin",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-27T08:00:00Z",
  },
];

/* ============================================
   SERVICIO
   ============================================ */

class ReportService {
  private definitions: ReportDefinition[] = [...mockDefinitions];
  private templates: ReportTemplate[] = [...mockTemplates];
  private generatedReports: GeneratedReport[] = [...mockGeneratedReports];
  private schedules: ReportSchedule[] = [...mockSchedules];
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

  // ============================================
  // DEFINICIONES DE REPORTE
  // ============================================

  async getDefinitions(
    filters?: { type?: ReportType; category?: string; search?: string }
  ): Promise<ReportDefinition[]> {
    await this.simulateDelay();

    if (this.useMocks) {
      let filtered = [...this.definitions];

      if (filters?.type) {
        filtered = filtered.filter(d => d.type === filters.type);
      }
      if (filters?.category) {
        filtered = filtered.filter(d => d.category === filters.category);
      }
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(d =>
          d.name.toLowerCase().includes(s) ||
          d.code.toLowerCase().includes(s)
        );
      }

      return filtered.sort((a, b) => b.usageCount - a.usageCount);
    }

    throw new Error("API not implemented");
  }

  async getDefinitionById(id: string): Promise<ReportDefinition | null> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      return this.definitions.find(d => d.id === id) || null;
    }

    throw new Error("API not implemented");
  }

  async createDefinition(data: CreateReportDefinitionDTO): Promise<ReportDefinition> {
    await this.simulateDelay(300);

    if (this.useMocks) {
      const now = new Date().toISOString();
      const definition: ReportDefinition = {
        id: this.generateId("def"),
        ...data,
        columns: data.columns.map((col, idx) => ({
          ...col,
          id: `col-${idx + 1}`,
        })),
        filters: data.filters || [],
        charts: data.charts?.map((chart, idx) => ({
          ...chart,
          id: `chart-${idx + 1}`,
        })),
        isPublic: data.isPublic ?? true,
        createdBy: "current-user",
        createdAt: now,
        updatedAt: now,
        usageCount: 0,
      };

      this.definitions.push(definition);
      return definition;
    }

    throw new Error("API not implemented");
  }

  async updateDefinition(
    id: string,
    data: Partial<CreateReportDefinitionDTO>
  ): Promise<ReportDefinition> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const index = this.definitions.findIndex(d => d.id === id);
      if (index === -1) throw new Error("Definición no encontrada");

      const updatedData = { ...data };
      if (data.columns) {
        updatedData.columns = data.columns.map((col, idx) => ({
          ...col,
          id: `col-${idx + 1}`,
        }));
      }

      this.definitions[index] = {
        ...this.definitions[index],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      } as ReportDefinition;

      return this.definitions[index];
    }

    throw new Error("API not implemented");
  }

  async deleteDefinition(id: string): Promise<void> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const index = this.definitions.findIndex(d => d.id === id);
      if (index !== -1) {
        this.definitions.splice(index, 1);
      }
      return;
    }

    throw new Error("API not implemented");
  }

  // ============================================
  // PLANTILLAS
  // ============================================

  async getTemplates(type?: ReportType): Promise<ReportTemplate[]> {
    await this.simulateDelay();

    if (this.useMocks) {
      let filtered = this.templates.filter(t => t.isActive);

      if (type) {
        filtered = filtered.filter(t => t.type === type);
      }

      return filtered;
    }

    throw new Error("API not implemented");
  }

  async getTemplateById(id: string): Promise<ReportTemplate | null> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      return this.templates.find(t => t.id === id) || null;
    }

    throw new Error("API not implemented");
  }

  // ============================================
  // GENERACIÓN DE REPORTES
  // ============================================

  async generateReport(request: GenerateReportRequest): Promise<GeneratedReport> {
    await this.simulateDelay(500);

    if (this.useMocks) {
      const now = new Date().toISOString();
      const definition = request.definitionId
        ? this.definitions.find(d => d.id === request.definitionId)
        : null;

      const report: GeneratedReport = {
        id: this.generateId("gen"),
        definitionId: request.definitionId || "",
        templateId: request.templateId,
        name: request.name || definition?.name || "Reporte Personalizado",
        type: definition?.type || "custom",
        parameters: request.parameters || {},
        filters: request.filters || [],
        dateRange: request.dateRange,
        status: request.async ? "pending" : "completed",
        format: request.format,
        fileUrl: `/reports/${this.generateId("file")}.${request.format}`,
        fileSize: Math.floor(Math.random() * 500000) + 50000,
        rowCount: Math.floor(Math.random() * 500) + 10,
        requestedAt: now,
        startedAt: now,
        completedAt: request.async ? undefined : now,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        requestedBy: "current-user",
      };

      this.generatedReports.unshift(report);

      // Incrementar contador de uso
      if (definition) {
        const idx = this.definitions.findIndex(d => d.id === definition.id);
        if (idx !== -1) {
          this.definitions[idx].usageCount++;
          this.definitions[idx].lastUsedAt = now;
        }
      }

      // Simular generación async
      if (request.async) {
        setTimeout(() => {
          const idx = this.generatedReports.findIndex(r => r.id === report.id);
          if (idx !== -1) {
            this.generatedReports[idx] = {
              ...this.generatedReports[idx],
              status: "completed",
              completedAt: new Date().toISOString(),
            };
          }
        }, 3000);
      }

      return report;
    }

    throw new Error("API not implemented");
  }

  async getGeneratedReports(
    filters: GeneratedReportFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: GeneratedReport[]; total: number }> {
    await this.simulateDelay();

    if (this.useMocks) {
      let filtered = [...this.generatedReports];

      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(r => r.name.toLowerCase().includes(s));
      }
      if (filters.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        filtered = filtered.filter(r => types.includes(r.type));
      }
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        filtered = filtered.filter(r => statuses.includes(r.status));
      }
      if (filters.format) {
        const formats = Array.isArray(filters.format) ? filters.format : [filters.format];
        filtered = filtered.filter(r => formats.includes(r.format));
      }
      if (filters.startDate) {
        filtered = filtered.filter(r =>
          new Date(r.requestedAt) >= new Date(filters.startDate!)
        );
      }
      if (filters.endDate) {
        filtered = filtered.filter(r =>
          new Date(r.requestedAt) <= new Date(filters.endDate!)
        );
      }

      filtered.sort((a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );

      const start = (page - 1) * pageSize;
      return {
        data: filtered.slice(start, start + pageSize),
        total: filtered.length,
      };
    }

    throw new Error("API not implemented");
  }

  async getReportById(id: string): Promise<GeneratedReport | null> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      return this.generatedReports.find(r => r.id === id) || null;
    }

    throw new Error("API not implemented");
  }

  async getReportStatus(id: string): Promise<ReportStatus> {
    await this.simulateDelay(50);

    if (this.useMocks) {
      const report = this.generatedReports.find(r => r.id === id);
      return report?.status || "failed";
    }

    throw new Error("API not implemented");
  }

  async downloadReport(id: string): Promise<{ url: string; filename: string }> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      const report = this.generatedReports.find(r => r.id === id);
      if (!report || !report.fileUrl) {
        throw new Error("Reporte no encontrado o no disponible");
      }

      return {
        url: report.fileUrl,
        filename: `${report.name}.${report.format}`,
      };
    }

    throw new Error("API not implemented");
  }

  // ============================================
  // PROGRAMACIÓN DE REPORTES
  // ============================================

  async getSchedules(): Promise<ReportSchedule[]> {
    await this.simulateDelay();

    if (this.useMocks) {
      return [...this.schedules];
    }

    throw new Error("API not implemented");
  }

  async getScheduleById(id: string): Promise<ReportSchedule | null> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      return this.schedules.find(s => s.id === id) || null;
    }

    throw new Error("API not implemented");
  }

  async createSchedule(data: CreateReportScheduleDTO): Promise<ReportSchedule> {
    await this.simulateDelay(300);

    if (this.useMocks) {
      const now = new Date().toISOString();
      const schedule: ReportSchedule = {
        id: this.generateId("sch"),
        definitionId: data.definitionId,
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        dayOfWeek: data.dayOfWeek,
        dayOfMonth: data.dayOfMonth,
        timeOfDay: data.timeOfDay,
        timezone: data.timezone || "America/Lima",
        parameters: data.parameters || {},
        relativeDateRange: data.relativeDateRange as RelativeDateRange | undefined,
        format: data.format,
        recipients: data.recipients,
        sendEmpty: data.sendEmpty ?? false,
        isActive: true,
        nextRunAt: this.calculateNextRun(data),
        runCount: 0,
        createdBy: "current-user",
        createdAt: now,
        updatedAt: now,
      };

      this.schedules.push(schedule);
      return schedule;
    }

    throw new Error("API not implemented");
  }

  async updateSchedule(id: string, data: Partial<CreateReportScheduleDTO>): Promise<ReportSchedule> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const index = this.schedules.findIndex(s => s.id === id);
      if (index === -1) throw new Error("Programación no encontrada");

      const updatedScheduleData = { ...data };
      if (data.relativeDateRange) {
        updatedScheduleData.relativeDateRange = data.relativeDateRange as RelativeDateRange;
      }

      this.schedules[index] = {
        ...this.schedules[index],
        ...updatedScheduleData,
        updatedAt: new Date().toISOString(),
      } as ReportSchedule;

      return this.schedules[index];
    }

    throw new Error("API not implemented");
  }

  async toggleSchedule(id: string): Promise<ReportSchedule> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const index = this.schedules.findIndex(s => s.id === id);
      if (index === -1) throw new Error("Programación no encontrada");

      this.schedules[index] = {
        ...this.schedules[index],
        isActive: !this.schedules[index].isActive,
        updatedAt: new Date().toISOString(),
      };

      return this.schedules[index];
    }

    throw new Error("API not implemented");
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.simulateDelay(200);

    if (this.useMocks) {
      const index = this.schedules.findIndex(s => s.id === id);
      if (index !== -1) {
        this.schedules.splice(index, 1);
      }
      return;
    }

    throw new Error("API not implemented");
  }

  async runScheduleNow(id: string): Promise<GeneratedReport> {
    await this.simulateDelay(300);

    if (this.useMocks) {
      const schedule = this.schedules.find(s => s.id === id);
      if (!schedule) throw new Error("Programación no encontrada");

      return this.generateReport({
        definitionId: schedule.definitionId,
        parameters: schedule.parameters,
        format: schedule.format,
      });
    }

    throw new Error("API not implemented");
  }

  private calculateNextRun(data: CreateReportScheduleDTO): string {
    const now = new Date();
    const [hours, minutes] = data.timeOfDay.split(":").map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next.toISOString();
  }

  // ============================================
  // DATOS DE REPORTES
  // ============================================

  async getOperationalData(
    startDate: string,
    endDate: string
  ): Promise<OperationalReportData> {
    await this.simulateDelay(400);

    if (this.useMocks) {
      return {
        totalOrders: 450,
        completedOrders: 380,
        pendingOrders: 50,
        cancelledOrders: 20,
        completionRate: 84.4,
        onTimeDeliveries: 350,
        lateDeliveries: 30,
        onTimeRate: 92.1,
        avgDeliveryTime: 145,
        activeVehicles: 25,
        utilizationRate: 78.5,
        totalKmTraveled: 45000,
        avgKmPerVehicle: 1800,
        activeDrivers: 28,
        avgOrdersPerDriver: 13.6,
        topDrivers: [
          { driverId: "drv-001", name: "Juan Pérez", orders: 25 },
          { driverId: "drv-002", name: "María García", orders: 22 },
          { driverId: "drv-003", name: "Carlos López", orders: 20 },
        ],
        totalIncidents: 8,
        resolvedIncidents: 7,
        avgResolutionTime: 45,
        periodStart: startDate,
        periodEnd: endDate,
      };
    }

    throw new Error("API not implemented");
  }

  async getFinancialData(
    startDate: string,
    endDate: string
  ): Promise<FinancialReportData> {
    await this.simulateDelay(400);

    if (this.useMocks) {
      return {
        totalRevenue: 250000,
        revenueByService: [
          { service: "Transporte", amount: 180000 },
          { service: "Distribución", amount: 50000 },
          { service: "Servicios Adicionales", amount: 20000 },
        ],
        revenueByCustomer: [
          { customerId: "cust-001", name: "Alicorp S.A.A.", amount: 85000 },
          { customerId: "cust-002", name: "Gloria S.A.", amount: 65000 },
          { customerId: "cust-003", name: "Backus S.A.", amount: 55000 },
        ],
        totalInvoiced: 245000,
        totalCollected: 198000,
        totalPending: 32000,
        totalOverdue: 15000,
        collectionRate: 80.8,
        totalCosts: 165000,
        costsByCategory: [
          { category: "Combustible", amount: 65000 },
          { category: "Personal", amount: 55000 },
          { category: "Mantenimiento", amount: 25000 },
          { category: "Peajes", amount: 12000 },
          { category: "Otros", amount: 8000 },
        ],
        costsByVehicle: [
          { vehicleId: "veh-001", plate: "ABC-123", amount: 18000 },
          { vehicleId: "veh-002", plate: "XYZ-789", amount: 16500 },
        ],
        grossProfit: 85000,
        grossMargin: 34.0,
        netProfit: 68000,
        netMargin: 27.2,
        previousPeriodRevenue: 225000,
        revenueGrowth: 11.1,
        previousPeriodCosts: 155000,
        costGrowth: 6.5,
        periodStart: startDate,
        periodEnd: endDate,
      };
    }

    throw new Error("API not implemented");
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  async getUsageStats(): Promise<ReportUsageStats> {
    await this.simulateDelay(300);

    if (this.useMocks) {
      return {
        totalGenerated: this.generatedReports.length * 15,
        byType: [
          { type: "operational", count: 45 },
          { type: "financial", count: 35 },
          { type: "fleet", count: 25 },
          { type: "driver", count: 15 },
        ],
        byFormat: [
          { format: "pdf", count: 60 },
          { format: "excel", count: 45 },
          { format: "csv", count: 15 },
        ],
        byStatus: [
          { status: "completed", count: 110 },
          { status: "failed", count: 5 },
          { status: "pending", count: 5 },
        ],
        avgGenerationTime: 8.5,
        topReports: this.definitions
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, 5)
          .map(d => ({
            definitionId: d.id,
            name: d.name,
            count: d.usageCount,
          })),
        topUsers: [
          { userId: "admin", userName: "Administrador", count: 45 },
          { userId: "finance", userName: "Finanzas", count: 35 },
          { userId: "ops", userName: "Operaciones", count: 30 },
        ],
        dailyTrend: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          count: Math.floor(Math.random() * 15) + 5,
        })),
      };
    }

    throw new Error("API not implemented");
  }

  async getReportCategories(): Promise<string[]> {
    await this.simulateDelay(100);

    if (this.useMocks) {
      const categories = new Set(this.definitions.map(d => d.category));
      return Array.from(categories);
    }

    throw new Error("API not implemented");
  }
}

export const reportService = new ReportService();

export default reportService;
