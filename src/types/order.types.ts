export interface OrderItem {
  id: string;
  sku: string;
  title: string;
  qty: number;
  price: number;
  fulfillmentStatus: string;
}

export interface Order {
  id: string;
  channelOrderId: string;
  customerName: string;
  customerEmail?: string;
  shippingAddress?: string | null;
  billingAddress?: string | null;
  paymentMode: string;
  orderTotal: number;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface ShopifyOrder {
  id: string;
  order_id: string;
  customer: string;
  customer_name?: string;
  total: number;
  status: string;
  created_at: string;
}

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'HOLD';

export type PaymentMode = 'PREPAID' | 'COD';
