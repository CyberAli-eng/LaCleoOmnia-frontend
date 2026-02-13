"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import { formatCurrency } from "@/utils/currency";
import Link from "next/link";
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
  Legend,
} from "recharts";
import { useFinancePolling } from "./useFinancePolling";

interface FinanceOverview {
  revenue?: number;
  netProfit?: number;
  loss?: number;
  rtoPercent?: number;
  cashPending?: number;
  codPercent?: number;
  profitLossLine?: Array<{ period: string; profit: number; revenue?: number }>;
  settledVsPending?: Array<{ period: string; settled: number; pending: number }>;
  codVsPrepaid?: Array<{ period: string; cod: number; prepaid: number }>;
  recentOrders?: Array<{
    id: string;
    externalId?: string;
    source?: string;
    status?: string;
    total?: number;
    createdAt?: string | null;
  }>;
}

interface Overview {
  todayRevenue: number;
  yesterdayRevenue: number;
  todayOrders: number;
  todayItems: number;
  yesterdayItems: number;
  orderAlerts: { pendingOrders: number; pendingShipment: 0 };
  productAlerts: { lowStockCount: 0 };
  channelAlerts: { connectedCount: 0 };
  recentOrders: [];
  // Razorpay specific metrics
  gatewayPending: number;
  gatewaySettled: number;
  gatewayFees: number;
  // Financial metrics
  netProfit?: number;
  rtoLoss?: number;
  codPercent?: number;
  cashPending?: number;
}

