import { create } from "zustand";

/** État d'interface transverse (équivalent AppState du mobile). */
interface AppState {
  /** Compteur du badge de notifications. */
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;
  /** Modale d'offre premium, ouverte par toute réponse 402. */
  upsellOpen: boolean;
  openUpsell: () => void;
  closeUpsell: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  unreadNotifications: 0,
  setUnreadNotifications: (unreadNotifications) => set({ unreadNotifications }),
  upsellOpen: false,
  openUpsell: () => set({ upsellOpen: true }),
  closeUpsell: () => set({ upsellOpen: false }),
}));
