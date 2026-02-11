import {
  LayoutDashboard,
  Package,
  Warehouse,
  DollarSign,
  Plug,
  Webhook,
  BarChart3,
  Settings,
  Tag,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { NavigationConfig } from "@/src/types/navigation.types";

export const navigationConfig: NavigationConfig = {
  sections: [
    {
      id: "main",
      items: [
        {
          id: "overview",
          label: "Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
          pattern: "^/dashboard$", // Exact match only
        },
        {
          id: "orders",
          label: "Orders",
          href: "/dashboard/orders",
          icon: Package,
          pattern: "^/dashboard/orders", // Matches /dashboard/orders and /dashboard/orders/[id]
        },
        {
          id: "inventory",
          label: "Inventory",
          href: "/dashboard/inventory",
          icon: Warehouse,
          pattern: "^/dashboard/inventory",
        },
        {
          id: "costs",
          label: "SKU Costs",
          href: "/dashboard/costs",
          icon: DollarSign,
          pattern: "^/dashboard/costs",
        },
        {
          id: "pnl",
          label: "Profit & Loss",
          href: "/dashboard/pnl",
          icon: TrendingUp,
          pattern: "^/dashboard/pnl",
        },
        {
          id: "risk",
          label: "Risk Management",
          href: "/dashboard/risk",
          icon: AlertTriangle,
          pattern: "^/dashboard/risk",
        },
      ],
    },
    {
      id: "integrations",
      label: "Integrations",
      items: [
        {
          id: "channels",
          label: "Channels",
          href: "/dashboard/integrations",
          icon: Plug,
          pattern: "^/dashboard/integrations",
        },
        {
          id: "webhooks",
          label: "Webhooks",
          href: "/dashboard/webhooks",
          icon: Webhook,
          pattern: "^/dashboard/webhooks",
        },
        {
          id: "razorpay",
          label: "Razorpay",
          href: "/dashboard/razorpay",
          icon: CreditCard,
          pattern: "^/dashboard/razorpay",
        },
      ],
    },
    {
      id: "operations",
      label: "Operations",
      items: [
        {
          id: "settlements",
          label: "Settlements",
          href: "/dashboard/settlements",
          icon: DollarSign,
          pattern: "^/dashboard/settlements",
        },
        {
          id: "logistics",
          label: "Logistics",
          href: "/dashboard/logistics",
          icon: Package,
          pattern: "^/dashboard/logistics",
        },
        {
          id: "workers",
          label: "Sync & Workers",
          href: "/dashboard/workers",
          icon: Settings,
          pattern: "^/dashboard/workers",
        },
        {
          id: "ads",
          label: "Ad Management",
          href: "/dashboard/ads",
          icon: BarChart3,
          pattern: "^/dashboard/ads",
        },
        {
          id: "labels",
          label: "Labels",
          href: "/dashboard/labels",
          icon: Tag,
          pattern: "^/dashboard/labels",
        },
        {
          id: "settings",
          label: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
          pattern: "^/dashboard/settings",
        },
      ],
    },
    {
      id: "analytics",
      label: "Analytics & Logs",
      items: [
        {
          id: "analytics",
          label: "Analytics",
          href: "/dashboard/analytics",
          icon: BarChart3,
          pattern: "^/dashboard/analytics",
        },
        {
          id: "audit",
          label: "Audit Logs",
          href: "/dashboard/audit",
          icon: FileText,
          pattern: "^/dashboard/audit",
        },
      ],
    },
    {
      id: "admin",
      items: [
        {
          id: "users",
          label: "Users",
          href: "/dashboard/users",
          icon: Users,
          pattern: "^/dashboard/users",
          requiredRole: "ADMIN",
        },
      ],
    },
  ],
};
