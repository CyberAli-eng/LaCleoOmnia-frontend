"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { MenuSection } from "./MenuSection";
import { useUIStore } from "@/src/stores/uiStore";
import { useAuthStore } from "@/src/stores/authStore";
import { authFetch } from "@/utils/api";
import { cn } from "@/src/lib/utils";
import { navigationConfig } from "@/src/constants/navigation";

interface ConnectedChannel {
  id: string;
  name: string;
}

export function Sidebar() {
  const {
    sidebarCollapsed,
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    closeAllSubmenus,
  } = useUIStore();

  const user = useAuthStore((state) => state.user);
  const [connectedChannels, setConnectedChannels] = useState<ConnectedChannel[]>([]);

  // Close submenus when sidebar is collapsed
  useEffect(() => {
    if (sidebarCollapsed) {
      closeAllSubmenus();
    }
  }, [sidebarCollapsed, closeAllSubmenus]);

  // Load connected channels
  useEffect(() => {
    const loadConnectedChannels = async () => {
      try {
        const list = await authFetch("/integrations/connected-summary").catch(() => []);
        setConnectedChannels(Array.isArray(list) ? list : []);
      } catch {
        setConnectedChannels([]);
      }
    };
    loadConnectedChannels();
  }, []);

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full",
          "border-r border-slate-200 bg-white shadow-xl",
          "transform transition-all duration-300 ease-out",
          "lg:relative lg:z-auto lg:translate-x-0 lg:shadow-none",
          // Mobile
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop width
          sidebarCollapsed ? "lg:w-16" : "lg:w-72",
          // Mobile width
          "w-72 max-w-[85vw]"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div
            className={cn(
              "flex shrink-0 items-center border-b border-slate-200",
              sidebarCollapsed
                ? "lg:flex-col lg:gap-2 lg:px-0 lg:py-4 p-4"
                : "justify-between p-4 lg:p-6"
            )}
          >
            <Link
              href="/dashboard"
              onClick={closeMobileSidebar}
              className={cn(
                "text-xl font-bold text-blue-600 hover:text-blue-700",
                "transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded",
                sidebarCollapsed && "lg:text-2xl"
              )}
              title={sidebarCollapsed ? "LaCleoOmnia" : undefined}
            >
              {sidebarCollapsed ? "L" : "LaCleoOmnia"}
            </Link>

            {/* Mobile close button */}
            <button
              onClick={closeMobileSidebar}
              className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Subtitle - hidden when collapsed */}
          {!sidebarCollapsed && (
            <div className="px-6 pb-3">
              <p className="text-xs text-slate-500">Order Management System</p>
            </div>
          )}

          {/* Connected channels - hidden when collapsed */}
          {!sidebarCollapsed && connectedChannels.length > 0 && (
            <div className="px-6 mb-4 shrink-0">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Channels</p>
              <div className="space-y-2">
                {connectedChannels.map((ch) => (
                  <div key={ch.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 truncate">{ch.name}</span>
                    <span className="text-green-600 shrink-0" title="Connected">✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Menu sections */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
            {navigationConfig.sections.map((section) => (
              <div key={section.id} className="mb-6">
                {section.label && !sidebarCollapsed && (
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {section.label}
                  </h3>
                )}
                <MenuSection
                  items={section.items}
                  collapsed={sidebarCollapsed}
                  onLinkClick={closeMobileSidebar}
                />
              </div>
            ))}
          </div>

          {/* Quick Actions - hide when collapsed */}
          {!sidebarCollapsed && (
            <div className="px-6 pt-6 border-t border-slate-200 shrink-0">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Quick Actions</p>
              <div className="space-y-1 mb-4">
                <Link
                  href="/dashboard/integrations"
                  onClick={closeMobileSidebar}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  + Import Orders
                </Link>
                <Link
                  href="/dashboard/orders"
                  onClick={closeMobileSidebar}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Create Shipment
                </Link>
                <Link
                  href="/dashboard/labels"
                  onClick={closeMobileSidebar}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Print Labels
                </Link>
                <button
                  onClick={() => {
                    alert("Sync started");
                  }}
                  className="w-full text-left rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Sync Now
                </button>
              </div>
            </div>
          )}

          {/* User info - bottom */}
          {!sidebarCollapsed && user && (
            <div className="shrink-0 border-t border-slate-200 p-4">
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-medium">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {user.name || user.email}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user.role || "User"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapse toggle - desktop only */}
          <div className="hidden shrink-0 border-t border-slate-200 p-2 lg:block">
            <button
              onClick={toggleSidebar}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg py-2",
                "text-sm font-medium text-slate-600",
                "hover:bg-slate-100 hover:text-slate-900",
                "transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500"
              )}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
