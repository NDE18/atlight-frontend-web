import { queryOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { authApi } from "./api";
import { USERNAME_MAX } from "./validation";

export type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

export const usernameAvailabilityQuery = (username: string) =>
  queryOptions({
    queryKey: ["auth", "username-available", username],
    queryFn: ({ signal }) => authApi.isUsernameAvailable(username, signal),
    staleTime: 30_000,
    retry: false,
  });

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * Disponibilité du nom d'utilisateur vérifiée en direct, 400 ms après la dernière frappe
 * (même délai que registration_page.dart). Une réponse arrivée trop tard est ignorée.
 */
export function useUsernameAvailability(raw: string): UsernameStatus {
  const username = raw.trim();
  const valid = username.length > 0 && username.length <= USERNAME_MAX;
  const debounced = useDebouncedValue(username, 400);
  const query = useQuery({
    ...usernameAvailabilityQuery(debounced),
    enabled: valid && debounced === username,
  });

  if (!valid) return "idle";
  if (debounced !== username) return "checking";
  if (query.data !== undefined) return query.data ? "available" : "taken";
  if (query.isError) return "error";
  return "checking";
}

/** Proposition quand le nom est pris : « awa.diallo » → « awa.diallo1 », « awa1 » → « awa2 ». */
export function suggestUsername(username: string): string {
  const match = username.match(/^(.*?)(\d+)$/);
  const suggestion = match ? `${match[1]}${Number(match[2]) + 1}` : `${username}1`;
  return suggestion.slice(-USERNAME_MAX);
}
