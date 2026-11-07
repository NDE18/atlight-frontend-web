import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";

/** Suggestion de connexion (`/api/recommendation`, `RecommendationUser` du mobile). */
export interface SuggestionDto {
  userId: number;
  username?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  picture?: string | null;
  sport?: string | null;
  role?: string | null;
  clubName?: string | null;
  requestStatus?: string | null;
}

/** Suggestions fournies par l'API, dans son ordre, sans re-tri côté web (NET-03). */
export const suggestionsQuery = (username: string, limit = 3) =>
  queryOptions({
    queryKey: ["network", "suggestions", username, limit],
    queryFn: () => apiClient<SuggestionDto[]>("recommendation", { query: { username, limit } }),
    staleTime: 5 * 60_000,
  });
