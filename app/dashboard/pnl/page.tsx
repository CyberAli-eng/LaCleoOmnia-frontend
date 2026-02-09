"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import { formatCurrency } from "@/utils/currency";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface PnLData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  orderCount: number;
  avgOrderValue: number;
}

interface PnLBreakdown {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  margin: number;
  periodData: PnLData[];
  expenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  revenueBreakdown: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
}

export default function PnLPage() {
  const [pnlData, setPnLData] = useState<PnLBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PnLData | null>(null);

  useEffect(() => {
    loadPnLData();
  }, [period]);

  const loadPnLData = async () => {
    setLoading(true);
    try {
      const data = await authFetch(`/api/finance/pnl?period=${period}`);
      setPnLData(data);
    } catch (err) {
      console.error("Failed to load P&L data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getProfitColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getProfitBgColor = (value: number) => {
    return value >= 0 ? 'bg-green-50' : 'bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading P&L data...</div>
      </div>
    );
  }

  const data = pnlData || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    margin: 0,
    periodData: [],
    expenseCategories: [],
    revenueBreakdown: []
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profit & Loss</h1>
          <p className="mt-1 text-sm text-slate-600">Financial performance and profitability analysis</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(data.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {data.periodData.length} periods
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500">Total Expenses</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(data.totalExpenses)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {data.expenseCategories.length} categories
          </p>
        </div>
        
        <div className={`rounded-lg border border-slate-200 p-6 ${getProfitBgColor(data.netProfit)}`}>
          <p className="text-sm font-medium text-slate-500">Net Profit</p>
          <p className={`mt-2 text-2xl font-bold ${getProfitColor(data.netProfit)}`}>
            {formatCurrency(data.netProfit)}
          </p>
          <p className={`mt-1 text-xs ${getProfitColor(data.margin)}`}>
            {data.margin.toFixed(1)}% margin
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500">Avg Order Value</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(data.avgOrderValue)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Per order
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profit/Loss Trend Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Profit/Loss Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.periodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cash Flow Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Cash Flow</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.periodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="revenue" fill="#10b981" />
              <Bar dataKey="expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* P&L Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Period Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Period</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Revenue</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Expenses</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Profit</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Margin</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Orders</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">AOV</th>
                <th className="text-center py-3 px-6 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.periodData.map((periodData, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-6">
                    <p className="font-medium text-slate-900">{periodData.period}</p>
                  </td>
                  <td className="py-3 px-6 text-right font-medium text-slate-900">
                    {formatCurrency(periodData.revenue)}
                  </td>
                  <td className="py-3 px-6 text-right text-slate-900">
                    {formatCurrency(periodData.expenses)}
                  </td>
                  <td className={`py-3 px-6 text-right font-semibold ${getProfitColor(periodData.profit)}`}>
                    {formatCurrency(periodData.profit)}
                  </td>
                  <td className={`py-3 px-6 text-right ${getProfitColor(periodData.margin)}`}>
                    {periodData.margin.toFixed(1)}%
                  </td>
                  <td className="py-3 px-6 text-right text-slate-900">
                    {periodData.orderCount}
                  </td>
                  <td className="py-3 px-6 text-right text-slate-900">
                    {formatCurrency(periodData.avgOrderValue)}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => {
                        setSelectedPeriod(periodData);
                        setDrilldownOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {data.periodData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No data available for selected period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Expense Breakdown</h2>
          <div className="space-y-3">
            {data.expenseCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{category.category}</span>
                    <span className="text-sm text-slate-900">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-3 text-xs text-slate-500 w-12 text-right">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
            {data.expenseCategories.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No expense data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-3">
            {data.revenueBreakdown.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{source.source}</span>
                    <span className="text-sm text-slate-900">{formatCurrency(source.amount)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-3 text-xs text-slate-500 w-12 text-right">
                  {source.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
            {data.revenueBreakdown.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No revenue data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drilldown Modal */}
      {drilldownOpen && selectedPeriod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedPeriod.period} Details</h3>
                <p className="text-sm text-slate-600 mt-1">Detailed financial breakdown</p>
              </div>
              <button
                onClick={() => setDrilldownOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Revenue</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {formatCurrency(selectedPeriod.revenue)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Expenses</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {formatCurrency(selectedPeriod.expenses)}
                  </p>
                </div>
                <div className={`rounded-lg p-4 ${getProfitBgColor(selectedPeriod.profit)}`}>
                  <p className="text-sm text-slate-500">Profit</p>
                  <p className={`text-lg font-bold mt-1 ${getProfitColor(selectedPeriod.profit)}`}>
                    {formatCurrency(selectedPeriod.profit)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Margin</p>
                  <p className={`text-lg font-bold mt-1 ${getProfitColor(selectedPeriod.margin)}`}>
                    {selectedPeriod.margin.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Orders</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {selectedPeriod.orderCount}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500">Avg Order Value</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {formatCurrency(selectedPeriod.avgOrderValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
