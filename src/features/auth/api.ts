import { apiClient, ApiError, type ApiErrorBody } from "@/shared/api/client";
import type { AuthSession, CodeCheckResult, RegistrationDto, RegistrationRequest } from "./types";

/** Réponse texte de `confirm_for_reset_password` quand le code est bon (`Constants.FOR_RESET_PASSWORD`). */
const RESET_CODE_OK = "for reset password";
/** `Constants.CODE_EXPIRED`. */
const CODE_EXPIRED = "EXPIRED";

/** Appel d'une route de session du BFF (/api/session/*), qui gère le cookie HttpOnly. */
async function sessionRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/session/${path}`, {
    method: "POST",
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!response.ok) throw new ApiError(response.status, data as ApiErrorBody | null);
  return data as T;
}

/** Équivalent de `UserService` (mobile) : compte, connexion et codes e-mail. */
export const authApi = {
  /** `GET /api/user/check-username` : true si le nom d'utilisateur est libre. */
  async isUsernameAvailable(username: string, signal?: AbortSignal): Promise<boolean> {
    const result = await apiClient<{ available: boolean }>("user/check-username", {
      anonymous: true,
      query: { username },
      signal,
    });
    return result.available;
  },

  /**
   * `POST /api/registration` : crée le compte (désactivé) et envoie le code par e-mail.
   * null si l'e-mail est invalide ou pris, ou si le nom d'utilisateur est pris :
   * le backend ne précise pas lequel.
   */
  async register(request: RegistrationRequest): Promise<RegistrationDto | null> {
    const result = await apiClient<RegistrationDto | undefined>("registration", {
      anonymous: true,
      method: "POST",
      body: request,
    });
    return result?.id ? result : null;
  },

  /** Code d'inscription : la session est ouverte directement (cookie posé par le BFF). */
  async confirmRegistration(
    userId: number,
    code: string,
  ): Promise<{ result: "ok"; session: AuthSession } | { result: Exclude<CodeCheckResult, "ok"> }> {
    try {
      const session = await sessionRequest<AuthSession>("confirm-registration", {
        user: userId,
        code,
      });
      return { result: "ok", session };
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        return { result: error.code === "CODE_EXPIRED" ? "expired" : "invalid" };
      }
      throw error;
    }
  },

  /** `GET /api/user/resend_code/{id}` : nouveau code, de nouveau valable 10 minutes. */
  async resendCode(userId: number): Promise<boolean> {
    const result = await apiClient<string>(`user/resend_code/${userId}`, { anonymous: true });
    return result === "OK";
  },

  /**
   * `POST /api/user/set_email` : nouvelle adresse pour un compte pas encore confirmé, nouveau code.
   * null si l'adresse est refusée (invalide, déjà prise, ou backend pas encore corrigé).
   */
  async changePendingEmail(userId: number, email: string): Promise<RegistrationDto | null> {
    try {
      const result = await apiClient<RegistrationDto | undefined>("user/set_email", {
        anonymous: true,
        method: "POST",
        // Mot de passe vide, comme le mobile : l'ancien set_email (avant le correctif backend du
        // lot 1) le refuse en 400, alors que sans mot de passe il effaçait le nom d'utilisateur
        // et rechiffrait le mot de passe du compte. Le set_email corrigé l'ignore.
        body: { id: userId, email, password: "" },
      });
      return result?.id ? result : null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) return null;
      throw error;
    }
  },

  /** Connexion par nom d'utilisateur (401 BAD_CREDENTIALS, 403 ACCOUNT_DISABLED, 429). */
  login(username: string, password: string): Promise<AuthSession> {
    return sessionRequest<AuthSession>("login", { username, password });
  },

  /** Met le JWT en liste noire côté backend et efface le cookie. */
  async logout(): Promise<void> {
    await sessionRequest<null>("logout");
  },

  /** `POST /api/user/pwd/forgotten` : envoie un code ; null si aucun compte n'a cette adresse (205). */
  async requestPasswordReset(email: string): Promise<RegistrationDto | null> {
    const result = await apiClient<RegistrationDto | undefined>("user/pwd/forgotten", {
      anonymous: true,
      method: "POST",
      body: { email },
    });
    return result?.id ? result : null;
  },

  /** `POST /api/user/confirm_for_reset_password`. */
  async confirmResetCode(userId: number, code: string): Promise<CodeCheckResult> {
    const result = await apiClient<string>("user/confirm_for_reset_password", {
      anonymous: true,
      method: "POST",
      body: { user: userId, code },
    });
    if (result === RESET_CODE_OK) return "ok";
    return result === CODE_EXPIRED ? "expired" : "invalid";
  },

  /**
   * `POST /api/user/reset_password` : exige un code confirmé il y a moins de 10 minutes.
   * false si le backend refuse (corps vide).
   */
  async resetPassword(email: string, password: string): Promise<boolean> {
    const result = await apiClient<{ id?: number } | undefined>("user/reset_password", {
      anonymous: true,
      method: "POST",
      body: { email, password },
    });
    return !!result?.id;
  },
};
