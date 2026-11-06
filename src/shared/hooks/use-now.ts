import { useSyncExternalStore } from "react";

/*
 * Horloge partagée à la seconde, pour les comptes à rebours (validité du code, renvoi).
 * Lue via useSyncExternalStore pour que le rendu reste pur.
 */
let now = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function tick() {
  now = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(tick, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot() {
  if (!now) now = Date.now();
  return now;
}

/** Heure courante (ms), mise à jour chaque seconde ; 0 au rendu serveur. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

/** Force une mise à jour immédiate (après l'envoi d'un nouveau code, par exemple). */
export const refreshNow = tick;
