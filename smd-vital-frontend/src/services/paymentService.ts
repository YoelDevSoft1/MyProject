// ========================================
// SERVICIO DE PAGOS
// ========================================

import { apiService } from './apiService';
import type { 
  Payment,
  PaginationInfo
} from '../types/models';
import type { ApiResponse, SearchOptions } from '../types/api-new';

export class PaymentService {
  private baseEndpoint = '/payments';

  // ===== OBTENER PAGOS =====
  async getPayments(
    filters?: {
      patient_id?: string;
      appointment_id?: string;
      status?: string;
      method?: string;
      date_from?: string;
      date_to?: string;
    },
    page: number = 1,
    limit: number = 10,
    sort?: { field: string; direction: 'asc' | 'desc' }
  ): Promise<ApiResponse<{ payments: Payment[]; pagination: PaginationInfo }>> {
    const params = {
      page,
      limit,
      ...filters,
      ...(sort && { sort_by: sort.field, sort_order: sort.direction }),
    };

    return apiService.get<{ payments: Payment[]; pagination: PaginationInfo }>(
      this.baseEndpoint,
      params
    );
  }

  // ===== OBTENER PAGO POR ID =====
  async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    return apiService.get<Payment>(`${this.baseEndpoint}/${id}`);
  }

  // ===== CREAR PAGO =====
  async createPayment(paymentData: Partial<Payment>): Promise<ApiResponse<Payment>> {
    return apiService.post<Payment>(this.baseEndpoint, paymentData);
  }

  // ===== ACTUALIZAR PAGO =====
  async updatePayment(id: string, paymentData: Partial<Payment>): Promise<ApiResponse<Payment>> {
    return apiService.put<Payment>(`${this.baseEndpoint}/${id}`, paymentData);
  }

  // ===== ELIMINAR PAGO =====
  async deletePayment(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // ===== OBTENER PAGOS DEL PACIENTE =====
  async getPatientPayments(patientId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ payments: Payment[]; pagination: PaginationInfo }>> {
    return apiService.get<{ payments: Payment[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/patient/${patientId}`,
      { page, limit }
    );
  }

  // ===== OBTENER PAGOS PENDIENTES =====
  async getPendingPayments(): Promise<ApiResponse<Payment[]>> {
    return apiService.get<Payment[]>(`${this.baseEndpoint}/pending`);
  }

  // ===== OBTENER PAGOS COMPLETADOS =====
  async getCompletedPayments(page: number = 1, limit: number = 10): Promise<ApiResponse<{ payments: Payment[]; pagination: PaginationInfo }>> {
    return apiService.get<{ payments: Payment[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/completed`,
      { page, limit }
    );
  }

  // ===== PROCESAR PAGO =====
  async processPayment(paymentId: string, paymentMethod: string, paymentData: any): Promise<ApiResponse<Payment>> {
    return apiService.post<Payment>(`${this.baseEndpoint}/${paymentId}/process`, {
      method: paymentMethod,
      ...paymentData,
    });
  }

  // ===== CONFIRMAR PAGO =====
  async confirmPayment(paymentId: string, transactionId: string): Promise<ApiResponse<Payment>> {
    return apiService.patch<Payment>(`${this.baseEndpoint}/${paymentId}/confirm`, {
      transaction_id: transactionId,
    });
  }

  // ===== CANCELAR PAGO =====
  async cancelPayment(paymentId: string, reason: string): Promise<ApiResponse<Payment>> {
    return apiService.patch<Payment>(`${this.baseEndpoint}/${paymentId}/cancel`, { reason });
  }

  // ===== REEMBOLSAR PAGO =====
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<ApiResponse<Payment>> {
    return apiService.post<Payment>(`${this.baseEndpoint}/${paymentId}/refund`, {
      amount,
      reason,
    });
  }

  // ===== BUSCAR PAGOS =====
  async searchPayments(searchOptions: SearchOptions): Promise<ApiResponse<{ payments: Payment[]; pagination: PaginationInfo }>> {
    return apiService.post<{ payments: Payment[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/search`,
      searchOptions
    );
  }

  // ===== OBTENER ESTADÍSTICAS DE PAGOS =====
  async getPaymentStats(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    total_payments: number;
    completed_payments: number;
    pending_payments: number;
    failed_payments: number;
    refunded_payments: number;
    total_revenue: number;
    revenue_this_period: number;
    payments_by_method: Record<string, number>;
    payments_by_status: Record<string, number>;
    average_payment_amount: number;
    payment_success_rate: number;
  }>> {
    return apiService.get<{
      total_payments: number;
      completed_payments: number;
      pending_payments: number;
      failed_payments: number;
      refunded_payments: number;
      total_revenue: number;
      revenue_this_period: number;
      payments_by_method: Record<string, number>;
      payments_by_status: Record<string, number>;
      average_payment_amount: number;
      payment_success_rate: number;
    }>(`${this.baseEndpoint}/stats`, { period });
  }

  // ===== OBTENER INGRESOS =====
  async getRevenue(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    total_revenue: number;
    revenue_this_period: number;
    revenue_growth: number;
    revenue_by_method: Record<string, number>;
    revenue_by_date: Array<{
      date: string;
      revenue: number;
      payments: number;
    }>;
  }>> {
    return apiService.get<{
      total_revenue: number;
      revenue_this_period: number;
      revenue_growth: number;
      revenue_by_method: Record<string, number>;
      revenue_by_date: Array<{
        date: string;
        revenue: number;
        payments: number;
      }>;
    }>(`${this.baseEndpoint}/revenue`, { period });
  }

  // ===== OBTENER PAGOS POR FECHA =====
  async getPaymentsByDate(date: string): Promise<ApiResponse<Payment[]>> {
    return apiService.get<Payment[]>(`${this.baseEndpoint}/date/${date}`);
  }

  // ===== OBTENER PAGOS POR MÉTODO =====
  async getPaymentsByMethod(method: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ payments: Payment[]; pagination: PaginationInfo }>> {
    return apiService.get<{ payments: Payment[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/method/${method}`,
      { page, limit }
    );
  }

  // ===== OBTENER PAGOS FALLIDOS =====
  async getFailedPayments(): Promise<ApiResponse<Payment[]>> {
    return apiService.get<Payment[]>(`${this.baseEndpoint}/failed`);
  }

  // ===== REINTENTAR PAGO FALLIDO =====
  async retryFailedPayment(paymentId: string): Promise<ApiResponse<Payment>> {
    return apiService.post<Payment>(`${this.baseEndpoint}/${paymentId}/retry`);
  }

  // ===== OBTENER HISTORIAL DE PAGOS =====
  async getPaymentHistory(paymentId: string): Promise<ApiResponse<Array<{
    id: string;
    action: string;
    description: string;
    changed_by: string;
    changed_at: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
  }>>> {
    return apiService.get<Array<{
      id: string;
      action: string;
      description: string;
      changed_by: string;
      changed_at: string;
      old_values?: Record<string, any>;
      new_values?: Record<string, any>;
    }>>(`${this.baseEndpoint}/${paymentId}/history`);
  }

  // ===== GENERAR COMPROBANTE =====
  async generateReceipt(paymentId: string): Promise<ApiResponse<{ receipt_url: string }>> {
    return apiService.get<{ receipt_url: string }>(`${this.baseEndpoint}/${paymentId}/receipt`);
  }

  // ===== ENVIAR COMPROBANTE POR EMAIL =====
  async emailReceipt(paymentId: string, email: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/${paymentId}/email-receipt`, { email });
  }

  // ===== OBTENER REPORTE DE PAGOS =====
  async getPaymentReport(
    startDate: string,
    endDate: string,
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
  ): Promise<ApiResponse<{ report_url: string }>> {
    return apiService.get<{ report_url: string }>(`${this.baseEndpoint}/report`, {
      start_date: startDate,
      end_date: endDate,
      format,
    });
  }

  // ===== CONFIGURAR MÉTODOS DE PAGO =====
  async configurePaymentMethods(methods: Array<{
    method: string;
    enabled: boolean;
    configuration: Record<string, any>;
  }>): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/configure-methods`, { methods });
  }

  // ===== OBTENER MÉTODOS DE PAGO DISPONIBLES =====
  async getAvailablePaymentMethods(): Promise<ApiResponse<Array<{
    method: string;
    enabled: boolean;
    configuration: Record<string, any>;
    fees: {
      fixed: number;
      percentage: number;
    };
  }>>> {
    return apiService.get<Array<{
      method: string;
      enabled: boolean;
      configuration: Record<string, any>;
      fees: {
        fixed: number;
        percentage: number;
      };
    }>>(`${this.baseEndpoint}/available-methods`);
  }
}

// ===== INSTANCIA SINGLETON =====
export const paymentService = new PaymentService();
