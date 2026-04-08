import api from './axios';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductsQueryParams,
  PaginatedProducts,
} from '../types';

export const productsApi = {
  getAll: async (params?: ProductsQueryParams): Promise<PaginatedProducts> => {
    const response = await api.get<PaginatedProducts>('/products', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  getBySku: async (sku: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/sku/${sku}`);
    return response.data;
  },

  getByBarcode: async (barcode: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/barcode/${barcode}`);
    return response.data;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: number, data: UpdateProductDto): Promise<Product> => {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
