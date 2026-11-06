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
  /** Message bref en bas de l'écran (« Bientôt disponible sur le web », « Lien copié »…). */
  toast: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useAppStore = create<AppState>()((set) => ({
  unreadNotifications: 0,
  setUnreadNotifications: (unreadNotifications) => set({ unreadNotifications }),
  upsellOpen: false,
  openUpsell: () => set({ upsellOpen: true }),
  closeUpsell: () => set({ upsellOpen: false }),
  toast: null,
  showToast: (toast) => {
    clearTimeout(toastTimer);
    set({ toast });
    toastTimer = setTimeout(() => set({ toast: null }), 3200);
  },
  hideToast: () => {
    clearTimeout(toastTimer);
    set({ toast: null });
  },
}));
