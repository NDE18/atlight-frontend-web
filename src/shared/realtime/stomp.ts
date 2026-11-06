import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { env } from "@/shared/config/env";

/**
 * Connexion STOMP unique (équivalent StompService du mobile) :
 * même URL /ws, même en-tête CONNECT `Authorization: Bearer <jwt>`.
 */
let client: Client | null = null;

async function fetchWsToken(): Promise<string> {
  const response = await fetch("/api/session/ws-token", { credentials: "same-origin" });
  if (!response.ok) throw new Error(`ws-token ${response.status}`);
  return ((await response.json()) as { token: string }).token;
}

export function getStompClient(): Client {
  if (client) return client;
  client = new Client({
    brokerURL: env.wsUrl,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    // Le jeton est relu à chaque (re)connexion : il peut avoir changé.
    beforeConnect: async (c) => {
      c.connectHeaders = { Authorization: `Bearer ${await fetchWsToken()}` };
    },
  });
  return client;
}

export function connectStomp(): void {
  const c = getStompClient();
  if (!c.active) c.activate();
}

export async function disconnectStomp(): Promise<void> {
  await client?.deactivate();
  client = null;
}

/** Abonnement JSON ; renvoie la fonction de désabonnement. */
export function subscribeJson<T>(destination: string, onMessage: (payload: T) => void): () => void {
  const c = getStompClient();
  let sub: StompSubscription | null = null;
  const attach = () => {
    sub = c.subscribe(destination, (message: IMessage) => onMessage(JSON.parse(message.body) as T));
  };
  if (c.connected) attach();
  const previous = c.onConnect;
  c.onConnect = (frame) => {
    previous?.(frame);
    attach();
  };
  return () => sub?.unsubscribe();
}

export function publishJson(destination: string, body: unknown): void {
  getStompClient().publish({ destination, body: JSON.stringify(body) });
}