interface SyncJob {
  finishedAt?: string;
  startedAt?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const [financeOverview, setFinanceOverview] = useState<FinanceOverview | null>(null);
  const [legacyOverview, setLegacyOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      const [financeRes, overviewRes, syncJobs] = await Promise.all([
        authFetch("/finance/overview").catch(() => null),
        authFetch("/analytics/overview").catch(() => null),
        authFetch("/workers").catch(() => []),
      ]);
      setFinanceOverview((financeRes as FinanceOverview) || null);
      setLegacyOverview((overviewRes as Overview) || null);
      const jobs = Array.isArray(syncJobs) ? (syncJobs as SyncJob[]) : (syncJobs as { jobs?: SyncJob[] })?.jobs || [];
      if (jobs.length > 0) {
        const last = jobs.sort((a, b) => {
          const tA = new Date(a.finishedAt || a.startedAt || a.createdAt || 0).getTime();
          const tB = new Date(b.finishedAt || b.startedAt || b.createdAt || 0).getTime();
          return tB - tA;
        })[0];
        setLastSync(last?.finishedAt || last?.startedAt || last?.createdAt || null);
      }
    } catch (err) {
      // Failed to load dashboard
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useFinancePolling(loadDashboard, true);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-slate-500">Loading overview…</div>
      </div>
    );
  }

  const fo = financeOverview || {};
  const lo = legacyOverview || {
    todayRevenue: 0,
    yesterdayRevenue: 0,
    todayOrders: 0,
    yesterdayOrders: 0,
    todayItems: 0,
    yesterdayItems: 0,
    orderAlerts: { pendingOrders: 0, pendingShipment: 0 },
    productAlerts: { lowStockCount: 0 },
    channelAlerts: { connectedCount: 0 },
    recentOrders: [],
    // Razorpay specific metrics
    gatewayPending: 0,
    gatewaySettled: 0,
    gatewayFees: 0,
    // Financial metrics
    netProfit: 0,
    rtoLoss: 0,
    codPercent: 0,
    cashPending: 0,
  };
  const revenue = fo.revenue ?? lo.todayRevenue ?? 0;
  const netProfit = fo.netProfit ?? lo.netProfit ?? 0;
  const loss = fo.loss ?? lo.rtoLoss ?? 0;
  const rtoPercent = fo.rtoPercent ?? 0;
  const cashPending = fo.cashPending ?? lo.cashPending ?? 0;
  const codPercent = fo.codPercent ?? 0;
  const recentOrders = fo.recentOrders ?? lo.recentOrders ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Profit & cashflow at a glance</p>
        </div>
        {lastSync && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Last sync</p>
            <p className="text-sm font-medium text-slate-700">{new Date(lastSync).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Phase B: KPI cards — every ₹ clickable */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Link
          href="/dashboard/orders"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors"
        >
          <p className="text-xs font-medium text-slate-500">Revenue</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(revenue)}</p>
        </Link>
        <Link
          href="/dashboard/pnl"
          className={`rounded-xl border p-5 shadow-sm transition-colors ${
            netProfit >= 0 ? "border-green-200 bg-green-50 hover:border-green-300" : "border-red-200 bg-red-50 hover:border-red-300"
          }`}
        >
          <p className="text-xs font-medium text-slate-500">Net Profit</p>
          <p className={`mt-2 text-xl font-bold ${netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
            {formatCurrency(netProfit)}
          </p>
        </Link>
        <Link
          href="/dashboard/risk"
          className="rounded-xl border border-red-200 bg-red-50/80 p-5 shadow-sm hover:border-red-300 transition-colors"
        >
          <p className="text-xs font-medium text-red-800">Loss</p>
          <p className="mt-2 text-xl font-bold text-red-700">{formatCurrency(loss)}</p>
        </Link>
        <Link
          href="/dashboard/logistics"
          className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm hover:border-amber-300 transition-colors"
        >
          <p className="text-xs font-medium text-amber-800">RTO %</p>
          <p className="mt-2 text-xl font-bold text-amber-700">{Number(rtoPercent).toFixed(1)}%</p>
        </Link>
        <Link
          href="/dashboard/settlements"
          className="flex justify-between rounded-xl border border-yellow-200 bg-yellow-50/80 p-5 shadow-sm hover:border-yellow-300 transition-colors"
        >
          <p className="text-xs font-medium text-yellow-800">Cash Pending</p>
          <p className="mt-2 text-xl font-bold text-yellow-700">{formatCurrency(cashPending)}</p>
        </Link>
        <Link
          href="/dashboard/settlements"
          className="flex justify-between rounded-xl border border-purple-200 bg-purple-50/80 p-5 shadow-sm hover:border-purple-300 transition-colors"
        >
          <p className="text-xs font-medium text-purple-800">Gateway Pending</p>
          <p className="mt-2 text-xl font-bold text-purple-700">{formatCurrency(lo.gatewayPending || 0)}</p>
        </Link>
        <Link
          href="/dashboard/settlements"
          className="flex justify-between rounded-xl border border-green-200 bg-green-50/80 p-5 shadow-sm hover:border-green-300 transition-colors"
        >
          <p className="text-xs font-medium text-green-800">Gateway Settled</p>
          <p className="mt-2 text-xl font-bold text-green-700">{formatCurrency(lo.gatewaySettled || 0)}</p>
        </Link>
        <Link
          href="/dashboard/orders?payment=COD"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors"
        >
          <p className="text-xs font-medium text-slate-500">COD %</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{Number(codPercent).toFixed(1)}%</p>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {(fo.profitLossLine?.length ?? 0) > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Profit / Loss trend</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={fo.profitLossLine}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={(v) => `${v}`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), ""]} />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {(fo.settledVsPending?.length ?? 0) > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Settled vs Pending</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={fo.settledVsPending} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} />
                <Tooltip />
                <Legend />
                <Bar dataKey="settled" fill="#10b981" name="Settled" />
                <Bar dataKey="pending" fill="#eab308" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {(fo.codVsPrepaid?.length ?? 0) > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">COD vs Prepaid</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={fo.codVsPrepaid} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cod" fill="#f59e0b" name="COD" />
                <Bar dataKey="prepaid" fill="#3b82f6" name="Prepaid" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Alerts + Recent orders */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 mb-3">Alerts</h2>
          <div className="space-y-2">
            <Link href="/dashboard/orders?status=NEW" className="flex justify-between rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm hover:bg-amber-50">
              <span className="text-amber-800">Pending orders</span>
              <span className="font-bold text-amber-700">{lo.orderAlerts.pendingOrders}</span>
            </Link>
            <Link href="/dashboard/settlements" className="flex justify-between rounded-lg border border-yellow-200 bg-yellow-50/80 px-3 py-2 text-sm hover:bg-yellow-50">
              <span className="text-yellow-800">Cash pending</span>
              <span className="font-bold text-yellow-700">{formatCurrency(cashPending)}</span>
            </Link>
            <Link href="/dashboard/risk" className="flex justify-between rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-sm hover:bg-red-50">
              <span className="text-red-800">RTO loss</span>
              <span className="font-bold text-red-700">{formatCurrency(loss)}</span>
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
            <Link href="/dashboard/orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentOrders.slice(0, 8).map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 py-2.5 px-3 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">#{order.externalId || order.id}</p>
                  <p className="text-xs text-slate-500">{order.source ?? ""} · {order.status ?? ""}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(order.total ?? 0)}</p>
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-slate-500">
                <p className="text-sm">No orders yet</p>
                <Link href="/dashboard/integrations" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">Connect a channel</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
