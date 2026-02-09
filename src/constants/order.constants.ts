import type { OrderStatus, PaymentMode } from '@/src/types';

export const ORDER_STATUS: Record<string, OrderStatus> = {
  NEW: 'NEW',
  CONFIRMED: 'CONFIRMED',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  HOLD: 'HOLD',
} as const;

export const ORDER_STATUS_COLORS: Record<OrderStatus | 'all', string> = {
  all: 'bg-slate-100 text-slate-700',
  NEW: 'bg-blue-50 text-blue-700',
  CONFIRMED: 'bg-purple-50 text-purple-700',
  PACKED: 'bg-yellow-50 text-yellow-700',
  SHIPPED: 'bg-green-50 text-green-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
  HOLD: 'bg-orange-50 text-orange-700',
};

export const PAYMENT_MODES: Record<string, PaymentMode> = {
  PREPAID: 'PREPAID',
  COD: 'COD',
} as const;

export const PAYMENT_MODE_COLORS: Record<PaymentMode, string> = {
  PREPAID: 'bg-green-50 text-green-700',
  COD: 'bg-amber-50 text-amber-700',
};

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  PREPAID: 'Prepaid',
  COD: 'COD',
};
