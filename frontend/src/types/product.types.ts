export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export interface Product {
  id: number;
  sku: string;
  name: string;
  barcode: string | null;
  description: string | null;
  categoryId: number | null;
  costPrice: number;
  salePrice: number;
  reorderPoint: number;
  status: ProductStatus;
  imageUrl: string | null;
  supplierId: number | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
  supplier?: {
    id: number;
    name: string;
  };
}

export interface CreateProductDto {
  sku: string;
  name: string;
  barcode?: string;
  description?: string;
  categoryId?: number;
  costPrice: number;
  salePrice: number;
  reorderPoint?: number;
  status?: ProductStatus;
  imageUrl?: string;
  supplierId?: number;
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  barcode?: string;
  description?: string;
  categoryId?: number;
  costPrice?: number;
  salePrice?: number;
  reorderPoint?: number;
  status?: ProductStatus;
  imageUrl?: string;
  supplierId?: number;
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  supplierId?: number;
  status?: ProductStatus;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
