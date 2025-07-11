import { create } from "zustand";

interface SidenavState {
  isOpen: boolean;
  toggleSidenav: () => void;
}

export const useSidenavStore = create<SidenavState>((set) => ({
  isOpen: false,
  toggleSidenav: () => set((state) => ({ isOpen: !state.isOpen })),
}));
