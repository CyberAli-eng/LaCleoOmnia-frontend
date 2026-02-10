"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCookie, deleteCookie, setCookie } from "@/utils/cookies";
import { authFetch } from "@/utils/api";
import { useAuthStore } from "@/src/stores/authStore";
import { Sidebar } from "@/src/components/common/Sidebar";
import { DashboardHeader } from "@/src/components/common/DashboardHeader";

interface ConnectedChannel {
  id: string;
  name: string;
}

const connectedChannelsStore = (() => {
  let data: ConnectedChannel[] = [];
  let fetching = false;
  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const fetchData = async () => {
    if (fetching) return;
    fetching = true;
    try {
      const list = await authFetch("/integrations/connected-summary").catch(() => []);
      data = Array.isArray(list) ? list : [];
    } catch {
      data = [];
    } finally {
      fetching = false;
      notify();
    }
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        void fetchData();
      }
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return data;
    },
    refresh() {
      void fetchData();
    },
  };
})();

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    // Auth check
    const token = getCookie("token") || localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Sync token across storage
    if (!localStorage.getItem("token") && token) {
      localStorage.setItem("token", token);
    }
    if (!getCookie("token") && token) {
      setCookie("token", token, 7);
    }

    // Load user data
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setAuth(token, user);
      } catch {
        logout();
      }
    }

    // Refresh user from API
    authFetch("/auth/me")
      .then((user) => {
        if (user) {
          setAuth(token, user);
        }
      })
      .catch(() => {
        logout();
        router.replace("/login");
      });
  }, [router, setAuth, logout]);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />

        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
