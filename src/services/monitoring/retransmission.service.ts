/**
 * @fileoverview Servicio de Retransmisión
 * 
 * @module services/monitoring/retransmission.service
 * @description Maneja la consulta y actualización de registros de retransmisión GPS
 */

import type { 
  RetransmissionRecord, 
  RetransmissionStats, 
  RetransmissionFilters,
  GpsCompany 
} from "@/types/monitoring";
import { 
  retransmissionMock, 
  generateRetransmissionStats,
  filterRetransmissionRecords,
  updateRetransmissionComment 
} from "@/mocks/monitoring/retransmission.mock";
import { gpsCompaniesMock, getActiveGpsCompanies } from "@/mocks/monitoring/gps-companies.mock";
import { apiConfig } from "@/config/api.config";

/**
 * Servicio de Retransmisión
 * Maneja consultas y actualizaciones de estado de retransmisión GPS
 */
export class RetransmissionService {
  private readonly useMocks: boolean;
  private readonly endpoint = "/monitoring/retransmission";

  constructor() {
    this.useMocks = apiConfig.useMocks;
  }

  /**
   * Simula delay de red para mocks
   */
  private async simulateDelay(ms: number = 300): Promise<void> {
    if (this.useMocks) {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  /**
   * Obtiene todos los registros de retransmisión con filtros opcionales
   */
  async getAll(filters?: RetransmissionFilters): Promise<RetransmissionRecord[]> {
    if (this.useMocks) {
      await this.simulateDelay();
      
      if (!filters) {
        return [...retransmissionMock];
      }
      
      return filterRetransmissionRecords(retransmissionMock, {
        vehicleSearch: filters.vehicleSearch,
        companyId: filters.companyId,
        movementStatus: filters.movementStatus,
        retransmissionStatus: filters.retransmissionStatus,
        gpsCompanyId: filters.gpsCompanyId,
        hasComments: filters.hasComments,
      });
    }

    // TODO: Implementar llamada a API real
    throw new Error("API not implemented");
  }

  /**
   * Obtiene un registro por ID
   */
  async getById(id: string): Promise<RetransmissionRecord | null> {
    if (this.useMocks) {
      await this.simulateDelay(200);
      const record = retransmissionMock.find(r => r.id === id);
      return record || null;
    }

    throw new Error("API not implemented");
  }

  /**
   * Actualiza el comentario de un registro
   */
  async updateComment(recordId: string, comment: string): Promise<RetransmissionRecord> {
    if (this.useMocks) {
      await this.simulateDelay(400);
      const record = updateRetransmissionComment(recordId, comment);
      
      if (!record) {
        throw new Error(`Record not found: ${recordId}`);
      }
      
      return record;
    }

    throw new Error("API not implemented");
  }

  /**
   * Obtiene estadísticas de retransmisión
   */
  async getStats(filters?: RetransmissionFilters): Promise<RetransmissionStats> {
    if (this.useMocks) {
      await this.simulateDelay(200);
      
      const records = filters 
        ? filterRetransmissionRecords(retransmissionMock, filters)
        : retransmissionMock;
        
      return generateRetransmissionStats(records);
    }

    throw new Error("API not implemented");
  }

  /**
   * Obtiene lista de empresas GPS
   */
  async getGpsCompanies(): Promise<GpsCompany[]> {
    if (this.useMocks) {
      await this.simulateDelay(100);
      return [...gpsCompaniesMock];
    }

    throw new Error("API not implemented");
  }

  /**
   * Obtiene solo empresas GPS activas
   */
  async getActiveGpsCompanies(): Promise<GpsCompany[]> {
    if (this.useMocks) {
      await this.simulateDelay(100);
      return getActiveGpsCompanies();
    }

    throw new Error("API not implemented");
  }

  /**
   * Obtiene lista única de empresas/operadores en los registros
   */
  async getCompanies(): Promise<string[]> {
    if (this.useMocks) {
      await this.simulateDelay(100);
      const companies = new Set(retransmissionMock.map(r => r.companyName));
      return Array.from(companies).sort();
    }

    throw new Error("API not implemented");
  }

  /**
   * Exporta registros de retransmisión a CSV
   */
  async exportToCSV(filters?: RetransmissionFilters): Promise<Blob> {
    const records = await this.getAll(filters);
    
    const headers = [
      "ID",
      "Placa",
      "Empresa",
      "GPS Provider",
      "Última Conexión",
      "Estado Movimiento",
      "Estado Retransmisión",
      "Duración Sin Conexión (seg)",
      "Comentarios"
    ].join(",");
    
    const rows = records.map(record => [
      record.id,
      record.vehiclePlate,
      `"${record.companyName}"`,
      record.gpsCompanyName,
      record.lastConnection,
      record.movementStatus,
      record.retransmissionStatus,
      record.disconnectedDuration,
      `"${record.comments || ""}"`,
    ].join(","));
    
    const csv = [headers, ...rows].join("\n");
    return new Blob([csv], { type: "text/csv;charset=utf-8;" });
  }

  /**
   * Marca múltiples registros con el mismo comentario
   */
  async bulkUpdateComments(recordIds: string[], comment: string): Promise<RetransmissionRecord[]> {
    if (this.useMocks) {
      await this.simulateDelay(500);
      
      const updatedRecords: RetransmissionRecord[] = [];
      
      for (const recordId of recordIds) {
        const record = updateRetransmissionComment(recordId, comment);
        if (record) {
          updatedRecords.push(record);
        }
      }
      
      return updatedRecords;
    }

    throw new Error("API not implemented");
  }
}

/**
 * Singleton del servicio de retransmisión
 */
export const retransmissionService = new RetransmissionService();
