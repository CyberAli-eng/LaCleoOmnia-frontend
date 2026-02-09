"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Zap, ChevronDown } from "lucide-react";
import { useUIStore } from "@/src/stores/uiStore";
import { useAuthStore } from "@/src/stores/authStore";
import { deleteCookie } from "@/utils/cookies";
import { cn } from "@/src/lib/utils";

export function DashboardHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const { setSidebarOpen } = useUIStore();
  const { user, logout } = useAuthStore();

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/orders?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    deleteCookie("token");
    logout();
    router.replace("/login");
  };

  return (
    <div className="relative shrink-0 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        {/* Left: Mobile menu + Search */}
        <div className="flex flex-1 items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Global search */}
          <form onSubmit={handleGlobalSearch} className="hidden sm:block max-w-md flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders, customers, SKUs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
        </div>

        {/* Right: Quick actions + Account */}
        <div className="flex items-center gap-2">
          {/* Quick actions */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                showQuickActions
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Actions</span>
            </button>

            {showQuickActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowQuickActions(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                  <Link
                    href="/dashboard/integrations"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setShowQuickActions(false)}
                  >
                    Import Orders
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setShowQuickActions(false)}
                  >
                    Create Shipment
                  </Link>
                  <Link
                    href="/dashboard/labels"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setShowQuickActions(false)}
                  >
                    Print Labels
                  </Link>
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      alert("Sync started");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Sync Now
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Account dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white font-medium">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden sm:inline truncate max-w-[100px]">
                {user?.name || user?.email || "Account"}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 text-slate-500 transition-transform",
                accountOpen && "rotate-180"
              )} />
            </button>

            {accountOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setAccountOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <div className="px-4 py-2 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-slate-500">{user?.role || "User"}</p>
                  </div>
                  <Link
                    href="/privacy"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setAccountOpen(false)}
                  >
                    Privacy
                  </Link>
                  <Link
                    href="/terms"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setAccountOpen(false)}
                  >
                    Terms
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border-t border-slate-200"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
