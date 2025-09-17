import { apiService } from './api';
import type { 
  Payment, 
  Invoice, 
  PaymentMethod, 
  PaginatedResponse 
} from '../types/api';

export class PaymentsService {
  private baseUrl = '/api/payments';

  async getPayments(params?: {
    page?: number;
    limit?: number;
    patient_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<Payment>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.patient_id) queryParams.append('patient_id', params.patient_id);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      return await apiService.get<PaginatedResponse<Payment>>(url);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async getPayment(id: string): Promise<Payment> {
    try {
      return await apiService.get<Payment>(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async processPayment(data: {
    patient_id: string;
    appointment_id?: string;
    amount: number;
    currency: 'COP' | 'USD';
    payment_method_id?: string;
    description: string;
  }): Promise<Payment> {
    try {
      return await apiService.post<Payment>(this.baseUrl, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async refundPayment(id: string, reason: string): Promise<Payment> {
    try {
      return await apiService.post<Payment>(`${this.baseUrl}/${id}/refund`, {
        reason,
      });
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Invoices
  async getInvoices(params?: {
    page?: number;
    limit?: number;
    patient_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<Invoice>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.patient_id) queryParams.append('patient_id', params.patient_id);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);

      const url = `${this.baseUrl}/invoices?${queryParams.toString()}`;
      return await apiService.get<PaginatedResponse<Invoice>>(url);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async getInvoice(id: string): Promise<Invoice> {
    try {
      return await apiService.get<Invoice>(`${this.baseUrl}/invoices/${id}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async createInvoice(data: {
    patient_id: string;
    appointment_id?: string;
    subtotal: number;
    tax_amount: number;
    description?: string;
    items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      total: number;
    }>;
  }): Promise<Invoice> {
    try {
      return await apiService.post<Invoice>(`${this.baseUrl}/invoices`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    try {
      return await apiService.put<Invoice>(`${this.baseUrl}/invoices/${id}`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await apiService.get<PaymentMethod[]>(`${this.baseUrl}/payment-methods`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async createPaymentMethod(data: {
    type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash';
    provider: string;
    last_four: string;
    expiry_month?: number;
    expiry_year?: number;
    is_default?: boolean;
  }): Promise<PaymentMethod> {
    try {
      return await apiService.post<PaymentMethod>(`${this.baseUrl}/payment-methods`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async updatePaymentMethod(id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    try {
      return await apiService.put<PaymentMethod>(`${this.baseUrl}/payment-methods/${id}`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async deletePaymentMethod(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/payment-methods/${id}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    try {
      return await apiService.patch<PaymentMethod>(`${this.baseUrl}/payment-methods/${id}/set-default`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }
}

export const paymentsService = new PaymentsService();
