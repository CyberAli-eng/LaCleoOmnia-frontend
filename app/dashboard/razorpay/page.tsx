"use client";

import { useState, useEffect } from "react";
import { CreditCard, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { DashboardHeader } from "@/src/components/common/DashboardHeader";

export default function RazorpayPage() {
  const [payments, setPayments] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payments");

  useEffect(() => {
    fetchRazorpayData();
  }, [activeTab]);

  const fetchRazorpayData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "payments" 
        ? "/api/razorpay/payments" 
        : "/api/razorpay/settlements";
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (activeTab === "payments") {
        setPayments(data.payments || []);
      } else {
        setSettlements(data.settlements || []);
      }
    } catch (error) {
      console.error("Failed to fetch Razorpay data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (type: "payments" | "settlements") => {
    try {
      const endpoint = type === "payments" 
        ? "/api/razorpay/sync/payments" 
        : "/api/razorpay/sync/settlements";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: 7 })
      });
      
      const result = await response.json();
      if (response.ok) {
        await fetchRazorpayData();
        alert(`Synced ${result.synced} ${type} successfully`);
      } else {
        alert("Sync failed: " + result.detail);
      }
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Sync failed. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "captured": return "bg-green-100 text-green-800";
      case "authorized": return "bg-blue-100 text-blue-800";
      case "refunded": return "bg-red-100 text-red-800";
      case "processed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "captured":
      case "processed": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Razorpay Integration</h1>
        <p className="text-gray-600 mt-2">Manage payments, settlements, and reconciliation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Payments</h3>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Settlements</h3>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{settlements.length}</div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Pending Sync</h3>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <p className="text-sm text-muted-foreground">Items to sync</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Connection Status</h3>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-green-600">Connected</div>
            <p className="text-sm text-muted-foreground">Razorpay API</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("payments")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "payments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab("settlements")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "settlements"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Settlements
            </button>
          </div>
          
          <button 
            onClick={() => handleSync(activeTab as "payments" | "settlements")}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync {activeTab === "payments" ? "Payments" : "Settlements"}
          </button>
        </div>

        <div className={activeTab === "payments" ? "block" : "hidden"}>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold pb-2">Recent Payments</h3>
            <p className="text-sm text-gray-600 mt-1">Latest Razorpay payment transactions</p>
            <div className="p-6 pt-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payments found</p>
                  <button 
                    onClick={() => handleSync("payments")}
                    className="mt-4 px-4 py-2 rounded-md font-medium transition-colors border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Sync Payments
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{payment.order_id || payment.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">₹{payment.amount?.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{payment.method}</div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(payment.status)}
                            {payment.status}
                          </div>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={activeTab === "settlements" ? "block" : "hidden"}>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold pb-2">Recent Settlements</h3>
            <p className="text-sm text-gray-600 mt-1">Latest Razorpay settlement batches</p>
            <div className="p-6 pt-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : settlements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No settlements found</p>
                  <button 
                    onClick={() => handleSync("settlements")}
                    className="mt-4 px-4 py-2 rounded-md font-medium transition-colors border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Sync Settlements
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {settlements.map((settlement: any) => (
                    <div key={settlement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{settlement.settlement_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(settlement.settlement_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {settlement.transaction_count} transactions
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">₹{settlement.amount?.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {settlement.fees && `Fees: ₹${settlement.fees?.toLocaleString()}`}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(settlement.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(settlement.status)}
                            {settlement.status}
                          </div>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
