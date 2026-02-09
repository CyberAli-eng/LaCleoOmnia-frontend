"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import { formatCurrency } from "@/utils/currency";

interface RiskCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  rtoOrders: number;
  totalValue: number;
  averageOrderValue: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  lastOrderDate: string;
  issues: Array<{
    type: 'RTO' | 'PAYMENT_FAILURE' | 'FRAUD' | 'COMPLAINT';
    description: string;
    date: string;
    amount?: number;
  }>;
}

interface RiskSummary {
  totalCustomers: number;
  highRiskCustomers: number;
  mediumRiskCustomers: number;
  lowRiskCustomers: number;
  totalRtoLoss: number;
  totalFailedPayments: number;
  rtoRate: number;
  failureRate: number;
}

export default function RiskPage() {
  const [customers, setCustomers] = useState<RiskCustomer[]>([]);
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<RiskCustomer | null>(null);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    setLoading(true);
    try {
      const data = await authFetch("/api/finance/risk");
      setCustomers(data.customers || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Failed to load risk data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      HIGH: "bg-red-50 text-red-700 border-red-200",
      MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
      LOW: "bg-green-50 text-green-700 border-green-200",
    };
    return colors[level] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getRiskBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
      HIGH: "bg-red-100 text-red-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      LOW: "bg-green-100 text-green-800",
    };
    return colors[level] || "bg-slate-100 text-slate-800";
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesFilter = filter === 'all' || customer.riskLevel === filter.toUpperCase();
    
    const matchesSearch = !searchTerm || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading risk analysis...</div>
      </div>
    );
  }

  const summaryData = summary || {
    totalCustomers: 0,
    highRiskCustomers: 0,
    mediumRiskCustomers: 0,
    lowRiskCustomers: 0,
    totalRtoLoss: 0,
    totalFailedPayments: 0,
    rtoRate: 0,
    failureRate: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Risk Analysis</h1>
          <p className="mt-1 text-sm text-slate-600">Customer risk assessment and fraud detection</p>
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500">Total Customers</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summaryData.totalCustomers}</p>
          <p className="mt-1 text-xs text-slate-500">Active customers</p>
        </div>
        
        <div 
          className="bg-white rounded-lg border border-red-200 p-6 cursor-pointer hover:border-red-300 transition-colors bg-red-50"
          onClick={() => setFilter('high')}
        >
          <p className="text-sm font-medium text-red-700">High Risk</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{summaryData.highRiskCustomers}</p>
          <p className="mt-1 text-xs text-red-600">Require attention</p>
        </div>
        
        <div 
          className="bg-white rounded-lg border border-slate-200 p-6 cursor-pointer hover:border-yellow-300 transition-colors"
          onClick={() => setFilter('medium')}
        >
          <p className="text-sm font-medium text-slate-500">Medium Risk</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">{summaryData.mediumRiskCustomers}</p>
          <p className="mt-1 text-xs text-slate-500">Monitor closely</p>
        </div>
        
        <div 
          className="bg-white rounded-lg border border-slate-200 p-6 cursor-pointer hover:border-green-300 transition-colors"
          onClick={() => setFilter('low')}
        >
          <p className="text-sm font-medium text-slate-500">Low Risk</p>
          <p className="mt-2 text-2xl font-bold text-green-600">{summaryData.lowRiskCustomers}</p>
          <p className="mt-1 text-xs text-slate-500">Safe customers</p>
        </div>
      </div>

      {/* Loss Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500">RTO Loss</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{formatCurrency(summaryData.totalRtoLoss)}</p>
          <p className="mt-1 text-xs text-slate-500">RTO Rate: {summaryData.rtoRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500">Payment Failures</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">{formatCurrency(summaryData.totalFailedPayments)}</p>
          <p className="mt-1 text-xs text-slate-500">Failure Rate: {summaryData.failureRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500">Total Loss</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {formatCurrency(summaryData.totalRtoLoss + summaryData.totalFailedPayments)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Combined losses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'high', 'medium', 'low'] as const).map((f) => (
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

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Customer</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Contact</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Orders</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Success Rate</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Total Value</th>
                <th className="text-center py-3 px-6 font-semibold text-slate-700">Risk Score</th>
                <th className="text-center py-3 px-6 font-semibold text-slate-700">Risk Level</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Issues</th>
                <th className="text-center py-3 px-6 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${getRiskColor(customer.riskLevel)}`}
                >
                  <td className="py-3 px-6">
                    <div>
                      <p className="font-medium text-slate-900">{customer.name}</p>
                      <p className="text-xs text-slate-500">ID: {customer.id.slice(0, 8)}</p>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div>
                      <p className="text-sm text-slate-900">{customer.email}</p>
                      <p className="text-xs text-slate-500">{customer.phone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div>
                      <p className="font-medium text-slate-900">{customer.totalOrders}</p>
                      <p className="text-xs text-slate-500">{customer.successOrders} success</p>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <span className={`font-medium ${
                      (customer.successOrders / customer.totalOrders) >= 0.9 ? 'text-green-600' :
                      (customer.successOrders / customer.totalOrders) >= 0.7 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {((customer.successOrders / customer.totalOrders) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-900">
                    {formatCurrency(customer.totalValue)}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className={`font-bold ${getRiskScoreColor(customer.riskScore)}`}>
                      {customer.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(customer.riskLevel)}`}>
                      {customer.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="space-y-1">
                      {customer.issues.slice(0, 2).map((issue, index) => (
                        <div key={index} className="text-xs">
                          <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                            issue.type === 'RTO' ? 'bg-red-100 text-red-700' :
                            issue.type === 'PAYMENT_FAILURE' ? 'bg-orange-100 text-orange-700' :
                            issue.type === 'FRAUD' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {issue.type.replace('_', ' ')}
                          </span>
                          {issue.amount && <span className="ml-1 text-slate-600">{formatCurrency(issue.amount)}</span>}
                        </div>
                      ))}
                      {customer.issues.length > 2 && (
                        <p className="text-xs text-slate-500">+{customer.issues.length - 2} more</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-sm text-slate-600 mt-1">Customer risk profile</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Risk Score</p>
                  <p className={`text-lg font-bold mt-1 ${getRiskScoreColor(selectedCustomer.riskScore)}`}>
                    {selectedCustomer.riskScore}/100
                  </p>
                </div>
                <div className={`rounded-lg p-4 ${getRiskColor(selectedCustomer.riskLevel)}`}>
                  <p className="text-sm text-slate-500">Risk Level</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(selectedCustomer.riskLevel)}`}>
                    {selectedCustomer.riskLevel}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Total Orders</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Success Rate</p>
                  <p className={`text-lg font-bold mt-1 ${
                    (selectedCustomer.successOrders / selectedCustomer.totalOrders) >= 0.9 ? 'text-green-600' :
                    (selectedCustomer.successOrders / selectedCustomer.totalOrders) >= 0.7 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {((selectedCustomer.successOrders / selectedCustomer.totalOrders) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-base font-semibold text-slate-900 mb-3">Contact Information</h4>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="text-sm text-slate-900 mt-1">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="text-sm text-slate-900 mt-1">{selectedCustomer.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="text-sm text-slate-900 mt-1">{selectedCustomer.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Statistics */}
              <div>
                <h4 className="text-base font-semibold text-slate-900 mb-3">Order Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700">Successful</p>
                    <p className="text-lg font-bold text-green-600 mt-1">{selectedCustomer.successfulOrders}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-700">Failed</p>
                    <p className="text-lg font-bold text-red-600 mt-1">{selectedCustomer.failedOrders}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-700">RTO</p>
                    <p className="text-lg font-bold text-orange-600 mt-1">{selectedCustomer.rtoOrders}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700">Avg Order Value</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(selectedCustomer.averageOrderValue)}</p>
                  </div>
                </div>
              </div>

              {/* Issues History */}
              <div>
                <h4 className="text-base font-semibold text-slate-900 mb-3">Issues History</h4>
                <div className="space-y-2">
                  {selectedCustomer.issues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          issue.type === 'RTO' ? 'bg-red-100 text-red-700' :
                          issue.type === 'PAYMENT_FAILURE' ? 'bg-orange-100 text-orange-700' :
                          issue.type === 'FRAUD' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {issue.type.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-slate-900">{issue.description}</span>
                      </div>
                      <div className="text-right">
                        {issue.amount && (
                          <p className="text-sm font-medium text-slate-900">{formatCurrency(issue.amount)}</p>
                        )}
                        <p className="text-xs text-slate-500">{new Date(issue.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {selectedCustomer.issues.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <p className="text-sm">No issues recorded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
