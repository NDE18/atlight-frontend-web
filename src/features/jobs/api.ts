import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";

/** Offre du Mercato (`JobOfferModel` du mobile), champs lus par l'accueil. */
export interface JobOfferDto {
  id: number;
  title?: string | null;
  description?: string | null;
  position?: string | null;
  sport?: string | null;
  location?: string | null;
  organismName?: string | null;
  organismPicture?: string | null;
}

/** Offres recommandées pour l'utilisateur (sport, poste, lieu), calculées par l'API. */
export const recommendedJobsQuery = (limit = 1) =>
  queryOptions({
    queryKey: ["jobs", "recommended", limit],
    queryFn: () => apiClient<JobOfferDto[]>("jobs/recommended", { query: { limit } }),
    staleTime: 5 * 60_000,
  });
