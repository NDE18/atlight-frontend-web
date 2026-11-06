import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import type { PostDto, StoryDto, TrendingHashtag } from "./types";

/** Fil classé (mode FORYOU), première page de 20 comme le mobile (FEED-01). */
export const feedQuery = () =>
  queryOptions({
    queryKey: ["feed", "FORYOU"],
    queryFn: () =>
      apiClient<PostDto[]>("user/publication/feed", { query: { limit: 20, mode: "FORYOU" } }),
  });

/** Hashtags tendance des 7 derniers jours (FEED-03). */
export const trendingQuery = () =>
  queryOptions({
    queryKey: ["feed", "trending"],
    queryFn: () =>
      apiClient<TrendingHashtag[]>("user/publication/feed/trending", { query: { limit: 10 } }),
    staleTime: 5 * 60_000,
  });

/** Stories des 24 dernières heures (FEED-04). */
export const storiesQuery = () =>
  queryOptions({
    queryKey: ["stories", "feed"],
    queryFn: () => apiClient<StoryDto[]>("stories/feed"),
  });
