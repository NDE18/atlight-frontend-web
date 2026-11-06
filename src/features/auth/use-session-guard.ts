"use client";

import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { apiClient } from "@/shared/api/client";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { useSessionStore } from "@/stores/session";
import type { PersonInfo } from "./types";
import { performLogout } from "./use-logout";

/** `GET /api/person/{id}` : la fiche Person complète, dont le web ne lit que le profil. */
export const currentPersonQuery = (personId: number) =>
  queryOptions({
    queryKey: ["person", personId],
    queryFn: () => apiClient<PersonInfo>(`person/${personId}`),
    staleTime: 5 * 60_000,
  });

/**
 * Session persistante et expiration (AUTH-05, AUTH-06) pour l'espace connecté :
 * - le profil est relu au backend, ce qui vérifie le jeton (un 401 déconnecte via apiClient) ;
 * - cookie présent mais profil local absent : session incohérente, déconnexion propre ;
 * - page restaurée depuis le cache du navigateur (retour arrière) : la session est revérifiée.
 */
export function useSessionGuard() {
  const hydrated = useHydrated();
  const user = useSessionStore((s) => s.user);
  const patchUser = useSessionStore((s) => s.patchUser);
  const queryClient = useQueryClient();
  const loggingOut = useRef(false);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    if (hydrated && !user && !loggingOut.current) {
      loggingOut.current = true;
      void performLogout(queryClient);
    }
  }, [hydrated, user, queryClient]);

  const personId = user?.personId ?? null;
  const { data: person } = useQuery({
    ...currentPersonQuery(personId ?? 0),
    enabled: personId !== null,
  });

  useEffect(() => {
    if (!person) return;
    patchUser({
      firstname: person.firstname,
      lastname: person.lastname,
      picture: person.picture,
      coverPicture: person.coverPicture,
      sport: person.sport,
      clubName: person.clubName,
      residence: person.residence,
      verified: person.verified ?? false,
      openToTryouts: person.openToTryouts ?? false,
    });
  }, [person, patchUser]);

  return { hydrated, user };
}
