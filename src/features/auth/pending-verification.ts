import { useSyncExternalStore } from "react";

/**
 * Compte créé en attente de son code (étape 4 de l'inscription). Gardé en sessionStorage pour
 * qu'un rechargement revienne à l'étape 4 (cahier 4.1.1), effacé après validation.
 * Jamais de mot de passe ici.
 */
export interface PendingVerification {
  userId: number;
  firstname: string;
  email: string;
  /** Envoi du dernier code (ms) : base du compte à rebours de 10 minutes. */
  sentAt: number;
}

const KEY = "atlight.pendingRegistration";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: PendingVerification | null } = { raw: null, value: null };

function parse(raw: string | null): PendingVerification | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<PendingVerification>;
    if (typeof value.userId !== "number" || typeof value.email !== "string") return null;
    return {
      userId: value.userId,
      email: value.email,
      firstname: typeof value.firstname === "string" ? value.firstname : "",
      sentAt: typeof value.sentAt === "number" ? value.sentAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function read(): PendingVerification | null {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  // Même objet tant que le contenu ne change pas : exigé par useSyncExternalStore.
  if (raw !== cache.raw) cache = { raw, value: parse(raw) };
  return cache.value;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function write(value: PendingVerification | null) {
  try {
    if (value) sessionStorage.setItem(KEY, JSON.stringify(value));
    else sessionStorage.removeItem(KEY);
  } catch {
    // Stockage indisponible (navigation privée stricte) : l'étape 4 ne survivra pas au rechargement.
  }
  listeners.forEach((listener) => listener());
}

export const pendingVerification = {
  get: read,
  save: (value: PendingVerification) => write(value),
  update: (patch: Partial<PendingVerification>) => {
    const current = read();
    if (current) write({ ...current, ...patch });
  },
  clear: () => write(null),
};

export function usePendingVerification(): PendingVerification | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
