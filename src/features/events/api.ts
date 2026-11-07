import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";

export type EventType = "MATCH" | "TRYOUT" | "TOURNAMENT";

/** Événement (`SportEventModel` du mobile), champs lus par l'accueil. */
export interface SportEventDto {
  id: number;
  title?: string | null;
  type?: EventType | string | null;
  startAt: string;
  location?: string | null;
  organismName?: string | null;
}

/** Événements à venir, dans l'ordre de l'API (EVT-01). */
export const upcomingEventsQuery = () =>
  queryOptions({
    queryKey: ["events", "upcoming"],
    queryFn: () => apiClient<SportEventDto[]>("events/upcoming"),
    staleTime: 5 * 60_000,
  });
