"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import { formatCurrency } from "@/utils/currency";

interface OrderFinance {
  id: string;
  channelOrderId: string;
  customerName: string;
  orderTotal: number;
  status: string;
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
    status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED';
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
}

interface OrderFinanceDrawerProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderFinanceDrawer({ orderId, isOpen, onClose }: OrderFinanceDrawerProps) {
  const [orderFinance, setOrderFinance] = useState<OrderFinance | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderFinance();
    }
  }, [isOpen, orderId]);

  const loadOrderFinance = async () => {
    setLoading(true);
    try {
      const data = await authFetch(`/api/finance/orders/${orderId}`);
      setOrderFinance(data);
    } catch (err) {
      console.error("Failed to load order finance:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-green-50 text-green-700",
      MEDIUM: "bg-yellow-50 text-yellow-700",
      HIGH: "bg-red-50 text-red-700",
    };
    return colors[level] || "bg-slate-100 text-slate-700";
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
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getSettlementColor(orderFinance.settlement.status)}`}>
                      {orderFinance.settlement.status}
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
