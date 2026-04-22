export type AlertType =
  | 'low_stock'
  | 'no_movement'
  | 'slow_moving'
  | 'discrepancy'
  | 'inventory_update'
  | 'low_sales_30'
  | 'low_sales_60'
  | 'low_sales_90'
  | 'oversell_risk';

export interface Alert {
  id: number;
  productId: number;
  alertType: AlertType;
  isResolved: boolean;
  resolvedById: number | null;
  resolvedAt: string | null;
  createdAt: string;
  notes: string | null;
  createdById: number | null;
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  product?: {
    id: number;
    sku: string;
    name: string;
    reorderPoint: number;
    inventory?: {
      currentStock: number;
    };
  };
  resolvedBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateAlertDto {
  productId: number;
  alertType: AlertType;
  notes?: string;
}

export interface ResolveAlertDto {
  resolutionNotes?: string;
}

export interface QueryAlertsDto {
  productId?: number;
  alertType?: AlertType;
  isResolved?: boolean;
  page?: number;
  limit?: number;
}

export interface AlertsResponse {
  data: Alert[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AlertsSummary {
  total: number;
  unresolved: number;
  resolved: number;
  byType: {
    type: AlertType;
    total: string;
    unresolved: string;
  }[];
}

export interface CheckResult {
  lowStock: Alert[];
  noMovement: Alert[];
  slowMoving: Alert[];
  lowSales30: Alert[];
  lowSales60: Alert[];
  lowSales90: Alert[];
  discrepancy: Alert[];
  oversellRisk: Alert[];
}
