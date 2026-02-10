import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OrdersFilters {
  searchTerm: string;
  status: string;
}

interface OrdersState {
  filters: OrdersFilters;
  selectedOrders: Set<string>;
  bulkAction: string;

  // Actions
  setFilter: (key: keyof OrdersFilters, value: string) => void;
  resetFilters: () => void;
  toggleOrderSelection: (orderId: string) => void;
  clearSelection: () => void;
  selectAll: (orderIds: string[]) => void;
  setBulkAction: (action: string) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      filters: {
        searchTerm: '',
        status: 'all',
      },
      selectedOrders: new Set<string>(),
      bulkAction: '',

      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }));
      },

      resetFilters: () => {
        set({
          filters: { searchTerm: '', status: 'all' },
        });
      },

      toggleOrderSelection: (orderId) => {
        set((state) => {
          const newSelected = new Set(state.selectedOrders);
          if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
          } else {
            newSelected.add(orderId);
          }
          return { selectedOrders: newSelected };
        });
      },

      clearSelection: () => {
        set({ selectedOrders: new Set<string>(), bulkAction: '' });
      },

      selectAll: (orderIds) => {
        set({ selectedOrders: new Set(orderIds) });
      },

      setBulkAction: (action) => {
        set({ bulkAction: action });
      },
    }),
    {
      name: 'orders-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
      }),
      // Don't persist selections and bulk actions
    }
  )
);
