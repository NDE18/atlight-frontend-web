import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";

/*
 * Compteurs des badges du shell. Relus chaque minute tant que l'onglet est visible ;
 * le temps réel (STOMP) arrive au lot 4.
 */
const REFRESH_MS = 60_000;

export const unreadNotificationsQuery = (username: string) =>
  queryOptions({
    queryKey: ["notifications", "count", username],
    queryFn: async () =>
      (await apiClient<{ count?: number }>("notification/count", { query: { username } }))?.count ??
      0,
    refetchInterval: REFRESH_MS,
  });

export const unreadMessagesQuery = () =>
  queryOptions({
    queryKey: ["messages", "unread-count"],
    queryFn: async () => (await apiClient<{ count?: number }>("message/unread-count"))?.count ?? 0,
    refetchInterval: REFRESH_MS,
  });

/** Organismes créés par l'utilisateur : « Publier au nom d'un organisme » n'apparaît que s'il y en a. */
export const myOrganismsQuery = () =>
  queryOptions({
    queryKey: ["organism", "my"],
    queryFn: () => apiClient<{ id: number; name?: string | null }[]>("organism/my"),
    staleTime: 10 * 60_000,
  });
