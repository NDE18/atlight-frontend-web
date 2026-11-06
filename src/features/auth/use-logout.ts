"use client";

import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSessionStore } from "@/stores/session";
import { authApi } from "./api";
import { pendingVerification } from "./pending-verification";

/**
 * Déconnexion (AUTH-06) : JWT mis en liste noire et cookie effacé par le BFF, puis toutes les
 * données de session effacées côté navigateur. Le rechargement complet sur /login (sans entrée
 * d'historique) vide la mémoire : le retour arrière ne réaffiche pas l'espace connecté.
 */
export async function performLogout(queryClient: QueryClient): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // Backend injoignable : le BFF a tout de même effacé le cookie s'il a été atteint.
  }
  queryClient.clear();
  useSessionStore.getState().clear();
  pendingVerification.clear();
  window.location.replace("/login");
}

export function useLogout() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const logout = async () => {
    if (pending) return;
    setPending(true);
    await performLogout(queryClient);
  };
  return { logout, pending };
}
