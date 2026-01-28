/**
 * @fileoverview Servicio de Clientes
 * 
 * Principio SRP: Solo maneja operaciones de Clientes.
 * Principio OCP: Extiende BaseService sin modificarlo.
 * 
 * @module services/master/customers.service
 */

import { BulkService } from "@/services/base.service";
import { API_ENDPOINTS } from "@/config/api.config";
import { Customer, CustomerStats } from "@/types/models";
import { customersMock } from "@/mocks/master";

/**
 * Servicio para gestión de Clientes
 * 
 * @example
 * const customers = await customersService.getAll({ page: 1, search: "alicorp" });
 * const customer = await customersService.getById("cust-001");
 */
class CustomersService extends BulkService<Customer> {
  constructor() {
    super(API_ENDPOINTS.master.customers, customersMock);
  }

  /**
   * Obtiene estadísticas de clientes
   */
  async getStats(): Promise<CustomerStats> {
    if (this.useMocks) {
      await this.simulateDelay(300);
      const active = this.mockData.filter((c) => c.status === "active").length;
      const inactive = this.mockData.filter((c) => c.status === "inactive").length;
      
      // Simular clientes nuevos este mes
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newThisMonth = this.mockData.filter(
        (c) => new Date(c.createdAt) >= thisMonth
      ).length;

      return {
        total: this.mockData.length,
        active,
        inactive,
        newThisMonth,
      };
    }

    return this.request<CustomerStats>("GET", `${this.endpoint}/stats`);
  }

  /**
   * Busca clientes por documento
   */
  async findByDocument(documentNumber: string): Promise<Customer | null> {
    if (this.useMocks) {
      await this.simulateDelay(300);
      return this.mockData.find((c) => c.documentNumber === documentNumber) || null;
    }

    return this.request<Customer | null>("GET", `${this.endpoint}/by-document/${documentNumber}`);
  }

  /**
   * Request helper para métodos adicionales
   */
  private async request<T>(method: string, endpoint: string, data?: unknown): Promise<T> {
    const { apiClient } = await import("@/lib/api");
    
    switch (method) {
      case "GET":
        return apiClient.get<T>(endpoint);
      case "POST":
        return apiClient.post<T>(endpoint, data);
      default:
        return apiClient.get<T>(endpoint);
    }
  }
}

/** Instancia singleton del servicio */
export const customersService = new CustomersService();
