"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import { formatCurrency } from "@/utils/currency";

interface OrderFinance {
  id: string;
  channelOrderId: string;
  customerName: string;
  orderTotal: number;
  orderStatus: string;
  createdAt: string;
  revenue: {
    total: number;
    items: Array<{
      sku: string;
      title: string;
      qty: number;
      price: number;
      subtotal: number;
    }>;
    shipping: number;
    taxes: number;
    discounts: number;
  };
  expenses: Array<{
    id: string;
    category: string;
    description: string;
    amount: number;
    createdAt: string;
  }>;
  settlement: {
    settlementStatus: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED';
    amount: number;
    expectedDate: string | null;
    settledDate: string | null;
    transactionId: string | null;
  };
  profit: number;
  cashStatus: 'PENDING' | 'CLEARED' | 'OVERDUE';
  eta: string | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  statusTimeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  // Payment gateway information
  partner?: "RAZORPAY" | "PAYMENT_GATEWAY" | "COD" | "SELLOSHIP" | "DELHIVERY";
  gateway?: "RAZORPAY" | "PAYMENT_GATEWAY";
  gateway_payment_id?: string;
  gateway_order_id?: string;
  amount?: number;
  currency?: string;
  fee?: number;
  tax?: number;
  net_amount?: number;
  paymentStatus?: "PAID" | "SETTLED";
  paid_at?: string;
  settled_at?: string;
  // Shopify-centric shipment information
  shipments?: Array<{
    id: string;
    shopifyFulfillmentId: string;
    trackingNumber: string;
    courier: string;
    fulfillmentStatus: string;
    deliveryStatus: string;
    selloshipStatus: string;
    lastSyncedAt: string;
  }>;
  // Settlement details
  gateway_fees?: number;
  gateway_tax?: number;
  total_deductions?: number;
  settlement_amount?: number;
  gateway_settlement_id?: string;
  utr?: string;
}

interface OrderFinanceDrawerProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderFinanceDrawer({ orderId, isOpen, onClose }: OrderFinanceDrawerProps) {
  const [orderFinance, setOrderFinance] = useState<OrderFinance | null>(null);
  const [loading, setLoading] = useState(true);

  // Refresh shipment status function
  const refreshShipmentStatus = async (trackingNumber: string, orderData: OrderFinance | null) => {
    try {
      const response = await authFetch(`/shipments/v2/sync/status/${trackingNumber}`, {
        method: 'POST'
      });
      if (response.ok) {
        console.log(`Refreshed status for ${trackingNumber}`);
        // Reload finance drawer to show updated status
        if (orderData?.id) {
          const updatedData = await authFetch(`/finance/orders/${orderData.id}`);
          setOrderFinance(updatedData);
        }
      } else {
        console.error(`Failed to refresh status for ${trackingNumber}`);
      }
    } catch (error) {
      console.error(`Error refreshing shipment status:`, error);
    }
  };

