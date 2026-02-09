"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import { formatCurrency } from "@/utils/currency";

interface Settlement {
  id: string;
  orderId: string;
  channelOrderId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED';
  expectedDate: string | null;
  settledDate: string | null;
  transactionId: string | null;
  channel: string;
  paymentMethod: string;
  failureReason?: string;
}

interface SettlementSummary {
  totalPending: number;
  totalProcessing: number;
  totalSettled: number;
  totalFailed: number;
  totalOverdue: number;
  pendingAmount: number;
  processingAmount: number;
  settledAmount: number;
  failedAmount: number;
  overdueAmount: number;
}

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'settled' | 'failed' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    setLoading(true);
    try {
      const data = await authFetch("/api/finance/settlements");
      setSettlements(data.settlements || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Failed to load settlements:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-50 text-yellow-700",
      PROCESSING: "bg-blue-50 text-blue-700",
      SETTLED: "bg-green-50 text-green-700",
      FAILED: "bg-red-50 text-red-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const isOverdue = (settlement: Settlement) => {
    return settlement.status === 'PENDING' && settlement.expectedDate && 
           new Date(settlement.expectedDate) < new Date();
  };

  const filteredSettlements = settlements.filter((settlement) => {
    const matchesFilter = filter === 'all' || 
      (filter === 'overdue' ? isOverdue(settlement) : settlement.status === filter.toUpperCase());
    
    const matchesSearch = !searchTerm || 
      settlement.channelOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (settlement.transactionId && settlement.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading settlements...</div>
      </div>
    );
  }

  const summaryData = summary || {
    totalPending: 0,
    totalProcessing: 0,
    totalSettled: 0,
    totalFailed: 0,
    totalOverdue: 0,
    pendingAmount: 0,
    processingAmount: 0,
    settledAmount: 0,
    failedAmount: 0,
    overdueAmount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settlements</h1>
          <p className="mt-1 text-sm text-slate-600">Track payment settlements and cash flow</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <div 
          className="bg-white rounded-lg border border-slate-200 p-6 cursor-pointer hover:border-yellow-300 transition-colors"
          onClick={() => setFilter('pending')}
        >
          <p className="text-sm font-medium text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summaryData.totalPending}</p>
          <p className="mt-1 text-sm text-slate-600">{formatCurrency(summaryData.pendingAmount)}</p>
        </div>
        
        <div 
          className="bg-white rounded-lg border border-slate-200 p-6 cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => setFilter('processing')}
        >
          <p className="text-sm font-medium text-slate-500">Processing</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summaryData.totalProcessing}</p>
          <p className="mt-1 text-sm text-slate-600">{formatCurrency(summaryData.processingAmount)}</p>
        </div>
        
        <div 
          className="bg-white rounded-lg border border-slate-200 p-6 cursor-pointer hover:border-green-300 transition-colors"
          onClick={() => setFilter('settled')}
        >
          <p className="text-sm font-medium text-slate-500">Settled</p>
          <p className="mt-2 text-2xl font-bold text-green-600">{summaryData.totalSettled}</p>
          <p className="mt-1 text-sm text-green-600">{formatCurrency(summaryData.settledAmount)}</p>
        </div>
        
        <div 
          className="bg-white rounded-lg border border-slate-200 p-6 cursor-pointer hover:border-red-300 transition-colors"
          onClick={() => setFilter('failed')}
        >
          <p className="text-sm font-medium text-slate-500">Failed</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{summaryData.totalFailed}</p>
          <p className="mt-1 text-sm text-red-600">{formatCurrency(summaryData.failedAmount)}</p>
        </div>
        
        <div 
          className="bg-white rounded-lg border border-orange-200 p-6 cursor-pointer hover:border-orange-300 transition-colors bg-orange-50"
          onClick={() => setFilter('overdue')}
        >
          <p className="text-sm font-medium text-orange-700">Overdue</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">{summaryData.totalOverdue}</p>
          <p className="mt-1 text-sm text-orange-600">{formatCurrency(summaryData.overdueAmount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order ID, channel, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'processing', 'settled', 'failed', 'overdue'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Order ID</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Channel</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Payment</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Amount</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Expected</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Settled</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Transaction ID</th>
                <th className="text-center py-3 px-6 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSettlements.map((settlement) => (
                <tr 
                  key={settlement.id} 
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    isOverdue(settlement) ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className="py-3 px-6">
                    <div>
                      <p className="font-medium text-slate-900">#{settlement.channelOrderId}</p>
                      <p className="text-xs text-slate-400">ID: {settlement.orderId.slice(0, 8)}</p>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm text-slate-900">{settlement.channel}</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm text-slate-900">{settlement.paymentMethod}</span>
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-900">
                    {formatCurrency(settlement.amount)}
                  </td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(settlement.status)}`}>
                      {settlement.status}
                      {isOverdue(settlement) && ' (Overdue)'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-slate-600">
                    {settlement.expectedDate ? new Date(settlement.expectedDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-6 text-slate-600">
                    {settlement.settledDate ? new Date(settlement.settledDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-6">
                    {settlement.transactionId ? (
                      <span className="text-xs font-mono text-slate-600">{settlement.transactionId}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => setSelectedSettlement(settlement)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSettlements.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No settlements found
                  </td>
                </tr>
              )}
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
