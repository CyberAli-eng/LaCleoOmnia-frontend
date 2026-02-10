"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import { formatCurrency } from "@/utils/currency";

interface Settlement {
  id: string;
  orderId: string;
  channelOrderId: string;
  customerName: string;
  amount: number;
  partner: "PAYMENT_GATEWAY" | "COD" | "DELHIVERY" | "SELLOSHIP";
  status: "PENDING" | "PROCESSING" | "SETTLED" | "FAILED" | "OVERDUE";
  expectedDate: string | null;
  settledDate: string | null;
  transactionId: string | null;
  codAmount: number;
  settlementAmount: number;
  utr: string;
  overdueDays: number;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for compatibility
  channel?: string;
  paymentMethod?: string;
  failureReason?: string;
}

interface SettlementsResponse {
  settlements: Settlement[];
  summary: {
    total: number;
    pending: number;
    settled: number;
    overdue: number;
    cod: number;
    gateway: number;
    selloship: number;
    delhivery: number;
  };
}

export default function SettlementsPage() {
  const [data, setData] = useState<SettlementsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    days: 30,
    status: "",
    partner: ""
  });
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  const loadSettlements = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.days !== 30) params.set("days", filters.days.toString());
      if (filters.status) params.set("status", filters.status);
      if (filters.partner) params.set("partner", filters.partner);

      const response = await authFetch(`/settlements?${params.toString()}`);
      setData(response as SettlementsResponse);
    } catch (err) {
      console.error("Failed to load settlements:", err);
      setError(err instanceof Error ? err.message : "Failed to load settlements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlements();
  }, [filters.days, filters.status, filters.partner]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-50 text-yellow-700",
      PROCESSING: "bg-blue-50 text-blue-700",
      SETTLED: "bg-green-50 text-green-700",
      FAILED: "bg-red-50 text-red-700",
      OVERDUE: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-slate-50 text-slate-700";
  };

  const getPartnerColor = (partner: string) => {
    const colors: Record<string, string> = {
      PAYMENT_GATEWAY: "bg-purple-50 text-purple-700",
      COD: "bg-orange-50 text-orange-700",
      DELHIVERY: "bg-teal-50 text-teal-700",
      SELLOSHIP: "bg-blue-50 text-blue-700"
    };
    return colors[partner] || "bg-slate-50 text-slate-700";
  };

  const isOverdue = (settlement: Settlement) => {
    return settlement.overdueDays > 7;
  };

  const handleMarkOverdue = async (settlementId: string) => {
    try {
      await authFetch(`/settlements/${settlementId}/mark-overdue`, {
        method: "POST"
      });
      loadSettlements(); // Reload data
    } catch (err) {
      console.error("Failed to mark settlement overdue:", err);
    }
  };

  const handleSync = async () => {
    try {
      await authFetch("/settlements/sync", {
        method: "POST"
      });
      loadSettlements(); // Reload data
    } catch (err) {
      console.error("Failed to sync settlements:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">Loading settlements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settlements</h1>
          <p className="mt-1 text-sm text-slate-600">
            Payment gateway and COD remittance tracking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settlements</h1>
        <p className="mt-1 text-sm text-slate-600">
          Payment gateway and COD remittance tracking
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Period:</label>
            <select
              value={filters.days}
              onChange={(e) => setFilters(prev => ({ ...prev, days: Number(e.target.value) }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SETTLED">Settled</option>
              <option value="FAILED">Failed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Partner:</label>
            <select
              value={filters.partner}
              onChange={(e) => setFilters(prev => ({ ...prev, partner: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="PAYMENT_GATEWAY">Payment Gateway</option>
              <option value="COD">COD</option>
              <option value="DELHIVERY">Delhivery</option>
              <option value="SELLOSHIP">Selloship</option>
            </select>
          </div>
          <button
            onClick={handleSync}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            🔄 Sync Now
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-sm font-medium text-slate-500">Total Amount</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(data.summary.total)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-sm font-medium text-slate-500">Pending</div>
          <div className="mt-2 text-2xl font-bold text-yellow-600">
            {data.summary.pending}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-sm font-medium text-slate-500">Settled</div>
          <div className="mt-2 text-2xl font-bold text-green-600">
            {data.summary.settled}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-sm font-medium text-slate-500">Overdue</div>
          <div className="mt-2 text-2xl font-bold text-red-600">
            {data.summary.overdue}
          </div>
        </div>
      </div>

      {/* Partner Breakdown */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="text-lg font-semibold text-slate-900 mb-4">Partner Breakdown</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPartnerColor("PAYMENT_GATEWAY")}`}>
              Payment Gateway
            </div>
            <div className="text-2xl font-bold text-purple-700">{data.summary.gateway}</div>
          </div>
          <div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPartnerColor("COD")}`}>
              COD
            </div>
            <div className="text-2xl font-bold text-orange-700">{data.summary.cod}</div>
          </div>
          <div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPartnerColor("DELHIVERY")}`}>
              Delhivery
            </div>
            <div className="text-2xl font-bold text-teal-700">{data.summary.delhivery}</div>
          </div>
          <div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPartnerColor("SELLOSHIP")}`}>
              Selloship
            </div>
            <div className="text-2xl font-bold text-blue-700">{data.summary.selloship}</div>
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Settlements</h2>
            <div className="text-sm text-slate-500">
              Showing {data.settlements.length} settlements
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Order</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Customer</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Partner</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Settled</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Overdue</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.settlements.map((settlement) => (
                <tr key={settlement.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-slate-900">#{settlement.channelOrderId || settlement.orderId}</p>
                      <p className="text-xs text-slate-400">ID: {settlement.orderId}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{settlement.customerName}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    {formatCurrency(settlement.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPartnerColor(settlement.partner)}`}>
                      {settlement.partner.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(settlement.status)}`}>
                      {settlement.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-slate-900">
                      {settlement.settledDate ? new Date(settlement.settledDate).toLocaleDateString() : '—'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-slate-900">
                      {settlement.overdueDays > 0 ? (
                        <span className="text-red-600 font-medium">{settlement.overdueDays} days</span>
                      ) : (
                        <span className="text-green-600">—</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {settlement.status === "SETTLED" && settlement.codAmount > 0 && (
                        <span className="text-xs text-slate-500">COD: {formatCurrency(settlement.codAmount)}</span>
                      )}
                      {settlement.status === "OVERDUE" && (
                        <button
                          onClick={() => handleMarkOverdue(settlement.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Mark Overdue
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement Detail Modal */}
      {selectedSettlement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Settlement #{selectedSettlement.channelOrderId}
                </h3>
                <p className="text-sm text-slate-600 mt-1">Settlement details</p>
              </div>
              <button
                onClick={() => setSelectedSettlement(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {formatCurrency(selectedSettlement.amount)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Status</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSettlement.status)}`}>
                    {selectedSettlement.status}
                    {isOverdue(selectedSettlement) && ' (Overdue)'}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Channel</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{selectedSettlement.channel}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Payment Method</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{selectedSettlement.paymentMethod}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Expected Date</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {selectedSettlement.expectedDate ? new Date(selectedSettlement.expectedDate).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Settled Date</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {selectedSettlement.settledDate ? new Date(selectedSettlement.settledDate).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              {selectedSettlement.transactionId && (
                <div>
                  <p className="text-sm text-slate-500">Transaction ID</p>
                  <p className="text-sm font-mono text-slate-900 mt-1">{selectedSettlement.transactionId}</p>
                </div>
              )}

              {selectedSettlement.failureReason && (
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-700 font-medium">Failure Reason</p>
                  <p className="text-sm text-red-600 mt-1">{selectedSettlement.failureReason}</p>
                </div>
              )}

              {isOverdue(selectedSettlement) && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-700 font-medium">Overdue Notice</p>
                  <p className="text-sm text-orange-600 mt-1">
                    This settlement was expected on {new Date(selectedSettlement.expectedDate!).toLocaleDateString()} 
                    but has not been settled yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
