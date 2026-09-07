import { create } from "zustand";

/**
 * Client-side UI state (not server data — that lives in TanStack Query).
 * Kept intentionally small; grows as the console gains surfaces.
 */
export interface UiState {
  /** Whether the (future) admin nav sidebar is open on mobile. */
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
