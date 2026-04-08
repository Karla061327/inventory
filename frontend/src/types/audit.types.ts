export interface AuditLog {
  id: number;
  entity: string;
  entityId: number;
  action: string;
  changes: Record<string, unknown>;
  userId: number;
  createdAt: string;
}
