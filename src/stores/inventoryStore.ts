import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface InventoryFilters {
  searchTerm: string;
  warehouse: string;
  lowStockOnly: boolean;
}

interface InventoryState {
  filters: InventoryFilters;

  // Actions
  setFilter: (key: keyof InventoryFilters, value: string | boolean) => void;
  resetFilters: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      filters: {
        searchTerm: '',
        warehouse: 'all',
        lowStockOnly: false,
      },

      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }));
      },

      resetFilters: () => {
        set({
          filters: { searchTerm: '', warehouse: 'all', lowStockOnly: false },
        });
      },
    }),
    {
      name: 'inventory-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
