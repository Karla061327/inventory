import api from './axios';
import type {
  Inventory,
  CreateInventoryEntryDto,
  CreateInventoryExitDto,
  CreateInventoryAdjustmentDto,
  QueryMovementsDto,
  InventoryResponse,
  MovementsResponse,
  InventoryMovement,
} from '../types';

export const inventoryApi = {
  getAll: async (): Promise<InventoryResponse> => {
    const response = await api.get<InventoryResponse>('/inventory');
    return response.data;
  },

  getStock: async (productId: number): Promise<Inventory> => {
    const response = await api.get<Inventory>(`/inventory/stock/${productId}`);
    return response.data;
  },

  createEntry: async (data: CreateInventoryEntryDto): Promise<InventoryMovement> => {
    const response = await api.post<InventoryMovement>('/inventory/entry', data);
    return response.data;
  },

  createExit: async (data: CreateInventoryExitDto): Promise<InventoryMovement> => {
    const response = await api.post<InventoryMovement>('/inventory/exit', data);
    return response.data;
  },

  createAdjustment: async (data: CreateInventoryAdjustmentDto): Promise<InventoryMovement> => {
    const response = await api.post<InventoryMovement>('/inventory/adjustment', data);
    return response.data;
  },

  getMovements: async (params?: QueryMovementsDto): Promise<MovementsResponse> => {
    const response = await api.get<MovementsResponse>('/inventory/movements', { params });
    return response.data;
  },
};
