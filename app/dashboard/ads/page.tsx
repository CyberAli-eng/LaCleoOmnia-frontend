"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import { formatCurrency } from "@/utils/currency";
import Link from "next/link";

interface AdsChannel {
  id: string;
  name: string;
  spend: number;
  orders: number;
  revenue: number;
  profit: number;
  roas?: number;
}

interface AdsOrder {
  orderId: string;
  channel: string;
  campaign?: string;
  adSpend: number;
  revenue: number;
  profit: number;
  date: string;
}

interface AdsData {
  channels: AdsChannel[];
  orders: AdsOrder[];
  totalSpend: number;
  totalRevenue: number;
  totalProfit: number;
}

export default function AdsPage() {
  const [data, setData] = useState<AdsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/finance/ads").catch(() => null);
      if (res) setData(res as AdsData);
      else setData({ channels: [], orders: [], totalSpend: 0, totalRevenue: 0, totalProfit: 0 });
    } catch {
      setData({ channels: [], orders: [], totalSpend: 0, totalRevenue: 0, totalProfit: 0 });
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
        <div className="text-slate-500">Loading ads attribution…</div>
      </div>
    );
  }

  const d = data || { channels: [], orders: [], totalSpend: 0, totalRevenue: 0, totalProfit: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ads Attribution</h1>
        <p className="mt-1 text-sm text-slate-600">Channel spend and profit impact</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/ads"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition-colors"
        >
          <p className="text-sm font-medium text-slate-500">Total spend</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(d.totalSpend)}</p>
        </Link>
        <Link
          href="/dashboard/ads"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition-colors"
        >
          <p className="text-sm font-medium text-slate-500">Revenue (attributed)</p>
          <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(d.totalRevenue)}</p>
        </Link>
        <Link
          href="/dashboard/ads"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition-colors"
        >
          <p className="text-sm font-medium text-slate-500">Profit impact</p>
          <p className={`mt-2 text-2xl font-bold ${(d.totalProfit ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(d.totalProfit ?? 0)}
          </p>
        </Link>
      </div>

      {/* Channel cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">By channel</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(d.channels || []).map((ch) => (
            <div
              key={ch.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition-colors"
            >
              <p className="font-medium text-slate-900">{ch.name}</p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-slate-600">Spend: <span className="font-medium text-slate-900">{formatCurrency(ch.spend)}</span></p>
                <p className="text-slate-600">Orders: <span className="font-medium text-slate-900">{ch.orders}</span></p>
                <p className="text-slate-600">Revenue: <span className="font-medium text-green-600">{formatCurrency(ch.revenue)}</span></p>
                <p className="text-slate-600">Profit: <span className={`font-medium ${(ch.profit ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(ch.profit ?? 0)}</span></p>
                {ch.roas != null && <p className="text-slate-600">ROAS: <span className="font-medium">{ch.roas.toFixed(2)}x</span></p>}
              </div>
            </div>
          ))}
          {(d.channels || []).length === 0 && (
            <p className="col-span-full text-slate-500 py-4">No channel data yet. Connect ad platforms in Settings.</p>
          )}
        </div>
      </div>

      {/* Order-level table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Order-level attribution</h2>
          <p className="text-sm text-slate-600 mt-1">Profit impact per order</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Order</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Channel</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Date</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Ad spend</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Revenue</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Profit</th>
              </tr>
            </thead>
            <tbody>
              {(d.orders || []).slice(0, 100).map((row, i) => (
                <tr key={row.orderId + i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-6">
                    <Link href={`/dashboard/orders/${row.orderId}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      #{String(row.orderId).slice(-8)}
                    </Link>
                  </td>
                  <td className="py-3 px-6 text-slate-900">{row.channel}</td>
                  <td className="py-3 px-6 text-slate-600">{row.date ? new Date(row.date).toLocaleDateString() : "—"}</td>
                  <td className="py-3 px-6 text-right text-slate-900">{formatCurrency(row.adSpend)}</td>
                  <td className="py-3 px-6 text-right text-green-600">{formatCurrency(row.revenue)}</td>
                  <td className={`py-3 px-6 text-right font-medium ${(row.profit ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(row.profit ?? 0)}
                  </td>
                </tr>
              ))}
              {(!d.orders || d.orders.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No order-level ads data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
