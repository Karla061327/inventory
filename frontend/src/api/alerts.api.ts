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
    const response = await api.get<AlertsResponse>('/api/alerts', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Alert> => {
    const response = await api.get<Alert>(`/api/alerts/${id}`);
    return response.data;
  },

  getUnresolved: async (): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/api/alerts/unresolved');
    return response.data;
  },

  getSummary: async (): Promise<AlertsSummary> => {
    const response = await api.get<AlertsSummary>('/api/alerts/summary');
    return response.data;
  },

  create: async (data: CreateAlertDto): Promise<Alert> => {
    const response = await api.post<Alert>('/api/alerts', data);
    return response.data;
  },

  resolve: async (id: number, data?: ResolveAlertDto): Promise<Alert> => {
    const response = await api.patch<Alert>(`/api/alerts/${id}/resolve`, data || {});
    return response.data;
  },

  runCheck: async (): Promise<{ lowStock: Alert[]; noMovement: Alert[]; slowMoving: Alert[] }> => {
    const response = await api.post<{ lowStock: Alert[]; noMovement: Alert[]; slowMoving: Alert[] }>('/api/alerts/check');
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/alerts/${id}`);
  },
};
