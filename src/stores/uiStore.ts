import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ModalState {
  orderDetail: string | null;
  stockAdjust: boolean;
  [key: string]: any;
}

interface UIState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  modals: ModalState;
  openSubmenus: Set<string>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSubmenu: (menuId: string) => void;
  setSubmenuOpen: (menuId: string, open: boolean) => void;
  closeAllSubmenus: () => void;
  openModal: (modal: keyof ModalState, data?: any) => void;
  closeModal: (modal: keyof ModalState) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarOpen: true,
      openSubmenus: new Set<string>(),
      modals: {
        orderDetail: null,
        stockAdjust: false,
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      toggleSubmenu: (menuId) => {
        set((state) => {
          const newSet = new Set(state.openSubmenus);
          if (newSet.has(menuId)) {
            newSet.delete(menuId);
          } else {
            newSet.add(menuId);
          }
          return { openSubmenus: newSet };
        });
      },

      setSubmenuOpen: (menuId, open) => {
        set((state) => {
          const newSet = new Set(state.openSubmenus);
          if (open) {
            newSet.add(menuId);
          } else {
            newSet.delete(menuId);
          }
          return { openSubmenus: newSet };
        });
      },

      closeAllSubmenus: () => {
        set({ openSubmenus: new Set<string>() });
      },

      openModal: (modal, data = null) => {
        set((state) => ({
          modals: { ...state.modals, [modal]: data !== null ? data : true },
        }));
      },

      closeModal: (modal) => {
        set((state) => ({
          modals: { ...state.modals, [modal]: null },
        }));
      },

      closeAllModals: () => {
        set({
          modals: {
            orderDetail: null,
            stockAdjust: false,
          },
        });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      // Don't persist modals and sidebarOpen
    }
  )
);