  const loadOrderFinance = useCallback(async () => {
    setLoading(true);
    try {
      // NOTE: `authFetch()` already targets `{API_BASE_URL}/api`, so paths must NOT start with `/api/...`
      const data = await authFetch(`/finance/orders/${orderId}`);
      setOrderFinance(data);
    } catch (err) {
      console.error("Failed to load order finance:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderFinance();
    }
  }, [isOpen, orderId, loadOrderFinance]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-blue-50 text-blue-700",
      CONFIRMED: "bg-purple-50 text-purple-700",
      PACKED: "bg-yellow-50 text-yellow-700",
      SHIPPED: "bg-green-50 text-green-700",
      DELIVERED: "bg-emerald-50 text-emerald-700",
      CANCELLED: "bg-red-50 text-red-700",
      HOLD: "bg-orange-50 text-orange-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const getSettlementColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-50 text-yellow-700",
      PROCESSING: "bg-blue-50 text-blue-700",
      SETTLED: "bg-green-50 text-green-700",
      FAILED: "bg-red-50 text-red-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const getCashStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-50 text-yellow-700",
      CLEARED: "bg-green-50 text-green-700",
      OVERDUE: "bg-red-50 text-red-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Order #{orderFinance?.channelOrderId || orderId}
            </h3>
            <p className="text-sm text-slate-600 mt-1">Financial Details</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="text-slate-500">Loading financial data...</div>
          </div>
        ) : orderFinance ? (
          <div className="p-6 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500">Total Revenue</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {formatCurrency(orderFinance.revenue.total)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500">Total Expenses</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {formatCurrency(orderFinance.expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                </p>
              </div>
              <div className={`rounded-lg p-4 ${orderFinance.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-xs text-slate-500">Net Profit</p>
                <p className={`text-lg font-bold mt-1 ${orderFinance.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(orderFinance.profit)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500">Cash Status</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getCashStatusColor(orderFinance.cashStatus)}`}>
                  {orderFinance.cashStatus}
                </span>
              </div>
            </div>

            {/* Revenue Section */}
            <div>
              <h4 className="text-base font-semibold text-slate-900 mb-4">Revenue Breakdown</h4>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Items Subtotal</span>
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(orderFinance.revenue.items.reduce((sum, item) => sum + item.subtotal, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Shipping</span>
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(orderFinance.revenue.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Taxes</span>
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(orderFinance.revenue.taxes)}
                    </span>
                  </div>
                  {orderFinance.revenue.discounts > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Discounts</span>
                      <span className="text-sm font-medium text-red-600">
                        -{formatCurrency(orderFinance.revenue.discounts)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-slate-900">Total Revenue</span>
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(orderFinance.revenue.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Panel */}
            {orderFinance.partner === "RAZORPAY" && (
              <div>
                <h4 className="text-base font-semibold text-slate-900 mb-4">💳 Payment Panel</h4>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-slate-500">Gateway</span>
                      <div className="font-medium text-slate-900">Razorpay</div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Payment ID</span>
                      <div className="font-medium text-slate-900">{orderFinance.gateway_payment_id || '—'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Amount</span>
                      <div className="font-medium text-slate-900">{formatCurrency(orderFinance.amount || 0)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Fee</span>
                      <div className="font-medium text-slate-900">{formatCurrency((orderFinance.fee || 0) + (orderFinance.tax || 0))}</div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Net Amount</span>
                      <div className="font-medium text-slate-900">{formatCurrency(orderFinance.net_amount || 0)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Paid At</span>
                      <div className="font-medium text-slate-900">
                        {orderFinance.paid_at ? new Date(orderFinance.paid_at).toLocaleDateString() : '—'}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Settled At</span>
                      <div className="font-medium text-slate-900">
                        {orderFinance.settled_at ? new Date(orderFinance.settled_at).toLocaleDateString() : '—'}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Status</span>
                      <div className="font-medium text-slate-900">{orderFinance.paymentStatus || '—'}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h5 className="text-sm font-medium text-slate-700 mb-3">Payment Details</h5>
                    <div className="text-xs text-slate-500 space-y-1">
                      {orderFinance.gateway_order_id && (
                        <div>Order ID: {orderFinance.gateway_order_id}</div>
                      )}
                      {orderFinance.gateway_settlement_id && (
                        <div>Settlement ID: {orderFinance.gateway_settlement_id}</div>
                      )}
                      {orderFinance.utr && (
                        <div>UTR: {orderFinance.utr}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipment Panel */}
            {orderFinance.shipments && orderFinance.shipments.length > 0 && (
              <div>
                <h4 className="text-base font-semibold text-slate-900 mb-4">📦 Shipment Panel</h4>
                <div className="space-y-4">
                  {orderFinance.shipments.map((shipment, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-slate-500">Tracking Number</span>
                          <div className="font-medium text-slate-900 font-mono text-sm">
                            {shipment.trackingNumber ? (
                              <a
                                href={`#`}
                                className="text-blue-600 hover:text-blue-800 underline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  // TODO: Open tracking modal
                                }}
                              >
                                {shipment.trackingNumber}
                              </a>
                            ) : (
                              '—'
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-slate-500">Courier</span>
                          <div className="font-medium text-slate-900">{shipment.courier || '—'}</div>
                        </div>
                        <div>
                          <span className="text-sm text-slate-500">Fulfillment</span>
                          <div className="font-medium text-slate-900">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              shipment.fulfillmentStatus === 'FULFILLED' ? 'bg-blue-50 text-blue-700' :
                              shipment.fulfillmentStatus === 'PARTIAL' ? 'bg-yellow-50 text-yellow-700' :
                              shipment.fulfillmentStatus === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                              'bg-gray-50 text-gray-700'
                            }`}>
                              {shipment.fulfillmentStatus || 'PENDING'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-slate-500">Delivery</span>
                          <div className="font-medium text-slate-900">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              shipment.deliveryStatus === 'DELIVERED' ? 'bg-green-50 text-green-700' :
                              shipment.deliveryStatus === 'IN_TRANSIT' || shipment.deliveryStatus === 'SHIPPED' ? 'bg-blue-50 text-blue-700' :
                              shipment.deliveryStatus === 'RTO' || shipment.deliveryStatus === 'RTO_INITIATED' ? 'bg-orange-50 text-orange-700' :
                              shipment.deliveryStatus === 'RTO_DONE' || shipment.deliveryStatus === 'LOST' ? 'bg-red-50 text-red-700' :
                              'bg-gray-50 text-gray-700'
                            }`}>
                              {shipment.deliveryStatus || 'PENDING'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Selloship Status Enrichment */}
                      {shipment.selloshipStatus && (
                        <div className="border-t border-slate-200 pt-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm text-slate-500">Selloship Status</span>
                              <div className="font-medium text-slate-900">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  shipment.selloshipStatus === 'DELIVERED' ? 'bg-green-50 text-green-700' :
                                  shipment.selloshipStatus === 'IN_TRANSIT' ? 'bg-blue-50 text-blue-700' :
                                  shipment.selloshipStatus === 'RTO' ? 'bg-orange-50 text-orange-700' :
                                  'bg-gray-50 text-gray-700'
                                }`}>
                                  {shipment.selloshipStatus}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-slate-500">Last Synced</span>
                              <div className="font-medium text-slate-900 text-xs">
                                {shipment.lastSyncedAt ? new Date(shipment.lastSyncedAt).toLocaleDateString() : '—'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Refresh Status Button */}
                      {orderFinance?.shipments && orderFinance.shipments.length > 0 && (
                        <div className="border-t border-slate-200 pt-3 mt-3">
                          <button
                            onClick={() => {
  const trackingNumber = orderFinance.shipments?.[0]?.trackingNumber;
  if (trackingNumber) {
    refreshShipmentStatus(trackingNumber, orderFinance);
  }
}}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            🔄 Refresh Shipment Status
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
              <div className="mt-4">
                <h5 className="text-sm font-medium text-slate-700 mb-2">Items</h5>
                <div className="space-y-2">
                  {orderFinance.revenue.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-slate-100">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">SKU: {item.sku} · Qty: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-900">{formatCurrency(item.subtotal)}</p>
                        <p className="text-xs text-slate-500">{formatCurrency(item.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-semibold text-slate-900">Expenses</h4>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  + Add Expense
                </button>
              </div>
              <div className="space-y-2">
                {orderFinance.expenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{expense.category}</p>
                      <p className="text-xs text-slate-500">{expense.description}</p>
                      <p className="text-xs text-slate-400">{new Date(expense.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(expense.amount)}
                      </span>
                      <button className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
                    </div>
                  </div>
                ))}
                {orderFinance.expenses.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">No expenses recorded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Settlement Section */}
            <div>
              <h4 className="text-base font-semibold text-slate-900 mb-4">Settlement</h4>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getSettlementColor(orderFinance.settlement.settlementStatus)}`}>
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Amount</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {formatCurrency(orderFinance.settlement.amount)}
                    </p>
                  </div>
                  {orderFinance.settlement.expectedDate && (
                    <div>
                      <p className="text-xs text-slate-500">Expected Date</p>
                      <p className="text-sm text-slate-900 mt-1">
                        {new Date(orderFinance.settlement.expectedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {orderFinance.settlement.settledDate && (
                    <div>
                      <p className="text-xs text-slate-500">Settled Date</p>
                      <p className="text-sm text-slate-900 mt-1">
                        {new Date(orderFinance.settlement.settledDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {orderFinance.settlement.transactionId && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500">Transaction ID</p>
                      <p className="text-sm text-slate-900 mt-1 font-mono">
                        {orderFinance.settlement.transactionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div>
              <h4 className="text-base font-semibold text-slate-900 mb-4">Status Timeline</h4>
              <div className="space-y-3">
                {orderFinance.statusTimeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {event.note && (
                        <p className="text-sm text-slate-600 mt-1">{event.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-slate-500">Failed to load financial data</div>
          </div>
        )}
      </div>
    </div>
  );
}
