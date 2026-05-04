import api from './axios';
import type {
  Alert,
  CreateAlertDto,
  ResolveAlertDto,
  QueryAlertsDto,
  AlertsResponse,
  AlertsSummary,
} from '../types';

export const alertsApi = {
  getAll: async (params?: QueryAlertsDto): Promise<AlertsResponse> => {
    const response = await api.get<AlertsResponse>('/alerts', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Alert> => {
    const response = await api.get<Alert>(`/alerts/${id}`);
    return response.data;
  },

  getUnresolved: async (): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/alerts/unresolved');
    return response.data;
  },

  getSummary: async (): Promise<AlertsSummary> => {
    const response = await api.get<AlertsSummary>('/alerts/summary');
    return response.data;
  },

  create: async (data: CreateAlertDto): Promise<Alert> => {
    const response = await api.post<Alert>('/alerts', data);
    return response.data;
  },

  resolve: async (id: number, data?: ResolveAlertDto): Promise<Alert> => {
    const response = await api.patch<Alert>(`/alerts/${id}/resolve`, data || {});
    return response.data;
  },

  runCheck: async (): Promise<{ lowStock: Alert[]; noMovement: Alert[]; slowMoving: Alert[] }> => {
    const response = await api.post<{ lowStock: Alert[]; noMovement: Alert[]; slowMoving: Alert[] }>('/alerts/check');
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/alerts/${id}`);
  },
};
