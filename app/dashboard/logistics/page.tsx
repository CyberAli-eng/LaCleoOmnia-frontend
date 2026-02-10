"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import { formatCurrency } from "@/utils/currency";

interface RtoPincode {
  pincode: string;
  orders: number;
  rtoCount: number;
  rtoRate: number;
  lossAmount: number;
}

interface RtoData {
  rtoRate: number;
  totalLoss: number;
  totalOrders: number;
  rtoCount: number;
  topPincodes: RtoPincode[];
  rows?: RtoPincode[];
}

export default function LogisticsPage() {
  const [data, setData] = useState<RtoData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/logistics/rto").catch(() => null);
      if (res) setData(res as RtoData);
      else setData({ rtoRate: 0, totalLoss: 0, totalOrders: 0, rtoCount: 0, topPincodes: [] });
    } catch {
      setData({ rtoRate: 0, totalLoss: 0, totalOrders: 0, rtoCount: 0, topPincodes: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-slate-500">Loading logistics RTO…</div>
      </div>
    );
  }

  const d = data || { rtoRate: 0, totalLoss: 0, totalOrders: 0, rtoCount: 0, topPincodes: [] };
  const rows = d.rows ?? d.topPincodes ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Logistics</h1>
        <p className="mt-1 text-sm text-slate-600">RTO and loss by pincode</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-6">
          <p className="text-sm font-medium text-amber-800">RTO %</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{Number(d.rtoRate).toFixed(1)}%</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/80 p-6">
          <p className="text-sm font-medium text-red-800">Loss</p>
          <p className="mt-2 text-2xl font-bold text-red-700">{formatCurrency(d.totalLoss ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">Total orders</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{d.totalOrders ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">RTO count</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{d.rtoCount ?? 0}</p>
        </div>
      </div>

      {/* Top pincodes table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Top pincodes (RTO / loss)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Pincode</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Orders</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">RTO</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">RTO %</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Loss</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.pincode} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-6 font-medium text-slate-900">{r.pincode}</td>
                  <td className="py-3 px-6 text-right text-slate-900">{r.orders}</td>
                  <td className="py-3 px-6 text-right text-amber-700">{r.rtoCount}</td>
                  <td className="py-3 px-6 text-right text-amber-700">{Number(r.rtoRate).toFixed(1)}%</td>
                  <td className="py-3 px-6 text-right font-medium text-red-600">{formatCurrency(r.lossAmount ?? 0)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No pincode data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
