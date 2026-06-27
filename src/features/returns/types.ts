export type ReturnStatus = 'Requested' | 'Approved' | 'Rejected' | 'Completed';

export interface ReturnItem {
  id: number;
  orderNumber: string | null;
  productName: string | null;
  customerName: string | null;
  reason: string | null;
  returnStatus: ReturnStatus;
  createdAt: string;
}

export interface ResolveReturnRequest {
  returnStatus: ReturnStatus;
}

export const RETURN_STATUSES: ReturnStatus[] = ['Requested', 'Approved', 'Rejected', 'Completed'];
