"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/utils/api";

interface CourierStats {
  courier: string;
  total_shipments: number;
  rto_shipments: number;
  rto_percentage: number;
  rto_loss: number;
  rto_loss_formatted: string;
}

interface LogisticsData {
  period_days: number;
  couriers: CourierStats[];
  summary: {
    total_shipments: number;
    total_rto: number;
    total_loss: number;
  };
}

function LogisticsPage() {
  const [data, setData] = useState<LogisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const loadLogisticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/logistics/rto?days=${days}`);
      setData(response as LogisticsData);
    } catch (err) {
      console.error("Failed to load logistics data:", err);
      setError(err instanceof Error ? err.message : "Failed to load logistics data");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadLogisticsData();
  }, [loadLogisticsData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRtoColor = (percentage: number) => {
    if (percentage >= 15) return 'text-red-600 bg-red-50';
    if (percentage >= 10) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">Loading logistics dashboard...</div>
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">No logistics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Logistics Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          RTO analytics and courier performance metrics
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <label className="text-sm font-medium text-slate-700">Period:</label>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
        <span className="text-sm text-slate-500">
          Showing data for {data.period_days} days
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-sm font-medium text-slate-500">Total Shipments</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {data.summary.total_shipments.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-sm font-medium text-slate-500">Total RTO</div>
          <div className="mt-2 text-3xl font-bold text-amber-600">
            {data.summary.total_rto.toLocaleString()}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {data.summary.total_shipments > 0 
              ? `${((data.summary.total_rto / data.summary.total_shipments) * 100).toFixed(1)}% of total`
              : '0% of total'
            }
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-sm font-medium text-slate-500">Total Loss</div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(data.summary.total_loss)}
          </div>
        </div>
      </div>

      {/* Courier Performance Table */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Courier Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Courier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  RTO %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Loss
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.couriers.map((courier, index) => (
                <tr key={courier.courier} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {courier.courier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRtoColor(courier.rto_percentage)}`}>
                      {courier.rto_percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {courier.rto_loss_formatted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      {data.couriers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Key Insights</h3>
          <div className="space-y-2 text-sm text-blue-800">
            {data.couriers.some(c => c.rto_percentage > 15) && (
              <div>• High RTO rates detected (&gt;15%). Consider reviewing packaging quality and delivery addresses.</div>
            )}
            {data.couriers.some(c => c.rto_percentage > 10) && (
              <div>• Multiple couriers with RTO rates above 10%. Address verification may help reduce returns.</div>
            )}
            {data.summary.total_loss > 0 && (
              <div>• Total logistics loss of {formatCurrency(data.summary.total_loss)} impacts overall profitability.</div>
            )}
            {data.couriers.length === 1 && (
              <div>• Consider using multiple couriers to diversify risk and compare performance.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LogisticsPage;
