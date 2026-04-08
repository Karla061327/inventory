export type MovementType = 'entry' | 'sale' | 'adjustment' | 'damaged' | 'loss';

export interface Inventory {
  id: number;
  productId: number;
  currentStock: number;
  lastMovementAt: string | null;
  updatedAt: string;
  product?: {
    id: number;
    sku: string;
    name: string;
    reorderPoint: number;
    costPrice: number;
    salePrice: number;
    status: string;
    category?: {
      id: number;
      name: string;
    };
    supplier?: {
      id: number;
      name: string;
    };
  };
}

export interface InventoryMovement {
  id: number;
  productId: number;
  movementType: MovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceDoc: string | null;
  notes: string | null;
  createdById: number;
  createdAt: string;
  product?: {
    id: number;
    sku: string;
    name: string;
  };
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateInventoryEntryDto {
  productId: number;
  quantity: number;
  referenceDoc?: string;
  notes?: string;
  supplierId?: number;
}

export interface CreateInventoryExitDto {
  productId: number;
  quantity: number;
  exitType: 'sale' | 'damaged' | 'loss';
  referenceDoc?: string;
  notes?: string;
}

export interface CreateInventoryAdjustmentDto {
  productId: number;
  newQuantity: number;
  reason: string;
  imageUrl?: string;
}

export interface QueryMovementsDto {
  productId?: number;
  movementType?: MovementType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface InventoryResponse {
  data: Inventory[];
  summary: {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
  };
}

export interface MovementsResponse {
  data: InventoryMovement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
