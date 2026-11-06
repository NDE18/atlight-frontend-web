import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** false au rendu serveur et à l'hydratation, true ensuite : pour ce qui dépend du stockage du navigateur. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
