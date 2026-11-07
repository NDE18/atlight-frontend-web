import { useAppStore } from "@/stores/app";
import { useSessionStore } from "@/stores/session";

/** Corps d'erreur du backend (`ApiErrorResponse`). */
export interface ApiErrorBody {
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | null,
  ) {
    super(body?.message ?? `HTTP ${status}`);
    this.name = "ApiError";
  }

  /** 402 : fonction premium requise, à traiter par la modale d'upsell, jamais comme une erreur. */
  get isPaymentRequired() {
    return this.status === 402;
  }

  /** Code fonctionnel du backend (`BAD_CREDENTIALS`, `CODE_EXPIRED`…), s'il y en a un. */
  get code(): string | undefined {
    return this.body?.error;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions extends Omit<RequestInit, "body"> {
  query?: Query;
  /** Objet sérialisé en JSON, ou FormData pour les envois multipart. */
  body?: unknown;
  /**
   * Endpoint public d'authentification (inscription, codes e-mail, mot de passe oublié) :
   * passe par /api/public/*, sans JWT, et un 401 n'y déconnecte personne.
   */
  anonymous?: boolean;
}

/**
 * Client unique vers le backend, via le relais BFF (/api/backend/*) qui ajoute le JWT.
 * Même contrat que l'ApiClient du mobile : 401 → déconnexion, 402 → upsell premium.
 */
export async function apiClient<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, body, headers, anonymous = false, ...init } = options;
  const relay = anonymous ? "/api/public" : "/api/backend";
  const url = new URL(`${relay}/${path.replace(/^\/?(api\/)?/, "")}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  if (response.ok) return parseBody<T>(response);

  const errorBody = await parseBody<ApiErrorBody | null>(response).catch(() => null);
  const error = new ApiError(response.status, errorBody);

  if (response.status === 401 && !anonymous) {
    useSessionStore.getState().clear();
    const next = `${window.location.pathname}${window.location.search}`;
    // Rechargement complet voulu : il vide tous les caches (TanStack Query, stores) après une déconnexion.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/login?next=${encodeURIComponent(next)}`);
  } else if (response.status === 402) {
    useAppStore.getState().openUpsell();
  }
  throw error;
}

async function parseBody<T>(response: Response): Promise<T> {
  // Un corps vide est valide (DELETE, toggles).
  const text = await response.text();
  if (!text) return undefined as T;
  const type = response.headers.get("content-type") ?? "";
  return (type.includes("json") ? JSON.parse(text) : text) as T;
}
