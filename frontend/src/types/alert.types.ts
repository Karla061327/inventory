export type AlertType = 'low_stock' | 'no_movement' | 'slow_moving' | 'discrepancy' | 'inventory_update';

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
    total: number;
    unresolved: number;
  }[];
}
