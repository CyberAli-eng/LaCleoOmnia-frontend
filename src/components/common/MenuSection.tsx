"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { NavAnchor } from "./NavAnchor";
import { MenuItem } from "@/src/types/navigation.types";
import { useUIStore } from "@/src/stores/uiStore";
import { useAuthStore } from "@/src/stores/authStore";
import { cn } from "@/src/lib/utils";

interface MenuSectionProps {
  items: MenuItem[];
  collapsed: boolean;
  onLinkClick?: () => void;
}

export function MenuSection({ items, collapsed, onLinkClick }: MenuSectionProps) {
  const { openSubmenus, toggleSubmenu } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    // Role-based filtering
    if (item.requiredRole && userRole !== item.requiredRole) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSubmenus.has(item.id);

    if (hasChildren) {
      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleSubmenu(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
              "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? item.label : undefined}
          >
            {item.icon && (
              <item.icon className="h-5 w-5 shrink-0 text-slate-500" />
            )}
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-left">{item.label}</span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
                )}
              </>
            )}
            {item.badge && !collapsed && (
              <span className="ml-auto shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                {item.badge}
              </span>
            )}
          </button>

          {!collapsed && isOpen && (
            <div className="space-y-1 overflow-hidden">
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Regular link item
    if (item.href) {
      return (
        <NavAnchor
          key={item.id}
          href={item.href}
          label={item.label}
          icon={item.icon}
          pattern={item.pattern}
          collapsed={collapsed}
          badge={item.badge}
          external={item.external}
          onClick={onLinkClick}
          level={level}
        />
      );
    }

    return null;
  };

  return (
    <nav className="space-y-1">
      {items.map((item) => renderMenuItem(item))}
    </nav>
  );
}
