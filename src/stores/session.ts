import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Données de profil de l'utilisateur connecté (équivalent du modèle Person du mobile).
 * Le JWT n'est jamais ici : il vit dans le cookie HttpOnly géré par le BFF.
 */
export interface SessionUser {
  userId: number;
  personId: number;
  username: string;
  firstname?: string;
  lastname?: string;
  role?: string;
  picture?: string | null;
  coverPicture?: string | null;
}

interface SessionState {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  patchUser: (patch: Partial<SessionUser>) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      patchUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      clear: () => set({ user: null }),
    }),
    {
      name: "atlight.session",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
