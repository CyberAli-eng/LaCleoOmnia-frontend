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
      ],
    },
    {
      id: "operations",
      label: "Operations",
      items: [
        {
          id: "labels",
          label: "Labels",
          href: "/dashboard/labels",
          icon: Tag,
          pattern: "^/dashboard/labels",
        },
        {
          id: "workers",
          label: "Sync & Workers",
          href: "/dashboard/workers",
          icon: Settings,
          pattern: "^/dashboard/workers",
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
