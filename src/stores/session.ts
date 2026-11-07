import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Données de profil de l'utilisateur connecté (équivalent du modèle Person du mobile).
 * Le JWT n'est jamais ici : il vit dans le cookie HttpOnly géré par le BFF.
 */
export interface SessionUser {
  userId: number;
  /** Absent pour un compte ORGANISM, qui n'a pas de Person. */
  personId: number | null;
  username: string;
  firstname?: string | null;
  lastname?: string | null;
  role?: string;
  picture?: string | null;
  coverPicture?: string | null;
  sport?: string | null;
  clubName?: string | null;
  residence?: string | null;
  /** Badge vérifié et cadre « Open to tryouts », relus sur la fiche Person. */
  verified?: boolean;
  openToTryouts?: boolean;
}

interface SessionState {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  patchUser: (patch: Partial<SessionUser>) => void;
  clear: () => void;
}

export const SESSION_STORAGE_KEY = "atlight.session";

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      patchUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      clear: () => set({ user: null }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
