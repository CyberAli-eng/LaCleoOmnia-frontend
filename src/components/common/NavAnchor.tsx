"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface NavAnchorProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  pattern?: string; // Regex pattern for active matching
  collapsed?: boolean;
  badge?: string | number;
  external?: boolean;
  onClick?: () => void;
  level?: number; // 0 = top level, 1+ = submenu levels
}

export function NavAnchor({
  href,
  label,
  icon: Icon,
  pattern,
  collapsed = false,
  badge,
  external = false,
  onClick,
  level = 0,
}: NavAnchorProps) {
  const pathname = usePathname();

  // Active state detection with wildcard pattern matching
  const isActive = (() => {
    if (pattern) {
      try {
        const regex = new RegExp(pattern);
        return regex.test(pathname);
      } catch (e) {
        console.error('Invalid pattern:', pattern, e);
        return false;
      }
    }

    // Default: exact match for home, startsWith for others
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  })();

  const linkClasses = cn(
    "flex items-center gap-3 rounded-lg transition-all duration-200",
    "group relative",
    level === 0 ? "px-3 py-2.5" : "px-3 py-2 pl-10", // Indent submenus
    collapsed && level === 0 && "justify-center px-2",
    isActive
      ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
  );

  const content = (
    <>
      {Icon && (
        <Icon
          className={cn(
            "shrink-0 transition-colors",
            isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700",
            collapsed ? "h-5 w-5" : "h-5 w-5"
          )}
        />
      )}
      {!collapsed && (
        <span className="flex-1 truncate">{label}</span>
      )}
      {!collapsed && badge && (
        <span className="ml-auto shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          {badge}
        </span>
      )}
      {collapsed && (
        <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white group-hover:block z-50">
          {label}
        </span>
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={linkClasses}
      onClick={onClick}
      title={collapsed ? label : undefined}
    >
      {content}
    </Link>
  );
}
