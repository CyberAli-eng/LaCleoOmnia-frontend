import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string | number;
  pattern?: string; // Regex pattern for active state matching
  children?: MenuItem[];
  requiredRole?: 'ADMIN' | 'USER';
  external?: boolean;
}

export interface MenuSection {
  id: string;
  label?: string; // Optional section label
  items: MenuItem[];
}

export interface NavigationConfig {
  sections: MenuSection[];
}
