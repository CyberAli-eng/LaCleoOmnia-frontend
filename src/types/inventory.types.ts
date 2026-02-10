export interface InventoryItem {
  id: string;
  sku: string;
  title?: string;
  warehouseId: string;
  warehouseName?: string;
  availableQty: number;
  reservedQty?: number;
  totalQty?: number;
  lowStockThreshold?: number;
  [key: string]: any;
}

export interface AdjustInventoryData {
  sku: string;
  warehouseId: string;
  qty: number;
  reason?: string;
  type: 'ADD' | 'REMOVE' | 'SET';
}

export interface InventoryHistory {
  id: string;
  sku: string;
  warehouseId: string;
  previousQty: number;
  newQty: number;
  changeQty: number;
  reason: string;
  createdAt: string;
  [key: string]: any;
}
